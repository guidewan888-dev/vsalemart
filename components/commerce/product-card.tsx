"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useCommerce } from "./commerce-provider";
import type { HomeProduct } from "@/types/commerce";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const artTones: Record<string, string> = {
  "forms-documents": "from-[#e7f3ff] to-[#cbe4ff]",
  "books-workbooks": "from-[#fff6c7] to-[#ffe36c]",
  stationery: "from-[#ffe9e3] to-[#ffc4b8]",
  "art-craft": "from-[#e3fff7] to-[#b7f1de]",
  "tape-adhesive": "from-[#f1ebff] to-[#d7c8ff]",
  "office-supplies": "from-[#e7edff] to-[#c8d6ff]",
  "flags-ceremony": "from-[#ffe4e9] to-[#cfe2ff]",
};

export function ProductCard({ product }: { product: HomeProduct }) {
  const { addToCart, favorites, toggleFavorite } = useCommerce();
  const [failed, setFailed] = useState(false);
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const liked = favorites.has(product.id);
  const artTone = artTones[product.categorySlug] ?? "from-[#eaf4ff] to-[#d2e7ff]";

  return <m.article data-product-card className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dfe8f5] bg-white shadow-[0_5px_16px_rgba(16,52,101,.06)]" whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
    <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${artTone}`}>
      {product.badgeLabel && <span className="absolute left-2 top-2 z-10 rounded-full bg-[#ff5148] px-2.5 py-1 text-[10px] font-bold text-white">{product.badgeLabel}</span>}
      <button type="button" onClick={() => toggleFavorite(product.id)} aria-label={liked ? `นำ ${product.name} ออกจากรายการโปรด` : `เพิ่ม ${product.name} ในรายการโปรด`} aria-pressed={liked} className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full border border-[#dce6f4] bg-white/95 text-[#092653] shadow-sm sm:size-9">
        <Heart className={`size-4 ${liked ? "fill-[#ff5148] text-[#ff5148]" : ""}`}/>
      </button>
      <Image src={failed ? "/images/vsale/products/demo/product-placeholder.svg" : product.image.src} alt={product.image.alt} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 28vw, 210px" className="object-contain p-3 saturate-[1.15] contrast-[1.03] transition-transform duration-300 group-hover:scale-[1.04]" onError={() => setFailed(true)}/>
      {product.isDemo && <span className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-[#092653]/88 px-2 py-1 text-[9px] font-semibold text-white"><Sparkles className="size-2.5"/>ภาพตัวอย่าง</span>}
      {!product.inStock && <div className="absolute inset-0 z-20 grid place-items-center bg-white/80"><span className="rounded-full bg-[#092653] px-3 py-1.5 text-xs font-bold text-white">สินค้าหมด</span></div>}
    </div>
    <div className="flex flex-1 flex-col p-3">
      <p className="truncate text-[10px] font-medium text-[#6b7d98]">{product.categoryName}</p>
      <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-[14px] font-bold leading-[1.55] text-[#0a2348]">{product.name}</h3>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5" aria-label={`ราคาปัจจุบัน ${money.format(product.price)}${product.compareAtPrice ? ` ราคาเดิม ${money.format(product.compareAtPrice)}` : ""}`}>
        <strong className="text-lg font-extrabold tracking-tight text-[#ff4238]">{money.format(product.price)}</strong>
        {product.compareAtPrice && <del className="text-[10px] text-[#8995a7]">{money.format(product.compareAtPrice)}</del>}
        {discount > 0 && <span className="text-[9px] font-bold text-[#e43830]">-{discount}%</span>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <div className="truncate text-[11px] font-medium text-[#66758d]"><span className="text-[#f3a400]">★</span> {product.rating?.toFixed(1) ?? "–"} · ขายแล้ว {formatCount(product.soldCount)}</div>
        <button type="button" disabled={!product.inStock} onClick={() => addToCart(product)} aria-label={`เพิ่ม ${product.name} ลงตะกร้า`} className="grid size-11 shrink-0 place-items-center rounded-full border border-[#cbdcf4] bg-white text-[#0872f5] hover:border-[#0872f5] hover:bg-[#0872f5] hover:text-white disabled:cursor-not-allowed disabled:text-[#a8b3c3] sm:size-9">
          <ShoppingCart className="size-4"/>
        </button>
      </div>
    </div>
  </m.article>;
}

function formatCount(value?: number | null) { if (!value) return "0"; return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString("th-TH"); }
export function ProductCardSkeleton() { return <div className="animate-pulse rounded-2xl bg-white"><div className="aspect-[4/3] bg-[#edf3fb]"/><div className="p-3"><div className="h-3 w-2/5 rounded bg-[#e5edf8]"/><div className="mt-3 h-9 rounded bg-[#e5edf8]"/></div></div>; }
export function EmptyState({ message = "ยังไม่พบสินค้าในหมวดนี้" }: { message?: string }) { return <div className="rounded-2xl border border-dashed border-[#bfd0e8] bg-white px-6 py-10 text-center text-sm text-[#5c6c84]">{message}</div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div className="rounded-2xl bg-[#fff1ef] px-6 py-8 text-center"><p>โหลดข้อมูลส่วนนี้ไม่สำเร็จ</p>{retry && <button className="mt-3 min-h-11 rounded-full bg-[#092653] px-5 text-white" onClick={retry}>ลองอีกครั้ง</button>}</div>; }
