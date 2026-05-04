import ToolCard from "@/components/ToolCard";
import { Package } from "lucide-react";

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Satıcı Araçları
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Günlük işlemlerinizi kolaylaştıran hesap araçları
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToolCard
          href="/tools/trendyol-kar"
          icon={<Package className="w-6 h-6 text-orange-500" />}
          title="Trendyol Kâr Hesaplayıcı"
          description="Satış fiyatı, komisyon ve kargo giderlerini hesaplayarak net kârınızı öğrenin."
          badge="Yeni"
        />
      </div>
    </div>
  );
}
