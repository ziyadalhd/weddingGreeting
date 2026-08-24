import type { Metadata, Viewport } from "next";

import { weddingConfig } from "@/config/wedding";

import "./globals.css";

export const metadata: Metadata = {
  title: `تهنئة زواج ${weddingConfig.groomName}`,
  description: `اكتب تهنئتك لـ${weddingConfig.groomName} وشاركها برسالة أو بطاقة جميلة.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F2E7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
