import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DanMe — Chicharrón de chile artesanal",
  description:
    "DanMe: chicharrón de chile 100% casero, hecho en México. Sabores habanero y serrano, sin conservadores. Pide por WhatsApp.",
  openGraph: {
    title: "DanMe — Chicharrón de chile artesanal",
    description:
      "Chicharrón de chile 100% casero, hecho en México. Pide por WhatsApp.",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
