import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vsalemart.com";
  const entries: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/categories",
    "/promotions",
    "/business",
    "/about",
    "/help",
    "/contact",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/policies/terms",
  ].map((path) => ({ url: base + path }));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false } });
    for (let offset = 0; offset < 49000; offset += 1000) {
      const { data, error } = await db
        .from("products")
        .select("slug,updated_at")
        .eq("is_active", true)
        .eq("is_demo", false)
        .order("id")
        .range(offset, offset + 999);
      if (error || !data?.length) break;
      entries.push(
        ...data.map((p) => ({
          url: base + "/products/" + encodeURIComponent(p.slug),
          lastModified: p.updated_at,
        })),
      );
      if (data.length < 1000) break;
    }
  }
  return entries;
}
