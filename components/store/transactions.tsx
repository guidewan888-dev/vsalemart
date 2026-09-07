"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "./provider";
import { api, authClient } from "@/lib/store/client";
import { money } from "@/lib/store/routes";
import { useData, DataForm, type Row, ResourceView } from "./forms";
import { AsyncButton, Badge, Empty } from "./ui";
export function Checkout({ quoteId }: { quoteId?: string }) {
  const { cart, clear } = useStore();
  const { data: addresses } = useData("addresses"),
    { data: taxes } = useData("tax");
  const [config, setConfig] = useState<Row | null>(null),
    [shipping, setShipping] = useState<Row[]>([]),
    [address, setAddress] = useState(""),
    [tax, setTax] = useState(""),
    [method, setMethod] = useState(""),
    [coupon, setCoupon] = useState(""),
    [note, setNote] = useState(""),
    [summary, setSummary] = useState<Row | null>(null),
    [error, setError] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  useEffect(() => {
    fetch("/api/store/config")
      .then((r) => r.json())
      .then((r) => {
        if (r.error) throw new Error(r.error);
        setConfig(r.config);
        setShipping(r.shipping);
      })
      .catch((e) => setError(e.message));
  }, []);
  const payload = {
    lines: cart.map((l) => ({
      product_id: l.product.id,
      variant_id: l.variantId ?? null,
      quantity: l.quantity,
    })),
    address_id: address,
    tax_id: tax || null,
    shipping_id: method,
    coupon,
    key,
    quote_id: quoteId,
    note,
  };
  if (!cart.length && !quoteId)
    return <Empty title="ยังไม่มีสินค้าในตะกร้า" href="/products" />;
  return (
    <div className="checkout">
      <div className="stack">
        {error && <p className="alert error">{error}</p>}
        <section className="panel stack">
          <h2>1. ที่อยู่จัดส่ง</h2>
          <label>
            เลือกที่อยู่
            <select
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSummary(null);
              }}
            >
              <option value="">เลือกที่อยู่จัดส่ง</option>
              {addresses?.data?.map((a: Row) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.address} {a.province} {a.postcode}
                </option>
              ))}
            </select>
          </label>
          <Link href="/account/addresses" className="link small">
            เพิ่ม / แก้ไขที่อยู่ →
          </Link>
        </section>
        <section className="panel stack">
          <h2>2. การจัดส่ง</h2>
          {shipping.length ? (
            <label>
              วิธีจัดส่ง
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  setSummary(null);
                }}
              >
                <option value="">เลือกขนส่ง</option>
                {shipping.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ·{" "}
                    {s.mode === "flat" ? money(s.base_fee) : "ตามน้ำหนัก"}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="alert">
              ร้านยังไม่ได้เปิดวิธีจัดส่ง กรุณาติดต่อร้านก่อนสั่งซื้อ
            </p>
          )}
        </section>
        <section className="panel stack">
          <h2>3. ใบกำกับภาษี</h2>
          <label>
            ข้อมูลผู้ซื้อ
            <select
              value={tax}
              onChange={(e) => {
                setTax(e.target.value);
                setSummary(null);
              }}
            >
              <option value="">ไม่ขอใบกำกับภาษีเต็มรูป</option>
              {taxes?.data?.map((t: Row) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.tax_id}
                </option>
              ))}
            </select>
          </label>
          <Link href="/account/tax" className="link small">
            เพิ่มข้อมูลใบกำกับภาษี →
          </Link>
        </section>
        <section className="panel stack">
          <h2>4. วิธีชำระเงิน</h2>
          <label className="checklabel">
            <input type="radio" name="payment" defaultChecked />
            โอนเงินและแนบสลิปให้ร้านตรวจสอบ
          </label>
          <label className="checklabel muted">
            <input type="radio" name="payment" disabled />
            QR อัตโนมัติ — ยังไม่เปิดให้บริการ
          </label>
          <label className="checklabel muted">
            <input type="radio" name="payment" disabled />
            บัตรเครดิต / เดบิต — ยังไม่เปิดให้บริการ
          </label>
          <p className="small muted">
            ข้อมูลบัญชีรับเงินแสดงหลังสร้างคำสั่งซื้อสำเร็จ
            ร้านจัดส่งเมื่อยืนยันยอดเงินเข้าแล้ว
          </p>
          <label>
            หมายเหตุถึงร้าน
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={2000}
            />
          </label>
        </section>
      </div>
      <aside className="panel summary stack">
        <h2>ตรวจสอบยอดชำระ</h2>
        {!quoteId &&
          cart.map((l) => (
            <div
              className="row between small"
              key={l.product.id + (l.variantId ?? "")}
            >
              <span>
                {l.product.name} × {l.quantity}
              </span>
            </div>
          ))}
        {quoteId && <p className="badge">สั่งซื้อตามใบเสนอราคา</p>}
        <label>
          คูปองส่วนลด
          <input
            disabled={!!quoteId}
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value);
              setSummary(null);
            }}
          />
        </label>
        {!config?.checkout_enabled && (
          <p className="alert">ร้านยังไม่เปิดรับคำสั่งซื้อออนไลน์</p>
        )}
        <AsyncButton
          className="btn secondary full"
          run={async () => {
            setSummary(null);
            if (!address || !method)
              throw new Error("เลือกที่อยู่และขนส่งก่อนตรวจสอบยอด");
            setSummary(await api("preview", payload));
          }}
        >
          ตรวจสอบราคาล่าสุดและค่าส่ง
        </AsyncButton>
        {summary && (
          <>
            <Totals order={summary} />
            <p className="small muted">
              ตรวจสอบยอดและข้อมูลก่อนยืนยัน
              การสั่งซื้อจะกันสินค้าจนถึงเวลาที่กำหนดในออเดอร์
            </p>
            <AsyncButton
              className="btn full"
              run={async () => {
                const result = await api("checkout", {
                  ...payload,
                  expected_total: summary.total,
                });
                if (!quoteId) clear();
                window.location.assign("/account/orders/" + result.id);
              }}
            >
              ยืนยันสั่งซื้อ {money(summary.total)}
            </AsyncButton>
          </>
        )}
      </aside>
    </div>
  );
}
export function Totals({ order: o }: { order: Row }) {
  return (
    <div>
      <div className="row between">
        <span>ยอดสินค้า</span>
        <span>{money(o.subtotal)}</span>
      </div>
      <div className="row between">
        <span>ส่วนลด</span>
        <span>−{money(o.discount)}</span>
      </div>
      <div className="row between">
        <span>ค่าจัดส่ง</span>
        <span>{money(o.shipping_fee)}</span>
      </div>
      <div className="row between small">
        <span>VAT {o.vat_rate}%</span>
        <span>{money(o.vat_amount)}</span>
      </div>
      <hr />
      <div className="row between">
        <strong>ยอดชำระทั้งหมด</strong>
        <strong className="price">{money(o.total)}</strong>
      </div>
    </div>
  );
}
export function OrderDetail({
  id,
  admin = false,
}: {
  id: string;
  admin?: boolean;
}) {
  const { data, error, busy, reload } = useData(
    (admin ? "admin/" : "") + "orders/" + id,
  );
  const [config, setConfig] = useState<Row | null>(null);
  useEffect(() => {
    fetch("/api/store/config")
      .then((r) => r.json())
      .then((r) => setConfig(r.config))
      .catch(() => {});
  }, []);
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  const o = data?.data;
  if (!o) return <Empty title="ไม่พบคำสั่งซื้อ" />;
  return (
    <div className="stack">
      <div className="panel">
        <div className="section-head">
          <div>
            <p className="small muted">คำสั่งซื้อ</p>
            <h2>{o.reference}</h2>
          </div>
          <div className="row">
            <Badge status={o.status} />
            <Badge status={o.payment_status} />
          </div>
        </div>
        <ol className="timeline">
          <li>
            <h3>รับคำสั่งซื้อ</h3>
            <p className="small muted">
              {new Date(o.created_at).toLocaleString("th-TH")}
            </p>
          </li>
          <li>
            <h3>
              {o.payment_status === "paid"
                ? "ยืนยันการชำระเงินแล้ว"
                : "ตรวจสอบการชำระเงิน"}
            </h3>
            <p className="small muted">
              {o.payment_status === "submitted"
                ? "ร้านกำลังตรวจสอบสลิปและยอดเงินเข้า"
                : o.payment_status === "paid"
                  ? "เตรียมจัดสินค้า"
                  : "ชำระและแนบสลิปภายใน " +
                    new Date(o.payment_due_at).toLocaleString("th-TH")}
            </p>
          </li>
          <li>
            <h3>การจัดส่ง</h3>
            <p className="small muted">
              {o.tracking_number
                ? o.carrier + " · " + o.tracking_number
                : "เลขพัสดุจะแสดงเมื่อร้านจัดส่งแล้ว"}
            </p>
          </li>
        </ol>
      </div>
      <div className="grid2">
        <section className="panel">
          <h3>ที่อยู่จัดส่ง</h3>
          <p>{o.shipping_address?.name}</p>
          <p className="small">
            {o.shipping_address?.phone}
            <br />
            {o.shipping_address?.address} {o.shipping_address?.province}{" "}
            {o.shipping_address?.postcode}
          </p>
        </section>
        <section className="panel">
          <h3>ข้อมูลใบกำกับภาษี</h3>
          <p>{o.tax_snapshot?.name ?? "ไม่ได้ขอใบกำกับภาษีเต็มรูป"}</p>
          <p className="small">
            {o.tax_snapshot?.tax_id} {o.tax_snapshot?.branch}
            <br />
            {o.tax_snapshot?.address}
          </p>
        </section>
      </div>
      <section className="panel">
        <h2>รายการสินค้า</h2>
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>สินค้า / ตัวเลือก</th>
                <th>ราคา</th>
                <th>จำนวน</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              {o.order_items.map((i: Row) => (
                <tr key={i.id}>
                  <td>
                    {i.product_name}
                    <br />
                    <span className="muted">{i.variant_name}</span>
                  </td>
                  <td>{money(i.unit_price)}</td>
                  <td>{i.quantity}</td>
                  <td>{money(i.quantity * i.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ maxWidth: 400, margin: "24px 0 0 auto" }}>
          <Totals order={o} />
        </div>
      </section>
      {!admin &&
        o.status === "pending" &&
        ["pending", "rejected"].includes(o.payment_status) && (
          <section className="panel stack">
            <h2>ชำระเงินและแนบสลิป</h2>
            <div className="alert">
              <strong>
                {config?.bank_name} · {config?.bank_account}
              </strong>
              <br />
              ชื่อบัญชี {config?.bank_holder}
              <br />
              ยอดโอน {money(o.total)}
            </div>
            <SlipUpload order={o} onDone={reload} />
            <AsyncButton
              className="btn ghost"
              run={async () => {
                if (window.confirm("ยกเลิกคำสั่งซื้อและคืนสินค้าเข้าสต็อก?")) {
                  await api("cancel", { id });
                  reload();
                }
              }}
            >
              ยกเลิกคำสั่งซื้อ
            </AsyncButton>
          </section>
        )}
      {admin && ["paid", "packing", "shipped"].includes(o.status) && (
        <section className="panel">
          <h2>ดำเนินการคำสั่งซื้อ</h2>
          <DataForm
            fields={[
              {
                key: "status",
                label: "สถานะถัดไป",
                type: "select",
                required: true,
                options: [
                  o.status === "paid"
                    ? "packing"
                    : o.status === "packing"
                      ? "shipped"
                      : "completed",
                ],
              },
              ...(o.status === "packing"
                ? [
                    { key: "carrier", label: "บริษัทขนส่ง", required: true },
                    {
                      key: "tracking_number",
                      label: "เลขพัสดุ",
                      required: true,
                    },
                  ]
                : []),
            ]}
            onSave={async (v) => {
              await api("admin/action", { action: "order", id, payload: v });
              reload();
            }}
          />
        </section>
      )}
      <div className="row">
        {o.payment_status === "paid" && (
          <>
            <Link
              className="btn secondary"
              href={
                (admin ? "/admin/orders/" : "/account/orders/") +
                id +
                "/invoice"
              }
            >
              ดูเอกสารการขาย
            </Link>
            {!admin && (
              <Link
                className="btn ghost"
                href={"/account/returns/new?order=" + id}
              >
                แจ้งคืนสินค้า / คืนเงิน
              </Link>
            )}
          </>
        )}
        {!admin && o.status === "completed" && (
          <Link
            className="btn ghost"
            href={"/account/orders/" + id + "/review"}
          >
            เขียนรีวิว
          </Link>
        )}
      </div>
    </div>
  );
}
function SlipUpload({ order, onDone }: { order: Row; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null),
    [at, setAt] = useState("");
  return (
    <div className="stack">
      <label>
        วันที่และเวลาที่โอน
        <input
          type="datetime-local"
          value={at}
          onChange={(e) => setAt(e.target.value)}
          required
        />
      </label>
      <label>
        รูปสลิป (JPG, PNG, WebP ไม่เกิน 5 MB)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <AsyncButton
        run={async () => {
          if (!file || !at) throw new Error("เลือกรูปสลิปและเวลาที่โอน");
          if (
            file.size > 5 * 1024 * 1024 ||
            !["image/jpeg", "image/png", "image/webp"].includes(file.type)
          )
            throw new Error("ไฟล์ต้องเป็นรูปภาพไม่เกิน 5 MB");
          const db = authClient(),
            { data } = await db.auth.getUser();
          if (!data.user) throw new Error("กรุณาเข้าสู่ระบบ");
          const path =
            data.user.id +
            "/" +
            crypto.randomUUID() +
            "." +
            { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[
              file.type
            ];
          const upload = await db.storage
            .from("payment-slips")
            .upload(path, file, { contentType: file.type, upsert: false });
          if (upload.error) throw upload.error;
          await api("submit-slip", {
            order_id: order.id,
            path,
            amount: order.total,
            transferred_at: new Date(at).toISOString(),
          });
          onDone();
        }}
      >
        ส่งสลิปให้ร้านตรวจสอบ
      </AsyncButton>
    </div>
  );
}
export function QuoteRequest() {
  const { cart } = useStore();
  const { data, busy, error } = useData("me");
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  if (data?.business?.status !== "approved")
    return (
      <Empty
        title="สำหรับบัญชีองค์กรที่ได้รับอนุมัติ"
        description="ส่งข้อมูลโรงเรียนหรือบริษัทให้ร้านตรวจสอบก่อนขอราคา"
        href="/business/apply"
        label="สมัครบัญชีองค์กร"
      />
    );
  if (!cart.length)
    return (
      <Empty
        title="เลือกสินค้าก่อนขอราคา"
        description="เพิ่มสินค้าที่ต้องการในตะกร้าแล้วกลับมาหน้านี้"
        href="/products"
      />
    );
  return (
    <div className="panel stack">
      <h2>รายการขอราคา</h2>
      {cart.map((l) => (
        <div className="row between" key={l.product.id + (l.variantId ?? "")}>
          <span>
            {l.product.name} {l.variantName}
          </span>
          <strong>{l.quantity} ชิ้น</strong>
        </div>
      ))}
      <DataForm
        fields={[
          {
            key: "note",
            label: "รายละเอียดการจัดซื้อ / วันที่ต้องการสินค้า",
            type: "textarea",
          },
        ]}
        label="ส่งคำขอใบเสนอราคา"
        onSave={async (v) => {
          const r = await api("quotes", {
            items: cart.map((l) => ({
              product_id: l.product.id,
              variant_id: l.variantId,
              quantity: l.quantity,
              name: l.product.name,
            })),
            note: v.note,
          });
          window.location.assign("/account/quotes/" + r.id);
        }}
      />
    </div>
  );
}
export function QuoteDetail({
  id,
  admin = false,
}: {
  id: string;
  admin?: boolean;
}) {
  const { data, error, busy, reload } = useData(
    (admin ? "admin/" : "") + "quotes/" + id,
  );
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  const q = data?.data;
  if (!q) return <Empty title="ไม่พบใบเสนอราคา" />;
  return (
    <div className="stack">
      <div className="document">
        <div className="row between">
          <h2>VSaleMart · ใบเสนอราคา</h2>
          <Badge status={q.status} />
        </div>
        <p className="small muted">
          รหัส {q.id}
          <br />
          วันที่ {new Date(q.created_at).toLocaleDateString("th-TH")}
        </p>
        <hr />
        <table className="table">
          <thead>
            <tr>
              <th>รายการสินค้า</th>
              <th>จำนวน</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((i: Row, n: number) => (
              <tr key={n}>
                <td>{i.name || i.product_id}</td>
                <td>{i.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 20 }}>{q.note}</p>
        {q.offered_total !== null && (
          <>
            <h2 className="price">ราคาสินค้ารวม {money(q.offered_total)}</h2>
            <p className="small">
              ค่าส่งและยอดภาษีแสดงก่อนยืนยันคำสั่งซื้อ
              <br />
              ใช้ได้ถึง {new Date(q.expires_at).toLocaleString("th-TH")}
            </p>
            <p>{q.admin_note}</p>
          </>
        )}
        <p className="small muted">เงื่อนไข: ชำระเงินก่อนจัดส่งทุกคำสั่งซื้อ</p>
      </div>
      <div className="row no-print">
        <button className="btn ghost" onClick={() => window.print()}>
          พิมพ์ / บันทึก PDF
        </button>
        {!admin &&
          q.status === "sent" &&
          new Date(q.expires_at) > new Date() && (
            <Link className="btn" href={"/checkout?quote=" + id}>
              ยอมรับราคาและสั่งซื้อ
            </Link>
          )}
      </div>
      {admin && ["submitted", "sent"].includes(q.status) && (
        <div className="panel">
          <h2>กำหนดราคาเสนอ</h2>
          <DataForm
            fields={[
              {
                key: "total",
                label: "ราคาสินค้ารวมหลังส่วนลด",
                type: "number",
                required: true,
              },
              {
                key: "expires_at",
                label: "ใช้ได้ถึง",
                type: "datetime-local",
                required: true,
              },
              { key: "note", label: "เงื่อนไข / หมายเหตุ", type: "textarea" },
            ]}
            onSave={async (v) => {
              await api("admin/action", {
                action: "quote",
                id,
                payload: {
                  ...v,
                  expires_at: new Date(v.expires_at).toISOString(),
                },
              });
              reload();
            }}
          />
        </div>
      )}
    </div>
  );
}
export function Invoice({
  id,
  admin = false,
}: {
  id: string;
  admin?: boolean;
}) {
  const { data, error, busy } = useData(
    (admin ? "admin/" : "") + "orders/" + id,
  );
  const invoice = useData("invoice/" + id);
  if (busy || invoice.busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  const doc = invoice.data?.data;
  const o = doc?.snapshot ?? data?.data;
  if (!o || o.payment_status !== "paid")
    return (
      <Empty
        title="เอกสารยังไม่พร้อม"
        description="เอกสารแสดงหลังยืนยันการชำระเงิน"
      />
    );
  return (
    <>
      <div className="alert no-print" style={{ marginBottom: 20 }}>
        {doc
          ? "เอกสารออกแล้ว ข้อมูลถูกบันทึก ณ เวลาออกเอกสาร"
          : "สรุปการขาย — ยังไม่ได้ออกใบกำกับภาษี"}
        {admin && !doc && o.tax_snapshot && (
          <AsyncButton
            run={async () => {
              await api("admin/issue-invoice", { id });
              invoice.reload();
            }}
          >
            ตรวจสอบข้อมูลแล้ว · ออกใบกำกับภาษี
          </AsyncButton>
        )}
      </div>
      <article className="document">
        <div className="row between">
          <div>
            <h2>{o.seller_snapshot?.name}</h2>
            <p>{o.seller_snapshot?.address}</p>
            <p>
              เลขผู้เสียภาษี {o.seller_snapshot?.tax_id}
              <br />
              สาขา {o.seller_snapshot?.branch ?? "00000"}
            </p>
          </div>
          <div>
            <h2>{doc ? "ใบเสร็จรับเงิน / ใบกำกับภาษี" : "สรุปการขาย"}</h2>
            {doc && (
              <p>
                {doc.number}
                <br />
                วันที่ {new Date(doc.issued_at).toLocaleDateString("th-TH")}
              </p>
            )}
          </div>
        </div>
        <hr />
        <div className="grid2">
          <div>
            <h3>ผู้ซื้อ</h3>
            <p>
              {o.tax_snapshot?.name ?? o.shipping_address?.name}
              <br />
              {o.tax_snapshot?.address ?? o.shipping_address?.address}
              <br />
              {o.tax_snapshot?.tax_id}
              <br />
              สาขา {o.tax_snapshot?.branch ?? "00000"}
            </p>
          </div>
          <div>
            <p>
              อ้างอิง {o.reference}
              <br />
              วันที่ {new Date(o.created_at).toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th>ราคาต่อหน่วย</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {o.order_items.map((i: Row) => (
              <tr key={i.id}>
                <td>{i.product_name}</td>
                <td>{i.quantity}</td>
                <td>{money(i.unit_price)}</td>
                <td>{money(i.quantity * i.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ maxWidth: 380, margin: "30px 0 0 auto" }}>
          <Totals order={o} />
        </div>
      </article>
      <button
        className="btn no-print"
        style={{ marginTop: 20 }}
        onClick={() => window.print()}
      >
        พิมพ์ / บันทึก PDF
      </button>
    </>
  );
}
export function ReturnForm({ orderId }: { orderId: string }) {
  return (
    <div className="panel">
      <DataForm
        fields={[
          { key: "order_id", label: "รหัสคำสั่งซื้อ", required: true },
          {
            key: "resolution",
            label: "ต้องการให้ดำเนินการ",
            type: "select",
            options: ["refund", "replacement"],
            required: true,
          },
          {
            key: "reason",
            label: "รายละเอียดปัญหาและสินค้าที่เกี่ยวข้อง",
            type: "textarea",
            required: true,
          },
        ]}
        initial={{ order_id: orderId }}
        label="ส่งคำขอ"
        onSave={async (v) => {
          await api("returns", v);
          window.location.assign("/account/returns");
        }}
      />
    </div>
  );
}
export function AccountHome() {
  const { data, error } = useData("me");
  return (
    <div className="stack">
      {error && <p className="alert error">{error}</p>}
      <div className="panel">
        <p className="eyebrow">MY V SALE</p>
        <h2>สวัสดี {data?.profile?.display_name ?? "คุณลูกค้า"}</h2>
        <p className="muted">{data?.user?.email}</p>
        {data?.business && <Badge status={data.business.status} />}
      </div>
      <div className="grid3">
        {[
          ["/account/orders", "คำสั่งซื้อ", "ติดตามยอดชำระและเลขพัสดุ"],
          ["/account/quotes", "ใบเสนอราคา", "ดูราคาและยืนยันการจัดซื้อ"],
          ["/account/addresses", "ที่อยู่จัดส่ง", "จัดการสถานที่รับสินค้า"],
          ["/account/tax", "ใบกำกับภาษี", "ข้อมูลสำหรับออกเอกสาร"],
          ["/account/returns", "บริการหลังการขาย", "ติดตามการคืนสินค้า"],
          ["/account/notifications", "การแจ้งเตือน", "อัปเดตจากร้าน"],
        ].map(([href, title, desc]) => (
          <Link className="panel" key={href} href={href}>
            <h3>{title} →</h3>
            <p className="small muted">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function Profile() {
  const { data, error, busy } = useData("me");
  if (busy) return <div className="skeleton" />;
  if (error) return <p className="alert error">{error}</p>;
  return (
    <div className="panel">
      <DataForm
        initial={data?.profile ?? {}}
        fields={[
          { key: "display_name", label: "ชื่อที่แสดง", required: true },
          { key: "phone", label: "เบอร์โทรศัพท์", required: true },
        ]}
        onSave={async (v) => {
          await api("profile", v);
        }}
      />
    </div>
  );
}
export function BusinessApply() {
  const { data } = useData("me");
  if (data?.business)
    return (
      <div className="panel stack">
        <h2>{data.business.name}</h2>
        <Badge status={data.business.status} />
        <p>
          {data.business.admin_note ??
            "ร้านจะตรวจสอบข้อมูลและแจ้งผลในบัญชีของคุณ"}
        </p>
        <Link href="/account/notifications" className="link">
          ดูการแจ้งเตือน
        </Link>
      </div>
    );
  return <ResourceView name="business" createOnly />;
}
