"use client";

import { ArrowLeft, ArrowRight, Flame, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { HomeCategory, HomeProduct } from "@/types/commerce";
import { EmptyState, ProductCard } from "@/components/commerce/product-card";

export function ProductGrid({ products }: { products: HomeProduct[] }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>;
}

export function ProductSection({ id, title, products, subtitle }: { id: string; title: string; products: HomeProduct[]; subtitle?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => rail.current?.scrollBy({ left: direction * Math.min(rail.current.clientWidth * 0.86, 1000), behavior: "smooth" });
  if (!products.length) return <EmptyState/>;
  const themes: Record<string, { shell: string; bar: string; label: string }> = {
    "best-sellers": { shell: "bg-[#fff8d9]", bar: "bg-[#ffb800]", label: "ฮิตที่สุด" },
    bundles: { shell: "bg-[#e5fbf3]", bar: "bg-[#16bd8a]", label: "คุ้มเป็นชุด" },
    "new-arrivals": { shell: "bg-[#eaf4ff]", bar: "bg-[#0872f5]", label: "เพิ่งมา" },
  };
  const theme = themes[id] ?? { shell: "bg-[#f4f7ff]", bar: "bg-[#7b53ed]", label: "เลือกช้อป" };

  return <section id={id} className="compact-section mx-auto max-w-[1200px] px-4 md:px-0">
    <div className={`overflow-hidden rounded-[24px] ${theme.shell} px-4 py-5 md:px-5`}>
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0"><span className={`inline-flex rounded-full ${theme.bar} px-2.5 py-1 text-[10px] font-black text-white`}>{theme.label}</span><h2 className="mt-1.5 text-[clamp(1.6rem,2.7vw,2.15rem)] font-black leading-tight tracking-[-.03em] text-[#092653]">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-[#62738b] sm:text-sm">{subtitle}</p>}</div>
      <div className="flex shrink-0 gap-2"><button onClick={() => scroll(-1)} className="grid size-11 place-items-center rounded-full border border-[#cddbf0] bg-white text-[#092653] hover:border-[#0872f5] hover:text-[#0872f5] sm:size-9" aria-label="ดูก่อนหน้า"><ArrowLeft className="size-4"/></button><button onClick={() => scroll(1)} className="grid size-11 place-items-center rounded-full border border-[#cddbf0] bg-white text-[#0872f5] hover:bg-[#0872f5] hover:text-white sm:size-9" aria-label="ดูถัดไป"><ArrowRight className="size-4"/></button></div>
    </div>
    <div ref={rail} className="product-rail -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:-mx-5 md:px-5">{products.map((product) => <div key={product.id} className="w-[44vw] max-w-[188px] shrink-0 snap-start sm:w-[30vw] md:w-[24vw] lg:w-[176px]"><ProductCard product={product}/></div>)}</div>
    </div>
  </section>;
}

export function ProductExplorer({ products, categories }: { products: HomeProduct[]; categories: HomeCategory[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const filtered = useMemo(() => products.filter((product) => (category === "all" || product.categorySlug === category) && product.name.toLocaleLowerCase("th").includes(query.toLocaleLowerCase("th"))).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) : sort === "new" ? Date.parse(b.publishedAt) - Date.parse(a.publishedAt) : (b.soldCount ?? 0) - (a.soldCount ?? 0)), [products, query, category, sort]);
  return <section id="products" className="compact-section bg-[#f1f7ff]"><div className="mx-auto max-w-[1320px] px-4 md:px-6"><div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end"><div><h2 className="text-3xl font-extrabold text-[#092653]">สินค้าทั้งหมด</h2><p className="mt-1 text-sm text-[#62738b]">ค้นหาและกรองสินค้าจากร้าน</p></div><div className="grid gap-2 sm:grid-cols-3 lg:w-[700px]"><label className="relative"><span className="sr-only">ค้นหาสินค้า</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#718198]"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาสินค้า" className="min-h-11 w-full rounded-lg border border-[#cad9ed] bg-white pl-10 pr-3 text-sm"/></label><label className="relative"><span className="sr-only">กรองหมวดหมู่</span><SlidersHorizontal className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#718198]"/><select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 w-full rounded-lg border border-[#cad9ed] bg-white pl-9 pr-3 text-sm"><option value="all">ทุกหมวดหมู่</option>{categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label><label><span className="sr-only">เรียงสินค้า</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-11 w-full rounded-lg border border-[#cad9ed] bg-white px-3 text-sm"><option value="popular">ยอดนิยม</option><option value="new">ล่าสุด</option><option value="price-low">ราคาต่ำไปสูง</option><option value="price-high">ราคาสูงไปต่ำ</option><option value="rating">คะแนนรีวิว</option></select></label></div></div>{filtered.length ? <ProductGrid products={filtered}/> : <EmptyState message="ไม่พบสินค้าที่ตรงกับคำค้นและหมวดที่เลือก"/>}</div></section>;
}

export function FlashSaleSection({ products }: { products: HomeProduct[] }) {
  return <section id="flash-sale" className="compact-section px-4 md:px-6"><div className="flash-shell relative mx-auto max-w-[1200px] overflow-hidden rounded-[26px] p-4 text-white shadow-[0_18px_45px_rgba(231,47,80,.18)] md:p-6"><span className="absolute -right-12 -top-20 size-56 rounded-full bg-[#ffd83d]/30"/><span className="absolute right-28 top-2 size-20 rounded-full border-[14px] border-white/10"/><div className="relative mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="inline-flex items-center gap-1 rounded-full bg-[#ffd83d] px-2.5 py-1 text-[10px] font-black tracking-wider text-[#17345d]"><Flame className="size-3"/>FLASH SALE</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">โปรมาแล้ว ช้อปได้เลย</h2><p className="mt-1 text-xs font-medium text-white/85 md:text-sm">ราคาพิเศษช่วงนี้ จนกว่าสินค้าจะหมด</p></div><a href="#promotions" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-[#e93455]">ดูโปรทั้งหมด <ArrowRight className="size-4"/></a></div><div className="relative grid grid-cols-2 gap-3 lg:grid-cols-4">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product}/>)}</div></div></section>;
}
