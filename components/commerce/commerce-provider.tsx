"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { HomeProduct } from "@/types/commerce";

type CartLine = { product: HomeProduct; quantity: number };
type CommerceContextValue = {
  cart: CartLine[];
  cartCount: number;
  cartOpen: boolean;
  favorites: Set<string>;
  toast: string;
  addToCart: (product: HomeProduct) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  openCart: (trigger?: HTMLElement) => void;
  closeCart: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const CART_KEY = "vsale-cart-v1";
const FAVORITES_KEY = "vsale-favorites-v1";

export function CommerceProvider({ children, products, dataSource }: { children: React.ReactNode; products: HomeProduct[]; dataSource: "supabase" | "demo" }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const hydrated = useRef(false);
  const cartTrigger = useRef<HTMLElement | null>(null);
  const supabase = useMemo(() => {
    if (dataSource !== "supabase" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  }, [dataSource]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as Array<{ productId: string; quantity: number }>;
        const cartMap = new Map(saved.map((line) => [line.productId, Math.max(1, line.quantity)]));
        const favoriteIds = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[]);
        if (supabase) {
          const { data: authData } = await supabase.auth.getUser();
          if (authData.user) {
            const [remoteCart, remoteFavorites] = await Promise.all([
              supabase.from("cart_items").select("product_id,quantity").eq("user_id", authData.user.id),
              supabase.from("favorites").select("product_id").eq("user_id", authData.user.id),
            ]);
            remoteCart.data?.forEach((line) => cartMap.set(line.product_id, Math.max(cartMap.get(line.product_id) ?? 0, line.quantity)));
            remoteFavorites.data?.forEach((item) => favoriteIds.add(item.product_id));
          }
        }
        if (!cancelled) {
          setCart([...cartMap].flatMap(([productId, quantity]) => { const product = products.find((item) => item.id === productId); return product ? [{ product, quantity }] : []; }));
          setFavorites(favoriteIds);
        }
      } catch { localStorage.removeItem(CART_KEY); localStorage.removeItem(FAVORITES_KEY); }
      hydrated.current = true;
    }
    void hydrate();
    return () => { cancelled = true; };
  }, [products, supabase]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart.map(({ product, quantity }) => ({ productId: product.id, quantity }))));
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      await supabase.from("cart_items").delete().eq("user_id", data.user.id);
      if (cart.length) await supabase.from("cart_items").insert(cart.map(({ product, quantity }) => ({ user_id: data.user.id, product_id: product.id, quantity })));
    });
  }, [cart, supabase]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      await supabase.from("favorites").delete().eq("user_id", data.user.id);
      if (favorites.size) await supabase.from("favorites").insert([...favorites].map((productId) => ({ user_id: data.user.id, product_id: productId })));
    });
  }, [favorites, supabase]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2200); return () => window.clearTimeout(timer); }, [toast]);

  const addToCart = useCallback((product: HomeProduct) => {
    if (!product.inStock) return;
    setCart((current) => current.some((line) => line.product.id === product.id) ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }]);
    setToast(`เพิ่ม “${product.name}” ลงตะกร้าแล้ว`);
  }, []);
  const updateQuantity = useCallback((productId: string, quantity: number) => setCart((current) => quantity < 1 ? current.filter((line) => line.product.id !== productId) : current.map((line) => line.product.id === productId ? { ...line, quantity } : line)), []);
  const removeFromCart = useCallback((productId: string) => setCart((current) => current.filter((line) => line.product.id !== productId)), []);
  const toggleFavorite = useCallback((productId: string) => setFavorites((current) => { const next = new Set(current); if (next.has(productId)) next.delete(productId); else next.add(productId); return next; }), []);
  const openCart = useCallback((trigger?: HTMLElement) => { cartTrigger.current = trigger ?? null; setCartOpen(true); }, []);
  const closeCart = useCallback(() => { setCartOpen(false); window.setTimeout(() => cartTrigger.current?.focus(), 0); }, []);
  const value = useMemo(() => ({ cart, cartCount: cart.reduce((sum, line) => sum + line.quantity, 0), cartOpen, favorites, toast, addToCart, updateQuantity, removeFromCart, toggleFavorite, openCart, closeCart }), [cart, cartOpen, favorites, toast, addToCart, updateQuantity, removeFromCart, toggleFavorite, openCart, closeCart]);
  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const value = useContext(CommerceContext);
  if (!value) throw new Error("useCommerce must be used inside CommerceProvider");
  return value;
}
