import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VSALE MART — เตรียมพบกันเร็ว ๆ นี้',
  description: 'VSALE MART กำลังเตรียมร้านสำหรับคุณ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="th"><body>{children}</body></html>;
}
