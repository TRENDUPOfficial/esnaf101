import { prisma } from "@esnaf101/db";
import { IyzicoBillingClient } from "@esnaf101/integrations-billing";

const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Adım 9: her gün çalışan otomatik tekrarlı tahsilat işleyici. Süresi dolan
 * (`active_until` geçmiş) aktif abonelikler için iyzico'dan tahsilat
 * dener. Başarılı olursa `active_until` bir sonraki döneme uzatılır;
 * başarısız denemede `subscription_payments`e kaydedilir ve
 * `MAX_CONSECUTIVE_FAILURES` ardışık başarısızlıktan sonra tenant/abonelik
 * askıya alınır (dunning).
 *
 * NOT: iyzico istemcisi (`@esnaf101/integrations-billing`) henüz gerçek
 * HMAC imzalama içermiyor (bkz. paket README/yorumları) — bu yüzden her
 * tahsilat denemesi şu an için her zaman başarısız sonuçlanır. Mekanizma
 * (job planlama, dunning, DB kayıtları) tamamen çalışır durumda; gerçek
 * iyzico entegrasyonu sandbox kimlik bilgileriyle doğrulanmalı.
 */
export async function processSubscriptionBilling(): Promise<void> {
  const dueSubscriptions = await prisma.subscription.findMany({
    where: { status: "active", activeUntil: { lte: new Date() } },
    include: { plan: true, tenant: true, payments: { orderBy: { createdAt: "desc" }, take: MAX_CONSECUTIVE_FAILURES } },
  });

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";

  for (const subscription of dueSubscriptions) {
    if (!subscription.iyzicoCardToken || !apiKey || !secretKey) {
      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          status: "failed",
          amount: subscription.plan.monthlyPrice,
          failureReason: "Kart tanımlı değil veya iyzico kimlik bilgileri eksik",
        },
      });
      await maybeSuspend(subscription.id, subscription.tenantId);
      continue;
    }

    const client = new IyzicoBillingClient({ apiKey, secretKey, baseUrl });
    try {
      const result = await client.chargeSubscription({
        cardToken: subscription.iyzicoCardToken,
        amount: Number(subscription.plan.monthlyPrice),
        conversationId: `${subscription.id}-${Date.now()}`,
      });

      if (!result.success) {
        throw new Error(result.failureReason ?? "Tahsilat başarısız");
      }

      await prisma.$transaction([
        prisma.subscriptionPayment.create({
          data: {
            subscriptionId: subscription.id,
            status: "success",
            amount: subscription.plan.monthlyPrice,
            iyzicoPaymentId: result.iyzicoPaymentId,
          },
        }),
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { activeUntil: addOneMonth(subscription.activeUntil) },
        }),
      ]);
    } catch (err) {
      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          status: "failed",
          amount: subscription.plan.monthlyPrice,
          failureReason: err instanceof Error ? err.message : String(err),
        },
      });
      await maybeSuspend(subscription.id, subscription.tenantId);
    }
  }
}

async function maybeSuspend(subscriptionId: string, tenantId: string): Promise<void> {
  const recentPayments = await prisma.subscriptionPayment.findMany({
    where: { subscriptionId },
    orderBy: { createdAt: "desc" },
    take: MAX_CONSECUTIVE_FAILURES,
  });
  const allFailed =
    recentPayments.length === MAX_CONSECUTIVE_FAILURES && recentPayments.every((p) => p.status === "failed");
  if (!allFailed) return;

  await prisma.$transaction([
    prisma.subscription.update({ where: { id: subscriptionId }, data: { status: "suspended" } }),
    prisma.tenant.update({ where: { id: tenantId }, data: { status: "suspended" } }),
  ]);
}

function addOneMonth(date: Date): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}
