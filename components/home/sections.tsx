import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box, Star, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { HomeCategory, HomePromotion, HomeReview } from "@/types/commerce";

export function HeroSection() {
  return <section className="bg-[#eef6ff]"><div className="mx-auto grid max-w-[1440px] overflow-hidden lg:grid-cols-[.82fr_1.18fr]">
    <div className="relative z-10 flex flex-col justify-center px-5 py-9 md:px-10 md:py-12 lg:pl-14 lg:pr-6">
      <Reveal><h1 className="max-w-xl text-[clamp(2.55rem,4.7vw,4.35rem)] font-extrabold leading-[1.02] tracking-[-.045em] text-[#082653]">ทุกอย่างพร้อม<br/><span className="text-[#0872f5]">ให้ทุกวันไปต่อ</span></h1></Reveal>
      <Reveal delay={0.07}><p className="mt-3 max-w-xl text-[15px] leading-6 text-[#243f65] md:text-[17px] md:leading-7">เครื่องเขียน หนังสือ แบบฟอร์ม ศิลปะ และอุปกรณ์สำนักงาน<br className="hidden md:block"/> เพื่อการเรียนรู้และการทำงานที่ดีกว่าในทุกวัน</p></Reveal>
      <Reveal delay={0.14} className="mt-5 flex flex-wrap gap-2.5"><Link href="#products" className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#0872f5] px-6 text-sm font-bold text-white">เลือกซื้อสินค้า <ArrowRight className="size-4"/></Link><Link href="#new-arrivals" className="inline-flex min-h-11 items-center rounded-full border border-[#0b5fc7] bg-white px-6 text-sm font-bold text-[#095ebf]">ดูสินค้าใหม่</Link></Reveal>
      <Reveal delay={0.2}><p className="mt-5 w-fit -rotate-2 text-sm font-bold italic text-[#0872f5]">เรื่องเรียน เรื่องงาน ไว้ใจ V SALE</p></Reveal>
    </div>
    <Reveal className="relative min-h-[290px] md:min-h-[360px] lg:min-h-[430px]"><Image src="/images/vsale/hero-home.png" alt="เครื่องเขียน หนังสือ สี และอุปกรณ์สำหรับการเรียนและสำนักงาน" fill priority sizes="(max-width: 1023px) 100vw, 60vw" className="object-cover object-center"/></Reveal>
  </div></section>;
}

export function SectionHeading({ title, linkLabel, href = "#products", copy }: { eyebrow?: string; title: string; linkLabel?: string; href?: string; copy?: string }) {
  return <div className="mb-4 flex items-end justify-between gap-3"><div className="min-w-0 sm:flex sm:items-baseline sm:gap-3"><h2 className="text-[clamp(1.65rem,2.8vw,2.25rem)] font-extrabold leading-tight tracking-[-.035em] text-[#082653]">{title}</h2>{copy && <p className="mt-1 text-xs text-[#61728b] sm:mt-0 sm:text-sm">{copy}</p>}</div>{linkLabel && <Link href={href} className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-[#0872f5] sm:flex">{linkLabel}<ArrowRight className="size-4"/></Link>}</div>;
}

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  return <Reveal><section id="categories" aria-label="หมวดหมู่สินค้า" className="mx-auto max-w-[1320px] px-4 py-4 md:px-6 md:py-5"><div className="category-rail flex gap-3 overflow-x-auto pb-1 md:justify-between md:gap-2">{categories.map((category) => <Link id={`category-${category.slug}`} key={category.id} href="#products" className="group w-[92px] shrink-0 text-center md:w-[112px]"><div className="relative mx-auto aspect-square overflow-hidden rounded-full bg-[#e8f3ff] ring-1 ring-[#d7e7f8]"><Image src={category.image.src} alt={category.image.alt} fill sizes="112px" className="object-cover transition-transform duration-300 group-hover:scale-105"/></div><h3 className="mt-2 text-[11px] font-bold leading-4 text-[#17365e] md:text-xs">{category.name}</h3></Link>)}</div></section></Reveal>;
}

export function TrustBenefits() {
  const items = [{ icon: <Star/>, title: "4.9 คะแนนร้าน", detail: "จากลูกค้าที่ซื้อจริง" }, { icon: <Box/>, title: "สินค้ากว่า 1,800+ รายการ", detail: "ครบทุกหมวดสำหรับเรียนและงาน" }, { icon: <Truck/>, title: "จัดส่งทั่วไทย", detail: "ส่งต่อได้ไวถึงคุณ" }];
  return <section aria-label="ข้อมูลร้าน" className="mx-auto max-w-[1320px] px-4 pb-5 md:px-6"><div className="grid rounded-xl bg-[#edf7ff] px-3 py-3 sm:grid-cols-3 sm:divide-x sm:divide-[#bfd7ef]">{items.map((item) => <div key={item.title} className="flex items-center justify-center gap-3 px-4 py-2"><span className="grid size-10 shrink-0 place-items-center text-[#0872f5] [&_svg]:size-6">{item.icon}</span><span><b className="block text-sm text-[#082653]">{item.title}</b><small className="block text-[11px] text-[#667a96]">{item.detail}</small></span></div>)}</div></section>;
}

export function PromotionGrid({ promotions }: { promotions: HomePromotion[] }) {
  return <Reveal><section id="promotions" className="compact-section mx-auto max-w-[1320px] px-4 md:px-6"><SectionHeading title="เลือกง่าย ได้คุ้มกว่า" copy="โปรเด่นสำหรับวันเรียน วันสอน และวันทำงาน" linkLabel="ดูโปรโมชั่นทั้งหมด"/><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.15fr_.68fr_1fr] lg:grid-rows-2">{promotions.map((promotion, index) => <Link key={promotion.id} href={promotion.href} className={`group relative min-h-[170px] overflow-hidden rounded-xl border border-[#dce6f2] ${index === 0 ? "md:min-h-[330px] lg:row-span-2" : ""} ${index === 1 ? "lg:row-span-2" : ""}`}><Image src={promotion.image.src} alt={promotion.image.alt} fill sizes={index < 2 ? "(max-width: 1023px) 100vw, 38vw" : "(max-width: 1023px) 100vw, 30vw"} className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"/><span className="absolute inset-0 bg-gradient-to-t from-[#061d42]/75 via-transparent to-transparent"/><span className="absolute inset-x-0 bottom-0 p-4 text-white"><small className="text-xs text-white/85">{promotion.subtitle}</small><strong className="mt-0.5 flex items-center justify-between text-lg font-bold md:text-xl">{promotion.title}<ArrowRight className="size-4"/></strong></span></Link>)}</div></section></Reveal>;
}

