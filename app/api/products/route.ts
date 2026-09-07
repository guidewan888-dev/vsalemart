import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

function positiveInteger(value: string | null, fallback: number, maximum?: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return maximum ? Math.min(normalized, maximum) : normalized;
}

export async function GET(request: NextRequest) {
  const page = positiveInteger(request.nextUrl.searchParams.get("page"), 1);
  const limit = positiveInteger(request.nextUrl.searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
  const search = request.nextUrl.searchParams.get("q")?.trim().slice(0, 120);
  const category = request.nextUrl.searchParams.get("category")?.trim().slice(0, 80);
  const promotionsOnly = request.nextUrl.searchParams.get("promotion") === "true";
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const supabase = createSupabaseClient();
    let query = supabase
      .from("products")
      .select(
        "id,slug,name,description,price,compare_at_price,cover_image,stock,is_demo,badge,is_featured,is_flash_sale,source,source_product_id,source_url,parent_sku,category_path,preparation_days,synced_at,categories!inner(slug,name)",
        { count: "exact" },
      )
      .eq("is_active", true)
      .eq("is_demo", false);

    const sort = request.nextUrl.searchParams.get("sort");
    query =
      sort === "price-asc" || sort === "price-desc"
        ? query.order("price", { ascending: sort === "price-asc" })
        : query
            .order("is_featured", { ascending: false })
            .order("stock", { ascending: false })
            .order("name", { ascending: true });
    if (request.nextUrl.searchParams.get("inStock") === "true")
      query = query.gt("stock", 0);
    if (promotionsOnly)
      query = query.eq("is_flash_sale", true);
    if (search) query = query.ilike("name", `%${search.replaceAll("%", "").replaceAll("_", "")}%`);
    if (category) query = query.eq("categories.slug", category);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json(
      {
        data: (data ?? []).map((row) => {
          const relation = row.categories as unknown;
          const productCategory = (Array.isArray(relation) ? relation[0] : relation) as { slug: string; name: string } | null;
          return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description,
            price: Number(row.price),
            compareAtPrice: row.compare_at_price == null ? null : Number(row.compare_at_price),
            currency: "THB",
            image: row.cover_image,
            stock: row.stock,
            isDemo: row.is_demo,
            badge: row.badge,
            featured: row.is_featured,
            flashSale: row.is_flash_sale,
            category: productCategory,
            source: row.source,
            sourceProductId: row.source_product_id,
            buyUrl: row.source_url,
            parentSku: row.parent_sku,
            categoryPath: row.category_path,
            preparationDays: row.preparation_days,
            syncedAt: row.synced_at,
          };
        }),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
      {
        headers: {
          "Cache-Control": promotionsOnly
            ? "public, max-age=0, s-maxage=0, must-revalidate"
            : "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("Catalog API error", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลสินค้าได้" }, { status: 500 });
  }
}
