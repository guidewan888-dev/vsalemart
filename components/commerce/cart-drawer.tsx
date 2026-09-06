"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useCommerce } from "./commerce-provider";

const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export function CartDrawer() {
  const { cart, cartOpen, closeCart, updateQuantity, removeFromCart } = useCommerce();
  const closeButton = useRef<HTMLButtonElement>(null);
  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  useEffect(() => {
    if (!cartOpen) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeCart(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [cartOpen, closeCart]);
  return <AnimatePresence>{cartOpen && <>
    <motion.button className="fixed inset-0 z-50 bg-[#0b1533]/45" aria-label="ปิดตะกร้า" onClick={closeCart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
    <motion.aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-white shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: .26, ease: [.22,1,.36,1] }}>
      <header className="flex items-center justify-between border-b border-[#e1e6ee] px-5 py-5"><div><p className="text-xs font-bold text-[#146ef5]">ตะกร้าของคุณ</p><h2 id="cart-title" className="text-2xl font-bold text-[#0b1533]">รายการสินค้า</h2></div><button ref={closeButton} onClick={closeCart} className="grid size-11 place-items-center rounded-full hover:bg-[#f2f5fa]" aria-label="ปิดตะกร้า"><X/></button></header>
      {cart.length === 0 ? <div className="grid flex-1 place-content-center px-8 text-center"><ShoppingBag className="mx-auto size-10 text-[#146ef5]"/><p className="mt-4 text-xl font-bold">ตะกร้ายังว่างอยู่</p><p className="mt-2 text-sm text-[#667085]">เลือกสินค้าที่ต้องการ แล้วกดเครื่องหมายบวกเพื่อเพิ่มลงตะกร้า</p><button onClick={closeCart} className="mt-6 min-h-12 rounded-full bg-[#146ef5] px-6 font-bold text-white">เลือกซื้อสินค้า</button></div> : <>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">{cart.map(({ product, quantity }) => <div key={product.id} className="grid grid-cols-[76px_1fr_auto] gap-3"><div className="relative aspect-square overflow-hidden rounded-xl bg-[#f7f6f2]"><Image src={product.image.src} alt="" fill sizes="76px" className="object-contain p-1"/></div><div className="min-w-0"><h3 className="line-clamp-2 text-sm font-semibold">{product.name}</h3><p className="mt-1 font-bold text-[#ff4438]">{money.format(product.price)}</p><div className="mt-2 flex w-fit items-center rounded-full border border-[#dce2ec]"><button className="grid size-9 place-items-center" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="ลดจำนวน"><Minus className="size-3.5"/></button><span className="min-w-7 text-center text-sm">{quantity}</span><button className="grid size-9 place-items-center" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="เพิ่มจำนวน"><Plus className="size-3.5"/></button></div></div><button className="grid size-11 place-items-center self-start text-[#667085]" onClick={() => removeFromCart(product.id)} aria-label={`ลบ ${product.name}`}><Trash2 className="size-4"/></button></div>)}</div>
        <footer className="border-t border-[#e1e6ee] p-5"><div className="flex justify-between"><span>ยอดรวม</span><strong className="text-xl">{money.format(total)}</strong></div><p className="mt-2 text-xs text-[#667085]">ค่าจัดส่งและส่วนลดคำนวณในขั้นตอนถัดไป</p><button className="mt-4 min-h-12 w-full rounded-full bg-[#146ef5] font-bold text-white">ดำเนินการสั่งซื้อ</button></footer>
      </>}
    </motion.aside>
  </>}</AnimatePresence>;
}

export function CartToast() {
  const { toast } = useCommerce();
  return <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-24 left-1/2 z-[70] -translate-x-1/2"><AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="w-max max-w-[calc(100vw-32px)] rounded-full bg-[#0b1533] px-5 py-3 text-sm font-semibold text-white shadow-xl">{toast}</motion.div>}</AnimatePresence></div>;
}
