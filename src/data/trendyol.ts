export type DesiRow = {
  desiRange: [number, number];
  barem1Price: number;
  barem2Price: number;
  barem3Price: number;
};

export type ShippingCompany = {
  id: string;
  name: string;
  rows: DesiRow[];
};

export type Category = {
  id: string;
  name: string;
  commissionRate: number;
};

// Komisyon oranları — evraklar gelince güncellenecek
export const TRENDYOL_CATEGORIES: Category[] = [
  { id: "giyim", name: "Giyim & Aksesuar", commissionRate: 20 },
  { id: "ayakkabi", name: "Ayakkabı", commissionRate: 20 },
  { id: "elektronik", name: "Elektronik", commissionRate: 8 },
  { id: "kozmetik", name: "Kozmetik & Kişisel Bakım", commissionRate: 15 },
  { id: "ev_yasam", name: "Ev & Yaşam", commissionRate: 15 },
  { id: "mobilya", name: "Mobilya & Dekorasyon", commissionRate: 15 },
  { id: "spor", name: "Spor & Outdoor", commissionRate: 18 },
  { id: "kitap", name: "Kitap & Hobi", commissionRate: 10 },
  { id: "bebek", name: "Oyuncak & Bebek", commissionRate: 15 },
  { id: "supermarket", name: "Süpermarket & Gıda", commissionRate: 8 },
  { id: "otomotiv", name: "Otomotiv & Motosiklet", commissionRate: 10 },
  { id: "pet", name: "Pet Shop", commissionRate: 12 },
];

// Kargo fiyatları — evraklar gelince güncellenecek
// Barem 1: 0–199.99 ₺ satış, Barem 2: 200–349.99 ₺, Barem 3: 350+ ₺
export const SHIPPING_COMPANIES: ShippingCompany[] = [
  {
    id: "yurtici",
    name: "Yurtiçi Kargo",
    rows: [
      { desiRange: [0, 1],  barem1Price: 32.90, barem2Price: 27.90, barem3Price: 24.90 },
      { desiRange: [1, 2],  barem1Price: 35.90, barem2Price: 30.90, barem3Price: 27.90 },
      { desiRange: [2, 3],  barem1Price: 38.90, barem2Price: 33.90, barem3Price: 30.90 },
      { desiRange: [3, 5],  barem1Price: 42.90, barem2Price: 37.90, barem3Price: 34.90 },
      { desiRange: [5, 10], barem1Price: 52.90, barem2Price: 47.90, barem3Price: 44.90 },
      { desiRange: [10, 20],barem1Price: 72.90, barem2Price: 67.90, barem3Price: 64.90 },
      { desiRange: [20, 30],barem1Price: 92.90, barem2Price: 87.90, barem3Price: 84.90 },
    ],
  },
  {
    id: "mng",
    name: "MNG Kargo",
    rows: [
      { desiRange: [0, 1],  barem1Price: 31.90, barem2Price: 26.90, barem3Price: 23.90 },
      { desiRange: [1, 2],  barem1Price: 34.90, barem2Price: 29.90, barem3Price: 26.90 },
      { desiRange: [2, 3],  barem1Price: 37.90, barem2Price: 32.90, barem3Price: 29.90 },
      { desiRange: [3, 5],  barem1Price: 41.90, barem2Price: 36.90, barem3Price: 33.90 },
      { desiRange: [5, 10], barem1Price: 51.90, barem2Price: 46.90, barem3Price: 43.90 },
      { desiRange: [10, 20],barem1Price: 71.90, barem2Price: 66.90, barem3Price: 63.90 },
      { desiRange: [20, 30],barem1Price: 91.90, barem2Price: 86.90, barem3Price: 83.90 },
    ],
  },
  {
    id: "aras",
    name: "Aras Kargo",
    rows: [
      { desiRange: [0, 1],  barem1Price: 30.90, barem2Price: 25.90, barem3Price: 22.90 },
      { desiRange: [1, 2],  barem1Price: 33.90, barem2Price: 28.90, barem3Price: 25.90 },
      { desiRange: [2, 3],  barem1Price: 36.90, barem2Price: 31.90, barem3Price: 28.90 },
      { desiRange: [3, 5],  barem1Price: 40.90, barem2Price: 35.90, barem3Price: 32.90 },
      { desiRange: [5, 10], barem1Price: 50.90, barem2Price: 45.90, barem3Price: 42.90 },
      { desiRange: [10, 20],barem1Price: 70.90, barem2Price: 65.90, barem3Price: 62.90 },
      { desiRange: [20, 30],barem1Price: 90.90, barem2Price: 85.90, barem3Price: 82.90 },
    ],
  },
  {
    id: "surat",
    name: "Sürat Kargo",
    rows: [
      { desiRange: [0, 1],  barem1Price: 31.50, barem2Price: 26.50, barem3Price: 23.50 },
      { desiRange: [1, 2],  barem1Price: 34.50, barem2Price: 29.50, barem3Price: 26.50 },
      { desiRange: [2, 3],  barem1Price: 37.50, barem2Price: 32.50, barem3Price: 29.50 },
      { desiRange: [3, 5],  barem1Price: 41.50, barem2Price: 36.50, barem3Price: 33.50 },
      { desiRange: [5, 10], barem1Price: 51.50, barem2Price: 46.50, barem3Price: 43.50 },
      { desiRange: [10, 20],barem1Price: 71.50, barem2Price: 66.50, barem3Price: 63.50 },
      { desiRange: [20, 30],barem1Price: 91.50, barem2Price: 86.50, barem3Price: 83.50 },
    ],
  },
];

export function getBaremTier(salePrice: number): 1 | 2 | 3 {
  if (salePrice < 200) return 1;
  if (salePrice < 350) return 2;
  return 3;
}

function getRowByDesi(companyId: string, desi: number): DesiRow | null {
  const company = SHIPPING_COMPANIES.find((c) => c.id === companyId);
  if (!company) return null;
  const sorted = [...company.rows].sort((a, b) => a.desiRange[1] - b.desiRange[1]);
  return sorted.find((r) => desi <= r.desiRange[1]) ?? sorted[sorted.length - 1] ?? null;
}

export function getShippingCost(companyId: string, desi: number, salePrice: number): number | null {
  const row = getRowByDesi(companyId, desi);
  if (!row) return null;
  const tier = getBaremTier(salePrice);
  if (tier === 1) return row.barem1Price;
  if (tier === 2) return row.barem2Price;
  return row.barem3Price;
}

export function getShippingCostByBarem(companyId: string, desi: number, barem: 1 | 2 | 3): number | null {
  const row = getRowByDesi(companyId, desi);
  if (!row) return null;
  if (barem === 1) return row.barem1Price;
  if (barem === 2) return row.barem2Price;
  return row.barem3Price;
}

export function calcTargetSalePrice(
  purchaseCost: number,
  targetMode: "percent" | "tl",
  targetValue: number,
  commissionRate: number,
  companyId: string,
  desi: number
): number {
  let barem: 1 | 2 | 3 = 1;
  for (let i = 0; i < 3; i++) {
    const shipping = getShippingCostByBarem(companyId, desi, barem) ?? 0;
    const commFrac = commissionRate / 100;
    const sp =
      targetMode === "percent"
        ? (shipping + purchaseCost) / (1 - commFrac - targetValue / 100)
        : (targetValue + shipping + purchaseCost) / (1 - commFrac);
    if (!isFinite(sp) || sp <= 0) return 0;
    const newBarem = getBaremTier(sp);
    if (newBarem === barem) return sp;
    barem = newBarem;
  }
  return 0;
}
