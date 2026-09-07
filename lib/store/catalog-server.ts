import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
export const getProductBySlug = cache(async (slug: string) => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return undefined;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db
    .from("products")
    .select(
      "*,categories(slug,name),product_variants(*),product_images(url,alt_text,sort_order)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_demo", false)
    .maybeSingle();
  if (error) throw new Error("ไม่สามารถโหลดสินค้าได้");
  return data;
});
