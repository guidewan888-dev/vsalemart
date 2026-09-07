import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const supabase = createSupabaseClient();
    let query = supabase
      .from("products")
      .select(
        "id,slug,name,description,price,compare_at_price,cover_image,stock,badge,is_featured,is_flash_sale,source,source_product_id,source_url,parent_sku,category_path,preparation_days,synced_at,categories(slug,name),product_images(url,alt_text,sort_order),product_variants(id,source_variant_id,name,sku,price,stock,gtin,weight_kg,length_cm,width_cm,height_cm,minimum_purchase_quantity,maximum_purchase_quantity,shipping_options)",
      )
      .eq("is_active", true);

    query = UUID_PATTERN.test(id) ? query.eq("id", id) : query.eq("slug", id);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });

    const relation = data.categories as unknown;
    const category = (Array.isArray(relation) ? relation[0] : relation) as { slug: string; name: string } | null;
    const images = [...(data.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json(
      {
        data: {
          id: data.id,
          slug: data.slug,
          name: data.name,
          description: data.description,
          price: Number(data.price),
          compareAtPrice: data.compare_at_price == null ? null : Number(data.compare_at_price),
          currency: "THB",
          coverImage: data.cover_image,
          images: images.map((image) => ({ url: image.url, alt: image.alt_text, order: image.sort_order })),
          stock: data.stock,
          badge: data.badge,
          featured: data.is_featured,
          flashSale: data.is_flash_sale,
          category,
          variants: (data.product_variants ?? []).map((variant) => ({
            id: variant.id,
            sourceVariantId: variant.source_variant_id,
            name: variant.name,
            sku: variant.sku,
            price: Number(variant.price),
            stock: variant.stock,
            gtin: variant.gtin,
            weightKg: variant.weight_kg == null ? null : Number(variant.weight_kg),
            dimensionsCm: {
              length: variant.length_cm == null ? null : Number(variant.length_cm),
              width: variant.width_cm == null ? null : Number(variant.width_cm),
              height: variant.height_cm == null ? null : Number(variant.height_cm),
            },
            minimumPurchaseQuantity: variant.minimum_purchase_quantity,
            maximumPurchaseQuantity: variant.maximum_purchase_quantity,
            shippingOptions: variant.shipping_options,
          })),
          source: data.source,
          sourceProductId: data.source_product_id,
          buyUrl: data.source_url,
          parentSku: data.parent_sku,
          categoryPath: data.category_path,
          preparationDays: data.preparation_days,
          syncedAt: data.synced_at,
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Product detail API error", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลสินค้าได้" }, { status: 500 });
  }
}
