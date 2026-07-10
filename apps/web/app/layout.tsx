import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { trTR } from "@clerk/localizations";
import "./globals.css";

export const metadata = {
  title: "Esnaf101 — Satıcı Paneli",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      localization={trTR}
      appearance={{
        variables: { colorPrimary: "#d97706" },
      }}
    >
      <html lang="tr">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
