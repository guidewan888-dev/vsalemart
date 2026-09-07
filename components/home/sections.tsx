import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Box, Check, Gift, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { HomeCategory, HomeProduct, HomePromotion, HomeReview } from "@/types/commerce";

export function HeroSection({ products, promotions }: { products: HomeProduct[]; promotions: HomePromotion[] }) {
  const discounts = products.map((product) => product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0);
  const maxDiscount = Math.max(0, ...discounts);
  const sidePromotions = promotions.slice(0, 2);

  return <section className="px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-5">
    <div className="mx-auto grid max-w-[1200px] gap-3 lg:grid-cols-[minmax(0,1.72fr)_minmax(300px,.68fr)]">
      <div className="hero-campaign grid overflow-hidden rounded-[26px] bg-white shadow-[0_18px_50px_rgba(145,67,12,.16)] md:min-h-[420px] md:grid-cols-[.92fr_1.18fr]">
        <div className="relative flex flex-col justify-center overflow-hidden bg-[linear-gradient(135deg,#ef5200_0%,#ff6b00_62%,#ff8f16_100%)] px-6 py-8 text-white md:px-9 md:py-9">
          <span className="absolute -right-14 -top-16 size-44 rounded-full border-[28px] border-[#ffd83d]/45" aria-hidden="true"/>
          <div className="relative z-10">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ffd83d] px-3 py-1.5 text-xs font-extrabold text-[#4a2b1b]"><Sparkles className="size-3.5"/> โปรเด่นจาก V SALE</span>
          <h1 className="mt-4 text-[clamp(2.25rem,3.4vw,3.05rem)] font-black leading-[1.02] tracking-[-.045em]">ช้อปวันนี้<br/><span className="text-[#fff068]">คุ้มตั้งแต่ชิ้นแรก</span></h1>
          <p className="mt-4 max-w-md text-[15px] font-medium leading-6 text-white/92 md:text-base">เครื่องเขียน แบบเรียน แบบฟอร์ม และของใช้สำนักงาน ครบสำหรับทุกวันเรียนและวันทำงาน</p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link href="#flash-sale" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ffd83d] px-6 text-sm font-extrabold text-[#4a2b1b] shadow-[0_9px_22px_rgba(255,216,61,.3)]">ช้อปโปรตอนนี้ <ArrowRight className="size-4"/></Link>
            <Link href="#products" className="inline-flex min-h-11 items-center rounded-full border border-white/55 bg-white/14 px-6 text-sm font-bold text-white backdrop-blur-sm">ดูสินค้าทั้งหมด</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/90"><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[#fff068]"/>ส่งฟรีครบ ฿499</span><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[#fff068]"/>จัดส่งทั่วไทย</span>{maxDiscount > 0 && <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[#fff068]"/>ลดสูงสุด {maxDiscount}%</span>}</div>
          </div>
        </div>
        <div className="relative min-h-[260px] bg-white md:min-h-[420px]">
          <Image src="/images/vsale/hero-home.png" alt="เครื่องเขียน หนังสือ สี และอุปกรณ์สำหรับการเรียนและสำนักงาน" fill priority sizes="(max-width: 767px) 100vw, 480px" className="object-cover object-[66%_center]"/>
          <span className="absolute bottom-5 right-5 rotate-3 rounded-2xl bg-[#ff4338] px-4 py-3 text-center text-white shadow-lg"><b className="block text-2xl font-black leading-none">SALE</b><small className="font-bold">ดีลพร้อมช้อป</small></span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:grid-rows-2">
        {sidePromotions.map((promotion, index) => <Link key={promotion.id} href={promotion.href} className="group flex min-h-[190px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#ffd6ae] bg-white shadow-[0_8px_22px_rgba(145,67,12,.08)]">
          <span className="relative min-h-[120px] flex-1 overflow-hidden"><Image src={promotion.image.src} alt={promotion.image.alt} fill sizes="(max-width: 1023px) 50vw, 360px" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"/><small className="absolute left-3 top-3 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-black text-white">{index === 0 ? "โปรฮิต" : "ราคาพิเศษ"}</small></span>
          <span className="flex items-end justify-between gap-2 border-t border-[#fff0df] bg-white p-3.5"><span className="min-w-0"><strong className="block truncate text-base font-black text-[#3a2114]">{promotion.title}</strong><small className="block truncate text-[10px] text-[#80685b]">{promotion.subtitle}</small></span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fff0df] text-[#d94700]"><ArrowRight className="size-4"/></span></span>
        </Link>)}
      </div>
    </div>
  </section>;
}

export function OfferStrip({ maxDiscount }: { maxDiscount: number }) {
  const items = [
    { icon: <Truck/>, label: "ส่งฟรี", detail: "เมื่อครบ ฿499", tone: "bg-[#fff0dc] text-[#dd5200]" },
    { icon: <BadgePercent/>, label: maxDiscount > 0 ? `ลดสูงสุด ${maxDiscount}%` : "โปรราคาพิเศษ", detail: "สินค้าร่วมรายการ", tone: "bg-[#ffe2d8] text-[#e43e22]" },
    { icon: <Gift/>, label: "โปรพร้อมช้อป", detail: "เลือกดีลได้ทันที", tone: "bg-[#fff0aa] text-[#c85c00]" },
    { icon: <ShieldCheck/>, label: "ช้อปมั่นใจ", detail: "ตรวจสอบก่อนจัดส่ง", tone: "bg-[#ffe8c8] text-[#b94700]" },
  ];
  return <section aria-label="ข้อเสนอและบริการ" className="mx-auto max-w-[1200px] px-4 py-2 md:px-0 md:py-3"><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{items.map((item) => <div key={item.label} className={`${item.tone} flex min-h-[72px] items-center gap-3 rounded-2xl px-3.5 py-3`}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/80 [&_svg]:size-5">{item.icon}</span><span><b className="block text-sm font-extrabold leading-tight">{item.label}</b><small className="text-[10px] font-medium opacity-75">{item.detail}</small></span></div>)}</div></section>;
}

export function SectionHeading({ title, linkLabel, href = "#products", copy, accent = "blue" }: { eyebrow?: string; title: string; linkLabel?: string; href?: string; copy?: string; accent?: "blue" | "coral" | "mint" | "purple" }) {
  const accents = { blue: "bg-[#ff6b00]", coral: "bg-[#ff4338]", mint: "bg-[#f38a00]", purple: "bg-[#d94b00]" };
  return <div className="mb-4 flex items-end justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-7 w-1.5 rounded-full ${accents[accent]}`}/><h2 className="text-[clamp(1.65rem,2.8vw,2.2rem)] font-black leading-tight tracking-[-.035em] text-[#3a2114]">{title}</h2></div>{copy && <p className="mt-1 pl-3.5 text-xs text-[#765d50] sm:text-sm">{copy}</p>}</div>{linkLabel && <Link href={href} className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#fff0df] px-3 py-2 text-xs font-extrabold text-[#d94b00] sm:flex">{linkLabel}<ArrowRight className="size-4"/></Link>}</div>;
}

export function CategoryGrid({ categories }: { categories: HomeCategory[] }) {
  const tones = ["#fff0d9", "#ffe9aa", "#ffe0d5", "#ffedc7", "#ffe2cb", "#fff3d7", "#ffdcca", "#ffebbd", "#ffe4d8"];
  return <Reveal><section id="categories" aria-label="หมวดหมู่สินค้า" className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="ช้อปตามหมวด" copy="เจอของที่ต้องการได้เร็วขึ้น" accent="purple"/><div className="category-rail flex gap-2.5 overflow-x-auto pb-2">{categories.map((category, index) => <Link id={`category-${category.slug}`} key={category.id} href="#products" className="group w-[112px] shrink-0 rounded-2xl border border-white bg-white p-2 text-center shadow-[0_5px_18px_rgba(46,75,120,.07)] md:w-[123px]"><div className="relative mx-auto aspect-square overflow-hidden rounded-xl" style={{ backgroundColor: tones[index % tones.length] }}><Image src={category.image.src} alt={category.image.alt} fill sizes="110px" className="object-cover transition-transform duration-300 group-hover:scale-105"/></div><h3 className="mt-2 line-clamp-2 min-h-8 text-[11px] font-extrabold leading-4 text-[#17365e]">{category.name}</h3></Link>)}</div></section></Reveal>;
}

export function TrustBenefits() {
  const items = [{ icon: <Star/>, title: "4.9 คะแนนร้าน", detail: "จากลูกค้าที่ซื้อจริง" }, { icon: <Box/>, title: "สินค้ากว่า 1,800+ รายการ", detail: "ครบทั้งเรื่องเรียนและงาน" }, { icon: <Truck/>, title: "จัดส่งทั่วไทย", detail: "แพ็กอย่างใส่ใจก่อนส่ง" }];
  return <section aria-label="ข้อมูลร้าน" className="mx-auto max-w-[1200px] px-4 py-3 md:px-0"><div className="grid overflow-hidden rounded-2xl border border-[#ffd9b0] bg-white shadow-[0_8px_24px_rgba(145,67,12,.07)] sm:grid-cols-3 sm:divide-x sm:divide-[#ffe3c7]">{items.map((item) => <div key={item.title} className="flex items-center justify-center gap-3 px-4 py-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fff0dc] text-[#e85500] [&_svg]:size-5">{item.icon}</span><span><b className="block text-sm text-[#3a2114]">{item.title}</b><small className="block text-[10px] text-[#80685b]">{item.detail}</small></span></div>)}</div></section>;
}

export function PromotionGrid({ promotions }: { promotions: HomePromotion[] }) {
  return <Reveal><section id="promotions" className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="โปรโมชั่นเลือกไว้ให้แล้ว" copy="ดีลเด่นสำหรับวันเรียน วันสอน และวันทำงาน" linkLabel="ดูสินค้าราคาพิเศษ" href="#flash-sale" accent="coral"/><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{promotions.slice(0, 4).map((promotion, index) => <Link key={promotion.id} href={promotion.href} className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#ffd6ae] bg-white shadow-[0_10px_25px_rgba(145,67,12,.09)]"><span className="relative aspect-[4/3] overflow-hidden bg-white"><Image src={promotion.image.src} alt={promotion.image.alt} fill sizes="(max-width: 767px) 50vw, 300px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"/><small className="absolute left-3 top-3 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-black text-white">{index === 0 ? "โปรแนะนำ" : index === 1 ? "ลดแรง" : index === 2 ? "ชุดคุ้ม" : "ราคาเบา ๆ"}</small></span><span className="flex flex-1 items-end justify-between gap-2 border-t border-[#fff0df] p-3.5"><span className="min-w-0"><small className="block truncate text-[10px] font-semibold text-[#80685b]">{promotion.subtitle}</small><strong className="mt-0.5 block truncate text-sm font-black text-[#3a2114] md:text-base">{promotion.title}</strong></span><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fff0df] text-[#d94700]"><ArrowRight className="size-4"/></span></span></Link>)}</div></section></Reveal>;
}

export function EditorialBanner() {
  return <Reveal><section className="mx-auto max-w-[1200px] px-4 py-4 md:px-0"><div className="grid overflow-hidden rounded-[24px] border border-[#ffd6ae] bg-[#fff0dc] md:min-h-[245px] md:grid-cols-[.78fr_1.22fr]"><div className="relative flex flex-col justify-center overflow-hidden p-6 md:p-9"><span className="absolute -left-10 -top-12 size-36 rounded-full bg-[#ffc83d]/45"/><div className="relative"><span className="w-fit rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-[#d94b00]">ไอเดียจัดโต๊ะ</span><h2 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-black leading-[1.02] text-[#3a2114]">จัดโต๊ะใหม่<br/><span className="text-[#ed5800]">ให้ไอเดียไปต่อ</span></h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#705648]">อุปกรณ์สำนักงาน เอกสาร เทป และกาว ครบในที่เดียว</p><Link href="#bundles" className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-[#d94700] px-5 text-sm font-extrabold text-white">ช้อปเซตสำนักงาน <ArrowRight className="size-4"/></Link></div></div><div className="relative min-h-[230px] bg-white"><Image src="/images/vsale/banners/editorial-desk.png" alt="โต๊ะทำงานที่จัดอย่างเป็นระเบียบพร้อมแฟ้มและเครื่องเขียน" fill sizes="(max-width: 767px) 100vw, 730px" className="object-cover object-center"/></div></div></section></Reveal>;
}

const useCases = [["วันเรียน", "อุปกรณ์ครบ พร้อมลุยทุกวิชา", "use-student.png", "#ff6b00"], ["วันสอน", "สื่อการสอน เอกสาร และอุปกรณ์", "use-teacher.png", "#ff9b19"], ["วันทำงาน", "จัดระเบียบงาน ให้สำเร็จทุกชิ้น", "use-office.png", "#f04b00"], ["วันสร้างสรรค์", "ศิลปะและงานฝีมือ จุดไอเดียใหม่", "use-creative.png", "#ffd13b"]];
export function ShopByUseSection() {
  return <Reveal><section className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="เลือกให้ตรงกับทุกวัน" copy="ชุดสินค้าที่จัดไว้ตามการใช้งาน" accent="mint"/><div className="category-rail flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">{useCases.map(([title, copy, image, color]) => <Link key={title} href="#products" className="group relative min-h-[190px] w-[78vw] max-w-sm shrink-0 snap-start overflow-hidden rounded-[22px] sm:w-[44vw] lg:w-auto"><Image src={`/images/vsale/lifestyle/${image}`} alt={`${title} ${copy}`} fill sizes="(max-width: 767px) 78vw, (max-width: 1023px) 44vw, 300px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"/><span className="absolute inset-0 bg-gradient-to-t from-[#061d42]/88 via-[#061d42]/10 to-transparent"/><span className="absolute inset-x-0 bottom-0 p-4 text-white"><span className="mb-2 block h-1 w-9 rounded-full" style={{ backgroundColor: color }}/><strong className="block text-xl font-black">{title}</strong><small className="block text-xs text-white/90">{copy}</small></span></Link>)}</div></section></Reveal>;
}

export function InstitutionalBanner() {
  return <Reveal><section id="institutional" className="mx-auto max-w-[1200px] px-4 py-4 md:px-0"><div className="grid overflow-hidden rounded-[24px] bg-[#d94700] md:min-h-[215px] md:grid-cols-[.78fr_1.22fr]"><div className="flex flex-col justify-center p-6 text-white md:p-9"><span className="w-fit rounded-full bg-[#fff06a] px-3 py-1 text-[10px] font-black text-[#4b260a]">สำหรับองค์กร</span><h2 className="mt-3 text-[clamp(1.8rem,3vw,2.5rem)] font-black leading-tight">สั่งยกชุด ยิ่งคุ้มกว่า</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/88">สำหรับโรงเรียนและสำนักงาน ร้านช่วยตรวจจำนวนและจัดข้อเสนอให้เหมาะกับการใช้งาน</p><Link href="#contact" className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-[#d94700]">สอบถามการสั่งซื้อ <ArrowRight className="size-4"/></Link></div><div className="relative min-h-[220px] bg-white"><Image src="/images/vsale/banners/institutional-orders.png" alt="ห้องเรียนพร้อมกล่องอุปกรณ์สำหรับจัดส่งจำนวนมาก" fill sizes="(max-width: 767px) 100vw, 730px" className="object-cover object-center"/></div></div></section></Reveal>;
}

export function CustomerReviews({ reviews }: { reviews: HomeReview[] }) {
  if (!reviews.length) return null;
  return <Reveal><section className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="ลูกค้าช้อปแล้วบอกต่อ" accent="purple"/><div className="grid gap-3 md:grid-cols-3">{reviews.map((review, index) => <article key={review.id} className={`rounded-[20px] p-4 ${index === 0 ? "bg-[#fff0dc]" : index === 1 ? "bg-[#fff0b8]" : "bg-[#ffe1d5]"}`}><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white text-sm font-black text-[#d94b00]">{review.authorInitial}</span><span><span className="block text-xs text-[#f4a600]">{"★".repeat(review.rating)}</span>{review.verified && <small className="text-[10px] font-bold text-[#16855b]">ซื้อแล้ว ✓</small>}</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#705648]">“{review.excerpt}”</p></article>)}</div></section></Reveal>;
}
