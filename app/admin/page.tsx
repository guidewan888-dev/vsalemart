import type { Metadata } from "next";
import { createSupabaseClient } from "@/lib/supabase";
import { AdminShell, type AdminProduct } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "ระบบหลังบ้าน",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function getProductsRange(from: number, to: number) {
  return createSupabaseClient()
    .from("products")
    .select("id,slug,name,price,cover_image,stock,badge,source_product_id,source_url,synced_at,categories(slug,name)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .range(from, to);
}

export default async function AdminPage() {
  const supabase = createSupabaseClient();
  const [firstProductsResult, secondProductsResult, activeCountResult, lowStockResult] = await Promise.all([
    getProductsRange(0, 999),
    getProductsRange(1000, 1999),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true).gt("stock", 0).lte("stock", 10),
  ]);

  const productRows = [...(firstProductsResult.data ?? []), ...(secondProductsResult.data ?? [])];
  const products: AdminProduct[] = productRows.map((row) => {
    const relation = row.categories as unknown;
    const category = (Array.isArray(relation) ? relation[0] : relation) as { slug?: string; name?: string } | null;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      price: Number(row.price),
      image: row.cover_image,
      stock: row.stock,
      badge: row.badge,
      sourceProductId: row.source_product_id,
      sourceUrl: row.source_url,
      syncedAt: row.synced_at,
      categorySlug: category?.slug ?? "other",
      categoryName: category?.name ?? "อื่น ๆ",
    };
  });

  return (
    <AdminShell
      products={products}
      activeCount={activeCountResult.count ?? products.length}
      lowStockCount={lowStockResult.count ?? 0}
      loadError={firstProductsResult.error?.message ?? secondProductsResult.error?.message ?? null}
    />
  );
}
