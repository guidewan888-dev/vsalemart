"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pages } from "@/lib/store/routes";
import { PageHead, Empty, BusinessBanner, Benefits, Badge } from "./ui";
import { Home, Catalog, Categories, Cart, ProductDetail } from "./catalog";
import {
  Gate,
  AuthForm,
  ResourceView,
  useData,
  DataForm,
  type Row,
} from "./forms";
import {
  Checkout,
  OrderDetail,
  QuoteRequest,
  QuoteDetail,
  Invoice,
  ReturnForm,
  AccountHome,
  Profile,
  BusinessApply,
} from "./transactions";
import {
  AdminDashboard,
  Settings,
  Inventory,
  AdminDetail,
  ProductManagement,
  ImportPage,
} from "./admin";
import { api } from "@/lib/store/client";
const publicCopy: Record<string, { heading: string; body: string }[]> = {
  about: [
    {
      heading: "ครบเรื่องเรียนและงาน",
      body: "VSaleMart จำหน่ายเครื่องเขียน หนังสือ แบบเรียน แบบฟอร์ม อุปกรณ์ศิลปะ และอุปกรณ์สำนักงาน สำหรับลูกค้าทั่วไป โรงเรียน และบริษัท",
    },
    {
      heading: "จัดซื้อในนามองค์กร",
      body: "ลูกค้าองค์กรสามารถสมัครบัญชีเพื่อให้ร้านตรวจสอบสิทธิ์ราคาส่ง และเลือกสินค้าเพื่อขอใบเสนอราคา โดยชำระเงินก่อนจัดส่งทุกคำสั่งซื้อ",
    },
  ],
  shipping: [
    {
      heading: "วิธีและค่าจัดส่ง",
      body: "วิธีจัดส่งที่ร้านเปิดใช้งานและค่าบริการจะแสดงก่อนยืนยันคำสั่งซื้อ ค่าส่งอาจเป็นราคาเดียวหรือตามน้ำหนัก ขึ้นอยู่กับบริการที่เลือก เงื่อนไขส่งฟรีใช้เมื่อร้านกำหนดไว้",
    },
    {
      heading: "ติดตามพัสดุ",
      body: "เมื่อร้านจัดส่ง พนักงานจะบันทึกบริษัทขนส่งและเลขพัสดุในคำสั่งซื้อ คุณดูข้อมูลได้จากบัญชีของฉัน → คำสั่งซื้อ",
    },
    {
      heading: "ระยะเวลาจัดส่ง",
      body: "ขึ้นอยู่กับสินค้า พื้นที่ปลายทาง และบริษัทขนส่ง หากต้องการใช้สินค้าภายในวันที่แน่นอน กรุณาสอบถามร้านก่อนสั่งซื้อ",
    },
  ],
  returns: [
    {
      heading: "แจ้งปัญหาสินค้า",
      body: "เปิดคำสั่งซื้อที่เกี่ยวข้องและเลือกแจ้งคืนสินค้า / คืนเงิน ระบุรายการสินค้าและปัญหาให้ชัดเจน ร้านจะตรวจสอบและแจ้งผลผ่านบัญชีของคุณ",
    },
    {
      heading: "ก่อนส่งสินค้าคืน",
      body: "กรุณารอคำยืนยันและรายละเอียดจากร้านก่อนส่งคืน เก็บบรรจุภัณฑ์และหลักฐานที่เกี่ยวข้องเพื่อใช้ประกอบการตรวจสอบ",
    },
    {
      heading: "ติดตามผล",
      body: "ติดตามได้ที่บัญชีของฉัน → คืนสินค้าและคืนเงิน เงื่อนไขและรายละเอียดการดำเนินการจะแสดงในคำตอบของร้าน",
    },
  ],
  privacy: [
    {
      heading: "ข้อมูลที่ใช้ในบริการ",
      body: "การสมัครบัญชีและสั่งซื้อใช้ข้อมูลติดต่อ ที่อยู่จัดส่ง รายการสินค้า และข้อมูลภาษีเมื่อคุณขอเอกสาร หลักฐานการโอนเงินใช้ประกอบการตรวจสอบการชำระเงิน",
    },
    {
      heading: "การติดต่อเรื่องข้อมูล",
      body: "หากต้องการสอบถามเกี่ยวกับข้อมูลบัญชี สามารถติดต่อร้านผ่านหน้าติดต่อเรา",
    },
  ],
  terms: [
    {
      heading: "ราคาและคำสั่งซื้อ",
      body: "ตรวจสอบสินค้า ตัวเลือก จำนวน ที่อยู่ ค่าส่ง ส่วนลด และยอดภาษีในหน้าสั่งซื้อก่อนยืนยัน ระบบตรวจราคากับสต็อกอีกครั้งเมื่อสร้างคำสั่งซื้อ",
    },
    {
      heading: "การชำระเงิน",
      body: "ชำระเงินก่อนจัดส่งทั้งหมด เมื่อโอนแล้วให้แนบสลิปในคำสั่งซื้อ ร้านตรวจยอดเงินเข้าก่อนอนุมัติชำระเงิน",
    },
    {
      heading: "ราคาสำหรับองค์กร",
      body: "สิทธิ์ราคาส่งใช้สำหรับบัญชีองค์กรที่ร้านอนุมัติ ใบเสนอราคามีวันหมดอายุและต้องยืนยันก่อนใช้สั่งซื้อ",
    },
  ],
};
function Content({ slug }: { slug: string }) {
  const [content, setContent] = useState<Row | null>(null);
  useEffect(() => {
    fetch("/api/store/content/" + slug)
      .then((r) => r.json())
      .then((r) => setContent(r.data))
      .catch(() => {});
  }, [slug]);
  return (
    <div className="panel prose">
      {content ? (
        <>
          <h2>{content.title}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{content.body}</p>
        </>
      ) : (
        <>
          {["privacy", "terms"].includes(slug) && (
            <p className="alert">
              ร้านกำลังจัดทำรายละเอียดนโยบายฉบับเต็ม
              สอบถามข้อมูลเพิ่มเติมได้ผ่านหน้าติดต่อเรา
            </p>
          )}
          {publicCopy[slug]?.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </>
      )}
      <p>
        <Link className="link" href="/contact">
          ติดต่อร้าน →
        </Link>
      </p>
    </div>
  );
}
function Help() {
  return (
    <div className="stack">
      {[
        [
          "สั่งซื้อสินค้าอย่างไร?",
          "เลือกสินค้าและตัวเลือก เพิ่มลงตะกร้า เข้าสู่ระบบ เลือกที่อยู่และขนส่ง ตรวจยอดชำระ แล้วกดยืนยันสั่งซื้อ",
        ],
        [
          "โอนเงินแล้วต้องทำอะไร?",
          "เปิดคำสั่งซื้อ แนบรูปสลิป พร้อมวันที่และเวลาที่โอน ร้านจะตรวจสอบยอดเงินเข้าและแจ้งผล",
        ],
        [
          "รับชำระด้วย QR และบัตรไหม?",
          "ช่องทางที่เปิดใช้งานจริงแสดงในหน้าสั่งซื้อ ช่องทาง QR อัตโนมัติและบัตรยังไม่เปิดจนกว่าร้านเชื่อมบริการเรียบร้อย",
        ],
        [
          "ขอราคาส่งได้อย่างไร?",
          "สมัครบัญชีองค์กร รอร้านอนุมัติ จากนั้นเลือกสินค้าเพื่อรับสิทธิ์ราคาส่งหรือขอใบเสนอราคา",
        ],
        [
          "ติดตามของได้ที่ไหน?",
          "เปิดบัญชีของฉัน → คำสั่งซื้อ เพื่อดูบริษัทขนส่งและเลขพัสดุ",
        ],
        [
          "สินค้ามีปัญหาต้องทำอย่างไร?",
          "เปิดคำสั่งซื้อและส่งคำขอคืนสินค้า / คืนเงิน พร้อมระบุปัญหา",
        ],
      ].map(([q, a]) => (
        <details className="panel" key={q}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>{q}</summary>
          <p className="muted" style={{ marginTop: 16 }}>
            {a}
          </p>
        </details>
      ))}
    </div>
  );
}
function DesignSystem() {
  return (
    <div className="stack">
      <div className="panel">
        <p className="eyebrow">FOUNDATIONS / 01</p>
        <h2>Orange commerce</h2>
        <p className="muted">
          ระบบภาพเดียวกันสำหรับหน้าร้านและงานหลังบ้าน โทนส้มสด พื้นผิวขาว
          และข้อความสีเข้ม
        </p>
        <div className="grid4" style={{ marginTop: 20 }}>
          {[
            ["Brand", "#ee4d2d"],
            ["Action", "#c53618"],
            ["Surface", "#ffffff"],
            ["Text", "#22252b"],
            ["Canvas", "#f5f6f8"],
            ["Success", "#13764d"],
            ["Warning", "#996000"],
            ["Danger", "#be2636"],
          ].map(([name, color]) => (
            <div key={name}>
              <div
                className="swatch"
                style={{ background: color, border: "1px solid var(--line)" }}
              />
              <strong>{name}</strong>
              <p className="small muted">{color}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="panel stack">
        <p className="eyebrow">TYPOGRAPHY / 02</p>
        <h1>หัวข้อหลัก · Noto Sans Thai</h1>
        <h2>หัวข้อส่วน · 22 px / 700</h2>
        <p>
          ข้อความเนื้อหา 16 px ระยะบรรทัด 1.65
          รองรับภาษาไทยและการขยายขนาดตัวอักษร
        </p>
        <p className="small muted">
          ป้ายกำกับ 14 px · ข้อมูลรอง 12–13 px ·
          ไม่ใช้สีอย่างเดียวในการสื่อสถานะ
        </p>
      </div>
      <div className="panel stack">
        <p className="eyebrow">COMPONENTS / 03</p>
        <div className="row">
          <button className="btn">ปุ่มหลัก</button>
          <button className="btn secondary">ปุ่มรอง</button>
          <button className="btn ghost">ปุ่มทั่วไป</button>
          <button className="btn" disabled>
            ไม่พร้อมใช้งาน
          </button>
        </div>
        <div className="row">
          {["submitted", "paid", "rejected", "shipped"].map((s) => (
            <Badge key={s} status={s} />
          ))}
        </div>
        <div className="form-grid">
          <label>
            ช่องกรอกข้อมูล
            <input placeholder="กรอกข้อมูล" />
          </label>
          <label>
            รายการเลือก
            <select>
              <option>เลือกตัวเลือก</option>
            </select>
          </label>
        </div>
        <p className="alert">ข้อความแจ้งข้อมูลก่อนดำเนินการ</p>
        <p className="alert error">ข้อความผิดพลาดพร้อมแนวทางแก้ไข</p>
        <p className="alert success">ข้อความยืนยันผลสำเร็จ</p>
        <Empty title="สถานะไม่มีข้อมูล" />
      </div>
      <div className="panel prose">
        <h2>โครงร่างและพฤติกรรม</h2>
        <p>
          พื้นที่เนื้อหากว้างสุด 1,240 px · Desktop 5 คอลัมน์สินค้า · Mobile 2
          คอลัมน์ · หน้าสั่งซื้อมีสรุปยอดด้านขวาบน Desktop และเรียงลงบนมือถือ ·
          แถบเมนูบัญชีและหลังบ้านเลื่อนแนวนอนบนมือถือ
        </p>
        <p>
          ระยะห่างหลัก 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 px · มุมการ์ด 12 px ·
          มุมปุ่มและฟอร์ม 8 px · ปุ่มสูงอย่างน้อย 46 px · แสดง focus
          สีน้ำเงินเมื่อใช้คีย์บอร์ด · ลดการเคลื่อนไหวตามการตั้งค่าผู้ใช้
        </p>
      </div>
      <div className="panel">
        <div className="section-head">
          <h2>ถอดแบบและรายการทุกหน้า ({Object.keys(pages).length} หน้า)</h2>
          <button className="btn ghost no-print" onClick={() => window.print()}>
            พิมพ์คู่มือ
          </button>
        </div>
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>หน้า</th>
                <th>เส้นทาง</th>
                <th>หน้าที่</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(pages).map(([path, [title, desc]]) => (
                <tr key={path}>
                  <td>
                    <Link href={path} className="link">
                      {title}
                    </Link>
                  </td>
                  <td>{path}</td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          หน้ารายละเอียดสินค้า ออเดอร์ ใบเสนอราคา สลิป และเอกสาร
          สร้างตามรหัสรายการจริง
        </p>
      </div>
    </div>
  );
}
function ReviewForm({ id }: { id: string }) {
  const { data } = useData("orders/" + id);
  return (
    <div className="panel">
      <DataForm
        fields={[
          {
            key: "product_id",
            label: "สินค้าในคำสั่งซื้อ",
            type: "select",
            options:
              data?.data?.order_items?.map((i: Row) => i.product_id) ?? [],
            required: true,
          },
          { key: "rating", label: "คะแนน 1–5", type: "number", required: true },
          {
            key: "excerpt",
            label: "รีวิวสินค้า",
            type: "textarea",
            required: true,
          },
        ]}
        onSave={async (v) => {
          await api("review", v);
        }}
      />
    </div>
  );
}
function ReturnDetail({ id }: { id: string }) {
  const { data, error, busy } = useData("returns/" + id);
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  const r = data?.data;
  return r ? (
    <div className="panel stack">
      <Badge status={r.status} />
      <h2>รายละเอียดคำขอ</h2>
      <p>{r.reason}</p>
      <h3>ผลการดำเนินการจากร้าน</h3>
      <p>{r.admin_note ?? "ร้านกำลังตรวจสอบคำขอ"}</p>
      <Link className="link" href={"/account/orders/" + r.order_id}>
        ดูคำสั่งซื้อ →
      </Link>
    </div>
  ) : (
    <Empty />
  );
}
export function StorePage({
  path,
  query = {},
  initialProduct,
}: {
  path: string;
  query?: Record<string, string>;
  initialProduct?: Row;
}) {
  const parts = path.split("/").filter(Boolean),
    title = pages[path as keyof typeof pages];
  let content;
  if (path === "/") return <Home />;
  if (parts[0] === "products" && parts[1])
    content = <ProductDetail slug={parts[1]} initial={initialProduct} />;
  else if (path === "/products")
    content = <Catalog initialQ={query.q} initialCategory={query.category} />;
  else if (path === "/categories") content = <Categories />;
  else if (path === "/promotions") content = <Catalog promotions />;
  else if (path === "/favorites") content = <Catalog favoritesOnly />;
  else if (path === "/cart") content = <Cart />;
  else if (path === "/checkout")
    content = (
      <Gate>
        <Checkout quoteId={query.quote} />
      </Gate>
    );
  else if (
    ["login", "register", "forgot-password", "reset-password"].includes(
      parts[0],
    )
  )
    content = <AuthForm mode={parts[0]} />;
  else if (path === "/business")
    content = (
      <>
        <div className="grid2">
          <BusinessBanner />
          <div className="panel stack">
            <h2>เริ่มต้นจัดซื้อกับ VSaleMart</h2>
            <ol className="timeline">
              <li>สมัครบัญชีและส่งข้อมูลองค์กร</li>
              <li>ร้านตรวจสอบและอนุมัติสิทธิ์ราคาส่ง</li>
              <li>เลือกสินค้า ขอราคา และยืนยันคำสั่งซื้อ</li>
              <li>ชำระเงินก่อนจัดส่ง พร้อมขอใบกำกับภาษี</li>
            </ol>
            <Link className="btn" href="/business/apply">
              สมัครบัญชีองค์กร
            </Link>
            <Link className="btn secondary" href="/quotes/new">
              ขอใบเสนอราคา
            </Link>
          </div>
        </div>
        <Benefits />
      </>
    );
  else if (path === "/business/apply")
    content = (
      <Gate>
        <BusinessApply />
      </Gate>
    );
  else if (path === "/quotes/new")
    content = (
      <Gate>
        <QuoteRequest />
      </Gate>
    );
  else if (path === "/contact")
    content = (
      <Gate>
        <div className="stack">
          <ResourceView name="support" createOnly />
          <h2>ข้อความที่เคยส่ง</h2>
          <ResourceView name="support" />
        </div>
      </Gate>
    );
  else if (path === "/help") content = <Help />;
  else if (path === "/about" || parts[0] === "policies")
    content = <Content slug={parts.at(-1)!} />;
  else if (path === "/design-system") content = <DesignSystem />;
  else if (parts[0] === "account") {
    const name = parts[1],
      id = parts[2];
    let inner;
    if (!name) inner = <AccountHome />;
    else if (name === "profile") inner = <Profile />;
    else if (name === "security") inner = <AuthForm mode="reset-password" />;
    else if (name === "orders" && id)
      inner =
        parts[3] === "invoice" ? (
          <Invoice id={id} />
        ) : parts[3] === "review" ? (
          <ReviewForm id={id} />
        ) : (
          <OrderDetail id={id} />
        );
    else if (name === "quotes" && id) inner = <QuoteDetail id={id} />;
    else if (name === "returns" && id)
      inner =
        id === "new" ? (
          <ReturnForm orderId={query.order ?? ""} />
        ) : (
          <ReturnDetail id={id} />
        );
    else inner = <ResourceView name={name} />;
    content = <Gate>{inner}</Gate>;
  } else if (parts[0] === "admin") {
    const name = parts[1],
      id = parts[2];
    let inner;
    if (!name || name === "reports")
      inner = <AdminDashboard reports={name === "reports"} />;
    else if (name === "settings") inner = <Settings />;
    else if (name === "inventory") inner = <Inventory />;
    else if (name === "import") inner = <ImportPage />;
    else if (name === "products")
      inner =
        id === "new" ? (
          <ResourceView name="products" admin createOnly />
        ) : (
          <ProductManagement initialQ={query.q} />
        );
    else if (name === "orders" && id)
      inner =
        parts[3] === "invoice" ? (
          <Invoice id={id} admin />
        ) : (
          <OrderDetail id={id} admin />
        );
    else if (name === "shipments" && id) inner = <OrderDetail id={id} admin />;
    else if (name === "quotes" && id) inner = <QuoteDetail id={id} admin />;
    else if (id) inner = <AdminDetail name={name} id={id} />;
    else inner = <ResourceView name={name} admin />;
    content = <Gate admin>{inner}</Gate>;
  } else
    content = (
      <Empty title="ไม่พบหน้าที่ต้องการ" href="/" label="กลับหน้าร้าน" />
    );
  return (
    <>
      {title && <PageHead title={title[0]} subtitle={title[1]} />}
      {content}
    </>
  );
}
