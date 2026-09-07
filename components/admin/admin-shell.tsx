"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileSpreadsheet,
  LayoutDashboard,
  Megaphone,
  Menu,
  PackageCheck,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  badge: string | null;
  sourceProductId: string | null;
  sourceUrl: string | null;
  syncedAt: string | null;
  categorySlug: string;
  categoryName: string;
};

type AdminView =
  | "overview"
  | "orders"
  | "shipping"
  | "products"
  | "categories"
  | "import"
  | "marketing"
  | "customers"
  | "reports"
  | "settings"
  | "help";

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("th-TH");

const menuGroups = [
  {
    label: "ร้านค้า",
    items: [
      ["ภาพรวม", LayoutDashboard, "#overview"],
      ["คำสั่งซื้อ", ShoppingBag, "#orders"],
      ["การจัดส่ง", Truck, "#shipping"],
    ],
  },
  {
    label: "สินค้า",
    items: [
      ["สินค้าของฉัน", Boxes, "#products"],
      ["หมวดหมู่", Tag, "#categories"],
      ["นำเข้าจาก Shopee", FileSpreadsheet, "#import"],
    ],
  },
  {
    label: "การเติบโต",
    items: [
      ["การตลาด", Megaphone, "#marketing"],
      ["ลูกค้า", Users, "#customers"],
      ["รายงาน", BarChart3, "#reports"],
    ],
  },
  {
    label: "งานขายและบริการ",
    items: [
      ["ตรวจสลิป", PackageCheck, "#payments"],
      ["สต็อกสินค้า", Boxes, "#inventory"],
      ["บัญชีองค์กร", Users, "#business"],
      ["ใบเสนอราคา", FileSpreadsheet, "#quotes"],
      ["คืนสินค้าและคืนเงิน", RefreshCw, "#returns"],
      ["รีวิวสินค้า", Tag, "#reviews"],
      ["ข้อความลูกค้า", CircleHelp, "#support"],
    ],
  },
  {
    label: "กำหนดค่า",
    items: [
      ["ขนส่งและค่าส่ง", Truck, "#shippingSettings"],
      ["เนื้อหาเว็บ", Megaphone, "#content"],
      ["สิทธิ์พนักงาน", Users, "#staff"],
      ["ประวัติการทำงาน", FileSpreadsheet, "#audit"],
    ],
  },
  {
    label: "ระบบ",
    items: [
      ["ตั้งค่าร้าน", Settings, "#settings"],
      ["ศูนย์ช่วยเหลือ", CircleHelp, "#help"],
    ],
  },
] as const;

