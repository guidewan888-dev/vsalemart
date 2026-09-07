"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useData,
  DataForm,
  Fields,
  ResourceView,
  formatValue,
  type Row,
} from "./forms";
import { api } from "@/lib/store/client";
import { money } from "@/lib/store/routes";
import { AsyncButton, Badge, Empty } from "./ui";
import { columnLabels, type Field } from "@/lib/store/resources";
export function AdminDashboard({ reports = false }: { reports?: boolean }) {
  const { data, error, busy } = useData("admin/dashboard");
  if (busy) return <div className="skeleton" />;
  if (error) return <div className="alert error">{error}</div>;
  const stats = data?.stats ?? {};
  return (
    <div className="stack">
      <div className="grid4">
        {[
          ["สินค้าที่เปิดขาย", stats.products ?? 0],
          ["รอตรวจสลิป", stats.slips ?? 0],
          ["รอจัดส่ง", stats.toShip ?? 0],
          ["ยอดรับชำระ", money(stats.paidTotal ?? 0)],
        ].map(([t, v]) => (
          <div className="panel stat" key={t}>
            <span className="small muted">{t}</span>
            <strong>{v}</strong>
            <span className="small muted">
              {t === "ยอดรับชำระ"
                ? "รวมออเดอร์ที่ยืนยันชำระแล้ว"
                : "ข้อมูลจากระบบร้าน"}
            </span>
          </div>
        ))}
      </div>
      {!reports && (
        <div className="grid3">
          {[
            [
              "/admin/payments",
              "ตรวจการชำระเงิน",
              "ตรวจสลิปเทียบกับยอดเงินจริง",
            ],
            ["/admin/orders", "จัดการคำสั่งซื้อ", "เตรียมสินค้าและอัปเดตสถานะ"],
            ["/admin/inventory", "ปรับสต็อก", "บันทึกยอดขายจาก Shopee"],
            [
              "/admin/business",
              "อนุมัติองค์กร",
              "ตรวจข้อมูลเพื่อเปิดสิทธิ์ราคาส่ง",
            ],
            ["/admin/quotes", "ออกใบเสนอราคา", "กำหนดราคาและอายุใบเสนอราคา"],
            [
              "/admin/import",
              "ข้อมูลนำเข้าจาก Shopee",
              "ตรวจข้อมูลเดิมและประวัตินำเข้า",
            ],
          ].map(([h, t, d]) => (
            <Link href={h} key={h} className="panel">
              <h3>{t} →</h3>
              <p className="small muted">{d}</p>
            </Link>
          ))}
        </div>
      )}
      <section className="panel">
        <div className="section-head">
          <h2>คำสั่งซื้อล่าสุด</h2>
          <Link className="link" href="/admin/orders">
            ดูทั้งหมด →
          </Link>
        </div>
        {data?.recent?.length ? (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr>
                  <th>คำสั่งซื้อ</th>
                  <th>วันที่</th>
                  <th>ยอดรวม</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((o: Row) => (
                  <tr key={o.id}>
                    <td>
                      <Link className="link" href={"/admin/orders/" + o.id}>
                        {o.reference}
                      </Link>
                    </td>
                    <td>
                      {new Date(o.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td>{money(o.total)}</td>
                    <td>
                      <Badge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="ยังไม่มีคำสั่งซื้อ" />
        )}
      </section>
      {reports && (
        <p className="alert">
          ยอดรับชำระเป็นยอดคำสั่งซื้อที่ตรวจชำระแล้ว
          การคืนเงินผ่านธนาคารต้องตรวจคู่กับรายการคืนเงินก่อนใช้ปิดบัญชี
        </p>
      )}
    </div>
  );
}
export function Inventory() {
  const [tab, setTab] = useState("products"),
    [values, setValues] = useState<Row>({}),
    [page, setPage] = useState(1),
    [q, setQ] = useState("");
  const { data, error, busy, reload } = useData(
    "admin/" + tab + "?page=" + page + "&q=" + encodeURIComponent(q),
  );
  return (
    <div className="stack">
      <p className="alert">
        ใช้สต็อกร่วมกับ Shopee พนักงานต้องปรับยอดเองเมื่อมีการขายนอกเว็บ
        หากสินค้ามีตัวเลือก ให้ปรับที่ตัวเลือกเพื่อให้ยอดรวมตรงกัน
      </p>
      <div className="tabs">
        <button
          className={tab === "products" ? "active" : ""}
          onClick={() => {
            setTab("products");
            setPage(1);
          }}
        >
          สินค้าหลัก
        </button>
        <button
          className={tab === "variants" ? "active" : ""}
          onClick={() => {
            setTab("variants");
            setPage(1);
          }}
        >
          ตัวเลือกสินค้า
        </button>
      </div>
      {error && <p className="alert error">{error}</p>}
      <div className="panel">
        <h2>ปรับยอดสต็อก</h2>
        <Fields
          fields={[
            { key: "id", label: "รหัสสินค้า", required: true },
            { key: "variant_id", label: "รหัสตัวเลือก (ถ้ามี)" },
            {
              key: "delta",
              label: "จำนวนเปลี่ยนแปลง เช่น 10 หรือ -3",
              type: "number",
              required: true,
            },
            {
              key: "reason",
              label: "เหตุผล เช่น ยอดขายจาก Shopee / รับสินค้าเข้า",
              type: "textarea",
              required: true,
            },
          ]}
          values={values}
          setValues={setValues}
        />
        <AsyncButton
          run={async () => {
            await api("admin/action", {
              action: "inventory",
              id: values.id,
              payload: values,
            });
            setValues({});
            reload();
          }}
        >
          บันทึกการปรับสต็อก
        </AsyncButton>
      </div>
      <div className="panel">
        <input
          aria-label="ค้นหาสินค้า"
          placeholder="ค้นหาชื่อสินค้า"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        {busy ? (
          <div className="skeleton" />
        ) : (
          <div className="tablewrap">
            <table className="table">
              <thead>
                <tr>
                  <th>สินค้า / ตัวเลือก</th>
                  <th>รหัส</th>
                  <th>คงเหลือ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((p: Row) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.id}</td>
                    <td>
                      <Badge
                        status={p.stock <= 10 ? "เหลือน้อย" : "พร้อมขาย"}
                      />{" "}
                      {p.stock}
                    </td>
                    <td>
                      <button
                        className="btn ghost"
                        onClick={() => {
                          setValues({
                            id: p.product_id ?? p.id,
                            variant_id: p.product_id ? p.id : "",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        เลือกปรับยอด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="row">
          <button
            className="btn ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ก่อนหน้า
          </button>
          <span>หน้า {page}</span>
          <button
            className="btn ghost"
            disabled={page * 30 >= (data?.total ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
const settingsFields: Field[] = [
  { key: "name", label: "ชื่อร้าน / ชื่อนิติบุคคล", required: true },
  { key: "tax_id", label: "เลขประจำตัวผู้เสียภาษี 13 หลัก", required: true },
  { key: "branch", label: "รหัสสาขา", required: true },
  {
    key: "address",
    label: "ที่อยู่ร้านตามเอกสาร",
    type: "textarea",
    required: true,
  },
  { key: "bank_name", label: "ธนาคาร", required: true },
  { key: "bank_account", label: "เลขบัญชีรับเงิน", required: true },
  { key: "bank_holder", label: "ชื่อบัญชี", required: true },
  {
    key: "vat_registered",
    label: "จดทะเบียนภาษีมูลค่าเพิ่ม (VAT)",
    type: "checkbox",
  },
  {
    key: "vat_rate",
    label: "อัตรา VAT (%) — ใส่ 0 หากยังไม่ได้จด VAT",
    type: "number",
    required: true,
  },
  {
    key: "payment_hours",
    label: "เวลาชำระเงิน (ชั่วโมง 1–168)",
    type: "number",
    required: true,
  },
  {
    key: "prices_include_vat",
    label: "ราคาสินค้ารวม VAT แล้ว",
    type: "checkbox",
  },
  {
    key: "checkout_enabled",
    label: "เปิดรับคำสั่งซื้อออนไลน์",
    type: "checkbox",
  },
];
export function Settings() {
  const { data, error, busy } = useData("admin/settings");
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  return (
    <div className="stack">
      <div className="panel">
        <h2>ข้อมูลร้านและรับชำระเงิน</h2>
        <DataForm
          fields={settingsFields}
          initial={data?.data ?? {}}
          onSave={async (v) => {
            await api("admin/settings", v);
          }}
        />
      </div>
      <div className="panel">
        <h2>บริการรับเงิน</h2>
        <div className="row between">
          <span>โอนเงินและแนบสลิป</span>
          <Badge status="ตั้งค่าบัญชีด้านบน" />
        </div>
        <div className="row between">
          <span>QR อัตโนมัติ / บัตร</span>
          <Badge status="ยังไม่เชื่อมผู้ให้บริการ" />
        </div>
        <p className="small muted">
          ช่องทางอัตโนมัติจะเปิดได้หลังเชื่อมบัญชีร้านค้าและทดสอบยืนยันการชำระเงิน
        </p>
      </div>
    </div>
  );
}
export function AdminDetail({ name, id }: { name: string; id: string }) {
  const { data, error, busy, reload } = useData("admin/" + name + "/" + id);
  const [slip, setSlip] = useState("");
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  const r = data?.data;
  if (!r) return <Empty title="ไม่พบรายการ" />;
  const action = {
    payments: "payment",
    business: "business",
    returns: "return",
    support: "support",
  }[name];
  let fields: Field[] = [];
  if (name === "payments" || name === "business")
    fields = [
      {
        key: "status",
        label: "ผลตรวจ",
        type: "select",
        options: ["approved", "rejected"],
        required: true,
      },
      {
        key: "note",
        label: "หมายเหตุ / เหตุผลเมื่อไม่อนุมัติ",
        type: "textarea",
      },
    ];
  if (name === "returns")
    fields = [
      {
        key: "status",
        label: "ผลดำเนินการ",
        type: "select",
        options: ["approved", "rejected", "refunded", "closed"],
        required: true,
      },
      {
        key: "note",
        label: "รายละเอียดและหลักฐานอ้างอิงการดำเนินการ",
        type: "textarea",
        required: true,
      },
    ];
  if (name === "support")
    fields = [
      {
        key: "reply",
        label: "คำตอบถึงลูกค้า",
        type: "textarea",
        required: true,
      },
    ];
  return (
    <div className="stack">
      <div className="panel">
        <h2>รายละเอียดรายการ</h2>
        <dl className="stack">
          {Object.entries(r)
            .filter(([k]) => !["storage_path", "user_id"].includes(k))
            .map(([k, v]) => (
              <div className="grid2" key={k}>
                <dt className="small muted">{columnLabels[k] ?? k}</dt>
                <dd>{formatValue(k, v)}</dd>
              </div>
            ))}
        </dl>
        {r.order_id && (
          <Link className="link" href={"/admin/orders/" + r.order_id}>
            เปิดคำสั่งซื้อ →
          </Link>
        )}
      </div>
      {name === "payments" && (
        <div className="panel stack">
          <p className="alert">
            ตรวจยอดเงินเข้าบัญชีจริงให้ตรงกับคำสั่งซื้อก่อนอนุมัติ
            รูปสลิปอย่างเดียวไม่ใช่การยืนยันยอดเงินเข้า
          </p>
          <AsyncButton
            run={async () => {
              setSlip((await api("slip/" + id)).url);
            }}
          >
            เปิดสลิป
          </AsyncButton>
          {slip && (
            <img
              src={slip}
              alt="หลักฐานการโอนเงิน"
              style={{ maxWidth: 480, margin: "auto" }}
            />
          )}
        </div>
      )}
      {action && (
        <div className="panel">
          <h2>ดำเนินการ</h2>
          {name === "returns" && (
            <p className="alert">
              เลือก “คืนเงินแล้ว” หลังทำรายการโอนคืนจริง
              และปรับสต็อกแยกหลังตรวจรับสินค้า
            </p>
          )}
          <DataForm
            fields={fields}
            onSave={async (payload) => {
              await api("admin/action", { action, id, payload });
              reload();
            }}
          />
        </div>
      )}
    </div>
  );
}
export function ProductManagement({ initialQ = "" }: { initialQ?: string }) {
  const [tab, setTab] = useState("products");
  return (
    <div className="stack">
      <div className="tabs">
        {[
          ["products", "สินค้าหลัก"],
          ["variants", "ตัวเลือกสินค้า"],
          ["wholesale", "ราคาส่งองค์กร"],
        ].map(([key, title]) => (
          <button
            className={tab === key ? "active" : ""}
            key={key}
            onClick={() => setTab(key)}
          >
            {title}
          </button>
        ))}
      </div>
      <ResourceView key={tab} name={tab} admin initialQ={initialQ} />
    </div>
  );
}

export function PromotionManagement() {
  const [mode, setMode] = useState<"active" | "all">("active");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const path =
    "admin/products?page=" +
    page +
    "&q=" +
    encodeURIComponent(q) +
    "&storefront=true" +
    (mode === "active" ? "&promotion=true" : "");
  const { data, error, busy, reload } = useData(path);
  const rows = data?.data ?? [];

  async function toggle(product: Row) {
    setMessage("");
    const enabled = !product.is_flash_sale;
    await api("admin/products/" + product.id, {
      is_flash_sale: enabled,
      ...(enabled && !product.badge ? { badge: "recommended" } : {}),
    });
    setMessage(enabled ? "เพิ่มสินค้าเข้าโปรโมชั่นแล้ว" : "นำสินค้าออกจากโปรโมชั่นแล้ว");
    reload();
  }

  return (
    <div className="stack promotion-admin">
      <section className="panel promotion-admin-hero">
        <div>
          <p className="eyebrow">PROMOTION PRODUCTS</p>
          <h2>สินค้าโปรโมชั่นหน้าร้าน</h2>
          <p className="small muted">
            เลือกสินค้าที่ต้องการแสดงทั้งหน้าแรกและหน้าโปรโมชั่น
            ราคาใช้ราคาขายจริงของสินค้า
          </p>
        </div>
        <AsyncButton
          className="btn"
          run={async () => {
            const result = await api("admin/promotion-starter", {});
            setMode("active");
            setPage(1);
            setMessage(
              result.count
                ? `เพิ่มสินค้าแนะนำ ${result.count} รายการแล้ว`
                : "สินค้าที่พร้อมขายถูกกำหนดเป็นโปรโมชั่นแล้ว",
            );
            reload();
          }}
        >
          จัดชุดโปรโมชั่นเริ่มต้น 10 รายการ
        </AsyncButton>
      </section>
      <section className="panel">
        <div className="section-head promotion-admin-tools">
          <div className="tabs" aria-label="ตัวกรองสินค้าโปรโมชั่น">
            <button
              className={mode === "active" ? "active" : ""}
              onClick={() => {
                setMode("active");
                setPage(1);
              }}
            >
              กำลังแสดง ({mode === "active" ? (data?.total ?? 0) : "ดูรายการ"})
            </button>
            <button
              className={mode === "all" ? "active" : ""}
              onClick={() => {
                setMode("all");
                setPage(1);
              }}
            >
              เลือกจากสินค้าทั้งหมด
            </button>
          </div>
          <input
            aria-label="ค้นหาสินค้าที่จะทำโปรโมชั่น"
            type="search"
            placeholder="ค้นหาชื่อสินค้า"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              setPage(1);
            }}
          />
        </div>
        {message && <p className="alert success">{message}</p>}
        {error && <p className="alert error">{error}</p>}
        {busy ? (
          <div className="skeleton" />
        ) : rows.length ? (
          <div className="promotion-admin-list">
            {rows.map((product: Row) => (
              <article className="promotion-admin-item" key={product.id}>
                <img src={product.cover_image} alt="" />
                <div className="promotion-admin-copy">
                  <h3>{product.name}</h3>
                  <p>
                    <strong>{money(product.price)}</strong>
                    <span className="muted small">คงเหลือ {product.stock}</span>
                  </p>
                </div>
                <span className={product.is_flash_sale ? "promo-state on" : "promo-state"}>
                  {product.is_flash_sale ? "กำลังแสดง" : "ยังไม่แสดง"}
                </span>
                <AsyncButton
                  className={product.is_flash_sale ? "btn ghost" : "btn"}
                  run={() => toggle(product)}
                >
                  {product.is_flash_sale ? "นำออก" : "เพิ่มเข้าโปรโมชั่น"}
                </AsyncButton>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            title={mode === "active" ? "ยังไม่มีสินค้าโปรโมชั่น" : "ไม่พบสินค้า"}
            description={
              mode === "active"
                ? "กดจัดชุดโปรโมชั่นเริ่มต้น หรือเลือกจากสินค้าทั้งหมด"
                : "ลองค้นหาด้วยชื่อสินค้าอื่น"
            }
          />
        )}
        {(data?.total ?? 0) > 30 && (
          <div className="row promotion-admin-pages">
            <button className="btn ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              ← ก่อนหน้า
            </button>
            <span>หน้า {page}</span>
            <button
              className="btn ghost"
              disabled={page * 30 >= Number(data?.total ?? 0)}
              onClick={() => setPage((value) => value + 1)}
            >
              ถัดไป →
            </button>
          </div>
        )}
      </section>
      <section>
        <h2>คูปองส่วนลด</h2>
        <p className="small muted">สร้างรหัสคูปองและกำหนดช่วงเวลาที่ลูกค้าใช้ได้</p>
        <ResourceView name="promotions" admin />
      </section>
    </div>
  );
}
export function ImportPage() {
  return (
    <div className="stack">
      <div className="panel">
        <h2>แคตตาล็อกจาก Shopee</h2>
        <p>
          ระบบใช้สินค้าที่นำเข้าไว้ใน Supabase เดิม รวมรายละเอียด ราคา ตัวเลือก
          น้ำหนัก รูปภาพ และข้อมูลแหล่งที่มา
        </p>
        <p className="alert">
          การนำเข้าไฟล์ใหม่อาจเปลี่ยนยอดสต็อก
          ควรตรวจสอบร่วมกับคำสั่งซื้อบนเว็บที่ยังกันสินค้าอยู่ก่อนใช้สคริปต์นำเข้าเดิม
        </p>
        <a
          className="btn secondary"
          href="https://seller.shopee.co.th/portal/product-mass/mass-update/download"
          target="_blank"
          rel="noreferrer"
        >
          เปิดหน้าส่งออกข้อมูล Shopee
        </a>
      </div>
      <ResourceView name="import" admin />
    </div>
  );
}
