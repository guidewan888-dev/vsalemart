"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"duplicate"|"error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); setStatus("loading"); try { const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); setStatus(response.ok ? (data.duplicate ? "duplicate" : "success") : "error"); } catch { setStatus("error"); } }
  return <section id="contact" className="section-pad mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12"><div className="grid gap-7 rounded-3xl bg-[#eaf2ff] p-7 md:grid-cols-[1fr_1.2fr] md:items-center md:p-10"><div><div className="flex items-center gap-3 text-[#146ef5]"><Send className="size-7"/><span className="text-xs font-bold">ข่าวสารจาก V SALE</span></div><h2 className="mt-3 text-3xl font-black text-[#0b1533]">ของใหม่และโปรดี<br/>ส่งตรงถึงคุณ</h2><p className="mt-2 text-sm text-[#667085]">ไม่พลาดสินค้าเข้าใหม่และข้อเสนอที่ตรงกับคุณ</p></div><form onSubmit={submit}><div className="flex flex-col gap-2 sm:flex-row"><label className="flex-1"><span className="sr-only">อีเมล</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="กรอกอีเมลของคุณ" className="min-h-12 w-full rounded-full border border-[#cad8eb] bg-white px-5 text-base outline-none focus:border-[#146ef5]"/></label><button disabled={status === "loading"} className="min-h-12 rounded-full bg-[#146ef5] px-7 font-bold text-white disabled:opacity-60">{status === "loading" ? "กำลังสมัคร..." : "สมัครรับข่าวสาร"}</button></div><p aria-live="polite" className="mt-2 min-h-5 text-xs text-[#4e5c75]">{status === "success" ? "สมัครรับข่าวสารเรียบร้อยแล้ว" : status === "duplicate" ? "อีเมลนี้สมัครไว้แล้ว" : status === "error" ? "ยังสมัครไม่ได้ กรุณาลองใหม่" : "เมื่อสมัคร คุณยอมรับนโยบายความเป็นส่วนตัวของร้าน"}</p></form></div></section>;
}
