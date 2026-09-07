"use client";

import { Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomeCategory, HomeProduct } from "@/types/commerce";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { SearchBar } from "./search-bar";

export function AnnouncementBar() { return <div className="overflow-hidden bg-[linear-gradient(90deg,#d94700_0%,#ff6b00_52%,#ff9b19_100%)] text-white"><div className="announcement-track flex min-h-8 w-max items-center gap-12 px-4 text-[11px] font-bold"><span>🎁 ส่งฟรีทุกออเดอร์ เมื่อซื้อครบ 499 บาท</span><span>⚡ โปรพร้อมช้อป · จัดส่งทั่วไทย</span><span>🎁 ส่งฟรีทุกออเดอร์ เมื่อซื้อครบ 499 บาท</span><span>⚡ โปรพร้อมช้อป · จัดส่งทั่วไทย</span></div></div>; }

export function SiteHeader({ products, categories }: { products: HomeProduct[]; categories: HomeCategory[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const { cartCount, openCart, favorites } = useCommerce();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setMobileOpen(false); setMobileSearch(false); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  return <header className={`sticky top-0 z-40 border-b border-[#ffe0bf] bg-white/96 transition-shadow backdrop-blur ${scrolled ? "shadow-[0_8px_24px_rgba(145,67,12,.11)]" : ""}`}>
    <div className={`mx-auto flex max-w-[1320px] items-center gap-3 px-4 transition-[height] md:px-6 ${scrolled ? "h-14" : "h-16 md:h-[68px]"}`}>
      <button className="grid size-11 place-items-center md:hidden" onClick={() => setMobileOpen(true)} aria-label="เปิดเมนู"><Menu/></button>
      <Logo/>
      <div className="mx-auto hidden max-w-2xl flex-1 px-5 md:block"><SearchBar products={products} categories={categories}/></div>
      <div className="ml-auto flex items-center gap-1">
        <button className="grid size-11 place-items-center md:hidden" onClick={() => setMobileSearch(true)} aria-label="ค้นหา"><Search/></button>
        <Link href="/account" className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-[#4a2b1b] hover:bg-[#fff1df] md:flex"><UserRound className="size-5 text-[#e85500]"/><span>เข้าสู่ระบบ</span></Link>
        <button className="relative hidden size-11 place-items-center rounded-full text-[#4a2b1b] hover:bg-[#fff0e8] hover:text-[#e85500] md:grid" aria-label={`รายการโปรด ${favorites.size} รายการ`}><Heart className="size-5"/>{favorites.size > 0 && <Badge count={favorites.size}/>}</button>
        <button className="relative grid size-11 place-items-center rounded-full bg-[#fff0dc] text-[#e85500] hover:bg-[#d94700] hover:text-white" onClick={(event) => openCart(event.currentTarget)} aria-label={`เปิดตะกร้า มี ${cartCount} รายการ`}><ShoppingCart className="size-5"/><Badge count={cartCount}/></button>
      </div>
    </div>
    <DesktopNav categories={categories}/>
    {mobileOpen && <MobileMenu categories={categories} close={() => setMobileOpen(false)}/>}
    {mobileSearch && <div className="fixed inset-0 z-50 bg-white p-4 md:hidden"><div className="mb-4 flex items-center justify-between"><Logo/><button onClick={() => setMobileSearch(false)} className="grid size-11 place-items-center" aria-label="ปิดการค้นหา"><X/></button></div><SearchBar compact products={products} categories={categories} onSelect={() => setMobileSearch(false)}/></div>}
  </header>;
}

function Logo() { return <Link href="/" className="flex shrink-0 items-center gap-2 text-[#e85500]" aria-label="V SALE หน้าแรก"><span className="grid size-10 -rotate-3 place-items-center rounded-xl bg-[#ff6b00] text-[27px] font-black italic leading-none text-white shadow-[4px_4px_0_#ffd83d]">V</span><span className="text-lg font-black tracking-tight">SALE<small className="block text-[6px] font-bold tracking-[.14em] text-[#3a2114]">GOOD TOOLS · GREAT DAYS</small></span></Link>; }
function Badge({ count }: { count: number }) { return count > 0 ? <span className="absolute right-0 top-0 grid min-w-5 place-items-center rounded-full bg-[#ff4438] px-1 text-[10px] font-bold leading-5 text-white">{count}</span> : null; }
function DesktopNav({ categories }: { categories: HomeCategory[] }) { return <nav className="group/nav hidden border-t border-[#fff0df] md:block" aria-label="เมนูหลัก"><div className="mx-auto flex h-10 max-w-[1200px] items-center justify-center gap-9 px-6 text-[13px] font-bold text-[#4a2b1b]"><Link className="text-[#e85500]" href="/">หน้าแรก</Link><Link href="#products">สินค้าทั้งหมด</Link><Link className="inline-flex items-center gap-1 text-[#e43e22]" href="#promotions"><span className="size-1.5 rounded-full bg-[#e43e22]"/>โปรโมชั่น</Link><Link href="#best-sellers">สินค้าขายดี</Link><Link href="#new-arrivals">สินค้าใหม่</Link><div className="group relative h-full"><button className="h-full font-bold">หมวดหมู่</button><div className="invisible absolute right-[-5rem] top-full z-50 w-[min(760px,calc(100vw-2rem))] rounded-b-2xl border border-[#ffe0bf] bg-white p-5 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><div className="grid grid-cols-3 gap-2">{categories.map((item) => <Link key={item.id} href={`#category-${item.slug}`} className="rounded-xl px-3 py-3 hover:bg-[#fff0df]">{item.name}</Link>)}</div></div></div></div></nav>; }
function MobileMenu({ categories, close }: { categories: HomeCategory[]; close: () => void }) { return <div className="fixed inset-0 z-50 md:hidden"><button className="absolute inset-0 bg-[#0b1533]/45" onClick={close} aria-label="ปิดเมนู"/><nav aria-label="เมนูมือถือ" className="absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto bg-white p-5"><div className="flex items-center justify-between"><Logo/><button onClick={close} className="grid size-11 place-items-center" aria-label="ปิดเมนู"><X/></button></div><div className="mt-8 grid text-lg font-bold"><Link className="border-b py-4" href="/" onClick={close}>หน้าแรก</Link><Link className="border-b py-4" href="#products" onClick={close}>สินค้าทั้งหมด</Link><Link className="border-b py-4" href="#promotions" onClick={close}>โปรโมชั่น</Link><Link className="border-b py-4" href="#best-sellers" onClick={close}>สินค้าขายดี</Link></div><p className="mt-7 text-xs font-bold text-[#667085]">หมวดหมู่สินค้า</p><div className="mt-2 grid">{categories.map((item) => <Link key={item.id} href={`#category-${item.slug}`} onClick={close} className="min-h-11 py-3 text-sm">{item.name}</Link>)}</div></nav></div>; }
