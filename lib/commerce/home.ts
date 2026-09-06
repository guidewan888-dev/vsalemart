import { createClient } from "@supabase/supabase-js";
import { demoCategories, demoProducts, demoPromotions } from "@/src/data/demo-products";
import type { HomeCategory, HomeData, HomeProduct, HomePromotion, HomeReview } from "@/types/commerce";

export async function getHomeData(): Promise<HomeData> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallback();
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const [productsResult, categoriesResult, promotionsResult, reviewsResult] = await Promise.allSettled([
    supabase.from("products").select("id,slug,name,description,price,compare_at_price,cover_image,rating,review_count,sold_count,stock,badge,is_featured,is_flash_sale,is_demo,published_at,categories(slug,name)").eq("is_active", true).order("sold_count", { ascending: false }).limit(30),
    supabase.from("categories").select("id,slug,name,image_url").eq("is_active", true).order("sort_order"),
    supabase.from("promotions").select("id,title,subtitle,href,image_url,tone,priority,starts_at,ends_at").eq("is_active", true).order("priority"),
    supabase.from("reviews").select("id,author_initial,rating,excerpt,is_verified").eq("is_published", true).limit(3),
  ]);
  const productRows = productsResult.status === "fulfilled" && !productsResult.value.error ? productsResult.value.data : null;
  if (!productRows?.length) return fallback();
  const categoryRows = categoriesResult.status === "fulfilled" && !categoriesResult.value.error ? categoriesResult.value.data : null;
  const promotionRows = promotionsResult.status === "fulfilled" && !promotionsResult.value.error ? promotionsResult.value.data : null;
  const reviewRows = reviewsResult.status === "fulfilled" && !reviewsResult.value.error ? reviewsResult.value.data : null;

  const products: HomeProduct[] = productRows.map((row) => {
    const relation = row.categories as unknown;
    const category = (Array.isArray(relation) ? relation[0] : relation) as { slug?: string; name?: string } | null;
    return { id: row.id, slug: row.slug, name: row.name, description: row.description ?? "", categorySlug: category?.slug ?? "all", categoryName: category?.name ?? "สินค้า", price: Number(row.price), compareAtPrice: row.compare_at_price == null ? null : Number(row.compare_at_price), currency: "THB", rating: row.rating == null ? null : Number(row.rating), reviewCount: row.review_count, soldCount: row.sold_count, badge: row.badge, badgeLabel: badgeLabel(row.badge), image: { src: row.cover_image || "/images/vsale/products/demo/product-placeholder.svg", alt: row.name }, inStock: row.stock > 0, stock: row.stock, isFeatured: row.is_featured, isFlashSale: row.is_flash_sale, isDemo: row.is_demo, publishedAt: row.published_at ?? new Date().toISOString() };
  });
  const categories: HomeCategory[] = categoryRows?.length ? categoryRows.map((row) => ({ id: row.id, slug: row.slug, name: row.name, image: { src: row.image_url, alt: row.name } })) : demoCategories;
  const promotions: HomePromotion[] = promotionRows?.length ? promotionRows.map((row) => ({ id: row.id, title: row.title, subtitle: row.subtitle ?? undefined, href: row.href, image: { src: row.image_url, alt: row.title }, tone: row.tone, priority: row.priority, startsAt: row.starts_at ?? undefined, endsAt: row.ends_at ?? undefined })) : demoPromotions;
  const reviews: HomeReview[] = reviewRows?.map((row) => ({ id: row.id, authorInitial: row.author_initial, rating: Number(row.rating), excerpt: row.excerpt, verified: row.is_verified })) ?? [];
  return { products, categories, promotions, reviews, source: "supabase" };
}

function fallback(): HomeData { return { products: demoProducts, categories: demoCategories, promotions: demoPromotions, reviews: [], source: "demo" }; }
function badgeLabel(badge: HomeProduct["badge"]) { return ({ sale: "ลดราคา", new: "สินค้าใหม่", bestseller: "ขายดี", ready: "พร้อมส่ง", recommended: "แนะนำ", value: "ชุดสุดคุ้ม" } as const)[badge ?? "sale"] ?? null; }
