"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "../../../lib/api";

export default function OnboardingSettingsPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [stockTrackingEnabled, setStockTrackingEnabled] = useState(false);
  const [iban, setIban] = useState("TR");
  const [ibanAccountHolder, setIbanAccountHolder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      await apiFetch("/tenants/me/onboarding", token, {
        method: "PATCH",
        body: JSON.stringify({
          stockTrackingEnabled,
          iban: iban.replace(/\s+/g, "").toUpperCase(),
          ibanAccountHolder,
        }),
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "3rem auto", padding: "0 1rem" }}>
      <h1>Son adım: işletme ayarları</h1>
      <p>Bu bilgileri daha sonra panelden değiştirebilirsiniz.</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={stockTrackingEnabled}
            onChange={(e) => setStockTrackingEnabled(e.target.checked)}
          />
          Stok takibini aktif et
        </label>

        <label>
          IBAN
          <input
            type="text"
            required
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="TR000000000000000000000000"
            maxLength={26}
          />
        </label>

        <label>
          Hesap sahibi
          <input
            type="text"
            required
            value={ibanAccountHolder}
            onChange={(e) => setIbanAccountHolder(e.target.value)}
            placeholder="Ad Soyad / Şirket Ünvanı"
          />
        </label>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Kaydediliyor..." : "Kurulumu tamamla"}
        </button>
      </form>
    </main>
  );
}
