import type { CreateInvoiceParams, CreateInvoiceResult, InvoiceProvider } from "./provider";

export interface ParasutConfig {
  clientId: string;
  clientSecret: string;
  companyId: string;
  accessToken: string;
}

/**
 * Paraşüt API adaptörü. `InvoiceProvider` interface'ini implemente eder,
 * böylece worker/API katmanı hangi sağlayıcının kullanıldığını bilmeden
 * fatura kesebilir (bkz. tenant_integrations.invoice_provider).
 */
export class ParasutInvoiceProvider implements InvoiceProvider {
  private readonly baseUrl = "https://api.parasut.com/v4";

  constructor(private readonly config: ParasutConfig) {}

  async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult> {
    const res = await fetch(`${this.baseUrl}/${this.config.companyId}/sales_invoices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(toParasutPayload(params)),
    });

    if (!res.ok) {
      throw new Error(`Paraşüt fatura oluşturma başarısız: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { data: { id: string } };
    return { externalRef: data.data.id };
  }
}

function toParasutPayload(params: CreateInvoiceParams) {
  return {
    data: {
      type: "sales_invoices",
      attributes: {
        item_type: "invoice",
        description: `${params.customerFullName} - ${params.customerAddress}`,
        details: params.items.map((item) => ({
          quantity: item.quantity,
          unit_price: item.unitPrice,
          product_name: item.name,
        })),
      },
    },
  };
}
