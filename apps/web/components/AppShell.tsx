"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { BoxIcon, HomeIcon, PlugIcon, ReceiptIcon, UsersIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Panel", icon: HomeIcon },
  { href: "/orders", label: "Siparişler", icon: ReceiptIcon },
  { href: "/products", label: "Ürünler", icon: BoxIcon },
  { href: "/customers", label: "Müşteriler", icon: UsersIcon },
  { href: "/integrations", label: "Entegrasyonlar", icon: PlugIcon },
];

export function AppShell({ tenantName, children }: { tenantName: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-900 lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-slate-900">
            E1
          </span>
          <span className="text-base font-semibold text-white">Esnaf101</span>
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
                  active ? "bg-slate-800 text-amber-400" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
          {tenantName}
        </div>
      </aside>

      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-slate-900">
            E1
          </span>
          <span className="font-semibold text-slate-900">Esnaf101</span>
        </div>
        <p className="hidden text-sm font-medium text-slate-500 lg:block">{tenantName}</p>
        <UserButton />
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                active ? "bg-amber-50 text-amber-700" : "text-slate-600"
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
