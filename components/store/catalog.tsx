"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart, Heart, Trash2, FileText } from "lucide-react";
import { useStore, lineKey, databaseProduct } from "./provider";
import { ProductCard, Benefits, BusinessBanner, Empty, Quantity } from "./ui";
import { money } from "@/lib/store/routes";
import type { HomeProduct } from "@/types/commerce";
const HOME_PAGE_SIZE = 50;

export function Home() {
  const { data } = useStore();
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(data.products.slice(0, HOME_PAGE_SIZE));
  const [total, setTotal] = useState(data.products.length);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selectedCategory = data.categories.find((c) => c.slug === category);
  const demoProducts = category
    ? data.products.filter((product) => product.categorySlug === category)
    : data.products;
  const visibleItems =
    data.source === "demo"
      ? demoProducts.slice(
          (page - 1) * HOME_PAGE_SIZE,
          page * HOME_PAGE_SIZE,
        )
      : items;
  const visibleTotal = data.source === "demo" ? demoProducts.length : total;

  useEffect(() => {
    if (data.source === "demo") return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      fetch(
        "/api/products?" +
          new URLSearchParams({
            category,
            page: String(page),
            limit: String(HOME_PAGE_SIZE),
            sort: "popular",
          }),
        { signal: ctrl.signal },
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.error) throw new Error(result.error);
          setItems(result.data.map(convert));
          setTotal(result.pagination.total);
        })
        .catch((caught) => {
          if (caught.name !== "AbortError") setError(caught.message);
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setBusy(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [category, page, data.products, data.source]);

  function showCategory(slug: string) {
    setCategory(slug);
    setPage(1);
    scrollHomeProducts();
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    scrollHomeProducts();
  }

  function scrollHomeProducts() {
    requestAnimationFrame(() =>
      document
        .getElementById("home-products")
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        }),
    );
  }

  return (
    <>
      <div className="hero">
        <div className="hero-main">
          <img
            src="/images/vsale/hero-home.png"
            alt="อุปกรณ์การเรียนและเครื่องเขียน VSaleMart"
          />
          <div className="hero-copy">
            <p className="eyebrow">READY FOR EVERY DAY</p>
            <h1>
              ครบเรื่องเรียน
              <br />
              พร้อมเรื่องงาน
            </h1>
            <p>
              เครื่องเขียน หนังสือ และอุปกรณ์สำนักงาน
              <br />
              เลือกของที่ใช่สำหรับทุกวันของคุณ
            </p>
            <Link href="/products" className="btn">
              เลือกซื้อสินค้า
            </Link>
          </div>
        </div>
        <BusinessBanner />
      </div>
      <Benefits />
      <section className="section">
        <div className="section-head">
          <h2>ช้อปตามหมวดหมู่</h2>
          <button
            className="link small category-reset"
            type="button"
            onClick={() => showCategory("")}
          >
            แสดงสินค้าทั้งหมด →
          </button>
        </div>
        <Categories
          compact
          selectedCategory={category}
          onSelect={showCategory}
        />
      </section>
      <section className="section home-products" id="home-products">
        <div className="section-head">
          <div>
            <p className="eyebrow">EVERYDAY ESSENTIALS</p>
            <h2>
              {selectedCategory
                ? `สินค้าในหมวด${selectedCategory.name}`
                : "สินค้าแนะนำสำหรับคุณ"}
            </h2>
            <p className="small muted">
              พบ {visibleTotal.toLocaleString("th-TH")} รายการ
            </p>
          </div>
          <Link className="link small" href="/products">
            สินค้าทั้งหมด →
          </Link>
        </div>
        {data.source === "demo" && (
          <p className="alert">
            กำลังแสดงสินค้าตัวอย่าง ยังไม่ใช่รายการสำหรับสั่งซื้อจริง
          </p>
        )}
        {error && <p className="alert error">{error}</p>}
        {busy ? (
          <div className="products" aria-label="กำลังโหลดสินค้า">
            {Array.from({ length: HOME_PAGE_SIZE }, (_, index) => (
              <div className="skeleton" key={index} />
            ))}
          </div>
        ) : visibleItems.length ? (
          <div className="products">
            {visibleItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Empty
            title="ยังไม่มีสินค้าในหมวดนี้"
            description="ลองเลือกหมวดอื่นหรือดูสินค้าทั้งหมด"
          />
        )}
        <Pagination
          page={page}
          total={visibleTotal}
          pageSize={HOME_PAGE_SIZE}
          onChange={changePage}
        />
      </section>
      <section className="panel grid3">
        <div>
          <FileText color="var(--brand)" />
          <h3>ขอใบเสนอราคา</h3>
          <p className="small muted">เลือกสินค้าและส่งรายการให้ร้านกำหนดราคา</p>
          <Link className="link" href="/quotes/new">
            เริ่มขอราคา →
          </Link>
        </div>
        <div>
          <h3>ติดตามทุกคำสั่งซื้อ</h3>
          <p className="small muted">ดูผลตรวจสลิปและเลขพัสดุจากบัญชีของคุณ</p>
          <Link className="link" href="/account/orders">
            ดูคำสั่งซื้อ →
          </Link>
        </div>
        <div>
          <h3>ต้องการความช่วยเหลือ?</h3>
          <p className="small muted">
            สอบถามรายละเอียดสินค้าและบริการหลังการขาย
          </p>
          <Link className="link" href="/contact">
            ติดต่อร้าน →
          </Link>
        </div>
      </section>
    </>
  );
}
export function Categories({
  compact = false,
  selectedCategory = "",
  onSelect,
}: {
  compact?: boolean;
  selectedCategory?: string;
  onSelect?: (slug: string) => void;
}) {
  const { data } = useStore();
  return (
    <div className={compact ? "categories" : "grid3"}>
      {data.categories.map((c) => {
        const content = (
          <>
          <img
            src={c.image.src}
            alt=""
            style={
              compact
                ? {}
                : {
                    width: 100,
                    height: 100,
                    objectFit: "contain",
                    objectPosition: "center",
                    padding: 6,
                    background: "#fff8f3",
                    borderRadius: 10,
                  }
            }
          />
          <span>{c.name}</span>
          </>
        );
        return onSelect ? (
          <button
            className={`category category-choice${selectedCategory === c.slug ? " active" : ""}`}
            key={c.id}
            type="button"
            aria-pressed={selectedCategory === c.slug}
            onClick={() => onSelect(c.slug)}
          >
            {content}
          </button>
        ) : (
          <Link
            className={compact ? "category" : "panel row"}
            key={c.id}
            href={"/products?category=" + c.slug}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="หน้ารายการสินค้า">
      <button
        type="button"
        className="btn ghost"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ← ก่อนหน้า
      </button>
      <span>
        หน้า <strong>{page}</strong> จาก {pages.toLocaleString("th-TH")}
      </span>
      <button
        type="button"
        className="btn ghost"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        ถัดไป →
      </button>
    </nav>
  );
}
function convert(row: Record<string, unknown>): HomeProduct {
  const c = row.category as { slug: string; name: string } | null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ""),
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice as number,
    currency: "THB",
    image: {
      src: String(
        row.image ||
          row.coverImage ||
          "/images/vsale/products/demo/product-placeholder.svg",
      ),
      alt: String(row.name),
    },
    stock: Number(row.stock),
    inStock: Number(row.stock) > 0,
    categorySlug: c?.slug ?? "",
    categoryName: c?.name ?? "สินค้า",
    isFeatured: !!row.featured,
    isFlashSale: !!row.flashSale,
    isDemo: !!row.isDemo,
    publishedAt: "",
  };
}
export function Catalog({
  favoritesOnly = false,
  promotions = false,
  initialQ = "",
  initialCategory = "",
}: {
  favoritesOnly?: boolean;
  promotions?: boolean;
  initialQ?: string;
  initialCategory?: string;
}) {
  const { data, favorites, savedProducts } = useStore();
  const [q, setQ] = useState(initialQ),
    [category, setCategory] = useState(initialCategory),
    [sort, setSort] = useState("popular"),
    [inStock, setInStock] = useState(false),
    [items, setItems] = useState(data.products),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(data.products.length),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (data.source === "demo" || favoritesOnly) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      fetch(
        "/api/products?" +
          new URLSearchParams({
            q,
            category,
            page: String(page),
            limit: "24",
            sort,
            inStock: String(inStock),
            promotion: String(promotions),
          }),
        { signal: ctrl.signal },
      )
        .then((r) => r.json())
        .then((r) => {
          if (r.error) throw new Error(r.error);
          setItems(r.data.map(convert));
          setTotal(r.pagination.total);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setBusy(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [
    q,
    category,
    page,
    sort,
    inStock,
    promotions,
    data.source,
    favoritesOnly,
  ]);
  let visible = items;
  function updateCategory(nextCategory: string) {
    setCategory(nextCategory);
    setPage(1);
    scrollPageTop();
  }

  function updatePage(nextPage: number) {
    setPage(nextPage);
    scrollPageTop();
  }

  if (data.source === "demo" || favoritesOnly) {
    visible = [
      ...new Map(
        [...data.products, ...savedProducts].map((p) => [p.id, p]),
      ).values(),
    ].filter(
      (p) =>
        (!favoritesOnly || favorites.includes(p.id)) &&
        (!category || p.categorySlug === category) &&
        p.name.toLowerCase().includes(q.toLowerCase()) &&
        (!promotions || p.isFlashSale) &&
        (!inStock || p.stock > 0),
    );
    visible = [...visible].sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : 0,
    );
  }
  return (
    <div className="catalog">
      <aside className="panel filters">
        <h3>ค้นหาและตัวกรอง</h3>
        <div className="stack">
          <label>
            ชื่อสินค้า
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <fieldset className="filter-group">
            <legend>หมวดหมู่</legend>
            <div className="filter-options">
              <button
                type="button"
                className={`filter-option${category === "" ? " active" : ""}`}
                aria-pressed={category === ""}
                onClick={() => updateCategory("")}
              >
                ทุกหมวดหมู่
              </button>
              {data.categories.map((c) => (
                <button
                  type="button"
                  className={`filter-option${category === c.slug ? " active" : ""}`}
                  aria-pressed={category === c.slug}
                  key={c.id}
                  onClick={() => updateCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="checklabel">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => {
                setInStock(e.target.checked);
                setPage(1);
                scrollPageTop();
              }}
            />
            เฉพาะสินค้าพร้อมขาย
          </label>
          <button
            className="btn ghost"
            onClick={() => {
              setQ("");
              setCategory("");
              setSort("popular");
              setInStock(false);
              setPage(1);
              scrollPageTop();
            }}
          >
            ล้างตัวกรอง
          </button>
        </div>
      </aside>
      <div>
        <div className="toolbar">
          <span className="small toolbar-result">
            <strong>
              {favoritesOnly || data.source === "demo" ? visible.length : total}{" "}
              รายการ
            </strong>
            {category && (
              <span>
                {data.categories.find((item) => item.slug === category)?.name}
              </span>
            )}
          </span>
          <label className="row">
            เรียงตาม
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
                scrollPageTop();
              }}
            >
              <option value="popular">แนะนำ</option>
              <option value="price-asc">ราคาต่ำไปสูง</option>
              <option value="price-desc">ราคาสูงไปต่ำ</option>
            </select>
          </label>
        </div>
        {error && (
          <p className="alert error" role="alert">
            {error}
          </p>
        )}
        {busy ? (
          <div className="products" aria-label="กำลังโหลดสินค้า">
            {Array.from({ length: 8 }, (_, i) => (
              <div className="skeleton" key={i} />
            ))}
          </div>
        ) : visible.length ? (
          <div className="products">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <Empty
            title="ไม่พบสินค้า"
            description="ลองเปลี่ยนคำค้นหาหรือหมวดหมู่สินค้า"
          />
        )}
        {!favoritesOnly && data.source === "supabase" && (
          <Pagination
            page={page}
            total={total}
            pageSize={24}
            onChange={updatePage}
          />
        )}
      </div>
    </div>
  );
}

function scrollPageTop() {
  requestAnimationFrame(() =>
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    }),
  );
}
type Variant = { id: string; name: string; price: number; stock: number };
export function ProductDetail({
  slug,
  initial,
}: {
  slug: string;
  initial?: Parameters<typeof databaseProduct>[0];
}) {
  const { data, add, favorite, favorites } = useStore();
  const fallback = initial
    ? databaseProduct(initial)
    : data.products.find((p) => p.slug === slug);
  const [product, setProduct] = useState(fallback),
    [variants, setVariants] = useState<Variant[]>(
      initial?.product_variants?.map((v: Variant) => ({
        ...v,
        price: Number(v.price),
      })) ?? [],
    ),
    [selected, setSelected] = useState(""),
    [images, setImages] = useState<string[]>(
      initial
        ? [
            initial.cover_image,
            ...(initial.product_images ?? []).map(
              (i: { url: string }) => i.url,
            ),
          ].filter(Boolean)
        : fallback
          ? [fallback.image.src]
          : [],
    ),
    [image, setImage] = useState(fallback?.image.src ?? ""),
    [quantity, setQuantity] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(!initial && data.source !== "demo");
  useEffect(() => {
    if (initial || data.source === "demo") return;
    const ctrl = new AbortController();
    fetch("/api/products/" + encodeURIComponent(slug), { signal: ctrl.signal })
      .then((r) => r.json())
      .then((r) => {
        if (r.error) throw new Error(r.error);
        const p = convert(r.data);
        setProduct(p);
        setVariants(r.data.variants);
        const pics = [
          r.data.coverImage,
          ...r.data.images.map((i: { url: string }) => i.url),
        ].filter(Boolean);
        setImages([...new Set<string>(pics)]);
        setImage(pics[0] ?? p.image.src);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setBusy(false));
    return () => ctrl.abort();
  }, [slug, data.source, initial]);
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  if (!product) return <Empty title="ไม่พบสินค้า" href="/products" />;
  const variant = variants.find((v) => v.id === selected),
    price = variant?.price ?? product.price,
    stock = variant?.stock ?? product.stock;
  const canAdd = stock > 0 && (!variants.length || !!variant);
  return (
    <div className="stack">
      <div className="panel detail">
        <div>
          <div className="detail-image">
            <img src={image} alt={product.name} />
          </div>
          <div className="detail-thumbs">
            {images.map((src) => (
              <button
                key={src}
                onClick={() => setImage(src)}
                aria-label="เลือกภาพสินค้า"
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">{product.categoryName}</p>
          <h1 style={{ fontSize: 28 }}>{product.name}</h1>
          {product.isDemo && <p className="badge">สินค้าตัวอย่าง</p>}
          <div className="pricebox">
            <div className="price">{money(price)}</div>
            <span className="small muted">
              ราคาที่แสดงสำหรับซื้อปลีก · ค่าส่งคำนวณก่อนยืนยัน
            </span>
          </div>
          <div className="stack">
            {variants.length > 0 && (
              <label>
                ตัวเลือกสินค้า
                <select
                  value={selected}
                  onChange={(e) => {
                    setSelected(e.target.value);
                    setQuantity(1);
                  }}
                >
                  <option value="">เลือกตัวเลือกสินค้า</option>
                  {variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.stock === 0}>
                      {v.name} · {money(v.price)} {v.stock === 0 ? "(หมด)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="row">
              <span className="small">จำนวน</span>
              <Quantity value={quantity} max={stock} onChange={setQuantity} />
              <span className="small muted">คงเหลือ {stock} ชิ้น</span>
            </div>
            <div className="row">
              <button
                className="btn"
                disabled={!canAdd}
                onClick={() =>
                  add(
                    { ...product, price, stock },
                    quantity,
                    variant?.id,
                    variant?.name,
                  )
                }
              >
                <ShoppingCart size={18} />
                เพิ่มลงตะกร้า
              </button>
              <button
                className="btn secondary"
                onClick={() => favorite(product.id)}
                aria-pressed={favorites.includes(product.id)}
              >
                <Heart size={18} />
                บันทึก
              </button>
            </div>
            <Link className="link small" href="/business">
              ราคาส่งสำหรับองค์กรที่ได้รับอนุมัติ →
            </Link>
            <div className="small muted">
              จัดส่งผ่านขนส่งในประเทศไทย
              <br />
              ชำระเงินก่อนจัดส่ง · ขอใบกำกับภาษีได้
            </div>
          </div>
        </div>
      </div>
      <div className="panel prose">
        <h2>รายละเอียดสินค้า</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {product.description ||
            "ติดต่อร้านเพื่อสอบถามรายละเอียดเพิ่มเติมเกี่ยวกับสินค้านี้"}
        </p>
        <h2>การจัดส่งและบริการหลังการขาย</h2>
        <p>
          เลือกวิธีจัดส่งและตรวจสอบค่าส่งในหน้าสั่งซื้อ
          หากสินค้าได้รับความเสียหายหรือไม่ตรงตามคำสั่งซื้อ
          สามารถแจ้งผ่านหน้ารายละเอียดคำสั่งซื้อได้
        </p>
        <Link href="/policies/returns" className="link">
          ดูขั้นตอนการคืนสินค้า
        </Link>
      </div>
      <div className="panel">
        <h2>รีวิวสินค้า</h2>
        <Reviews productId={product.id} />
      </div>
    </div>
  );
}
function Reviews({ productId }: { productId: string }) {
  const [rows, setRows] = useState<
    Array<{ id: string; rating: number; excerpt: string }>
  >([]);
  useEffect(() => {
    fetch("/api/store/reviews?product=" + productId)
      .then((r) => r.json())
      .then((r) => setRows(r.data ?? []))
      .catch(() => {});
  }, [productId]);
  return rows.length ? (
    <div className="stack">
      {rows.map((r) => (
        <div className="panel" key={r.id}>
          <p>{"★".repeat(r.rating)}</p>
          <p>{r.excerpt}</p>
        </div>
      ))}
    </div>
  ) : (
    <Empty
      title="ยังไม่มีรีวิว"
      description="รีวิวที่ผ่านการตรวจสอบจะแสดงในหน้านี้"
    />
  );
}
export function Cart() {
  const { cart, quantity } = useStore();
  const total = cart.reduce((s, l) => s + l.product.price * l.quantity, 0);
  if (!cart.length)
    return (
      <div className="panel">
        <Empty
          title="ตะกร้าของคุณยังว่าง"
          description="เลือกสินค้าที่ต้องการแล้วเพิ่มลงตะกร้า"
          href="/products"
        />
      </div>
    );
  return (
    <div className="checkout">
      <div className="panel">
        {cart.map((l) => (
          <div className="cartline" key={lineKey(l)}>
            <img src={l.product.image.src} alt="" />
            <div>
              <Link href={"/products/" + l.product.slug}>
                <h3>{l.product.name}</h3>
              </Link>
              <p className="small muted">{l.variantName ?? "สินค้ามาตรฐาน"}</p>
              <p className="price">{money(l.product.price)}</p>
              <Quantity
                value={l.quantity}
                max={l.product.stock}
                onChange={(q) => quantity(lineKey(l), q)}
              />
            </div>
            <div>
              <strong>{money(l.product.price * l.quantity)}</strong>
              <button
                className="btn ghost"
                aria-label={"ลบ " + l.product.name}
                onClick={() => quantity(lineKey(l), 0)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <aside className="panel summary">
        <h2>สรุปคำสั่งซื้อ</h2>
        <div className="row between">
          <span>สินค้า {cart.reduce((n, l) => n + l.quantity, 0)} ชิ้น</span>
          <strong>{money(total)}</strong>
        </div>
        <div className="small muted">
          ค่าส่ง ส่วนลด และภาษีจะยืนยันก่อนสั่งซื้อ
        </div>
        <hr />
        <Link className="btn full" href="/checkout">
          ดำเนินการสั่งซื้อ
        </Link>
        <Link
          className="btn secondary full"
          style={{ marginTop: 12 }}
          href="/quotes/new"
        >
          ขอใบเสนอราคา
        </Link>
      </aside>
    </div>
  );
}
