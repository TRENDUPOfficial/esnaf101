import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Esnaf101 - Satıcı Araçları",
  description: "Trendyol satıcıları için kâr hesaplayıcı ve pratik araçlar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200`}>
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {children}
        </main>
      </body>
    </html>
  );
}
