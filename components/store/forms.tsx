"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { api, authClient } from "@/lib/store/client";
import { resources, columnLabels, type Field } from "@/lib/store/resources";
import { Badge, Empty, AsyncButton } from "./ui";
import { money, statuses } from "@/lib/store/routes";
// Database rows contain resource-specific JSON; all writes use explicit field allowlists.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export function useData(path: string) {
  const [data, setData] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    api(path)
      .then((r) => {
        if (alive) {
          setData(r);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [path, revision]);
  return {
    data,
    error,
    busy,
    reload: () => {
      setBusy(true);
      setRevision((r) => r + 1);
    },
  };
}
export function Gate({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { data, error, busy } = useData("me");
  if (busy) return <div className="skeleton" aria-label="ตรวจสอบบัญชี" />;
  if (error)
    return (
      <div className="panel">
        <Empty
          title="เข้าสู่ระบบเพื่อดำเนินการ"
          description={error}
          href="/login"
          label="เข้าสู่ระบบ"
        />
      </div>
    );
  if (admin && !data?.admin)
    return (
      <div className="alert error">
        บัญชีนี้ไม่มีสิทธิ์จัดการร้าน กรุณาใช้บัญชีพนักงานที่ได้รับสิทธิ์
      </div>
    );
  return <>{children}</>;
}
export function Fields({
  fields,
  values,
  setValues,
}: {
  fields: Field[];
  values: Row;
  setValues: (v: Row) => void;
}) {
  return (
    <div className="form-grid">
      {fields.map((f) => (
        <label
          key={f.key}
          className={
            f.type === "textarea"
              ? "span2"
              : f.type === "checkbox"
                ? "checklabel"
                : ""
          }
        >
          {f.type !== "checkbox" && (
            <span>
              {f.label}
              {f.required && " *"}
            </span>
          )}
          {f.type === "textarea" ? (
            <textarea
              value={values[f.key] ?? ""}
              required={f.required}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            />
          ) : f.type === "select" ? (
            <select
              value={values[f.key] ?? ""}
              required={f.required}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            >
              <option value="">เลือก</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {{
                    flat: "ราคาเดียว",
                    weight: "ตามน้ำหนัก",
                    fixed: "ส่วนลดบาท",
                    percent: "ส่วนลดเปอร์เซ็นต์",
                  }[o] ??
                    statuses[o] ??
                    (
                      {
                        refund: "คืนเงิน",
                        replacement: "เปลี่ยนสินค้า",
                      } as Record<string, string>
                    )[o] ??
                    o}
                </option>
              ))}
            </select>
          ) : f.type === "checkbox" ? (
            <>
              <input
                type="checkbox"
                checked={!!values[f.key]}
                onChange={(e) =>
                  setValues({ ...values, [f.key]: e.target.checked })
                }
              />
              {f.label}
            </>
          ) : (
            <input
              type={f.type ?? "text"}
              value={values[f.key] ?? ""}
              required={f.required}
              step={f.type === "number" ? "any" : undefined}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
            />
          )}{" "}
          {["cover_image", "image_url"].includes(f.key) && (
            <ImageUpload
              onUploaded={(url) => setValues({ ...values, [f.key]: url })}
            />
          )}
          {f.hint && <span className="muted small">{f.hint}</span>}
        </label>
      ))}
    </div>
  );
}
export function DataForm({
  fields,
  initial = {},
  onSave,
  label = "บันทึกข้อมูล",
}: {
  fields: Field[];
  initial?: Row;
  onSave: (v: Row) => Promise<void>;
  label?: string;
}) {
  const [values, setValues] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setSuccess(false);
        try {
          await onSave(values);
          setSuccess(true);
        } catch (e) {
          setError(e instanceof Error ? e.message : "ไม่สำเร็จ");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Fields fields={fields} values={values} setValues={setValues} />
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="alert success" role="status">
          บันทึกข้อมูลเรียบร้อยแล้ว
        </p>
      )}
      <div>
        <button className="btn" disabled={busy}>
          {busy ? "กำลังบันทึก…" : label}
        </button>
      </div>
    </form>
  );
}
export function AuthForm({ mode }: { mode: string }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const db = authClient();
      if (mode === "forgot-password") {
        const r = await db.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (r.error) throw r.error;
        setMessage("หากอีเมลนี้มีบัญชี ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้");
      } else if (mode === "reset-password") {
        const r = await db.auth.updateUser({ password });
        if (r.error) throw r.error;
        setMessage("ตั้งรหัสผ่านใหม่แล้ว เข้าสู่บัญชีได้เลย");
      } else if (mode === "register") {
        const r = await db.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin + "/account",
          },
        });
        if (r.error) throw r.error;
        setMessage("กรุณาตรวจสอบอีเมลเพื่อยืนยันการสมัครสมาชิก");
      } else {
        const r = await db.auth.signInWithPassword({ email, password });
        if (r.error) throw r.error;
        window.location.assign("/account");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ไม่สามารถเข้าสู่ระบบได้");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth">
      <div className="panel">
        <form className="stack" onSubmit={submit}>
          {mode === "register" && (
            <label>
              ชื่อผู้ใช้งาน
              <input
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          {mode !== "reset-password" && (
            <label>
              อีเมล
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          )}
          {mode !== "forgot-password" && (
            <label>
              รหัสผ่าน
              <input
                type="password"
                minLength={8}
                required
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="small muted">อย่างน้อย 8 ตัวอักษร</span>
            </label>
          )}
          {mode === "register" && (
            <label className="checklabel">
              <input type="checkbox" required />
              ฉันอ่าน
              <Link href="/policies/terms" className="link">
                เงื่อนไข
              </Link>
              และ
              <Link href="/policies/privacy" className="link">
                ความเป็นส่วนตัว
              </Link>
              แล้ว
            </label>
          )}
          {error && (
            <p role="alert" className="alert error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="alert success">
              {message}
            </p>
          )}
          <button className="btn full" disabled={busy}>
            {busy
              ? "กำลังดำเนินการ…"
              : mode === "register"
                ? "สมัครสมาชิก"
                : mode === "forgot-password"
                  ? "ส่งลิงก์ทางอีเมล"
                  : mode === "reset-password"
                    ? "บันทึกรหัสผ่าน"
                    : "เข้าสู่ระบบ"}
          </button>
          {mode === "login" && (
            <AsyncButton
              className="btn secondary full"
              run={async () => {
                if (!email) throw new Error("กรุณากรอกอีเมล");
                const r = await authClient().auth.signInWithOtp({
                  email,
                  options: {
                    emailRedirectTo: window.location.origin + "/account",
                  },
                });
                if (r.error) throw r.error;
                setMessage("ส่งลิงก์เข้าสู่ระบบทางอีเมลแล้ว");
              }}
            >
              รับลิงก์เข้าสู่ระบบทางอีเมล
            </AsyncButton>
          )}
          <div className="row between small">
            <Link
              className="link"
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </Link>
            <Link className="link" href="/forgot-password">
              ลืมรหัสผ่าน
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export function formatValue(key: string, value: unknown): ReactNode {
  if (value == null || value === "") return "—";
  if (key === "cover_image" && /^https:\/\//.test(String(value)))
    return <img src={String(value)} alt="ภาพสินค้า" loading="lazy" />;
  if (key === "cover_image" && String(value).startsWith("/images/"))
    return <img src={String(value)} alt="ภาพสินค้า" loading="lazy" />;
  if (key === "source_url" && /^https:\/\//.test(String(value)))
    return (
      <a href={String(value)} target="_blank" rel="noreferrer" className="link">
        เปิดใน Shopee ↗
      </a>
    );
  if (typeof value === "boolean") return value ? "เปิด" : "ปิด";
  if (key === "status" || key === "payment_status")
    return <Badge status={String(value)} />;
  if (
    [
      "price",
      "total",
      "amount",
      "offered_total",
      "base_fee",
      "per_kg",
      "free_over",
    ].includes(key)
  )
    return money(Number(value));
  if (key.endsWith("_at"))
    return new Date(String(value)).toLocaleString("th-TH");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
export function ResourceView({
  name,
  admin = false,
  createOnly = false,
  initialQ = "",
}: {
  name: string;
  admin?: boolean;
  createOnly?: boolean;
  initialQ?: string;
}) {
  const resource = resources[name],
    prefix = (admin ? "admin/" : "") + name;
  const [page, setPage] = useState(1),
    [q, setQ] = useState(initialQ),
    [editing, setEditing] = useState<Row | null>(createOnly ? {} : null);
  const { data, error, busy, reload } = useData(
    prefix + "?page=" + page + "&q=" + encodeURIComponent(q),
  );
  if (!resource) return null;
  const editable =
    resource.fields.length > 0 &&
    (!admin || !["business", "support"].includes(name));
  const rows: Row[] = data?.data ?? [];
  return (
    <div className="stack">
      {error && <p className="alert error">{error}</p>}
      {!createOnly && (
        <div className="toolbar">
          <div className="row">
            <span className="small">{data?.total ?? 0} รายการ</span>
            {admin &&
              ["products", "categories", "customers"].includes(name) && (
                <input
                  aria-label="ค้นหารายการ"
                  placeholder="ค้นหา…"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                />
              )}
          </div>
          {editable && (
            <button className="btn" onClick={() => setEditing({})}>
              + เพิ่ม{resource.title}
            </button>
          )}
        </div>
      )}
      {editing && (
        <div className="panel">
          <div className="section-head">
            <h2>
              {editing.id ? "แก้ไข" : "เพิ่ม"}
              {resource.title}
            </h2>
            {!createOnly && (
              <button className="btn ghost" onClick={() => setEditing(null)}>
                ปิด
              </button>
            )}
          </div>
          <DataForm
            key={editing.id ?? "new"}
            fields={resource.fields}
            initial={editing}
            onSave={async (values) => {
              await api(prefix + (editing.id ? "/" + editing.id : ""), values);
              if (!createOnly) setEditing(null);
              reload();
            }}
          />
          {name === "products" && (
            <p className="alert" style={{ marginTop: 16 }}>
              หลังสร้างสินค้า ให้ปรับยอดในหน้าสต็อกสินค้า
              เพื่อบันทึกประวัติการเปลี่ยนแปลง
            </p>
          )}
        </div>
      )}
      {!createOnly &&
        (busy ? (
          <div className="skeleton" />
        ) : rows.length ? (
          <div className="panel tablewrap">
            <table className="table">
              <thead>
                <tr>
                  {resource.columns.map((c) => (
                    <th key={c}>{columnLabels[c] ?? c}</th>
                  ))}
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id ?? r.user_id ?? i}>
                    {resource.columns.map((c) => (
                      <td key={c}>{formatValue(c, r[c])}</td>
                    ))}
                    <td>
                      {editable && (
                        <button
                          className="btn ghost"
                          onClick={() => setEditing(r)}
                        >
                          แก้ไข
                        </button>
                      )}
                      {["orders", "quotes", "returns"].includes(name) && (
                        <Link
                          className="link"
                          href={
                            (admin ? "/admin/" : "/account/") +
                            name +
                            "/" +
                            r.id
                          }
                        >
                          ดูรายละเอียด
                        </Link>
                      )}
                      {admin &&
                        [
                          "business",
                          "payments",
                          "shipments",
                          "support",
                        ].includes(name) && (
                          <Link
                            className="link"
                            href={"/admin/" + name + "/" + r.id}
                          >
                            ดำเนินการ
                          </Link>
                        )}
                      {!admin && ["addresses", "tax"].includes(name) && (
                        <AsyncButton
                          className="btn ghost"
                          run={async () => {
                            if (window.confirm("ลบรายการนี้?")) {
                              await api(
                                prefix + "/" + r.id,
                                undefined,
                                "DELETE",
                              );
                              reload();
                            }
                          }}
                        >
                          ลบ
                        </AsyncButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel">
            <Empty />
          </div>
        ))}
      {!createOnly && (
        <div className="row">
          <button
            className="btn ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ก่อนหน้า
          </button>
          <span className="small">หน้า {page}</span>
          <button
            className="btn ghost"
            disabled={page * 30 >= (data?.total ?? 0)}
            onClick={() => setPage((p) => p + 1)}
          >
            ถัดไป
          </button>
        </div>
      )}
      {name === "staff" && (
        <p className="alert">
          สิทธิ์พนักงานกำหนดโดยผู้ดูแลฐานข้อมูล
          เพื่อป้องกันบัญชีทั่วไปยกระดับสิทธิ์ตนเอง
        </p>
      )}
    </div>
  );
}

function ImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <span className="stack">
      <input
        aria-label="อัปโหลดรูปสินค้า"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError("");
          try {
            if (file.size > 5 * 1024 * 1024)
              throw new Error("รูปต้องไม่เกิน 5 MB");
            const extension = (
              {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/webp": "webp",
              } as Record<string, string>
            )[file.type];
            if (!extension) throw new Error("ใช้รูป JPG, PNG หรือ WebP");
            const db = authClient();
            const path = "store/" + crypto.randomUUID() + "." + extension;
            const result = await db.storage
              .from("product-images")
              .upload(path, file, { contentType: file.type });
            if (result.error) throw result.error;
            onUploaded(
              db.storage.from("product-images").getPublicUrl(path).data
                .publicUrl,
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && <span className="small">กำลังอัปโหลด…</span>}
      {error && (
        <span className="alert error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
