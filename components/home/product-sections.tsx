"use client";

import { ArrowLeft, ArrowRight, Flame, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeCategory, HomeProduct } from "@/types/commerce";
import { EmptyState, ProductCard } from "@/components/commerce/product-card";

export function ProductGrid({ products }: { products: HomeProduct[] }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>;
}

export function ProductSection({ id, title, products, subtitle }: { id: string; title: string; products: HomeProduct[]; subtitle?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * Math.min(rail.current.clientWidth * 0.82, 900), behavior: "smooth" });
  if (!products.length) return <EmptyState/>;

  return <section id={id} className="section-pad mx-auto max-w-[1360px] px-4 md:px-6 lg:px-10">
    <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
      <div className="min-w-0"><p className="mb-2 text-xs font-extrabold tracking-[.16em] text-[#1268f3]">V SALE PICKS</p><h2 className="text-[clamp(1.8rem,3.2vw,2.8rem)] font-extrabold leading-tight tracking-[-.035em] text-[#0a1d40]">{title}</h2>{subtitle && <p className="mt-2 text-[15px] leading-6 text-[#52627a]">{subtitle}</p>}</div>
      <div className="flex shrink-0 gap-2"><button onClick={() => scroll(-1)} className="grid size-12 place-items-center rounded-full border border-[#cddbf0] bg-white text-[#0a1d40] shadow-sm hover:border-[#1268f3] hover:text-[#1268f3]" aria-label="ดูก่อนหน้า"><ArrowLeft className="size-5"/></button><button onClick={() => scroll(1)} className="grid size-12 place-items-center rounded-full bg-[#1268f3] text-white shadow-[0_8px_20px_rgba(18,104,243,.24)] hover:bg-[#0758d9]" aria-label="ดูถัดไป"><ArrowRight className="size-5"/></button></div>
    </div>
    <div ref={rail} className="product-rail -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-5 sm:gap-5 md:-mx-6 md:px-6 lg:-mx-10 lg:px-10">{products.map((product) => <div key={product.id} className="w-[78vw] max-w-[290px] shrink-0 snap-start sm:w-[44vw] md:w-[31vw] lg:w-[23vw] xl:w-[270px]"><ProductCard product={product}/></div>)}</div>
  </section>;
}

export function ProductExplorer({ products, categories }: { products: HomeProduct[]; categories: HomeCategory[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const filtered = useMemo(() => products.filter((product) => (category === "all" || product.categorySlug === category) && product.name.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) : sort === "new" ? Date.parse(b.publishedAt) - Date.parse(a.publishedAt) : (b.soldCount ?? 0) - (a.soldCount ?? 0)), [products, query, category, sort]);

  return <section id="products" className="section-pad relative overflow-hidden bg-[#eaf2ff]">
    <div className="absolute -left-24 top-20 size-72 rounded-full bg-[#6f9cff]/15 blur-3xl"/><div className="absolute -right-24 bottom-20 size-80 rounded-full bg-[#ff8a70]/15 blur-3xl"/>
    <div className="relative mx-auto max-w-[1360px] px-4 md:px-6 lg:px-10">
      <div className="mb-7 md:mb-9"><p className="text-xs font-extrabold tracking-[.16em] text-[#1268f3]">{products.some((product) => product.isDemo) ? "รายการตั้งต้นสำหรับจัดหน้า" : "รายการสินค้าจากร้าน"}</p><h2 className="mt-2 text-[clamp(1.9rem,3.4vw,3rem)] font-extrabold tracking-[-.035em] text-[#0a1d40]">เลือกของที่ใช่ ได้เร็วขึ้น</h2><p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#52627a]">ค้นหา กรองหมวด และเรียงสินค้าได้ในที่เดียว สินค้าที่มีป้าย “ภาพตัวอย่าง” พร้อมเปลี่ยนเป็นรูปจริงจาก Supabase</p></div>
      <div className="mb-8 grid gap-3 rounded-[1.5rem] border border-white/80 bg-white/90 p-3 shadow-[0_16px_40px_rgba(30,76,138,.09)] backdrop-blur md:grid-cols-[1fr_230px_210px] md:p-4">
        <label className="relative min-w-0"><span className="sr-only">ค้นหาสินค้าในรายการ</span><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#61718a]"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาจากชื่อสินค้า" className="min-h-12 w-full rounded-xl border border-[#d5e0f0] bg-[#f8fbff] pl-12 pr-4 text-base outline-none focus:border-[#1268f3]"/></label>
        <label className="relative"><span className="sr-only">กรองหมวดหมู่</span><SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#61718a]"/><select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#d5e0f0] bg-[#f8fbff] pl-11 pr-3 text-base"><option value="all">ทุกหมวดหมู่</option>{categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
        <label><span className="sr-only">เรียงสินค้า</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-12 w-full rounded-xl border border-[#d5e0f0] bg-[#f8fbff] px-4 text-base"><option value="popular">ยอดนิยม</option><option value="new">ล่าสุด</option><option value="price-low">ราคาต่ำไปสูง</option><option value="price-high">ราคาสูงไปต่ำ</option><option value="rating">คะแนนรีวิว</option></select></label>
      </div>
      {filtered.length ? <ProductGrid products={filtered}/> : <EmptyState message="ไม่พบสินค้าที่ตรงกับคำค้นและหมวดที่เลือก"/>}
    </div>
  </section>;
}

export function FlashSaleSection({ products }: { products: HomeProduct[] }) {
  const [seconds, setSeconds] = useState(8 * 60 * 60 + 24 * 60 + 16);
  useEffect(() => { const timer = window.setInterval(() => setSeconds((value) => Math.max(value - 1, 0)), 1000); return () => window.clearInterval(timer); }, []);
  const time = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];

  return <section id="flash-sale" className="section-pad px-4 md:px-6 lg:px-10">
    <div className="flash-shell relative mx-auto max-w-[1360px] overflow-hidden rounded-[2rem] p-5 text-white shadow-[0_28px_70px_rgba(7,38,91,.22)] md:p-9 lg:p-11">
      <div className="absolute -right-24 -top-24 size-64 rounded-full border-[42px] border-white/10"/><div className="absolute -bottom-28 left-[22%] size-72 rounded-full bg-[#30d7b2]/15 blur-2xl"/>
      <div className="relative mb-7 flex flex-wrap items-end justify-between gap-5 md:mb-9"><div><p className="inline-flex items-center gap-2 rounded-full bg-[#ff5b4d] px-3 py-1.5 text-xs font-extrabold tracking-[.12em] text-white"><Flame className="size-4"/>FLASH SALE</p><h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-tight tracking-[-.04em]">ดีลเด่น ราคาน่าโดน</h2><p className="mt-2 text-sm text-[#dce8ff] md:text-base">ของใช้ยอดนิยมที่เลือกมาให้แล้ว</p></div><div className="flex items-center gap-2" aria-label={`เหลือเวลา ${time[0]} ชั่วโมง ${time[1]} นาที ${time[2]} วินาที`}>{time.map((value, index) => <span key={index} className="grid size-12 place-items-center rounded-xl border border-white/20 bg-white text-lg font-extrabold tabular-nums text-[#0a1d40] shadow-lg md:size-14">{String(value).padStart(2, "0")}</span>)}</div></div>
      <div className="relative grid gap-4 md:grid-cols-3 md:gap-5">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product}/>)}</div>
    </div>
  </section>;
}
