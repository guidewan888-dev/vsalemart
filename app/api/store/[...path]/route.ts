/* eslint-disable @typescript-eslint/no-explicit-any -- Request payloads are allowlisted and database/RPC validated. */
import { createClient } from "@supabase/supabase-js";
import { resources } from "@/lib/store/resources";
import { NextRequest } from "next/server";
const privateHeaders = { "Cache-Control": "private, no-store" };
const response = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: privateHeaders });
async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await params).path;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key)
      return response({ error: "ยังไม่ได้เชื่อมต่อระบบข้อมูล" }, 503);
    const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
    const db = createClient(url, key, {
      auth: { persistSession: false },
      global: { headers: token ? { Authorization: "Bearer " + token } : {} },
    });
    if (req.method === "GET" && path[0] === "config") {
      const [cfg, ship] = await Promise.all([
        db.rpc("checkout_config"),
        db.from("shipping_methods").select("*").eq("active", true),
      ]);
      if (cfg.error || ship.error)
        throw new Error("ร้านยังไม่พร้อมรับคำสั่งซื้อ");
      return response({ config: cfg.data, shipping: ship.data });
    }
    if (req.method === "GET" && path[0] === "content") {
      const { data, error } = await db
        .from("content_pages")
        .select("title,body")
        .eq("id", path[1])
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return response({ data });
    }
    if (req.method === "GET" && path[0] === "reviews") {
      const { data, error } = await db
        .from("reviews")
        .select("id,rating,excerpt")
        .eq("product_id", req.nextUrl.searchParams.get("product"))
        .eq("is_published", true);
      if (error) throw error;
      return response({ data });
    }
    if (!token) return response({ error: "กรุณาเข้าสู่ระบบ" }, 401);
    const { data: auth, error: authError } = await db.auth.getUser(token);
    if (authError || !auth.user)
      return response({ error: "กรุณาเข้าสู่ระบบใหม่" }, 401);
    const uid = auth.user.id;
    const { data: isAdmin, error: roleError } = await db.rpc("is_store_admin");
    if (roleError) throw new Error("ยังไม่ได้ติดตั้งโครงสร้างระบบใหม่");
    if (path[0] === "me") {
      const [profile, business] = await Promise.all([
        db.from("profiles").select("*").eq("id", uid).maybeSingle(),
        db
          .from("business_accounts")
          .select("*")
          .eq("user_id", uid)
          .maybeSingle(),
      ]);
      return response({
        user: { id: uid, email: auth.user.email },
        admin: !!isAdmin,
        profile: profile.data,
        business: business.data,
      });
    }
    const admin = path[0] === "admin";
    if (admin && !isAdmin)
      return response({ error: "บัญชีนี้ไม่มีสิทธิ์จัดการร้าน" }, 403);
    if (req.method === "GET" && admin && path[1] === "dashboard") {
      const r = await db.rpc("store_dashboard");
      if (r.error) throw r.error;
      return response(r.data);
    }
    if (req.method === "GET" && admin && path[1] === "settings") {
      const { data, error } = await db
        .from("store_settings")
        .select("value")
        .eq("id", "store")
        .single();
      if (error) throw error;
      return response({ data: data.value });
    }
    if (req.method === "GET" && path[0] === "slip") {
      const { data, error } = await db
        .from("payment_slips")
        .select("storage_path")
        .eq("id", path[1])
        .single();
      if (error) throw error;
      const signed = await db.storage
        .from("payment-slips")
        .createSignedUrl(data.storage_path, 120);
      if (signed.error) throw signed.error;
      return response({ url: signed.data.signedUrl });
    }
    if (req.method === "GET" && path[0] === "invoice") {
      const { data, error } = await db
        .from("tax_documents")
        .select("*")
        .eq("order_id", path[1])
        .maybeSingle();
      if (error) throw error;
      return response({ data });
    }
    if (req.method === "GET" && path[0] === "basket") {
      const [cart, fav] = await Promise.all([
        db
          .from("cart_items")
          .select("*,products(*,categories(slug,name)),product_variants(*)")
          .eq("user_id", uid),
        db
          .from("favorites")
          .select("product_id,products(*,categories(slug,name))")
          .eq("user_id", uid),
      ]);
      if (cart.error || fav.error)
        throw new Error("โหลดรายการที่บันทึกไม่สำเร็จ");
      return response({ cart: cart.data, favorites: fav.data });
    }
    let body: Record<string, any> = {};
    if (req.method === "POST") {
      const raw = await req.text();
      if (raw.length > 100000)
        return response({ error: "ข้อมูลมีขนาดใหญ่เกินไป" }, 413);
      body = JSON.parse(raw);
      if (path[0] === "basket") {
        const { error } = await db.rpc("save_store_basket", {
          lines: body.lines,
          favorite_ids: body.favorites,
        });
        if (error) throw error;
        return response({ ok: true });
      }

      if (admin && path[1] === "issue-invoice") {
        const { data, error } = await db.rpc("issue_store_invoice", {
          order_ref: body.id,
        });
        if (error) throw error;
        return response({ id: data });
      }

      if (path[0] === "checkout" || path[0] === "preview") {
        const { data, error } = await db.rpc("store_checkout", {
          lines: body.lines,
          address_id: body.address_id,
          shipping_id: body.shipping_id,
          billing_id: body.tax_id || null,
          coupon_code: body.coupon || "",
          request_key: body.key,
          quote_ref: body.quote_id || null,
          note: body.note || "",
          commit_order: path[0] === "checkout",
          expected_total: body.expected_total ?? null,
        });
        if (error) throw error;
        return response(data);
      }
      if (path[0] === "cancel") {
        const { error } = await db.rpc("cancel_store_order", {
          order_ref: body.id,
        });
        if (error) throw error;
        return response({ ok: true });
      }
      if (path[0] === "submit-slip") {
        const { error } = await db.rpc("submit_store_slip", {
          order_ref: body.order_id,
          path: body.path,
          paid_amount: Number(body.amount),
          paid_at: body.transferred_at,
        });
        if (error) throw error;
        return response({ ok: true });
      }
      if (admin && path[1] === "action") {
        const { error } = await db.rpc("store_admin_action", {
          action: body.action,
          entity: body.id,
          payload: body.payload ?? {},
        });
        if (error) throw error;
        return response({ ok: true });
      }
      if (path[0] === "profile") {
        const { error } = await db
          .from("profiles")
          .update({
            display_name: String(body.display_name ?? "").slice(0, 100),
            phone: String(body.phone ?? "").slice(0, 30),
          })
          .eq("id", uid);
        if (error) throw error;
        return response({ ok: true });
      }
      if (admin && path[1] === "settings") {
        const allowed = [
          "name",
          "tax_id",
          "branch",
          "address",
          "bank_name",
          "bank_account",
          "bank_holder",
          "vat_rate",
          "vat_registered",
          "prices_include_vat",
          "checkout_enabled",
          "payment_hours",
        ];
        const value = Object.fromEntries(
          allowed.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
        );
        if (
          value.checkout_enabled &&
          (!value.bank_name ||
            !value.bank_holder ||
            !value.bank_account ||
            !value.tax_id ||
            !value.address ||
            value.vat_rate === null ||
            value.vat_rate === undefined)
        )
          throw new Error(
            "กรอกข้อมูลร้าน บัญชีรับเงิน และภาษีก่อนเปิดรับออเดอร์",
          );
        const { data: current, error: readError } = await db
          .from("store_settings")
          .select("value")
          .eq("id", "store")
          .single();
        if (readError) throw readError;
        const { error } = await db
          .from("store_settings")
          .update({
            value: { ...(current.value ?? {}), ...value },
            updated_at: new Date().toISOString(),
          })
          .eq("id", "store");
        if (error) throw error;
        return response({ ok: true });
      }
      if (path[0] === "quotes") {
        if (!Array.isArray(body.items) || !body.items.length)
          throw new Error("กรุณาเลือกสินค้า");
        const items = body.items
          .slice(0, 100)
          .map(
            (l: {
              product_id: string;
              variant_id?: string;
              quantity: number;
              name?: string;
            }) => ({
              product_id: l.product_id,
              variant_id: l.variant_id ?? null,
              quantity: Number(l.quantity),
              name: String(l.name ?? "").slice(0, 200),
            }),
          );
        if (
          items.some(
            (l: { quantity: number }) =>
              !Number.isInteger(l.quantity) || l.quantity < 1,
          )
        )
          throw new Error("จำนวนไม่ถูกต้อง");
        const { data, error } = await db
          .from("quotes")
          .insert({
            user_id: uid,
            items,
            note: String(body.note ?? "").slice(0, 2000),
          })
          .select("id")
          .single();
        if (error) throw error;
        return response({ id: data.id });
      }
      if (path[0] === "returns") {
        const { error } = await db.from("return_requests").insert({
          user_id: uid,
          order_id: body.order_id,
          reason: String(body.reason ?? "").slice(0, 2000),
          resolution: body.resolution,
        });
        if (error) throw error;
        return response({ ok: true });
      }
      if (path[0] === "review") {
        const { error } = await db.from("reviews").insert({
          user_id: uid,
          product_id: body.product_id,
          rating: Number(body.rating),
          excerpt: String(body.excerpt ?? "").slice(0, 2000),
          author_initial: auth.user.email?.slice(0, 1) ?? "ลูกค้า",
          is_verified: false,
          is_published: false,
        });
        if (error) throw error;
        return response({ ok: true });
      }
    }
    const name = admin ? path[1] : path[0],
      id = admin ? path[2] : path[1],
      resource = resources[name];
    if (!resource) return response({ error: "ไม่พบรายการ" }, 404);
    if (
      !admin &&
      ![
        "addresses",
        "tax",
        "business",
        "orders",
        "quotes",
        "returns",
        "notifications",
        "support",
      ].includes(name)
    )
      return response({ error: "ไม่มีสิทธิ์" }, 403);
    if (req.method === "GET") {
      const page = Math.max(
        1,
        Number(req.nextUrl.searchParams.get("page")) || 1,
      );
      let query = db
        .from(resource.table)
        .select(
          name === "orders" || name === "shipments" ? "*,order_items(*)" : "*",
          { count: "exact" },
        );
      if (!admin) query = query.eq("user_id", uid);
      if (id) query = query.eq("id", id);
      if (name === "shipments")
        query = query.in("status", ["paid", "packing", "shipped", "completed"]);
      const status = req.nextUrl.searchParams.get("status");
      if (status) query = query.eq("status", status);
      const search = req.nextUrl.searchParams
        .get("q")
        ?.replace(/[%_]/g, "")
        .slice(0, 120);
      if (search && ["products", "categories", "customers"].includes(name))
        query = query.ilike(
          name === "customers" ? "display_name" : "name",
          "%" + search + "%",
        );
      const { data, error, count } = await query
        .order(name === "import" ? "started_at" : "created_at", {
          ascending: false,
        })
        .range((page - 1) * 30, page * 30 - 1);
      if (error) throw error;
      return response({
        data: id ? (data?.[0] ?? null) : data,
        total: count,
        page,
      });
    }
    if (req.method === "POST") {
      if (!admin && !["addresses", "tax", "business", "support"].includes(name))
        return response({ error: "ไม่มีสิทธิ์" }, 403);
      if (!resource.fields.length)
        return response({ error: "ใช้ขั้นตอนจัดการรายการนี้โดยเฉพาะ" }, 400);
      if (!admin && id && ["business", "support"].includes(name))
        return response({ error: "แก้ไขรายการที่ส่งแล้วไม่ได้" }, 403);
      const values: Record<string, unknown> = {};
      for (const field of resource.fields) {
        if (body[field.key] !== undefined) {
          let val = body[field.key];
          if (field.type === "number")
            val = val === "" || val === null ? null : Number(val);
          if (
            field.required &&
            (val === null || val === "") &&
            field.type !== "checkbox"
          )
            throw new Error("กรุณากรอก " + field.label);
          values[field.key] =
            typeof val === "string" ? val.slice(0, 10000) : val;
        }
      }
      if (!admin) values.user_id = uid;
      const query = id
        ? db.from(resource.table).update(values).eq("id", id)
        : db.from(resource.table).insert(values);
      const { data, error } = await query.select("id").single();
      if (error) throw error;
      return response({ id: data.id });
    }
    if (
      req.method === "DELETE" &&
      !admin &&
      ["addresses", "tax"].includes(name) &&
      id
    ) {
      const { error } = await db
        .from(resource.table)
        .delete()
        .eq("id", id)
        .eq("user_id", uid);
      if (error) throw error;
      return response({ ok: true });
    }
    return response({ error: "ไม่รองรับคำสั่งนี้" }, 405);
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e && "message" in e
          ? String(e.message)
          : "ไม่สามารถดำเนินการได้";
    return response({ error: message }, 400);
  }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
