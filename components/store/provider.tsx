"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { HomeData, HomeProduct } from "@/types/commerce";
import { api, authClient } from "@/lib/store/client";
export type Line = {
  product: HomeProduct;
  quantity: number;
  variantId?: string;
  variantName?: string;
};
type Store = {
  data: HomeData;
  cart: Line[];
  favorites: string[];
  savedProducts: HomeProduct[];
  add: (p: HomeProduct, q?: number, v?: string, n?: string) => void;
  quantity: (key: string, q: number) => void;
  favorite: (id: string) => void;
  clear: () => void;
  notice: string;
  notify: (s: string) => void;
};
const Context = createContext<Store | null>(null);
export const lineKey = (l: Line) => l.product.id + ":" + (l.variantId ?? "");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function databaseProduct(p: Record<string, any>): HomeProduct {
  const c = Array.isArray(p.categories) ? p.categories[0] : p.categories;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    price: Number(p.price),
    compareAtPrice: p.compare_at_price,
    currency: "THB",
    image: {
      src:
        p.cover_image || "/images/vsale/products/demo/product-placeholder.svg",
      alt: p.name,
    },
    stock: p.stock,
    inStock: p.stock > 0,
    categorySlug: c?.slug ?? "",
    categoryName: c?.name ?? "สินค้า",
    isDemo: !!p.is_demo,
    isFeatured: !!p.is_featured,
    isFlashSale: !!p.is_flash_sale,
    publishedAt: p.published_at ?? "",
  };
}
export function StoreProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: HomeData;
}) {
  const [cart, setCart] = useState<Line[]>([]),
    [favorites, setFavorites] = useState<string[]>([]),
    [savedProducts, setSavedProducts] = useState<HomeProduct[]>([]),
    [notice, notify] = useState(""),
    [hydrated, setHydrated] = useState(false);
  const remoteReady = useRef(false),
    saving = useRef(Promise.resolve());
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let local: Line[] = [],
        ids: string[] = [];
      try {
        const raw = JSON.parse(localStorage.getItem("vsale-cart-v2") ?? "null");
        if (Array.isArray(raw))
          local = raw.filter(
            (l) =>
              l?.product?.id && Number.isInteger(l.quantity) && l.quantity > 0,
          );
        else {
          const old = JSON.parse(localStorage.getItem("vsale-cart-v1") ?? "[]");
          if (Array.isArray(old))
            local = old.flatMap((l) => {
              const p = data.products.find((p) => p.id === l.productId);
              return p ? [{ product: p, quantity: l.quantity }] : [];
            });
        }
        const fav = JSON.parse(
          localStorage.getItem("vsale-favorites-v2") ??
            localStorage.getItem("vsale-favorites-v1") ??
            "[]",
        );
        if (Array.isArray(fav)) ids = fav.filter((x) => typeof x === "string");
      } catch {}
      try {
        if (data.source === "supabase") {
          const { data: session } = await authClient().auth.getSession();
          if (session.session) {
            const result = await api("basket");
            const map = new Map(local.map((l) => [lineKey(l), l]));
            for (const row of result.cart) {
              if (!row.products) continue;
              const product = databaseProduct(row.products);
              const variant = row.product_variants;
              if (variant) {
                product.price = Number(variant.price);
                product.stock = variant.stock;
              }
              const line: Line = {
                product,
                quantity: row.quantity,
                variantId: row.variant_id ?? undefined,
                variantName: variant?.name,
              };
              const saved = map.get(lineKey(line));
              map.set(lineKey(line), {
                ...line,
                quantity: Math.max(saved?.quantity ?? 0, line.quantity),
              });
            }
            local = [...map.values()];
            ids = [
              ...new Set([
                ...ids,
                ...result.favorites.map(
                  (f: { product_id: string }) => f.product_id,
                ),
              ]),
            ];
            if (!cancelled)
              setSavedProducts(
                result.favorites
                  .filter((f: { products: unknown }) => !!f.products)
                  .map(
                    (f: { products: Parameters<typeof databaseProduct>[0] }) =>
                      databaseProduct(f.products),
                  ),
              );
            remoteReady.current = true;
          }
        }
      } catch {
        if (!cancelled)
          notify(
            "โหลดตะกร้าบัญชีไม่สำเร็จ กำลังใช้รายการที่บันทึกในอุปกรณ์นี้",
          );
      }
      if (!cancelled) {
        setCart(local);
        setFavorites(ids);
        setHydrated(true);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [data.products, data.source]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("vsale-cart-v2", JSON.stringify(cart));
      localStorage.setItem("vsale-favorites-v2", JSON.stringify(favorites));
    } catch {}
    if (!remoteReady.current) return;
    const timer = setTimeout(() => {
      const uuid = /^[0-9a-f-]{36}$/i;
      saving.current = saving.current
        .then(async () => {
          await api("basket", {
            lines: cart
              .filter((l) => uuid.test(l.product.id) && !l.product.isDemo)
              .map((l) => ({
                product_id: l.product.id,
                variant_id: l.variantId ?? null,
                quantity: l.quantity,
              })),
            favorites: favorites.filter((id) => uuid.test(id)),
          });
        })
        .catch(() => {
          notify("บันทึกตะกร้าในบัญชีไม่สำเร็จ รายการยังอยู่ในอุปกรณ์นี้");
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [cart, favorites, hydrated]);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => notify(""), 4000);
      return () => clearTimeout(id);
    }
  }, [notice]);
  function add(
    product: HomeProduct,
    quantity = 1,
    variantId?: string,
    variantName?: string,
  ) {
    if (!hydrated) {
      notify("กำลังโหลดตะกร้า กรุณาลองอีกครั้ง");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || product.stock < quantity)
      return;
    const line = { product, quantity, variantId, variantName };
    setCart((old) => {
      const found = old.find((l) => lineKey(l) === lineKey(line));
      return found
        ? old.map((l) =>
            lineKey(l) === lineKey(line)
              ? {
                  ...l,
                  quantity: Math.min(product.stock, l.quantity + quantity),
                }
              : l,
          )
        : [...old, line];
    });
    notify("เพิ่มสินค้าลงตะกร้าแล้ว");
  }
  return (
    <Context.Provider
      value={{
        data,
        cart,
        favorites,
        savedProducts,
        add,
        quantity: (key, q) =>
          setCart((old) =>
            q <= 0
              ? old.filter((l) => lineKey(l) !== key)
              : old.map((l) =>
                  lineKey(l) === key
                    ? {
                        ...l,
                        quantity: Math.max(
                          1,
                          Math.min(l.product.stock, Math.floor(q)),
                        ),
                      }
                    : l,
                ),
          ),
        favorite: (id) => {
          if (hydrated)
            setFavorites((old) =>
              old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
            );
        },
        clear: () => {
          setCart([]);
          try {
            localStorage.setItem("vsale-cart-v2", "[]");
          } catch {}
        },
        notice,
        notify,
      }}
    >
      {children}
      <div className="toast" role="status">
        {notice}
      </div>
    </Context.Provider>
  );
}
export function useStore() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing StoreProvider");
  return c;
}
