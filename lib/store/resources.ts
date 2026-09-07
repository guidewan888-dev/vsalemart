export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "textarea"
    | "email"
    | "datetime-local"
    | "checkbox"
    | "select";
  required?: boolean;
  options?: string[];
  hint?: string;
};
export type Resource = {
  table: string;
  title: string;
  columns: string[];
  fields: Field[];
};
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  required = true,
): Field => ({ key, label, type, required });
export const resources: Record<string, Resource> = {
  import: {
    table: "catalog_sync_runs",
    title: "ประวัตินำเข้า",
    columns: [
      "source",
      "status",
      "product_count",
      "variant_count",
      "completed_at",
    ],
    fields: [],
  },
  addresses: {
    table: "addresses",
    title: "ที่อยู่จัดส่ง",
    columns: ["name", "phone", "address", "province", "postcode"],
    fields: [
      f("name", "ชื่อผู้รับ"),
      f("phone", "เบอร์โทรศัพท์"),
      f("address", "บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต", "textarea"),
      f("province", "จังหวัด"),
      f("postcode", "รหัสไปรษณีย์"),
    ],
  },
  tax: {
    table: "tax_profiles",
    title: "ข้อมูลใบกำกับภาษี",
    columns: ["name", "tax_id", "branch", "address"],
    fields: [
      f("name", "ชื่อบุคคล / บริษัท / โรงเรียน"),
      f("tax_id", "เลขประจำตัวผู้เสียภาษี 13 หลัก"),
      f("branch", "รหัสสาขา (สำนักงานใหญ่ 00000)"),
      f("address", "ที่อยู่ใบกำกับภาษี", "textarea"),
    ],
  },
  business: {
    table: "business_accounts",
    title: "บัญชีองค์กร",
    columns: ["name", "tax_id", "contact_name", "phone", "status"],
    fields: [
      f("name", "ชื่อโรงเรียน / บริษัท"),
      f("tax_id", "เลขประจำตัวผู้เสียภาษี 13 หลัก"),
      f("branch", "รหัสสาขา"),
      f("address", "ที่อยู่องค์กร", "textarea"),
      f("contact_name", "ชื่อผู้ติดต่อ"),
      f("phone", "เบอร์โทรศัพท์"),
    ],
  },
  products: {
    table: "products",
    title: "สินค้า",
    columns: [
      "cover_image",
      "name",
      "price",
      "is_flash_sale",
      "stock",
      "source_product_id",
      "is_active",
      "source_url",
    ],
    fields: [
      f("name", "ชื่อสินค้า"),
      f("slug", "ชื่อใน URL (ไม่ซ้ำ)"),
      f("description", "รายละเอียดสินค้า", "textarea"),
      f("price", "ราคาปลีก", "number"),
      f("compare_at_price", "ราคาเดิมก่อนลด", "number", false),
      {
        ...f("badge", "ป้ายบนสินค้า", "select", false),
        options: ["sale", "new", "bestseller", "ready", "recommended", "value"],
      },
      f("is_featured", "สินค้าแนะนำ", "checkbox", false),
      f("is_flash_sale", "แสดงในโปรโมชั่น", "checkbox", false),
      f("cover_image", "URL รูปสินค้า"),
      f("category_id", "รหัสหมวดหมู่"),
      f("is_active", "เปิดขาย", "checkbox"),
    ],
  },
  variants: {
    table: "product_variants",
    title: "ตัวเลือกสินค้า",
    columns: ["name", "sku", "price", "stock", "weight_kg"],
    fields: [
      f("product_id", "รหัสสินค้า"),
      f("source_variant_id", "รหัสตัวเลือก (ไม่ซ้ำในสินค้า)"),
      f("name", "ชื่อตัวเลือก"),
      f("sku", "SKU"),
      f("price", "ราคา", "number"),
      f("weight_kg", "น้ำหนักกิโลกรัม", "number", false),
    ],
  },
  wholesale: {
    table: "wholesale_prices",
    title: "ราคาส่ง",
    columns: ["product_id", "variant_id", "minimum_quantity", "price"],
    fields: [
      f("product_id", "รหัสสินค้า"),
      f("variant_id", "รหัสตัวเลือก (เว้นว่างถ้าไม่มี)", "text", false),
      f("minimum_quantity", "จำนวนขั้นต่ำ", "number"),
      f("price", "ราคาส่งต่อชิ้น", "number"),
    ],
  },
  categories: {
    table: "categories",
    title: "หมวดหมู่",
    columns: ["name", "slug", "sort_order", "is_active"],
    fields: [
      f("name", "ชื่อหมวดหมู่"),
      f("slug", "ชื่อใน URL"),
      f("image_url", "URL ภาพหมวดหมู่"),
      f("sort_order", "ลำดับแสดง", "number"),
      f("is_active", "แสดงหมวดหมู่", "checkbox"),
    ],
  },
  shipping: {
    table: "shipping_methods",
    title: "วิธีจัดส่ง",
    columns: ["name", "mode", "base_fee", "per_kg", "free_over", "active"],
    fields: [
      f("name", "ชื่อขนส่ง / บริการ"),
      { ...f("mode", "วิธีคิดค่าส่ง", "select"), options: ["flat", "weight"] },
      f("base_fee", "ค่าจัดส่งพื้นฐาน (บาท)", "number"),
      f("per_kg", "เพิ่มต่อกิโลกรัม (ปัดขึ้น)", "number", false),
      f(
        "free_over",
        "ส่งฟรีเมื่อยอดสินค้า หลังส่วนลด ครบ (บาท)",
        "number",
        false,
      ),
      f("active", "เปิดใช้งาน", "checkbox"),
    ],
  },
  promotions: {
    table: "coupons",
    title: "คูปอง",
    columns: ["code", "kind", "amount", "minimum_total", "active"],
    fields: [
      f("code", "รหัสคูปอง"),
      { ...f("kind", "ประเภทส่วนลด", "select"), options: ["fixed", "percent"] },
      f("amount", "ส่วนลด บาท / เปอร์เซ็นต์", "number"),
      f("minimum_total", "ยอดสินค้าขั้นต่ำ", "number"),
      f("starts_at", "เริ่มใช้", "datetime-local", false),
      f("ends_at", "สิ้นสุด", "datetime-local", false),
      f("active", "เปิดใช้งาน", "checkbox"),
    ],
  },
  content: {
    table: "content_pages",
    title: "เนื้อหาเว็บไซต์",
    columns: ["id", "title", "published"],
    fields: [
      f("id", "รหัสหน้า เช่น about, shipping, returns, privacy, terms"),
      f("title", "ชื่อหน้า"),
      f("body", "เนื้อหา", "textarea"),
      f("published", "เผยแพร่", "checkbox"),
    ],
  },
  reviews: {
    table: "reviews",
    title: "รีวิว",
    columns: ["author_initial", "rating", "excerpt", "is_published"],
    fields: [
      f("excerpt", "ข้อความรีวิว", "textarea"),
      f("is_published", "เผยแพร่", "checkbox"),
    ],
  },
  orders: {
    table: "orders",
    title: "คำสั่งซื้อ",
    columns: ["reference", "total", "payment_status", "status", "created_at"],
    fields: [],
  },
  payments: {
    table: "payment_slips",
    title: "สลิป",
    columns: ["order_id", "amount", "status", "created_at"],
    fields: [],
  },
  shipments: {
    table: "orders",
    title: "จัดส่ง",
    columns: ["reference", "carrier", "tracking_number", "status"],
    fields: [],
  },
  customers: {
    table: "profiles",
    title: "ลูกค้า",
    columns: ["id", "display_name", "phone", "created_at"],
    fields: [],
  },
  quotes: {
    table: "quotes",
    title: "ใบเสนอราคา",
    columns: ["id", "offered_total", "status", "expires_at", "created_at"],
    fields: [],
  },
  returns: {
    table: "return_requests",
    title: "คำขอคืนสินค้า",
    columns: ["order_id", "reason", "resolution", "status"],
    fields: [],
  },
  notifications: {
    table: "notifications",
    title: "การแจ้งเตือน",
    columns: ["title", "message", "created_at"],
    fields: [],
  },
  support: {
    table: "support_tickets",
    title: "ข้อความ",
    columns: ["subject", "message", "reply", "status"],
    fields: [f("subject", "หัวข้อ"), f("message", "ข้อความ", "textarea")],
  },
  staff: {
    table: "staff_members",
    title: "พนักงาน",
    columns: ["user_id", "role", "created_at"],
    fields: [],
  },
  audit: {
    table: "audit_log",
    title: "ประวัติการทำงาน",
    columns: ["actor", "action", "entity_id", "details", "created_at"],
    fields: [],
  },
};
export const columnLabels: Record<string, string> = {
  cover_image: "รูปสินค้า",
  source_product_id: "รหัส Shopee",
  source_url: "แหล่งสินค้า",
  admin_note: "หมายเหตุจากร้าน",
  contact_name: "ผู้ติดต่อ",
  transferred_at: "เวลาที่โอน",
  storage_path: "หลักฐาน",
  id: "รหัส",
  user_id: "บัญชีผู้ใช้",
  name: "ชื่อ",
  phone: "โทรศัพท์",
  address: "ที่อยู่",
  province: "จังหวัด",
  postcode: "รหัสไปรษณีย์",
  tax_id: "เลขผู้เสียภาษี",
  branch: "สาขา",
  status: "สถานะ",
  price: "ราคา",
  stock: "คงเหลือ",
  is_active: "เปิดใช้งาน",
  active: "เปิดใช้งาน",
  slug: "URL",
  sort_order: "ลำดับ",
  mode: "วิธีคิด",
  base_fee: "ค่าส่งพื้นฐาน",
  per_kg: "ต่อกิโลกรัม",
  free_over: "ยอดส่งฟรี",
  code: "รหัสคูปอง",
  kind: "ประเภท",
  amount: "จำนวนเงิน",
  minimum_total: "ยอดขั้นต่ำ",
  published: "เผยแพร่",
  title: "หัวข้อ",
  author_initial: "ผู้รีวิว",
  rating: "คะแนน",
  excerpt: "รีวิว",
  is_published: "เผยแพร่",
  reference: "เลขคำสั่งซื้อ",
  total: "ยอดรวม",
  payment_status: "การชำระเงิน",
  created_at: "วันที่",
  order_id: "คำสั่งซื้อ",
  carrier: "ขนส่ง",
  tracking_number: "เลขพัสดุ",
  display_name: "ชื่อลูกค้า",
  offered_total: "ราคาสินค้าที่เสนอ",
  expires_at: "หมดอายุ",
  reason: "เหตุผล",
  resolution: "ความต้องการ",
  message: "ข้อความ",
  reply: "คำตอบ",
  role: "สิทธิ์",
  actor: "ผู้ดำเนินการ",
  action: "การทำงาน",
  entity_id: "รายการ",
  details: "รายละเอียด",
  product_id: "รหัสสินค้า",
  variant_id: "รหัสตัวเลือก",
  minimum_quantity: "ขั้นต่ำ",
  sku: "SKU",
  weight_kg: "น้ำหนัก (กก.)",
};
