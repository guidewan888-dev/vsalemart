"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"duplicate"|"error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); setStatus("loading"); try { const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }); const data = await response.json(); setStatus(response.ok ? (data.duplicate ? "duplicate" : "success") : "error"); } catch { setStatus("error"); } }
  return <section id="contact" className="compact-section mx-auto max-w-[1320px] px-4 md:px-6"><div className="grid gap-4 rounded-xl bg-[#eaf5ff] p-5 md:grid-cols-[1fr_1.35fr] md:items-center md:px-7"><div className="flex items-center gap-3"><Send className="size-7 text-[#0872f5]"/><div><h2 className="text-xl font-extrabold text-[#082653]">ของใหม่และโปรดี ส่งตรงถึงคุณ</h2><p className="text-xs text-[#667a96]">ไม่พลาดสินค้าเข้าใหม่และข้อเสนอจาก V SALE</p></div></div><form onSubmit={submit}><div className="flex flex-col gap-2 sm:flex-row"><label className="flex-1"><span className="sr-only">อีเมล</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="กรอกอีเมลของคุณ" className="min-h-11 w-full rounded-lg border border-[#cad8eb] bg-white px-4 text-sm outline-none focus:border-[#0872f5]"/></label><button disabled={status === "loading"} className="min-h-11 rounded-lg bg-[#0872f5] px-6 text-sm font-bold text-white disabled:opacity-60">{status === "loading" ? "กำลังสมัคร..." : "สมัครรับข่าวสาร"}</button></div><p aria-live="polite" className="mt-1 min-h-4 text-[10px] text-[#52657e]">{status === "success" ? "สมัครรับข่าวสารเรียบร้อยแล้ว" : status === "duplicate" ? "อีเมลนี้สมัครไว้แล้ว" : status === "error" ? "ยังสมัครไม่ได้ กรุณาลองใหม่" : "เมื่อสมัคร คุณยอมรับนโยบายความเป็นส่วนตัวของร้าน"}</p></form></div></section>;
}
