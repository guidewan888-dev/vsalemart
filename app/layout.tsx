import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VSALE MART — ของดี ราคาที่ชอบ',
  description: 'รวมของใช้ราคาดี เลือกง่าย พร้อมส่งจากไทย',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><body>{children}</body></html>;
}
