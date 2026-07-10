"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "../../../lib/api";
import { CenteredLayout } from "../../../components/CenteredLayout";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input, Label } from "../../../components/ui/Field";
import { AlertIcon } from "../../../components/icons";

export default function OnboardingSettingsPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [stockTrackingEnabled, setStockTrackingEnabled] = useState(false);
  const [iban, setIban] = useState("TR");
  const [ibanAccountHolder, setIbanAccountHolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiFetch("/tenants/me/onboarding", token, {
        method: "PATCH",
        body: JSON.stringify({
          stockTrackingEnabled,
          iban: iban.replace(/\s+/g, "").toUpperCase(),
          ibanAccountHolder,
        }),
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CenteredLayout>
      <Card className="w-full max-w-sm">
        <CardHeader title="Son adım: işletme ayarları" description="Bu bilgileri daha sonra panelden değiştirebilirsiniz." />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={stockTrackingEnabled}
                onChange={(e) => setStockTrackingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              Stok takibini aktif et
            </label>

            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                type="text"
                required
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="TR000000000000000000000000"
                maxLength={26}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="ibanAccountHolder">Hesap sahibi</Label>
              <Input
                id="ibanAccountHolder"
                type="text"
                required
                value={ibanAccountHolder}
                onChange={(e) => setIbanAccountHolder(e.target.value)}
                placeholder="Ad Soyad / Şirket Ünvanı"
                className="w-full"
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-sm text-rose-600">
                <AlertIcon className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Kaydediliyor..." : "Kurulumu tamamla"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </CenteredLayout>
  );
}
