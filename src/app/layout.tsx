import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "ABICO Loyalty — Гишүүнчлэлийн бонус систем",
  description:
    "Олон дэлгүүрт нэг картаар оноо цуглуулж, бонус авна. ABICO нэгдсэн гишүүнчлэл.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
