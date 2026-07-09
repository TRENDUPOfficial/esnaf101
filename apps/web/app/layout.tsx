import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { trTR } from "@clerk/localizations";

export const metadata = {
  title: "Esnaf101 — Satıcı Paneli",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider localization={trTR}>
      <html lang="tr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
