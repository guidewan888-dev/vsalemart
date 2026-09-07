"use client";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  PackageOpen,
  ChevronRight,
  Heart,
  Search,
  ShoppingCart,
  User,
  House,
  LayoutGrid,
  Building2,
  ShieldCheck,
  Truck,
  FileCheck2,
  Headphones,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "./provider";
import { accountNav, adminNav, money, statuses } from "@/lib/store/routes";
import type { HomeProduct } from "@/types/commerce";
import { authClient } from "@/lib/store/client";
export function Badge({ status }: { status: string }) {
  return (
    <span className={"badge " + status}>{statuses[status] ?? status}</span>
  );
}
export function Empty({
  title = "ยังไม่มีรายการ",
  description = "รายการใหม่จะแสดงที่นี่เมื่อมีการดำเนินการ",
  href,
  label = "เลือกซื้อสินค้า",
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <PackageOpen size={44} />
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="btn secondary" href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}
export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="pagehead row between">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname(),
    admin = path.startsWith("/admin"),
    account = path.startsWith("/account");
  const { cart } = useStore();
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      window.scrollTo({ top: 0, left: 0, behavior: "auto" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [path]);
  if (admin) return <AdminShell>{children}</AdminShell>;
  return (
    <>
      <a className="skip" href="#main">
        ข้ามไปยังเนื้อหา
      </a>
      {admin ? (
        <header className="admin-header">
          <div className="wrap row between">
            <Link className="logo" href="/">
              <b>V</b>SALE<span className="admin-title">ระบบจัดการร้านค้า</span>
            </Link>
            <Link className="btn ghost" href="/">
              ดูหน้าร้าน
            </Link>
          </div>
        </header>
      ) : (
        <>
          <div className="topbar">
            <div className="wrap row between">
              <span>เครื่องเขียน · หนังสือ · อุปกรณ์สำนักงาน</span>
              <div className="row">
                <Link href="/business">ลูกค้าโรงเรียน / บริษัท</Link>
                <Link href="/help">ช่วยเหลือ</Link>
              </div>
            </div>
          </div>
          <header className="header">
            <div className="wrap">
              <div className="header-main row">
                <Link className="logo" href="/">
                  <b>V</b>SALE<small>MART · ครบเรื่องเรียนและงาน</small>
                </Link>
                <form className="search" action="/products">
                  <input
                    name="q"
                    type="search"
                    aria-label="ค้นหาสินค้า"
                    placeholder="ค้นหาเครื่องเขียน หนังสือ และอุปกรณ์สำนักงาน"
                  />
                  <button aria-label="ค้นหา">
                    <Search size={22} />
                  </button>
                </form>
                <Link className="icon-link" href="/account">
                  <User size={25} />
                  <span className="account-label">บัญชีของฉัน</span>
                </Link>
                <Link
                  className="icon-link"
                  href="/cart"
                  aria-label="ตะกร้าสินค้า"
                >
                  <ShoppingCart size={28} />
                  {cart.length > 0 && (
                    <span className="count">
                      {cart.reduce((n, l) => n + l.quantity, 0)}
                    </span>
                  )}
                </Link>
              </div>
              <nav className="nav">
                <Link href="/products">สินค้าทั้งหมด</Link>
                <Link href="/categories">หมวดหมู่สินค้า</Link>
                <Link href="/promotions">โปรโมชั่น</Link>
                <Link href="/business">ราคาสำหรับองค์กร</Link>
                <Link href="/account/orders">ติดตามคำสั่งซื้อ</Link>
                <Link href="/contact">ติดต่อเรา</Link>
              </nav>
            </div>
          </header>
        </>
      )}
      <main id="main" className="main wrap">
        {path !== "/" && (
          <div className="crumb">
            <Link href="/">หน้าร้าน</Link>
            <ChevronRight size={14} />
            <span>
              {admin ? "จัดการร้านค้า" : account ? "บัญชีลูกค้า" : "VSaleMart"}
            </span>
          </div>
        )}
        {admin || account ? (
          <div className="workspace">
            <aside className="sidebar">
              <h3>{admin ? "จัดการร้านค้า" : "บัญชีของฉัน"}</h3>
              {(admin ? adminNav : accountNav).map(([href, [title]]) => (
                <Link
                  key={href}
                  href={href}
                  className={path === href ? "active" : ""}
                >
                  <LayoutGrid size={16} />
                  {title}
                </Link>
              ))}
              <button
                className="btn ghost"
                onClick={async () => {
                  try {
                    await authClient().auth.signOut();
                    window.location.assign("/login");
                  } catch {
                    window.location.assign("/login");
                  }
                }}
              >
                <LogOut size={16} />
                ออกจากระบบ
              </button>
            </aside>
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      <footer className="footer">
        <div className="wrap">
          <div className="grid4">
            <div>
              <h3 className="logo">V SALE MART</h3>
              <p>
                ครบเรื่องเรียนและงาน
                <br />
                สำหรับคุณ โรงเรียน และทุกองค์กร
              </p>
            </div>
            <div>
              <h3>บริการลูกค้า</h3>
              {[
                ["/help", "ศูนย์ช่วยเหลือ"],
                ["/policies/shipping", "การจัดส่ง"],
                ["/policies/returns", "การคืนสินค้า"],
                ["/contact", "ติดต่อเรา"],
              ].map(([h, t]) => (
                <Link key={h} href={h}>
                  {t}
                </Link>
              ))}
            </div>
            <div>
              <h3>ซื้อกับ VSaleMart</h3>
              {[
                ["/account/orders", "คำสั่งซื้อของฉัน"],
                ["/business", "ลูกค้าองค์กร"],
                ["/quotes/new", "ขอใบเสนอราคา"],
                ["/about", "เกี่ยวกับเรา"],
              ].map(([h, t]) => (
                <Link key={h} href={h}>
                  {t}
                </Link>
              ))}
            </div>
            <div>
              <h3>ข้อมูลและเงื่อนไข</h3>
              <Link href="/policies/privacy">ความเป็นส่วนตัว</Link>
              <Link href="/policies/terms">เงื่อนไขการซื้อสินค้า</Link>
              <Link href="/admin">เข้าสู่ระบบพนักงาน</Link>
              <Link href="/design-system">ดีไซน์ซิสเต็มและรายการหน้า</Link>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} VSaleMart ·
            ชำระเงินก่อนจัดส่งทุกคำสั่งซื้อ
          </div>
        </div>
      </footer>
      {!admin && (
        <nav className="mobile-nav">
          <Link href="/">
            <House />
            หน้าร้าน
          </Link>
          <Link href="/categories">
            <LayoutGrid />
            หมวดหมู่
          </Link>
          <Link href="/favorites">
            <Heart />
            รายการโปรด
          </Link>
          <Link href="/cart">
            <ShoppingCart />
            ตะกร้า
          </Link>
          <Link href="/account">
            <User />
            บัญชี
          </Link>
        </nav>
      )}
    </>
  );
}
export function ProductCard({ product: p }: { product: HomeProduct }) {
  return (
    <article className="product">
      <div className="product-img">
        <Link href={"/products/" + p.slug} scroll>
          <img src={p.image.src} alt={p.name} loading="lazy" />
        </Link>
        {p.badgeLabel && <span className="badge">{p.badgeLabel}</span>}
      </div>
      <div className="product-info">
        <Link href={"/products/" + p.slug} scroll>
          <h3>{p.name}</h3>
        </Link>
        <div className="price">{money(p.price)}</div>
        {p.compareAtPrice && p.compareAtPrice > p.price ? (
          <del className="small muted">{money(p.compareAtPrice)}</del>
        ) : null}
        <div className="product-meta">
          <span>
            {p.isDemo
              ? "สินค้าตัวอย่าง"
              : p.rating
                ? "★ " + p.rating
                : "สินค้าในร้าน"}
          </span>
          <span>{p.stock > 0 ? "พร้อมจำหน่าย" : "สินค้าหมด"}</span>
        </div>
      </div>
    </article>
  );
}
export function Benefits() {
  return (
    <div className="benefits">
      <span>
        <ShieldCheck />
        ตรวจสอบการชำระเงิน
      </span>
      <span>
        <Truck />
        จัดส่งทั่วประเทศไทย
      </span>
      <span>
        <FileCheck2 />
        ขอใบกำกับภาษีได้
      </span>
      <span>
        <Headphones />
        บริการหลังการขาย
      </span>
    </div>
  );
}
export function BusinessBanner() {
  return (
    <div className="hero-side">
      <p className="eyebrow">V SALE FOR BUSINESS</p>
      <Building2 size={30} />
      <h2>
        จัดซื้อให้โรงเรียน
        <br />
        และบริษัท ได้ครบในที่เดียว
      </h2>
      <p>
        ขอใบเสนอราคาและสิทธิ์ราคาส่ง
        <br />
        สำหรับบัญชีองค์กรที่ผ่านการอนุมัติ
      </p>
      <div>
        <Link className="btn" href="/business">
          ดูบริการสำหรับองค์กร
        </Link>
      </div>
    </div>
  );
}
export function Quantity({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="qty">
      <button
        type="button"
        aria-label="ลดจำนวน"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
      >
        −
      </button>
      <input
        aria-label="จำนวนสินค้า"
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(1, Number(e.target.value) || 1)))
        }
      />
      <button
        type="button"
        aria-label="เพิ่มจำนวน"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
export function AsyncButton({
  children,
  run,
  className = "btn",
}: {
  children: ReactNode;
  run: () => Promise<void>;
  className?: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <button
        className={className}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await run();
          } catch (e) {
            setError(e instanceof Error ? e.message : "ไม่สำเร็จ");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "กำลังดำเนินการ…" : children}
      </button>
      {error && (
        <p role="alert" className="alert error">
          {error}
        </p>
      )}
    </>
  );
}