export function AdminShell({
  products = [],
  activeCount = 0,
  lowStockCount = 0,
  loadError = null,
  children,
}: {
  products?: AdminProduct[];
  activeCount?: number;
  lowStockCount?: number;
  loadError?: string | null;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const destinations: Record<string, string> = {
    overview: "/admin",
    orders: "/admin/orders",
    shipping: "/admin/shipments",
    products: "/admin/products",
    categories: "/admin/categories",
    import: "/admin/import",
    marketing: "/admin/promotions",
    customers: "/admin/customers",
    reports: "/admin/reports",
    settings: "/admin/settings",
    help: "/help",
    inventory: "/admin/inventory",
    payments: "/admin/payments",
    business: "/admin/business",
    quotes: "/admin/quotes",
    returns: "/admin/returns",
    reviews: "/admin/reviews",
    content: "/admin/content",
    shippingSettings: "/admin/shipping",
    staff: "/admin/staff",
    audit: "/admin/audit",
    support: "/admin/support",
  };
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const categories = useMemo(
    () =>
      [
        ...new Map(
          products.map((product) => [
            product.categorySlug,
            product.categoryName,
          ]),
        ).entries(),
      ].sort((a, b) => a[1].localeCompare(b[1], "th")),
    [products],
  );
  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesQuery =
          !query ||
          product.name
            .toLocaleLowerCase("th")
            .includes(query.toLocaleLowerCase("th")) ||
          product.sourceProductId?.includes(query);
        const matchesCategory =
          category === "all" || product.categorySlug === category;
        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "low" ? product.stock <= 10 : product.stock > 10);
        return matchesQuery && matchesCategory && matchesStock;
      }),
    [products, query, category, stockFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(
    (Math.min(page, pageCount) - 1) * pageSize,
    Math.min(page, pageCount) * pageSize,
  );
  const latestSync = products.find((product) => product.syncedAt)?.syncedAt;

  function updateFilters(callback: () => void) {
    callback();
    setPage(1);
  }

  return (
    <div className="legacy-admin min-h-dvh bg-[#f6f7f9] text-[#263342]">
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 lg:px-6">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg hover:bg-[#fff2ea] lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="เปิดเมนู"
          >
            <Menu className="size-5" />
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-lg font-black tracking-tight text-[#ee4d2d]"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-[#ee4d2d] text-white">
              <Store className="size-5" />
            </span>
            V SALE{" "}
            <span className="hidden text-xs font-semibold text-[#7b8794] sm:inline">
              Seller Center
            </span>
          </Link>
          <form
            action="/admin/products"
            className="ml-auto hidden w-full max-w-md items-center rounded-lg border border-[#dfe3e8] bg-[#fafbfc] px-3 md:flex"
          >
            <Search className="size-4 text-[#8a96a3]" />
            <input
              className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              name="q"
              aria-label="ค้นหาสินค้าในหลังบ้าน"
              placeholder="ค้นหาสินค้า"
            />
          </form>
          <Link
            href="/"
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dfe3e8] px-3 text-xs font-bold hover:border-[#ee4d2d] hover:text-[#ee4d2d] md:ml-0"
          >
            ดูหน้าร้าน <ExternalLink className="size-3.5" />
          </Link>
          <button
            type="button"
            className="hidden min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-bold sm:inline-flex"
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#fff1eb] text-[#ee4d2d]">
              V
            </span>
            vsale <ChevronDown className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        <button
          type="button"
          className={`fixed inset-0 z-40 bg-black/35 lg:hidden ${mobileNavOpen ? "block" : "hidden"}`}
          onClick={() => setMobileNavOpen(false)}
          aria-label="ปิดเมนู"
        />
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[272px] overflow-y-auto border-r border-[#e5e7eb] bg-white px-3 pb-8 pt-4 transition-transform lg:sticky lg:top-16 lg:z-10 lg:h-[calc(100dvh-4rem)] lg:w-[228px] lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="mb-4 flex items-center justify-between px-2 lg:hidden">
            <strong className="text-[#ee4d2d]">เมนูจัดการร้าน</strong>
            <button
              type="button"
              className="grid size-11 place-items-center"
              onClick={() => setMobileNavOpen(false)}
              aria-label="ปิดเมนู"
            >
              <X className="size-5" />
            </button>
          </div>
          {menuGroups.map((group) => (
            <nav key={group.label} className="mb-5" aria-label={group.label}>
              <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[.1em] text-[#9aa3ad]">
                {group.label}
              </p>
              {group.items.map(([label, Icon, href]) => {
                const view = href.slice(1) as AdminView;
                return (
                  <Link
                    key={label}
                    href={children ? destinations[view] : href}
                    onClick={() => {
                      if (!children) setActiveView(view);
                      setMobileNavOpen(false);
                    }}
                    className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold hover:bg-[#fff2ed] hover:text-[#d93d20] ${(children ? pathname === destinations[view] || (view !== "overview" && pathname.startsWith(destinations[view] + "/")) : activeView === view) ? "bg-[#fff2ed] text-[#d93d20]" : "text-[#4b5968]"}`}
                  >
                    <Icon className="size-[18px]" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          ))}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-[1160px]">
            {children ?? (
              <>
                <section
                  id="overview"
                  className={`scroll-mt-24 ${activeView === "overview" ? "block" : "hidden"}`}
                >
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#ee4d2d]">
                        ภาพรวมร้าน
                      </p>
                      <h1 className="mt-1 text-2xl font-black tracking-tight text-[#202b36]">
                        สวัสดี V SALE
                      </h1>
                      <p className="mt-1 text-sm text-[#687584]">
                        ติดตามสินค้าและงานสำคัญของร้านในที่เดียว
                      </p>
                    </div>
                    <a
                      href="#import"
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#ee4d2d] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#d94124]"
                    >
                      <RefreshCw className="size-4" />
                      อัปเดตจาก Shopee
                    </a>
                  </div>
                  <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[#e4e7eb] bg-[#e4e7eb] sm:grid-cols-3">
                    <Metric
                      label="สินค้าพร้อมขาย"
                      value={number.format(activeCount)}
                      detail="แสดงบนหน้าร้าน"
                      icon={PackageCheck}
                    />
                    <Metric
                      label="สต็อกใกล้หมด"
                      value={number.format(lowStockCount)}
                      detail="เหลือไม่เกิน 10 ชิ้น"
                      icon={AlertTriangle}
                      warn={lowStockCount > 0}
                    />
                    <Metric
                      label="ข้อมูลที่โหลดมาจัดการ"
                      value={number.format(products.length)}
                      detail="สินค้าพร้อมขายทั้งหมด"
                      icon={Boxes}
                    />
                  </div>
                </section>

                <section
                  id="import"
                  className={`${activeView === "overview" || activeView === "import" ? "block" : "hidden"} mt-5 scroll-mt-24 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white`}
                >
                  <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="flex gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf7ef] text-[#138a4a]">
                        <FileSpreadsheet className="size-5" />
                      </span>
                      <div>
                        <h2 className="font-black text-[#27323d]">
                          ข้อมูลจาก Shopee พร้อมใช้งาน
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-[#6b7785]">
                          นำเข้าชื่อ รายละเอียด ราคา สต็อก ตัวเลือก น้ำหนัก ขนาด
                          และรูปสินค้าแล้ว
                          {latestSync
                            ? ` · ซิงก์ล่าสุด ${new Date(latestSync).toLocaleString("th-TH")}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://seller.shopee.co.th/portal/product-mass/mass-update/download"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#ee4d2d] px-4 text-sm font-bold text-[#d94326] hover:bg-[#fff3ee]"
                    >
                      เปิดหน้าส่งออก Shopee <ExternalLink className="size-4" />
                    </a>
                  </div>
                </section>

                <section
                  id="products"
                  className={`${activeView === "overview" || activeView === "products" || activeView === "categories" ? "block" : "hidden"} mt-5 scroll-mt-24 rounded-xl border border-[#e5e7eb] bg-white`}
                >
                  <div className="border-b border-[#edf0f2] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-black text-[#27323d]">
                          สินค้าของฉัน
                        </h2>
                        <p className="mt-1 text-xs text-[#7b8794]">
                          ข้อมูลจริงจากฐานสินค้า V SALE
                        </p>
                      </div>
                      <span className="rounded-full bg-[#eff8f2] px-3 py-1 text-xs font-bold text-[#16864c]">
                        ขายอยู่ {number.format(activeCount)}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 md:grid-cols-[minmax(240px,1fr)_220px_170px]">
                      <label className="flex min-h-10 items-center rounded-lg border border-[#dfe3e8] px-3 focus-within:border-[#ee4d2d]">
                        <Search className="size-4 text-[#8a96a3]" />
                        <input
                          value={query}
                          onChange={(event) =>
                            updateFilters(() => setQuery(event.target.value))
                          }
                          className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                          placeholder="ชื่อสินค้า หรือรหัสสินค้า"
                        />
                      </label>
                      <select
                        value={category}
                        onChange={(event) =>
                          updateFilters(() => setCategory(event.target.value))
                        }
                        className="min-h-10 rounded-lg border border-[#dfe3e8] bg-white px-3 text-sm outline-none focus:border-[#ee4d2d]"
                      >
                        <option value="all">ทุกหมวดหมู่</option>
                        {categories.map(([slug, name]) => (
                          <option key={slug} value={slug}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={stockFilter}
                        onChange={(event) =>
                          updateFilters(() =>
                            setStockFilter(event.target.value),
                          )
                        }
                        className="min-h-10 rounded-lg border border-[#dfe3e8] bg-white px-3 text-sm outline-none focus:border-[#ee4d2d]"
                      >
                        <option value="all">ทุกระดับสต็อก</option>
                        <option value="low">ใกล้หมด ≤ 10</option>
                        <option value="ready">มากกว่า 10</option>
                      </select>
                    </div>
                  </div>

                  {loadError ? (
                    <div
                      role="alert"
                      className="m-5 rounded-lg bg-[#fff0ed] p-4 text-sm text-[#b93622]"
                    >
                      โหลดรายการสินค้าไม่สำเร็จ: {loadError}
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] border-collapse text-left">
                          <thead>
                            <tr className="bg-[#fafbfc] text-[11px] font-bold uppercase tracking-wide text-[#7a8694]">
                              <th className="px-5 py-3">สินค้า</th>
                              <th className="px-4 py-3">หมวดหมู่</th>
                              <th className="px-4 py-3 text-right">ราคา</th>
                              <th className="px-4 py-3 text-right">สต็อก</th>
                              <th className="px-4 py-3">สถานะ</th>
                              <th className="px-5 py-3 text-right">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visible.map((product) => (
                              <ProductRow key={product.id} product={product} />
                            ))}
                          </tbody>
                        </table>
                        {!visible.length && (
                          <div className="px-6 py-16 text-center text-sm text-[#7a8694]">
                            ไม่พบสินค้าที่ตรงกับตัวกรอง
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f2] px-5 py-3 text-xs text-[#707d8b]">
                        <span>
                          แสดง{" "}
                          {visible.length
                            ? (Math.min(page, pageCount) - 1) * pageSize + 1
                            : 0}
                          –
                          {Math.min(
                            Math.min(page, pageCount) * pageSize,
                            filtered.length,
                          )}{" "}
                          จาก {number.format(filtered.length)} รายการ
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPage((current) => Math.max(1, current - 1))
                            }
                            disabled={page <= 1}
                            className="grid size-9 place-items-center rounded-lg border border-[#dfe3e8] disabled:opacity-40"
                            aria-label="หน้าก่อนหน้า"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <span className="min-w-20 text-center font-bold">
                            หน้า {Math.min(page, pageCount)} / {pageCount}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPage((current) =>
                                Math.min(pageCount, current + 1),
                              )
                            }
                            disabled={page >= pageCount}
                            className="grid size-9 place-items-center rounded-lg border border-[#dfe3e8] disabled:opacity-40"
                            aria-label="หน้าถัดไป"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </section>

                <section
                  id="orders"
                  className={`${activeView === "orders" ? "block" : "hidden"} scroll-mt-24 rounded-xl border border-[#e5e7eb] bg-white`}
                >
                  <PanelHeader
                    eyebrow="คำสั่งซื้อ"
                    title="คำสั่งซื้อของฉัน"
                    copy="ตรวจสอบ ชำระเงิน แพ็ก และจัดส่งจากคิวเดียว"
                  />
                  <StatusTabs
                    labels={[
                      "ทั้งหมด 0",
                      "ที่ต้องจัดส่ง 0",
                      "กำลังจัดส่ง 0",
                      "สำเร็จแล้ว 0",
                      "ยกเลิก 0",
                    ]}
                  />
                  <EmptyWork
                    icon={ShoppingBag}
                    title="ยังไม่มีคำสั่งซื้อบนเว็บไซต์"
                    copy="คำสั่งซื้อจาก Shopee จะยังไม่ซิงก์จนกว่าร้านจะได้รับสิทธิ์ Official API"
                  />
                </section>

                {activeView === "shipping" && (
                  <OperationalPanel
                    icon={Truck}
                    eyebrow="การจัดส่ง"
                    title="จัดส่งแบบชุด"
                    copy="เตรียมพัสดุ พิมพ์เอกสาร และติดตามสถานะการส่ง"
                  >
                    <StatusTabs
                      labels={[
                        "ต้องจัดส่ง 0",
                        "เตรียมจัดส่งแล้ว 0",
                        "ส่งมอบแล้ว 0",
                      ]}
                    />
                    <EmptyWork
                      icon={Truck}
                      title="ยังไม่มีพัสดุที่ต้องดำเนินการ"
                      copy="รายการจะปรากฏเมื่อมีคำสั่งซื้อจากเว็บไซต์ V SALE"
                    />
                  </OperationalPanel>
                )}
                {activeView === "marketing" && (
                  <OperationalPanel
                    icon={Megaphone}
                    eyebrow="Marketing Centre"
                    title="เครื่องมือการตลาด"
                    copy="วางโปรโมชันและติดตามกิจกรรมที่กำลังใช้งาน"
                  >
                    <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        "โปรเปิดเทอม",
                        "ดีลประจำสัปดาห์",
                        "เซตสำนักงาน",
                        "สินค้าต่ำกว่า ฿99",
                      ].map((name, index) => (
                        <div
                          key={name}
                          className="rounded-lg border border-[#e7eaee] p-4"
                        >
                          <span className="text-[11px] font-bold text-[#ee4d2d]">
                            กำลังแสดง
                          </span>
                          <h3 className="mt-2 text-sm font-black">{name}</h3>
                          <p className="mt-1 text-xs text-[#7b8794]">
                            ลำดับที่ {index + 1} บนหน้าร้าน
                          </p>
                        </div>
                      ))}
                    </div>
                  </OperationalPanel>
                )}
                {activeView === "customers" && (
                  <OperationalPanel
                    icon={Users}
                    eyebrow="ลูกค้า"
                    title="รีวิวและข้อความลูกค้า"
                    copy="ติดตามเสียงจากลูกค้าและงานที่ต้องตอบ"
                  >
                    <StatusTabs
                      labels={["รีวิวทั้งหมด 0", "รอตอบ 0", "รายงานแล้ว 0"]}
                    />
                    <EmptyWork
                      icon={Users}
                      title="ยังไม่มีรีวิวบนเว็บไซต์"
                      copy="รีวิว Shopee ไม่สามารถดึงผ่าน Official API ได้ในสถานะร้านปัจจุบัน"
                    />
                  </OperationalPanel>
                )}
                {activeView === "reports" && (
                  <OperationalPanel
                    icon={BarChart3}
                    eyebrow="ข้อมูล"
                    title="รายงานร้านค้า"
                    copy="ภาพรวมแคตตาล็อกและความพร้อมขาย"
                  >
                    <div className="grid gap-px overflow-hidden border-t border-[#edf0f2] bg-[#edf0f2] sm:grid-cols-3">
                      <Metric
                        label="สินค้าพร้อมขาย"
                        value={number.format(activeCount)}
                        detail="รายการที่มีราคา สต็อก และรูป"
                        icon={PackageCheck}
                      />
                      <Metric
                        label="สินค้าใกล้หมด"
                        value={number.format(lowStockCount)}
                        detail="ควรเติมสต็อก"
                        icon={AlertTriangle}
                        warn
                      />
                      <Metric
                        label="มูลค่าสต็อก"
                        value={money.format(
                          products.reduce(
                            (sum, item) => sum + item.price * item.stock,
                            0,
                          ),
                        )}
                        detail="คำนวณจากสินค้าพร้อมขายทั้งหมด"
                        icon={BarChart3}
                      />
                    </div>
                  </OperationalPanel>
                )}
                {activeView === "settings" && (
                  <OperationalPanel
                    icon={Settings}
                    eyebrow="ระบบ"
                    title="ตั้งค่าร้านค้า"
                    copy="สถานะบริการที่เชื่อมกับ V SALE"
                  >
                    <div className="divide-y divide-[#edf0f2]">
                      {[
                        ["เว็บไซต์และโดเมน", "vsalemart.com", "เชื่อมต่อแล้ว"],
                        ["ฐานข้อมูล", "Supabase", "เชื่อมต่อแล้ว"],
                        ["การเผยแพร่", "Vercel", "พร้อมใช้งาน"],
                        ["คลังโค้ด", "GitHub", "เชื่อมต่อแล้ว"],
                        ["แหล่งข้อมูลสินค้า", "Shopee Excel", "นำเข้าแล้ว"],
                      ].map(([name, value, status]) => (
                        <div
                          key={name}
                          className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr_auto] sm:items-center"
                        >
                          <strong className="text-sm">{name}</strong>
                          <span className="text-sm text-[#687584]">
                            {value}
                          </span>
                          <span className="text-xs font-bold text-[#16864c]">
                            ● {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </OperationalPanel>
                )}
                {activeView === "help" && (
                  <OperationalPanel
                    icon={CircleHelp}
                    eyebrow="ช่วยเหลือ"
                    title="ขั้นตอนงานประจำ"
                    copy="ทางลัดสำหรับดูแลข้อมูลร้าน"
                  >
                    <div className="grid gap-3 p-5 md:grid-cols-3">
                      {[
                        [
                          "อัปเดตสินค้า",
                          "ส่งออกไฟล์ 5 ชุดจาก Shopee แล้วนำเข้าฐานข้อมูล",
                        ],
                        ["ตรวจสต็อก", "เปิดสินค้าของฉันและเลือกตัวกรองใกล้หมด"],
                        [
                          "ตรวจหน้าร้าน",
                          "เปิดหน้า V SALE และทดสอบค้นหา/ตะกร้า",
                        ],
                      ].map(([title, copy], index) => (
                        <div
                          key={title}
                          className="rounded-lg border border-[#e6e9ed] p-4"
                        >
                          <span className="grid size-7 place-items-center rounded-full bg-[#fff0eb] text-xs font-black text-[#e14427]">
                            {index + 1}
                          </span>
                          <h3 className="mt-3 text-sm font-black">{title}</h3>
                          <p className="mt-1 text-xs leading-5 text-[#6f7c89]">
                            {copy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </OperationalPanel>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function PanelHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="p-5">
      <p className="text-xs font-bold text-[#ee4d2d]">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-black text-[#27323d]">{title}</h2>
      <p className="mt-1 text-sm text-[#6b7785]">{copy}</p>
    </div>
  );
}

function StatusTabs({ labels }: { labels: string[] }) {
  return (
    <div className="flex gap-6 overflow-x-auto border-y border-[#edf0f2] px-5 text-sm">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          className={`min-h-12 whitespace-nowrap border-b-2 font-semibold ${index === 0 ? "border-[#ee4d2d] text-[#dd4326]" : "border-transparent text-[#687584]"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function EmptyWork({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Boxes;
  title: string;
  copy: string;
}) {
  return (
    <div className="m-5 flex min-h-44 items-center justify-center rounded-lg border border-dashed border-[#dfe3e8] bg-[#fafbfc] text-center">
      <div>
        <Icon className="mx-auto size-7 text-[#9aa3ad]" />
        <p className="mt-3 text-sm font-bold">{title}</p>
        <p className="mx-auto mt-1 max-w-lg text-xs leading-5 text-[#7b8794]">
          {copy}
        </p>
      </div>
    </div>
  );
}

function OperationalPanel({
  icon: Icon,
  eyebrow,
  title,
  copy,
  children,
}: {
  icon: typeof Boxes;
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e5e7eb] bg-white">
      <div className="flex items-start gap-3">
        <span className="ml-5 mt-5 grid size-10 shrink-0 place-items-center rounded-lg bg-[#fff0eb] text-[#e14427]">
          <Icon className="size-5" />
        </span>
        <PanelHeader eyebrow={eyebrow} title={title} copy={copy} />
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  warn = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Boxes;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 bg-white p-5">
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${warn ? "bg-[#fff3df] text-[#d77a00]" : "bg-[#fff0eb] text-[#e64628]"}`}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs font-semibold text-[#73808e]">{label}</p>
        <strong className="mt-0.5 block text-2xl font-black text-[#222e3a]">
          {value}
        </strong>
        <span className="text-[11px] text-[#8a96a3]">{detail}</span>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: AdminProduct }) {
  const [failed, setFailed] = useState(false);
  return (
    <tr className="border-t border-[#edf0f2] text-sm hover:bg-[#fffaf7]">
      <td className="px-5 py-3">
        <div className="flex min-w-[300px] items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#eceff2] bg-[#f7f8fa]">
            {product.image && !failed ? (
              <Image
                src={product.image}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
                onError={() => setFailed(true)}
              />
            ) : (
              <span className="grid h-full place-items-center text-[10px] text-[#a1aab4]">
                ไม่มีรูป
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 max-w-[390px] font-semibold leading-5 text-[#2e3945]">
              {product.name}
            </p>
            <p className="mt-0.5 text-[11px] text-[#8a96a3]">
              รหัส {product.sourceProductId ?? product.slug}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-[#657280]">
        {product.categoryName}
      </td>
      <td className="px-4 py-3 text-right font-bold text-[#263442]">
        {money.format(product.price)}
      </td>
      <td
        className={`px-4 py-3 text-right font-bold ${product.stock <= 10 ? "text-[#d87900]" : "text-[#263442]"}`}
      >
        {number.format(product.stock)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7ef] px-2.5 py-1 text-[11px] font-bold text-[#14834a]">
          <span className="size-1.5 rounded-full bg-[#1da35b]" />
          ขายอยู่
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        {product.sourceUrl ? (
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-[#d94427] hover:bg-[#fff0eb]"
          >
            เปิดใน Shopee <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <span className="text-xs text-[#9aa3ad]">—</span>
        )}
      </td>
    </tr>
  );
}
