"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeCategory, HomeProduct } from "@/types/commerce";
import { EmptyState, ProductCard } from "@/components/commerce/product-card";

export function ProductGrid({ products }: { products: HomeProduct[] }) { return <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>; }

export function ProductSection({ id, title, products, subtitle }: { id: string; title: string; products: HomeProduct[]; subtitle?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * Math.min(rail.current.clientWidth * .8, 800), behavior: "smooth" });
  if (!products.length) return <EmptyState/>;
  return <section id={id} className="section-pad mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12"><div className="mb-7 flex items-end justify-between gap-4"><div><h2 className="text-[clamp(1.65rem,3vw,2.6rem)] font-black tracking-[-.035em] text-[#0b1533]">{title}</h2>{subtitle && <p className="mt-1 text-sm text-[#667085]">{subtitle}</p>}</div><div className="flex gap-2"><button onClick={() => scroll(-1)} className="grid size-11 place-items-center rounded-full border border-[#dce2ec] bg-white" aria-label="ดูก่อนหน้า"><ArrowLeft className="size-4"/></button><button onClick={() => scroll(1)} className="grid size-11 place-items-center rounded-full border border-[#dce2ec] bg-white" aria-label="ดูถัดไป"><ArrowRight className="size-4"/></button></div></div><div ref={rail} className="product-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6 lg:-mx-12 lg:px-12">{products.map((product) => <div key={product.id} className="w-[46vw] max-w-[220px] shrink-0 snap-start md:w-[28vw] lg:w-[17vw]"><ProductCard product={product}/></div>)}</div></section>;
}

export function ProductExplorer({ products, categories }: { products: HomeProduct[]; categories: HomeCategory[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const filtered = useMemo(() => products.filter((product) => (category === "all" || product.categorySlug === category) && product.name.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))).sort((a,b) => sort === "price-low" ? a.price-b.price : sort === "price-high" ? b.price-a.price : sort === "rating" ? (b.rating ?? 0)-(a.rating ?? 0) : sort === "new" ? Date.parse(b.publishedAt)-Date.parse(a.publishedAt) : (b.soldCount ?? 0)-(a.soldCount ?? 0)), [products, query, category, sort]);
  return <section id="products" className="section-pad mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12"><div className="mb-7"><p className="text-xs font-bold text-[#146ef5]">{products.some((product) => product.isDemo) ? "รายการตั้งต้นสำหรับจัดหน้า" : "รายการสินค้าจากร้าน"}</p><h2 className="mt-1 text-[clamp(1.65rem,3vw,2.6rem)] font-black tracking-[-.035em] text-[#0b1533]">สินค้าแนะนำ</h2><p className="mt-2 text-sm text-[#667085]">สินค้าที่มีป้าย “ข้อมูลตัวอย่าง” สามารถเปลี่ยนเป็นชื่อ ราคา สต็อก และรูปจริงใน Supabase ได้ทันที</p></div><div className="mb-7 grid gap-3 rounded-2xl bg-white p-3 md:grid-cols-[1fr_220px_200px]"><label><span className="sr-only">ค้นหาสินค้าในรายการ</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาจากชื่อสินค้า" className="min-h-12 w-full rounded-xl border border-[#dce2ec] px-4 text-base outline-none focus:border-[#146ef5]"/></label><label><span className="sr-only">กรองหมวดหมู่</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#dce2ec] bg-white px-3"><option value="all">ทุกหมวดหมู่</option>{categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label><label><span className="sr-only">เรียงสินค้า</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#dce2ec] bg-white px-3"><option value="popular">ยอดนิยม</option><option value="new">ล่าสุด</option><option value="price-low">ราคาต่ำไปสูง</option><option value="price-high">ราคาสูงไปต่ำ</option><option value="rating">คะแนนรีวิว</option></select></label></div>{filtered.length ? <ProductGrid products={filtered}/> : <EmptyState message="ไม่พบสินค้าที่ตรงกับคำค้นและหมวดที่เลือก"/>}</section>;
}

export function FlashSaleSection({ products }: { products: HomeProduct[] }) {
  const [seconds, setSeconds] = useState(8 * 60 * 60 + 24 * 60 + 16);
  useEffect(() => { const timer = window.setInterval(() => setSeconds((value) => Math.max(value - 1, 0)), 1000); return () => window.clearInterval(timer); }, []);
  const time = [Math.floor(seconds/3600), Math.floor((seconds%3600)/60), seconds%60];
  return <section id="flash-sale" className="section-pad bg-[#082653] text-white"><div className="mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold text-[#75aaff]">FLASH SALE</p><h2 className="mt-1 text-3xl font-black md:text-4xl">ดีลวันนี้ หมดแล้วหมดเลย</h2></div><div className="flex items-center gap-1.5" aria-label={`เหลือเวลา ${time[0]} ชั่วโมง ${time[1]} นาที ${time[2]} วินาที`}>{time.map((value,index) => <span key={index} className="grid size-11 place-items-center rounded-lg bg-white font-black tabular-nums text-[#0b1533]">{String(value).padStart(2,"0")}</span>)}</div></div><div className="rounded-3xl bg-[#f7f6f2] p-4 text-[#0b1533] md:p-6"><ProductGrid products={products.slice(0,6)}/></div></div></section>;
}
