import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { CreditCardIcon, TrendingUpIcon } from "../components/icons";
import { adminApiFetch } from "../lib/api";

interface RevenueSummary {
  mrr: number;
  activeCount: number;
  suspendedCount: number;
  cancelledCount: number;
}

export default async function HomePage() {
  const revenue = (await adminApiFetch("/admin/revenue-summary")) as RevenueSummary;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Panel" description="Platform geneli abonelik ve gelir özeti" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Aylık tekrarlayan gelir (MRR)" value={`${revenue.mrr} TL`} icon={<TrendingUpIcon />} />
          <StatCard label="Aktif abonelik" value={revenue.activeCount} icon={<CreditCardIcon />} />
          <StatCard label="Askıda" value={revenue.suspendedCount} />
        </div>
      </div>
    </AppShell>
  );
}
