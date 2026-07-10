import type { ReactNode } from "react";
import { ShieldIcon } from "./icons";

export function CenteredLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-4 py-12">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500">
          <ShieldIcon className="h-5 w-5 text-white" />
        </span>
        <div className="leading-tight">
          <p className="text-base font-semibold text-slate-900">Esnaf101</p>
          <p className="text-xs text-slate-500">Süper Admin</p>
        </div>
      </div>
      {children}
    </main>
  );
}
