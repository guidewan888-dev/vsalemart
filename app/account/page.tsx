"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"sent"|"error">("idle");
  async function submit(event: FormEvent) { event.preventDefault(); setStatus("loading"); try { const supabase = createSupabaseClient(); const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/account` } }); setStatus(error ? "error" : "sent"); } catch { setStatus("error"); } }
  return <main className="grid min-h-dvh place-items-center bg-[#eaf2ff] px-4 py-12"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl md:p-10"><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#146ef5]"><ArrowLeft className="size-4"/>กลับหน้าร้าน</Link>{status === "sent" ? <div className="py-12 text-center"><CheckCircle2 className="mx-auto size-12 text-[#16855b]"/><h1 className="mt-5 text-2xl font-black">ตรวจสอบอีเมลของคุณ</h1><p className="mt-3 text-[#667085]">เราได้ส่งลิงก์เข้าสู่ระบบไปที่ {email}</p></div> : <><p className="mt-8 text-sm font-bold text-[#146ef5]">บัญชี V SALE</p><h1 className="mt-2 text-3xl font-black">เข้าสู่ระบบด้วยอีเมล</h1><p className="mt-3 leading-7 text-[#667085]">รับลิงก์เข้าสู่ระบบโดยไม่ต้องจำรหัสผ่าน</p><form onSubmit={submit} className="mt-7"><label className="text-sm font-bold">อีเมล<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[#dce2ec] px-4 text-base outline-none focus:border-[#146ef5]" placeholder="name@example.com"/></label><button disabled={status === "loading"} className="mt-4 min-h-12 w-full rounded-full bg-[#146ef5] font-bold text-white disabled:opacity-60">{status === "loading" ? "กำลังส่ง..." : "ส่งลิงก์เข้าสู่ระบบ"}</button>{status === "error" && <p role="alert" className="mt-3 text-sm text-[#d7352b]">ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่</p>}</form></>}</section></main>;
}
