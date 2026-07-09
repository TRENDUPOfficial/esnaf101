import type { CreateShipmentParams, CreateShipmentResult, ShippingProvider } from "./provider";

export interface ShipentegraConfig {
  apiKey: string;
  apiSecret: string;
}

/**
 * Shipentegra API adaptörü. `ShippingProvider` interface'ini implemente
 * eder, böylece worker/API katmanı hangi kargo entegratörünün kullanıldığını
 * bilmeden etiket oluşturabilir (bkz. tenant_integrations.shipping_provider).
 */
export class ShipentegraShippingProvider implements ShippingProvider {
  private readonly baseUrl = "https://apis.shipentegra.com/v1";

  constructor(private readonly config: ShipentegraConfig) {}

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "X-Api-Key": this.config.apiKey,
        "X-Api-Secret": this.config.apiSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: params.orderRef,
        recipient: {
          name: params.recipientFullName,
          address: params.recipientAddress,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Shipentegra kargo oluşturma başarısız: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      carrier: string;
      tracking_number: string;
      label_url?: string;
    };

    return {
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      labelUrl: data.label_url,
    };
  }
}
