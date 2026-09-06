"use client";

import { Home, LayoutGrid, Search, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { useCommerce } from "@/components/commerce/commerce-provider";

export function SiteFooter() { return <footer className="bg-[#082653] pb-24 pt-8 text-white md:pb-7"><div className="mx-auto grid max-w-[1320px] gap-7 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-5"><div><p className="text-2xl font-black">V SALE</p><p className="mt-2 text-xs leading-5 text-white/70">ครบเรื่องเรียนและงาน<br/>เพื่อทุกวันที่เดินหน้าต่อ</p></div><FooterGroup title="เลือกซื้อสินค้า" links={["สินค้าทั้งหมด","โปรโมชั่น","สินค้าขายดี","สินค้าใหม่","หมวดหมู่"]}/><FooterGroup title="ช่วยเหลือลูกค้า" links={["ติดตามคำสั่งซื้อ","การจัดส่ง","การคืนสินค้า","คำถามที่พบบ่อย","ติดต่อเรา"]}/><FooterGroup title="เกี่ยวกับ V SALE" links={["เกี่ยวกับเรา","นโยบายความเป็นส่วนตัว","ข้อกำหนดการใช้งาน"]}/><div><h2 className="text-sm font-bold">ติดต่อเรา</h2><p className="mt-3 text-xs leading-5 text-white/70">ช่องทางติดต่อจริงจะเพิ่มหลังได้รับข้อมูลจากร้าน</p></div></div><div className="mx-auto mt-6 flex max-w-[1320px] flex-wrap justify-between gap-3 border-t border-white/15 px-4 pt-4 text-[10px] text-white/60 md:px-6"><span>© 2026 V SALE สงวนลิขสิทธิ์</span><span>ชำระเงินปลอดภัย · จัดส่งทั่วไทย</span></div></footer>; }
function FooterGroup({ title, links }: { title: string; links: string[] }) { return <div><h2 className="text-sm font-bold">{title}</h2><ul className="mt-2 space-y-1.5 text-xs text-white/70">{links.map((label) => <li key={label}><Link className="hover:text-white" href="#">{label}</Link></li>)}</ul></div>; }

export function MobileBottomNav() {
  const { cartCount, openCart, favorites } = useCommerce();
  return <nav aria-label="เมนูล่างมือถือ" className="fixed inset-x-0 bottom-0 z-40 grid h-[64px] grid-cols-5 border-t border-[#dce2ec] bg-white px-1 pb-[env(safe-area-inset-bottom)] md:hidden"><NavItem icon={<Home/>} label="หน้าแรก" href="/"/><NavItem icon={<LayoutGrid/>} label="หมวดหมู่" href="#categories"/><NavItem icon={<Search/>} label="ค้นหา" href="#top"/><button className="relative grid min-h-11 place-content-center justify-items-center gap-0.5 text-[10px]" onClick={(event) => openCart(event.currentTarget)}><ShoppingCart className="size-5"/>{cartCount > 0 && <span className="absolute right-[24%] top-1 min-w-4 rounded-full bg-[#ff4438] px-1 text-white">{cartCount}</span>}ตะกร้า</button><NavItem icon={<UserRound/>} label={favorites.size ? `โปรด ${favorites.size}` : "บัญชี"} href="/account"/></nav>;
}
function NavItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) { return <Link href={href} className="grid min-h-11 place-content-center justify-items-center gap-0.5 text-[10px] [&_svg]:size-5">{icon}{label}</Link>; }
