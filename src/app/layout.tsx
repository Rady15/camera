import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/Providers";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SecureVision - أنظمة المراقبة الذكية | Smart Security Cameras",
  description: "متجر متخصص في بيع كاميرات المراقبة وأنظمة الأمان | Premium CCTV cameras and security systems",
  keywords: ["كاميرات مراقبة", "CCTV", "أنظمة أمان", "Hikvision", "Dahua", "security cameras"],
  authors: [{ name: "SecureVision Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SecureVision - أنظمة المراقبة الذكية",
    description: "متجر متخصص في بيع كاميرات المراقبة وأنظمة الأمان",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} antialiased bg-background text-foreground font-tajawal`}
      >
        <LanguageProvider>
          <Providers>
            {children}
          </Providers>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
