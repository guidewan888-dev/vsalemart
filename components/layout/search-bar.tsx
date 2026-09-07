"use client";

import Image from "next/image";
import { Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { HomeCategory, HomeProduct } from "@/types/commerce";

export function SearchBar({ products, categories, compact = false, onSelect }: { products: HomeProduct[]; categories: HomeCategory[]; compact?: boolean; onSelect?: () => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("th");
    if (!term) return products.slice(0, 4);
    return products.filter((product) => `${product.name} ${product.categoryName}`.toLocaleLowerCase("th").includes(term)).slice(0, 6);
  }, [products, query]);
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, Math.max(results.length - 1, 0))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
    if (event.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
    if (event.key === "Enter" && results[active]) { document.getElementById("products")?.scrollIntoView(); setOpen(false); onSelect?.(); }
  }
  return <div className={`relative ${compact ? "w-full" : "hidden w-full md:block"}`}>
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-[#cfe1f8] bg-[#f4f9ff] px-4 focus-within:border-[#0872f5] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0872f5]/10"><Search className="size-5 shrink-0 text-[#0872f5]"/><span className="sr-only">ค้นหาสินค้า</span><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown} placeholder="ค้นหาสินค้า ชื่อหนังสือ ระดับชั้น หรือรหัสสินค้า" role="combobox" aria-expanded={open} aria-controls="search-results" aria-activedescendant={results[active] ? `search-result-${results[active].id}` : undefined} className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[#71809a]"/><button type="button" className={`grid size-10 place-items-center ${query ? "" : "invisible"}`} onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="ล้างคำค้น"><X className="size-4"/></button></label>
    {open && <><button aria-label="ปิดผลการค้นหา" className="fixed inset-0 z-30 cursor-default bg-transparent" onClick={() => setOpen(false)}/><div id="search-results" role="listbox" className="absolute inset-x-0 top-[calc(100%+8px)] z-40 max-h-[70vh] overflow-y-auto rounded-2xl border border-[#dce2ec] bg-white p-3 shadow-2xl">
      {!query && <div className="mb-3 px-2"><p className="text-xs font-bold text-[#7b8495]">คำค้นยอดนิยม</p><div className="mt-2 flex flex-wrap gap-2">{["แบบฟอร์ม", "ปากกา", "ธงชาติไทย", "หนังสือเรียน"].map((term) => <button key={term} onClick={() => setQuery(term)} className="min-h-10 rounded-full bg-[#eef4ff] px-3 text-sm text-[#146ef5]">{term}</button>)}</div></div>}
      {results.length ? <div className="space-y-1">{results.map((product, index) => <button id={`search-result-${product.id}`} role="option" aria-selected={active === index} key={product.id} onMouseEnter={() => setActive(index)} onClick={() => { document.getElementById("products")?.scrollIntoView(); setOpen(false); onSelect?.(); }} className={`grid w-full grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl p-2 text-left ${active === index ? "bg-[#eef4ff]" : ""}`}><span className="relative aspect-square overflow-hidden rounded-lg bg-[#f7f6f2]"><Image src={product.image.src} alt="" fill sizes="52px" className="object-contain"/></span><span className="min-w-0"><b className="line-clamp-1 text-sm">{product.name}</b><small className="text-[#667085]">{product.categoryName}</small></span><strong className="text-sm text-[#ff4438]">฿{product.price.toLocaleString("th-TH")}</strong></button>)}</div> : <div className="px-4 py-8 text-center"><p className="font-bold">ไม่พบสินค้าที่ค้นหา</p><p className="mt-1 text-sm text-[#667085]">ลองค้นหาจากหมวดสินค้าแทน</p><div className="mt-3 flex flex-wrap justify-center gap-2">{categories.slice(0,4).map((item) => <button key={item.id} onClick={() => setQuery(item.name)} className="min-h-10 rounded-full border px-3 text-sm">{item.name}</button>)}</div></div>}
    </div></>}
  </div>;
}
