"use client";

import Image from "next/image";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useCommerce } from "./commerce-provider";
import type { HomeProduct } from "@/types/commerce";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export function ProductCard({ product }: { product: HomeProduct }) {
  const { addToCart, favorites, toggleFavorite } = useCommerce();
  const [failed, setFailed] = useState(false);
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const liked = favorites.has(product.id);
  return (
    <m.article className="group min-w-0" whileHover={{ y: -5 }} transition={{ duration: .2 }}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white">
        {product.badgeLabel && <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-[#ff5a47] px-2.5 py-1 text-[11px] font-bold text-white">{product.badgeLabel}</span>}
        <button type="button" onClick={() => toggleFavorite(product.id)} aria-label={liked ? `นำ ${product.name} ออกจากรายการโปรด` : `เพิ่ม ${product.name} ในรายการโปรด`} aria-pressed={liked} className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full bg-white/95 text-[#0b1533] shadow-sm focus-visible:ring-2 focus-visible:ring-[#146ef5]">
          <Heart className={`size-5 ${liked ? "fill-[#ff5a47] text-[#ff5a47]" : ""}`} />
        </button>
        <Image src={failed ? "/images/vsale/products/demo/product-placeholder.svg" : product.image.src} alt={product.image.alt} fill sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 17vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" onError={() => setFailed(true)} />
        {!product.inStock && <div className="absolute inset-0 grid place-items-center bg-white/70"><span className="rounded-full bg-[#0b1533] px-4 py-2 text-sm font-bold text-white">สินค้าหมด</span></div>}
      </div>
      <p className="mt-3 text-xs text-[#667085]">{product.categoryName}</p>
      <h3 className="mt-1 line-clamp-2 min-h-[3rem] text-[15px] font-semibold leading-6 text-[#0b1533]">{product.name}</h3>
      <div className="mt-1 flex items-baseline gap-2" aria-label={`ราคาปัจจุบัน ${money.format(product.price)}${product.compareAtPrice ? ` ราคาเดิม ${money.format(product.compareAtPrice)}` : ""}`}>
        <strong className="text-lg text-[#ff4438]">{money.format(product.price)}</strong>
        {product.compareAtPrice && <del className="text-xs text-[#8992a3]">{money.format(product.compareAtPrice)}</del>}
        {discount > 0 && <span className="text-[10px] font-bold text-[#ff4438]">-{discount}%</span>}
      </div>
      <div className="mt-1 flex min-h-6 items-center justify-between gap-2 text-xs text-[#667085]">
        <span><span className="text-[#f4a600]">★</span> {product.rating?.toFixed(1) ?? "–"} · ขายแล้ว {formatCount(product.soldCount)}</span>
        <button type="button" disabled={!product.inStock} onClick={() => addToCart(product)} aria-label={`เพิ่ม ${product.name} ลงตะกร้า`} className="grid size-11 shrink-0 place-items-center rounded-full border border-[#dce2ec] bg-white text-[#146ef5] transition hover:border-[#146ef5] hover:bg-[#146ef5] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
          {product.inStock ? <Plus className="size-5"/> : <ShoppingCart className="size-4"/>}
        </button>
      </div>
      {product.isDemo && <span className="mt-2 inline-block rounded bg-[#fff3d9] px-2 py-1 text-[10px] text-[#76520b]">ข้อมูลตัวอย่าง</span>}
    </m.article>
  );
}

function formatCount(value?: number | null) { if (!value) return "0"; return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString("th-TH"); }

export function ProductCardSkeleton() { return <div className="animate-pulse"><div className="aspect-[4/5] rounded-2xl bg-[#e8edf5]"/><div className="mt-3 h-3 w-2/5 rounded bg-[#e8edf5]"/><div className="mt-2 h-5 w-full rounded bg-[#e8edf5]"/><div className="mt-2 h-5 w-1/2 rounded bg-[#e8edf5]"/></div>; }
export function EmptyState({ message = "ยังไม่พบสินค้าในหมวดนี้" }: { message?: string }) { return <div className="rounded-2xl border border-dashed border-[#cfd7e4] px-6 py-16 text-center text-[#667085]">{message}</div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div className="rounded-2xl bg-[#fff0ed] px-6 py-10 text-center"><p>โหลดข้อมูลส่วนนี้ไม่สำเร็จ</p>{retry && <button className="mt-3 min-h-11 rounded-full bg-[#0b1533] px-5 text-white" onClick={retry}>ลองอีกครั้ง</button>}</div>; }