export function EditorialBanner() {
  return <Reveal><section className="mx-auto max-w-[1320px] px-4 py-4 md:px-6"><div className="relative min-h-[300px] overflow-hidden rounded-xl border border-[#dce6f2] md:min-h-[250px]"><Image src="/images/vsale/banners/editorial-desk.png" alt="โต๊ะทำงานที่จัดอย่างเป็นระเบียบพร้อมแฟ้มและเครื่องเขียน" fill sizes="(max-width: 767px) 100vw, 1320px" className="object-cover object-[62%_center]"/><div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-transparent"/><div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center p-6 md:p-9"><h2 className="text-[clamp(2rem,3.4vw,3rem)] font-extrabold leading-[1.05] text-[#082653]">จัดโต๊ะใหม่<br/><span className="text-[#0872f5]">ให้ไอเดียไหลลื่น</span></h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#405b7e]">อุปกรณ์สำนักงาน เอกสาร เทป และกาว เพื่อพื้นที่ทำงานที่เป็นระเบียบ</p><Link href="#products" className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-[#0872f5] px-5 text-sm font-bold text-white">เลือกดูสินค้า <ArrowRight className="size-4"/></Link></div></div></section></Reveal>;
}

const useCases = [["วันเรียน", "อุปกรณ์ครบ พร้อมลุยทุกวิชา", "use-student.png"], ["วันสอน", "สื่อการสอน เอกสาร และอุปกรณ์", "use-teacher.png"], ["วันทำงาน", "จัดระเบียบงาน ให้สำเร็จทุกชิ้น", "use-office.png"], ["วันสร้างสรรค์", "ศิลปะและงานฝีมือ จุดไอเดียใหม่", "use-creative.png"]];
export function ShopByUseSection() {
  return <Reveal><section className="compact-section mx-auto max-w-[1320px] px-4 md:px-6"><SectionHeading title="เลือกตามวันของคุณ"/><div className="category-rail flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">{useCases.map(([title, copy, image]) => <Link key={title} href="#products" className="group relative min-h-[185px] w-[78vw] max-w-sm shrink-0 snap-start overflow-hidden rounded-xl border border-[#dce6f2] sm:w-[44vw] lg:w-auto"><Image src={`/images/vsale/lifestyle/${image}`} alt={`${title} ${copy}`} fill sizes="(max-width: 767px) 78vw, (max-width: 1023px) 44vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"/><span className="absolute inset-0 bg-gradient-to-t from-[#061d42]/80 via-transparent to-transparent"/><span className="absolute inset-x-0 bottom-0 p-4 text-white"><strong className="block text-xl font-bold">{title}</strong><small className="block text-xs text-white/90">{copy}</small><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#9fd2ff]">เลือกดูสินค้า <ArrowRight className="size-3"/></span></span></Link>)}</div></section></Reveal>;
}

export function InstitutionalBanner() {
  return <Reveal><section id="institutional" className="mx-auto max-w-[1320px] px-4 py-4 md:px-6"><div className="relative min-h-[300px] overflow-hidden rounded-xl bg-[#e8f4ff] md:min-h-[215px]"><Image src="/images/vsale/banners/institutional-orders.png" alt="ห้องเรียนพร้อมกล่องอุปกรณ์สำหรับจัดส่งจำนวนมาก" fill sizes="(max-width: 767px) 100vw, 1320px" className="object-cover object-center"/><div className="absolute inset-0 bg-gradient-to-r from-[#e8f4ff] via-[#e8f4ff]/95 to-transparent"/><div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 md:p-9"><h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-tight text-[#082653]">สำหรับโรงเรียนและสำนักงาน</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#405b7e]">สั่งซื้อจำนวนมาก ให้ร้านช่วยตรวจสอบจำนวนและจัดข้อเสนอให้เหมาะกับการใช้งาน</p><Link href="#contact" className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-[#0872f5] px-5 text-sm font-bold text-white">สอบถามการสั่งซื้อ <ArrowRight className="size-4"/></Link></div></div></section></Reveal>;
}

export function CustomerReviews({ reviews }: { reviews: HomeReview[] }) {
  if (!reviews.length) return null;
  return <Reveal><section className="compact-section mx-auto max-w-[1320px] px-4 md:px-6"><SectionHeading title="เสียงจากลูกค้า"/><div className="grid gap-3 md:grid-cols-3">{reviews.map((review) => <article key={review.id} className="rounded-xl border border-[#dce6f2] bg-white p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-[#e4efff] text-sm font-bold text-[#0872f5]">{review.authorInitial}</span><span><span className="block text-xs text-[#f4a600]">{"★".repeat(review.rating)}</span>{review.verified && <small className="text-[10px] text-[#16855b]">ซื้อแล้ว ✓</small>}</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#405b7e]">“{review.excerpt}”</p></article>)}</div></section></Reveal>;
}
