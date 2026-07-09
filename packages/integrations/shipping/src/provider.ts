export interface CreateShipmentParams {
  recipientFullName: string;
  recipientAddress: string;
  orderRef: string;
}

export interface CreateShipmentResult {
  carrier: string;
  trackingNumber: string;
  labelUrl?: string;
}

/**
 * Tenant'ın seçtiği kargo entegratöründen/firmasından bağımsız ortak arayüz.
 * Yeni bir sağlayıcı eklemek (doğrudan Yurtiçi/Aras API'leri...) bu
 * interface'i implemente eden yeni bir sınıf eklemek anlamına gelir.
 */
export interface ShippingProvider {
  createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult>;
}
