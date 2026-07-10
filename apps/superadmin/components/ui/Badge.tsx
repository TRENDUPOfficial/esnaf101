const VARIANTS = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-700",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export function Badge({ variant = "neutral", children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}

const TENANT_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pending_onboarding: { label: "Onboarding bekliyor", variant: "warning" },
  active: { label: "Aktif", variant: "success" },
  suspended: { label: "Askıda", variant: "danger" },
};

export function TenantStatusBadge({ status }: { status: string }) {
  const info = TENANT_STATUS[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

const SUBSCRIPTION_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  active: { label: "Aktif", variant: "success" },
  suspended: { label: "Askıda", variant: "danger" },
  cancelled: { label: "İptal", variant: "neutral" },
};

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const info = SUBSCRIPTION_STATUS[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
