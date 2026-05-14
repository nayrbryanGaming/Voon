import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voon — Meet at the Speed of Voice",
  description: "Platform video conference gratis, unlimited, khusus kampus Indonesia. Didukung AI untuk notulen, absensi, dan kuis otomatis.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://voon.vercel.app"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Voon — Meet at the Speed of Voice",
    description: "Free. Unlimited. Built for campus.",
    url: "https://voon.vercel.app",
    siteName: "Voon",
    images: [{ url: "/og-image.png" }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voon — Meet at the Speed of Voice",
    description: "Free. Unlimited. Built for campus.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
