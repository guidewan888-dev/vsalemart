"use client";

import Image from "next/image";
import { Heart, ShoppingCart, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useCommerce } from "./commerce-provider";
import type { HomeProduct } from "@/types/commerce";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const artTones: Record<string, string> = {
  "forms-documents": "from-[#fff1df] to-[#ffd6aa]",
  "books-workbooks": "from-[#fff7c5] to-[#ffd95e]",
  stationery: "from-[#ffe9dc] to-[#ffb98d]",
  "art-craft": "from-[#fff0d2] to-[#ffc979]",
  "tape-adhesive": "from-[#ffe7d5] to-[#ffc0a1]",
  "office-supplies": "from-[#fff3df] to-[#ffd0a0]",
  "flags-ceremony": "from-[#ffe7da] to-[#ffbf98]",
};

export function ProductCard({ product }: { product: HomeProduct }) {
  const { addToCart, favorites, toggleFavorite } = useCommerce();
  const [failed, setFailed] = useState(false);
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const liked = favorites.has(product.id);
  const artTone = artTones[product.categorySlug] ?? "from-[#fff2df] to-[#ffd4a8]";

  return <m.article data-product-card className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-white bg-white shadow-[0_7px_20px_rgba(20,55,102,.09)] ring-1 ring-[#dce8f6]/70" whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
    <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${artTone}`}>
      {product.badgeLabel && <span className="absolute left-2 top-2 z-10 rounded-full bg-[#ff4361] px-2.5 py-1 text-[10px] font-black text-white shadow-sm">{product.badgeLabel}</span>}
      <button type="button" onClick={() => toggleFavorite(product.id)} aria-label={liked ? `นำ ${product.name} ออกจากรายการโปรด` : `เพิ่ม ${product.name} ในรายการโปรด`} aria-pressed={liked} className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full border border-[#ffe0bf] bg-white/95 text-[#4a2b1b] shadow-sm sm:size-9">
        <Heart className={`size-4 ${liked ? "fill-[#ff5148] text-[#ff5148]" : ""}`}/>
      </button>
      <Image src={failed ? "/images/vsale/products/demo/product-placeholder.svg" : product.image.src} alt={product.image.alt} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 28vw, 210px" className="object-contain p-3 saturate-[1.15] contrast-[1.03] transition-transform duration-300 group-hover:scale-[1.04]" onError={() => setFailed(true)}/>
      {product.isDemo && <span className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-[#6b300d]/88 px-2 py-1 text-[9px] font-semibold text-white"><Sparkles className="size-2.5"/>ภาพตัวอย่าง</span>}
      {!product.inStock && <div className="absolute inset-0 z-20 grid place-items-center bg-white/80"><span className="rounded-full bg-[#6b300d] px-3 py-1.5 text-xs font-bold text-white">สินค้าหมด</span></div>}
    </div>
    <div className="flex flex-1 flex-col p-3">
      <p className="truncate text-[10px] font-bold text-[#8a684f]">{product.categoryName}</p>
      <h3 className="mt-1 line-clamp-2 min-h-[2.6rem] text-[13px] font-extrabold leading-[1.5] text-[#3a2114]">{product.name}</h3>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5" aria-label={`ราคาปัจจุบัน ${money.format(product.price)}${product.compareAtPrice ? ` ราคาเดิม ${money.format(product.compareAtPrice)}` : ""}`}>
        <strong className="text-lg font-black tracking-tight text-[#e94816]">{money.format(product.price)}</strong>
        {product.compareAtPrice && <del className="text-[10px] text-[#8995a7]">{money.format(product.compareAtPrice)}</del>}
        {discount > 0 && <span className="text-[9px] font-bold text-[#e43830]">-{discount}%</span>}
      </div>
      <div className="mt-auto pt-2"><div className="truncate text-[10px] font-semibold text-[#80685b]"><span className="text-[#f3a400]">★</span> {product.rating?.toFixed(1) ?? "–"} · ขายแล้ว {formatCount(product.soldCount)}</div><button type="button" disabled={!product.inStock} onClick={() => addToCart(product)} aria-label={`เพิ่ม ${product.name} ลงตะกร้า`} className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#d94700] px-2 text-[11px] font-extrabold text-white shadow-[0_5px_12px_rgba(217,71,0,.2)] hover:bg-[#bd3e00] disabled:cursor-not-allowed disabled:bg-[#eee8e3] disabled:text-[#9a8b82]"><ShoppingCart className="size-3.5"/>{product.inStock ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}</button></div>
    </div>
  </m.article>;
}

function formatCount(value?: number | null) { if (!value) return "0"; return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString("th-TH"); }
export function ProductCardSkeleton() { return <div className="animate-pulse rounded-2xl bg-white"><div className="aspect-[4/3] bg-[#edf3fb]"/><div className="p-3"><div className="h-3 w-2/5 rounded bg-[#e5edf8]"/><div className="mt-3 h-9 rounded bg-[#e5edf8]"/></div></div>; }
export function EmptyState({ message = "ยังไม่พบสินค้าในหมวดนี้" }: { message?: string }) { return <div className="rounded-2xl border border-dashed border-[#bfd0e8] bg-white px-6 py-10 text-center text-sm text-[#5c6c84]">{message}</div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div className="rounded-2xl bg-[#fff1e8] px-6 py-8 text-center"><p>โหลดข้อมูลส่วนนี้ไม่สำเร็จ</p>{retry && <button className="mt-3 min-h-11 rounded-full bg-[#d94700] px-5 text-white" onClick={retry}>ลองอีกครั้ง</button>}</div>; }
