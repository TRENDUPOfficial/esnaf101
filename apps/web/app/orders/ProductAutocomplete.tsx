"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "../../lib/api";

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
    <div ref={containerRef} style={{ position: "relative", minWidth: 220 }}>
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
        style={{ width: "100%" }}
      />
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      {open && options.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 10,
            background: "Canvas",
            color: "CanvasText",
            border: "1px solid #888",
            listStyle: "none",
            margin: 0,
            padding: 0,
            width: "100%",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <li
              key={option.id}
              style={{ padding: "0.25rem 0.5rem", cursor: "pointer" }}
              onClick={() => {
                setSelected(option);
                setQuery("");
                setOptions([]);
                setOpen(false);
              }}
            >
              {option.name}
              {option.sku ? ` (${option.sku})` : ""}
              {option.stockQty === 0 ? " — stok yok" : option.stockQty !== null ? ` — stok: ${option.stockQty}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
