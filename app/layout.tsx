import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { getHomeData } from "@/lib/commerce/home";
import { StoreProvider } from "@/components/store/provider";
import { Shell } from "@/components/store/ui";

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-noto-thai",
  display: "swap",
});
const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});
export const dynamic = "force-dynamic";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vsalemart.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "V SALE — ครบเรื่องเรียนและงาน", template: "%s | V SALE" },
  description:
    "เครื่องเขียน หนังสือ แบบฟอร์ม ศิลปะ และอุปกรณ์สำนักงาน เพื่อทุกวันที่เดินหน้าต่อ",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "/",
    siteName: "V SALE",
    title: "V SALE — ครบเรื่องเรียนและงาน",
    description:
      "เลือกซื้อเครื่องเขียน หนังสือ แบบฟอร์ม และอุปกรณ์สำนักงานในราคาที่เข้าถึงง่าย",
    images: [
      {
        url: "/images/vsale/hero-home.png",
        width: 1672,
        height: 940,
        alt: "V SALE ครบเรื่องเรียนและงาน",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ff6b00",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getHomeData();
  return (
    <html lang="th" className={`${notoThai.variable} ${plexThai.variable}`}>
      <body>
        <StoreProvider data={data}>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
