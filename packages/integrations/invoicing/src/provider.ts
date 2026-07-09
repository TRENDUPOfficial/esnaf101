export interface InvoiceLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceParams {
  customerFullName: string;
  customerAddress: string;
  items: InvoiceLineItem[];
}

export interface CreateInvoiceResult {
  externalRef: string;
  pdfUrl?: string;
}

/**
 * Tenant'ın seçtiği muhasebe/e-fatura sağlayıcısından bağımsız ortak arayüz.
 * Yeni bir sağlayıcı eklemek (Nilvera, Logo, Mikro...) bu interface'i
 * implemente eden yeni bir sınıf eklemek anlamına gelir.
 */
export interface InvoiceProvider {
  createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;
}
