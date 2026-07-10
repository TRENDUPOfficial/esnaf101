"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "../../../lib/api";

interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
  stockQty: number | null;
}

/**
 * PLANNING.md Adım 4: "Ürün seçimi arama/otomatik tamamlama (autocomplete)
 * ile yapılacak." Personel yazdıkça `/products?search=` ile eşleşen ürünler
 * listelenir; stok takibi açık ve stoğu 0 olan ürünler "stok yok" etiketiyle
 * gösterilir (seçim yine de engellenmiyor — personelin manuel override
 * ihtiyacı olabilir).
 */
export function ProductAutocomplete({ name }: { name: string }) {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) return;
    const handle = setTimeout(async () => {
      if (!query.trim()) {
        setOptions([]);
        return;
      }
      const token = await getToken();
      const results = (await apiFetch(`/products?search=${encodeURIComponent(query)}`, token)) as ProductOption[];
      setOptions(results);
    }, 250);
    return () => clearTimeout(handle);
  }, [query, selected, getToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-[220px] flex-1">
      <input
        type="text"
        placeholder="Ürün ara..."
        value={selected ? selected.name : query}
        onChange={(event) => {
          setSelected(null);
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        required
        autoComplete="off"
        className="block w-full rounded-lg border-0 px-3 py-2 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-amber-500"
      />
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      {open && options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((option) => (
            <li
              key={option.id}
              className="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-amber-50"
              onClick={() => {
                setSelected(option);
                setQuery("");
                setOptions([]);
                setOpen(false);
              }}
            >
              <span className="font-medium text-slate-900">{option.name}</span>
              {option.sku ? <span className="text-slate-400"> ({option.sku})</span> : null}
              {option.stockQty === 0 ? (
                <span className="ml-1.5 text-rose-500">stok yok</span>
              ) : option.stockQty !== null ? (
                <span className="ml-1.5 text-slate-400">stok: {option.stockQty}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
