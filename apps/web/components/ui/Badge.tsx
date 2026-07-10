const VARIANTS = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-rose-50 text-rose-700",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

const ORDER_STATUS_LABELS: Record<string, { label: string; variant: BadgeVariant }> = {
  new: { label: "Yeni", variant: "neutral" },
  awaiting_product_price: { label: "Fiyat bekliyor", variant: "warning" },
  awaiting_invoice: { label: "Fatura bekliyor", variant: "info" },
  invoiced: { label: "Faturalandı", variant: "info" },
  awaiting_payment: { label: "Ödeme bekliyor", variant: "warning" },
  paid: { label: "Ödendi", variant: "success" },
  shipped: { label: "Kargolandı", variant: "success" },
};

export function Badge({ variant = "neutral", children }: { variant?: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const info = ORDER_STATUS_LABELS[status] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
