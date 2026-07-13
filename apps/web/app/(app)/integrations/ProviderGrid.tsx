"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "../../../components/ui/Badge";
import { ChevronDownIcon } from "../../../components/icons";

export interface ProviderOption {
  id: string;
  name: string;
  /** Gerçek bir API adaptörü olan (bkz. packages/integrations/*) sağlayıcılar için true. */
  available: boolean;
}

export function ProviderGrid({
  providers,
  connectedId,
  connectedLabel,
  forms,
}: {
  providers: ProviderOption[];
  /** Şu an tenant'a bağlı sağlayıcının id'si (varsa). */
  connectedId?: string | null;
  connectedLabel?: string;
  /** available:true olan sağlayıcılar için id -> form içeriği eşlemesi. */
  forms: Record<string, ReactNode>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(connectedId ?? null);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {providers.map((provider) => {
          const isConnected = provider.id === connectedId;
          const isExpanded = provider.id === expandedId;
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : provider.id)}
              className={`flex items-center justify-between gap-1.5 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                isExpanded
                  ? "border-amber-400 bg-amber-50 text-amber-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                {isConnected && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                {provider.name}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          );
        })}
      </div>

      {providers.map((provider) => {
        if (provider.id !== expandedId) return null;
        const isConnected = provider.id === connectedId;
        return (
          <div key={provider.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{provider.name}</span>
              {isConnected ? (
                <Badge variant="success">{connectedLabel ?? "Bağlı"}</Badge>
              ) : provider.available ? (
                <Badge variant="neutral">Bağlı değil</Badge>
              ) : (
                <Badge variant="warning">Yakında</Badge>
              )}
            </div>
            {provider.available ? (
              forms[provider.id]
            ) : (
              <p className="text-sm text-slate-500">
                Bu entegrasyon henüz eklenmedi. Öncelikli olarak eklenmesini istiyorsanız bize ulaşın.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
