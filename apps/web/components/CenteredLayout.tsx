import type { ReactNode } from "react";

export function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4 py-12">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-900">
          E1
        </span>
        <span className="text-lg font-semibold text-slate-900">Esnaf101</span>
      </div>
      {children}
    </main>
  );
}
