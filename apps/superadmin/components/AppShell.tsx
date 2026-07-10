"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BuildingIcon, CreditCardIcon, HomeIcon, LogoutIcon, ShieldIcon } from "./icons";
import { logout } from "../app/actions";

const NAV_ITEMS = [
  { href: "/", label: "Panel", icon: HomeIcon },
  { href: "/tenants", label: "Tenant'lar", icon: BuildingIcon },
  { href: "/subscription-plans", label: "Abonelik Planları", icon: CreditCardIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-900 lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-slate-900">
            <ShieldIcon className="h-5 w-5 text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Esnaf101</p>
            <p className="text-xs text-slate-400">Süper Admin</p>
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-slate-800 text-indigo-400" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={logout} className="border-t border-slate-800 p-3">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
          >
            <LogoutIcon className="h-5 w-5" />
            Çıkış
          </button>
        </form>
      </aside>

      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500">
            <ShieldIcon className="h-4 w-4 text-white" />
          </span>
          <span className="font-semibold text-slate-900">Esnaf101 Admin</span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 lg:inline-flex">
          <ShieldIcon className="h-3.5 w-3.5" />
          Platform yönetimi
        </span>
        <form action={logout} className="lg:hidden">
          <button type="submit" className="text-sm font-medium text-slate-500">
            Çıkış
          </button>
        </form>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                active ? "bg-indigo-50 text-indigo-700" : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="px-4 py-8 lg:px-8">{children}</main>
    </div>
  );
}
