import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Esnaf101 — Süper Admin",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
