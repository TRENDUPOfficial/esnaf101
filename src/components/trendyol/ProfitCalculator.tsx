"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  TRENDYOL_CATEGORIES,
  SHIPPING_COMPANIES,
  getShippingCost,
  getBaremTier,
  calcTargetSalePrice,
} from "@/data/trendyol";
import { PieChart } from "@/components/ui/PieChart";

type CommissionMode = "category" | "manual";
type CalcMode = "profit" | "target";
type TargetMode = "percent" | "tl";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function ProfitCalculator() {
  const [calcMode, setCalcMode] = useState<CalcMode>("profit");

  // Kâr Hesapla modu
  const [salePrice, setSalePrice] = useState("");

  // Satış Fiyatı Bul modu
  const [targetMode, setTargetMode] = useState<TargetMode>("percent");
  const [targetValue, setTargetValue] = useState("");

  // Ortak alanlar
  const [purchaseCost, setPurchaseCost] = useState("");
  const [vatRate, setVatRate] = useState("20");
  const [commissionMode, setCommissionMode] = useState<CommissionMode>("category");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [manualCommission, setManualCommission] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [desi, setDesi] = useState("");
  const [isDesiManual, setIsDesiManual] = useState(false);
  const [boxLength, setBoxLength] = useState("");
  const [boxWidth, setBoxWidth] = useState("");
  const [boxHeight, setBoxHeight] = useState("");
  const [desiPanelOpen, setDesiPanelOpen] = useState(true);

  const updateDesiFromBox = (l: string, w: string, h: string) => {
    if (l && w && h) {
      const calc = (parseFloat(l) * parseFloat(w) * parseFloat(h)) / 3000;
      if (!isNaN(calc) && calc > 0) {
        setDesi(calc.toFixed(4));
        setIsDesiManual(false);
      }
    }
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoxLength(e.target.value);
    updateDesiFromBox(e.target.value, boxWidth, boxHeight);
  };
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoxWidth(e.target.value);
    updateDesiFromBox(boxLength, e.target.value, boxHeight);
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoxHeight(e.target.value);
    updateDesiFromBox(boxLength, boxWidth, e.target.value);
  };
  const handleDesiManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesi(e.target.value);
    setIsDesiManual(true);
  };

  // Ortak hesaplamalar
  const purchaseCostNum = parseFloat(purchaseCost) || 0;
  const desiNum = parseFloat(desi) || 0;
  const commissionRate =
    commissionMode === "category"
      ? TRENDYOL_CATEGORIES.find((c) => c.id === selectedCategory)?.commissionRate ?? 0
      : parseFloat(manualCommission) || 0;

  // Kâr Hesapla modu
  const salePriceNum = parseFloat(salePrice) || 0;
  const commissionAmount = salePriceNum * commissionRate / 100;
  const shippingCost =
    selectedCompany && desiNum > 0
      ? getShippingCost(selectedCompany, desiNum, salePriceNum) ?? 0
      : 0;
  const profit = salePriceNum - commissionAmount - shippingCost - purchaseCostNum;
  const profitMargin = salePriceNum > 0 ? (profit / salePriceNum) * 100 : 0;
  const trendyolTotal = commissionAmount + shippingCost;
  const sellerReceives = salePriceNum - trendyolTotal;
  const baremTier = getBaremTier(salePriceNum);

  // Satış Fiyatı Bul modu
  const targetValueNum = parseFloat(targetValue) || 0;
  const suggestedPrice =
    purchaseCostNum > 0 && targetValueNum > 0 && commissionRate > 0
      ? calcTargetSalePrice(purchaseCostNum, targetMode, targetValueNum, commissionRate, selectedCompany, desiNum)
      : 0;
  const sugCommission = suggestedPrice * commissionRate / 100;
  const sugShipping =
    selectedCompany && desiNum > 0
      ? getShippingCost(selectedCompany, desiNum, suggestedPrice) ?? 0
      : 0;
  const sugProfit = suggestedPrice - sugCommission - sugShipping - purchaseCostNum;
  const sugMargin = suggestedPrice > 0 ? (sugProfit / suggestedPrice) * 100 : 0;
  const sugBaremTier = getBaremTier(suggestedPrice);

  // Aktif modun değerleri (pasta grafik için)
  const activeSalePrice = calcMode === "profit" ? salePriceNum : suggestedPrice;
  const activeCommission = calcMode === "profit" ? commissionAmount : sugCommission;
  const activeShipping = calcMode === "profit" ? shippingCost : sugShipping;
  const activeProfit = calcMode === "profit" ? profit : sugProfit;
  const hasResult = activeSalePrice > 0;

  // Pasta grafik dilimleri
  const pieSegments = [
    { label: "Alış Maliyeti", value: purchaseCostNum, color: "#3b82f6" },
    { label: "Trendyol Komisyonu", value: activeCommission, color: "#f97316" },
    { label: "Kargo Ücreti", value: activeShipping, color: "#8b5cf6" },
    { label: activeProfit >= 0 ? "Net Kâr" : "Zarar", value: Math.abs(activeProfit), color: activeProfit >= 0 ? "#22c55e" : "#ef4444" },
  ];

  // Desi hesaplayıcı için
  const calcDesi =
    boxLength && boxWidth && boxHeight
      ? (parseFloat(boxLength) * parseFloat(boxWidth) * parseFloat(boxHeight)) / 3000
      : null;
  const desiShippingCost =
    selectedCompany && calcDesi !== null && calcDesi > 0
      ? getShippingCost(selectedCompany, calcDesi, activeSalePrice || salePriceNum)
      : null;

  return (
    <div className="space-y-6">
      {/* Mod Seçimi */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {([["profit", "Kâr Hesapla"], ["target", "Satış Fiyatı Bul"]] as [CalcMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setCalcMode(mode)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              calcMode === mode
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOL: Girdiler */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Girdi Bilgileri
          </h2>

          {calcMode === "profit" ? (
            <div>
              <label className={labelClass}>
                Satış Fiyatı (₺){" "}
                <span className="text-gray-400 font-normal text-xs">KDV dahil</span>
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                step="0.0001"
                min="0"
                placeholder="0.0000"
                className={inputClass}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Hedef Kâr Türü</label>
                <div className="flex gap-2">
                  {([["percent", "% Kâr Marjı"], ["tl", "TL Kâr"]] as [TargetMode, string][]).map(([m, l]) => (
                    <button
                      key={m}
                      onClick={() => setTargetMode(m)}
                      className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                        targetMode === m
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  {targetMode === "percent" ? "Hedef Kâr Marjı (%)" : "Hedef Kâr (₺)"}
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  step="0.0001"
                  min="0"
                  placeholder="0.0000"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Alış Maliyeti (₺)</label>
            <input
              type="number"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              step="0.0001"
              min="0"
              placeholder="0.0000"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>KDV Oranı</label>
            <select value={vatRate} onChange={(e) => setVatRate(e.target.value)} className={inputClass}>
              <option value="1">%1</option>
              <option value="8">%8</option>
              <option value="18">%18</option>
              <option value="20">%20</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Komisyon</label>
            <div className="flex gap-2 mb-2">
              {(["category", "manual"] as CommissionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCommissionMode(mode)}
                  className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                    commissionMode === mode
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {mode === "category" ? "Kategori Seç" : "Manuel %"}
                </button>
              ))}
            </div>
            {commissionMode === "category" ? (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={inputClass}
              >
                <option value="">Kategori seçin...</option>
                {TRENDYOL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (%{c.commissionRate})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                value={manualCommission}
                onChange={(e) => setManualCommission(e.target.value)}
                step="0.0001"
                min="0"
                max="100"
                placeholder="0.0000"
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>Kargo Firması</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className={`${inputClass} mb-2`}
            >
              <option value="">Firma seçin...</option>
              {SHIPPING_COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="relative">
              <input
                type="number"
                value={desi}
                onChange={handleDesiManualChange}
                step="0.0001"
                min="0"
                placeholder="Desi (0.0000)"
                className={inputClass}
              />
              {isDesiManual && desi && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-500 font-medium pointer-events-none">
                  * Manuel giriş
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ: Sonuçlar */}
        <div className="space-y-4">
          {calcMode === "profit" ? (
            hasResult ? (
              <>
                <ResultCard
                  profit={profit}
                  margin={profitMargin}
                  barem={baremTier}
                  salePrice={salePriceNum}
                  commission={commissionAmount}
                  commissionRate={commissionRate}
                  shipping={shippingCost}
                  purchase={purchaseCostNum}
                  trendyolTotal={trendyolTotal}
                  sellerReceives={sellerReceives}
                />
                <PieCard segments={pieSegments} />
              </>
            ) : (
              <EmptyState label="Satış fiyatını girin, kâr hesabı burada görünür." />
            )
          ) : suggestedPrice > 0 ? (
            <>
              {/* Önerilen Fiyat */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-xl border-2 border-blue-400 dark:border-blue-700 p-6">
                <div className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-1">
                  Önerilen Satış Fiyatı
                </div>
                <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {suggestedPrice.toFixed(2)} ₺
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                  Net Kâr: {sugProfit.toFixed(2)} ₺ · %{sugMargin.toFixed(2)} marj
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <Info className="w-3 h-3" />
                  Barem {sugBaremTier} uygulandı
                </div>
              </div>
              <ResultCard
                profit={sugProfit}
                margin={sugMargin}
                barem={sugBaremTier}
                salePrice={suggestedPrice}
                commission={sugCommission}
                commissionRate={commissionRate}
                shipping={sugShipping}
                purchase={purchaseCostNum}
                trendyolTotal={sugCommission + sugShipping}
                sellerReceives={suggestedPrice - sugCommission - sugShipping}
                compact
              />
              <PieCard segments={pieSegments} />
            </>
          ) : (
            <EmptyState label="Alış maliyeti, hedef kâr ve komisyon girin." />
          )}
        </div>
      </div>

      {/* Desi Hesaplayıcı */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDesiPanelOpen((p) => !p)}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <span className="font-semibold text-gray-700 dark:text-gray-300">📐 Desi Hesaplayıcı</span>
          {desiPanelOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {desiPanelOpen && (
          <div className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "En (cm)", value: boxLength, onChange: handleLengthChange },
                { label: "Boy (cm)", value: boxWidth, onChange: handleWidthChange },
                { label: "Yükseklik (cm)", value: boxHeight, onChange: handleHeightChange },
              ].map(({ label, value, onChange }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    step="0.01"
                    min="0"
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            {calcDesi !== null && calcDesi > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-500 dark:text-blue-400 mb-1">Hesaplanan Desi</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{calcDesi.toFixed(4)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Kargo Ücreti</div>
                  <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {desiShippingCost !== null ? `${desiShippingCost.toFixed(2)} ₺` : "— ₺"}
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
              <span className="mt-0.5">⚠️</span>
              <span>Ürünün kilogram ağırlığı hesapladığınız desiyi geçiyorsa ürünün kilogramı desi olarak sayılır.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  profit, margin, barem, salePrice, commission, commissionRate,
  shipping, purchase, trendyolTotal, sellerReceives, compact,
}: {
  profit: number; margin: number; barem: 1 | 2 | 3;
  salePrice: number; commission: number; commissionRate: number;
  shipping: number; purchase: number; trendyolTotal: number;
  sellerReceives: number; compact?: boolean;
}) {
  const isProfit = profit >= 0;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      {!compact && (
        <div className={`rounded-lg p-4 mb-4 ${isProfit ? "bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800"}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Kâr</div>
          <div className={`text-3xl font-bold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {isProfit ? "+" : ""}{profit.toFixed(2)} ₺
          </div>
          <div className={`text-base font-semibold mt-1 ${isProfit ? "text-green-500" : "text-red-500"}`}>
            %{margin.toFixed(2)} kâr marjı
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
            <Info className="w-3 h-3" />Barem {barem} uygulandı
          </div>
        </div>
      )}
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Maliyet Dökümü</h3>
      <div className="space-y-2 text-sm">
        <Row label="Satış Fiyatı" value={`${salePrice.toFixed(2)} ₺`} />
        <Row label={`Komisyon (%${commissionRate})`} value={`-${commission.toFixed(2)} ₺`} red />
        <Row label="Kargo Ücreti" value={`-${shipping.toFixed(2)} ₺`} red />
        <Row label="Alış Maliyeti" value={`-${purchase.toFixed(2)} ₺`} red />
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 space-y-2">
          <Row label="Trendyol'a giden" value={`${trendyolTotal.toFixed(2)} ₺`} muted />
          <Row label="Satıcıya kalan (brüt)" value={`${sellerReceives.toFixed(2)} ₺`} muted />
        </div>
      </div>
    </div>
  );
}

function PieCard({ segments }: { segments: Parameters<typeof PieChart>[0]["segments"] }) {
  const hasData = segments.some((s) => s.value > 0);
  if (!hasData) return null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        Maliyet Dağılımı
      </h3>
      <PieChart segments={segments} />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center text-gray-400">
      <div className="text-5xl mb-3">📊</div>
      <p className="text-sm">{label}</p>
    </div>
  );
}

function Row({ label, value, red, muted }: { label: string; value: string; red?: boolean; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={red ? "font-medium text-red-500" : muted ? "font-medium text-gray-600 dark:text-gray-300" : "font-medium text-gray-900 dark:text-white"}>
        {value}
      </span>
    </div>
  );
}
