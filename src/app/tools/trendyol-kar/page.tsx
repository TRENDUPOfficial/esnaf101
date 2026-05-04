import ProfitCalculator from "@/components/trendyol/ProfitCalculator";

export default function TrendyolKarPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Trendyol Kâr Hesaplayıcı
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Satış fiyatı, komisyon ve kargo giderlerinizi girerek net kârınızı hesaplayın.
        </p>
      </div>
      <ProfitCalculator />
    </div>
  );
}
