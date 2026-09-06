"use client";

import Image from "next/image";
import { Heart, ShoppingBag, ShoppingCart, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useCommerce } from "./commerce-provider";
import type { HomeProduct } from "@/types/commerce";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

const artTones: Record<string, string> = {
  "forms-documents": "from-[#e8f2ff] via-[#f8fbff] to-[#dceaff]",
  "books-workbooks": "from-[#fff2c7] via-[#fffaf0] to-[#ffe6a0]",
  stationery: "from-[#ffe8e3] via-[#fff8f6] to-[#ffd3c8]",
  "art-craft": "from-[#e5fbf4] via-[#f8fffd] to-[#c8f2e4]",
  "tape-adhesive": "from-[#f0eaff] via-[#faf8ff] to-[#dfd2ff]",
  "office-supplies": "from-[#e7edff] via-[#f8faff] to-[#d6e0ff]",
  "flags-ceremony": "from-[#ffe8ec] via-[#fff8f9] to-[#dce9ff]",
};

export function ProductCard({ product }: { product: HomeProduct }) {
  const { addToCart, favorites, toggleFavorite } = useCommerce();
  const [failed, setFailed] = useState(false);
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const liked = favorites.has(product.id);
  const artTone = artTones[product.categorySlug] ?? "from-[#eef4ff] via-white to-[#e3ecff]";

  return (
    <m.article data-product-card className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.6rem] border border-[#dce7f6] bg-white p-2.5 shadow-[0_12px_35px_rgba(16,52,101,.08)]" whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <div className={`relative aspect-square overflow-hidden rounded-[1.2rem] bg-gradient-to-br ${artTone}`}>
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-white/50" />
        <div className="absolute -bottom-10 -left-8 size-32 rounded-full border-[18px] border-white/40" />
        {product.badgeLabel && <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#ff5b4d] px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">{product.badgeLabel}</span>}
        <button type="button" onClick={() => toggleFavorite(product.id)} aria-label={liked ? `นำ ${product.name} ออกจากรายการโปรด` : `เพิ่ม ${product.name} ในรายการโปรด`} aria-pressed={liked} className="absolute right-2.5 top-2.5 z-10 grid size-11 place-items-center rounded-full border border-white/80 bg-white/95 text-[#0a1d40] shadow-md focus-visible:ring-2 focus-visible:ring-[#146ef5]">
          <Heart className={`size-5 ${liked ? "fill-[#ff5b4d] text-[#ff5b4d]" : ""}`} />
        </button>
        <Image src={failed ? "/images/vsale/products/demo/product-placeholder.svg" : product.image.src} alt={product.image.alt} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw" className="object-contain p-5 drop-shadow-[0_12px_16px_rgba(11,31,67,.14)] transition-transform duration-300 group-hover:scale-[1.045] sm:p-7" onError={() => setFailed(true)} />
        {product.isDemo && <span className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-[#0a1d40]/90 px-2.5 py-1 text-[10px] font-semibold text-white"><Sparkles className="size-3"/>ภาพตัวอย่าง</span>}
        {!product.inStock && <div className="absolute inset-0 z-20 grid place-items-center bg-white/78 backdrop-blur-[2px]"><span className="rounded-full bg-[#0a1d40] px-4 py-2 text-sm font-bold text-white">สินค้าหมด</span></div>}
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
        <p className="text-[12px] font-semibold text-[#547096]">{product.categoryName}</p>
        <h3 className="mt-1.5 line-clamp-2 min-h-[3.35rem] text-[16px] font-bold leading-[1.65] text-[#0a1d40]">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1" aria-label={`ราคาปัจจุบัน ${money.format(product.price)}${product.compareAtPrice ? ` ราคาเดิม ${money.format(product.compareAtPrice)}` : ""}`}>
          <strong className="text-[21px] font-extrabold tracking-tight text-[#f04438]">{money.format(product.price)}</strong>
          {product.compareAtPrice && <del className="text-[12px] text-[#7b879a]">{money.format(product.compareAtPrice)}</del>}
          {discount > 0 && <span className="rounded-full bg-[#fff0ed] px-2 py-0.5 text-[11px] font-bold text-[#d92d20]">-{discount}%</span>}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[13px] font-medium text-[#52627a]"><span className="text-[#f6a609]">★</span><span>{product.rating?.toFixed(1) ?? "–"}</span><span aria-hidden="true">•</span><span>ขายแล้ว {formatCount(product.soldCount)}</span></div>
        <button type="button" disabled={!product.inStock} onClick={() => addToCart(product)} aria-label={`เพิ่ม ${product.name} ลงตะกร้า`} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1268f3] px-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(18,104,243,.22)] hover:bg-[#0758d9] disabled:cursor-not-allowed disabled:bg-[#e7edf5] disabled:text-[#8793a6] disabled:shadow-none">
          {product.inStock ? <ShoppingBag className="size-4"/> : <ShoppingCart className="size-4"/>}{product.inStock ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
        </button>
      </div>
    </m.article>
  );
}

function formatCount(value?: number | null) { if (!value) return "0"; return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString("th-TH"); }

export function ProductCardSkeleton() { return <div className="animate-pulse rounded-[1.6rem] bg-white p-2.5"><div className="aspect-square rounded-[1.2rem] bg-[#e8eef8]"/><div className="mx-2 mt-4 h-3 w-2/5 rounded bg-[#e8eef8]"/><div className="mx-2 mt-3 h-5 rounded bg-[#e8eef8]"/><div className="mx-2 mt-3 h-12 rounded-xl bg-[#e8eef8]"/></div>; }
export function EmptyState({ message = "ยังไม่พบสินค้าในหมวดนี้" }: { message?: string }) { return <div className="rounded-3xl border-2 border-dashed border-[#c7d6ec] bg-white/70 px-6 py-16 text-center font-medium text-[#52627a]">{message}</div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div className="rounded-3xl bg-[#fff0ed] px-6 py-10 text-center"><p>โหลดข้อมูลส่วนนี้ไม่สำเร็จ</p>{retry && <button className="mt-3 min-h-11 rounded-full bg-[#0a1d40] px-5 text-white" onClick={retry}>ลองอีกครั้ง</button>}</div>; }
