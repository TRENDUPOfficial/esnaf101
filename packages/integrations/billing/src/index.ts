export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface StoreCardParams {
  tenantId: string;
  cardHolderName: string;
  cardNumber: string;
  expireYear: string;
  expireMonth: string;
}

export interface StoreCardResult {
  cardToken: string;
}

export interface ChargeSubscriptionParams {
  cardToken: string;
  amount: number;
  conversationId: string;
}

export interface ChargeSubscriptionResult {
  success: boolean;
  iyzicoPaymentId?: string;
  failureReason?: string;
}

/**
 * iyzico Abonelik (Subscription) API istemcisi. Kart bilgisi hiçbir zaman
 * bu servisin veritabanında saklanmaz — sadece iyzico'nun döndürdüğü
 * `cardToken` saklanır (bkz. subscriptions.iyzico_card_token).
 *
 * NOT: iyzico istekleri HMAC tabanlı imzalama gerektirir; gerçek imzalama
 * mantığı resmi `iyzipay` SDK'sı entegre edildiğinde eklenecektir.
 */
export class IyzicoBillingClient {
  constructor(private readonly config: IyzicoConfig) {}

  async storeCard(_params: StoreCardParams): Promise<StoreCardResult> {
    throw new Error("IyzicoBillingClient.storeCard henüz implemente edilmedi");
  }

  async chargeSubscription(_params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult> {
    throw new Error("IyzicoBillingClient.chargeSubscription henüz implemente edilmedi");
  }
}
