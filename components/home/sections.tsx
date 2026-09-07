import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Box, Check, Gift, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { HomeCategory, HomeProduct, HomePromotion, HomeReview } from "@/types/commerce";

const promotionTones = [
  "from-[#ef5200]/96 via-[#ff7600]/72 to-[#ffc12e]/18",
  "from-[#ff493d]/95 via-[#ff6b00]/72 to-[#ffd43b]/16",
  "from-[#d94700]/94 via-[#f27500]/68 to-transparent",
  "from-[#ff7900]/94 via-[#ffab19]/62 to-transparent",
];

export function HeroSection({ products, promotions }: { products: HomeProduct[]; promotions: HomePromotion[] }) {
  const discounts = products.map((product) => product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0);
  const maxDiscount = Math.max(0, ...discounts);
  const sidePromotions = promotions.slice(0, 2);

  return <section className="px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-5">
    <div className="mx-auto grid max-w-[1200px] gap-3 lg:grid-cols-[minmax(0,1.72fr)_minmax(300px,.68fr)]">
      <div className="hero-campaign relative min-h-[500px] overflow-hidden rounded-[26px] bg-[#ff6b00] shadow-[0_18px_50px_rgba(224,83,0,.22)] md:min-h-[430px]">
        <Image src="/images/vsale/hero-home.png" alt="เครื่องเขียน หนังสือ สี และอุปกรณ์สำหรับการเรียนและสำนักงาน" fill priority sizes="(max-width: 1023px) 100vw, 820px" className="hero-vivid object-cover object-[65%_center]"/>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#ef5200_0%,rgba(255,107,0,.97)_38%,rgba(255,126,0,.55)_62%,rgba(255,126,0,.05)_100%)] max-md:bg-[linear-gradient(180deg,#ef5200_0%,rgba(255,107,0,.97)_49%,rgba(255,126,0,.20)_100%)]"/>
        <span className="absolute -right-14 -top-16 size-52 rounded-full border-[34px] border-[#ffd83d]/95 md:size-64" aria-hidden="true"/>
        <span className="absolute bottom-6 right-6 hidden rotate-3 rounded-2xl bg-[#ff4338] px-4 py-3 text-center text-white shadow-lg md:block"><b className="block text-3xl font-black leading-none">SALE</b><small className="font-bold">ดีลพร้อมช้อป</small></span>
        <div className="relative z-10 flex min-h-[500px] max-w-[570px] flex-col px-6 py-8 text-white md:min-h-[430px] md:justify-center md:px-11 md:py-9">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ffd83d] px-3 py-1.5 text-xs font-extrabold text-[#4a2b1b]"><Sparkles className="size-3.5"/> โปรเด่นจาก V SALE</span>
          <h1 className="mt-4 text-[clamp(2.65rem,5vw,4.45rem)] font-black leading-[.98] tracking-[-.055em]">ช้อปวันนี้<br/><span className="text-[#fff068]">คุ้มตั้งแต่ชิ้นแรก</span></h1>
          <p className="mt-4 max-w-md text-[15px] font-medium leading-6 text-white/92 md:text-base">เครื่องเขียน แบบเรียน แบบฟอร์ม และของใช้สำนักงาน ครบสำหรับทุกวันเรียนและวันทำงาน</p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link href="#flash-sale" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#ffd83d] px-6 text-sm font-extrabold text-[#4a2b1b] shadow-[0_9px_22px_rgba(255,216,61,.3)]">ช้อปโปรตอนนี้ <ArrowRight className="size-4"/></Link>
            <Link href="#products" className="inline-flex min-h-11 items-center rounded-full border border-white/55 bg-white/14 px-6 text-sm font-bold text-white backdrop-blur-sm">ดูสินค้าทั้งหมด</Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/90"><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[#fff068]"/>ส่งฟรีครบ ฿499</span><span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[#fff068]"/>จัดส่งทั่วไทย</span>{maxDiscount > 0 && <span className="inline-flex items-center gap-1.5"><Check className="size-4 text-[#fff068]"/>ลดสูงสุด {maxDiscount}%</span>}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        {sidePromotions.map((promotion, index) => <Link key={promotion.id} href={promotion.href} className={`group relative min-h-[190px] overflow-hidden rounded-[22px] ${index === 0 ? "bg-[#ff9b19]" : "bg-[#ff5b3f]"}`}>
          <Image src={promotion.image.src} alt={promotion.image.alt} fill sizes="(max-width: 1023px) 50vw, 360px" className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"/>
          <span className={`absolute inset-0 bg-gradient-to-r ${promotionTones[index]}`}/>
          <span className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5"><small className="inline-flex rounded-full bg-white/18 px-2 py-1 text-[10px] font-bold backdrop-blur-sm">{index === 0 ? "โปรฮิต" : "ราคาพิเศษ"}</small><strong className="mt-2 flex items-end justify-between gap-2 text-xl font-black leading-tight md:text-2xl">{promotion.title}<ArrowRight className="size-5 shrink-0"/></strong><span className="mt-1 block text-xs text-white/90">{promotion.subtitle}</span></span>
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
  return <Reveal><section id="promotions" className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="โปรโมชั่นเลือกไว้ให้แล้ว" copy="ดีลเด่นสำหรับวันเรียน วันสอน และวันทำงาน" linkLabel="ดูสินค้าราคาพิเศษ" href="#flash-sale" accent="coral"/><div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{promotions.slice(0, 4).map((promotion, index) => <Link key={promotion.id} href={promotion.href} className="group relative min-h-[220px] overflow-hidden rounded-[22px] shadow-[0_10px_25px_rgba(145,67,12,.12)] md:min-h-[245px]"><Image src={promotion.image.src} alt={promotion.image.alt} fill sizes="(max-width: 767px) 50vw, 300px" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"/><span className={`absolute inset-0 bg-gradient-to-t ${promotionTones[index]}`}/><span className="absolute left-3 top-3 rounded-full bg-[#fff06a] px-2.5 py-1 text-[10px] font-black text-[#4a2b1b]">{index === 0 ? "โปรแนะนำ" : index === 1 ? "ลดแรง" : index === 2 ? "ชุดคุ้ม" : "ราคาเบา ๆ"}</span><span className="absolute inset-x-0 bottom-0 p-4 text-white"><small className="text-[10px] font-semibold text-white/85">{promotion.subtitle}</small><strong className="mt-1 flex items-center justify-between text-base font-black md:text-xl">{promotion.title}<span className="grid size-8 place-items-center rounded-full bg-white text-[#d94700]"><ArrowRight className="size-4"/></span></strong></span></Link>)}</div></section></Reveal>;
}

export function EditorialBanner() {
  return <Reveal><section className="mx-auto max-w-[1200px] px-4 py-4 md:px-0"><div className="relative min-h-[300px] overflow-hidden rounded-[24px] bg-[#fff0dc] md:min-h-[245px]"><Image src="/images/vsale/banners/editorial-desk.png" alt="โต๊ะทำงานที่จัดอย่างเป็นระเบียบพร้อมแฟ้มและเครื่องเขียน" fill sizes="(max-width: 767px) 100vw, 1200px" className="object-cover object-[66%_center]"/><div className="absolute inset-0 bg-gradient-to-r from-[#fff0dc] via-[#fff0dc]/94 to-transparent"/><span className="absolute -left-10 -top-12 size-36 rounded-full bg-[#ffc83d]/58"/><div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center p-6 md:p-9"><span className="w-fit rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-[#d94b00]">ไอเดียจัดโต๊ะ</span><h2 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-black leading-[1.02] text-[#3a2114]">จัดโต๊ะใหม่<br/><span className="text-[#ed5800]">ให้ไอเดียไปต่อ</span></h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#705648]">อุปกรณ์สำนักงาน เอกสาร เทป และกาว ครบในที่เดียว</p><Link href="#bundles" className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-[#d94700] px-5 text-sm font-extrabold text-white">ช้อปเซตสำนักงาน <ArrowRight className="size-4"/></Link></div></div></section></Reveal>;
}

const useCases = [["วันเรียน", "อุปกรณ์ครบ พร้อมลุยทุกวิชา", "use-student.png", "#ff6b00"], ["วันสอน", "สื่อการสอน เอกสาร และอุปกรณ์", "use-teacher.png", "#ff9b19"], ["วันทำงาน", "จัดระเบียบงาน ให้สำเร็จทุกชิ้น", "use-office.png", "#f04b00"], ["วันสร้างสรรค์", "ศิลปะและงานฝีมือ จุดไอเดียใหม่", "use-creative.png", "#ffd13b"]];
export function ShopByUseSection() {
  return <Reveal><section className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="เลือกให้ตรงกับทุกวัน" copy="ชุดสินค้าที่จัดไว้ตามการใช้งาน" accent="mint"/><div className="category-rail flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">{useCases.map(([title, copy, image, color]) => <Link key={title} href="#products" className="group relative min-h-[190px] w-[78vw] max-w-sm shrink-0 snap-start overflow-hidden rounded-[22px] sm:w-[44vw] lg:w-auto"><Image src={`/images/vsale/lifestyle/${image}`} alt={`${title} ${copy}`} fill sizes="(max-width: 767px) 78vw, (max-width: 1023px) 44vw, 300px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"/><span className="absolute inset-0 bg-gradient-to-t from-[#061d42]/88 via-[#061d42]/10 to-transparent"/><span className="absolute inset-x-0 bottom-0 p-4 text-white"><span className="mb-2 block h-1 w-9 rounded-full" style={{ backgroundColor: color }}/><strong className="block text-xl font-black">{title}</strong><small className="block text-xs text-white/90">{copy}</small></span></Link>)}</div></section></Reveal>;
}

export function InstitutionalBanner() {
  return <Reveal><section id="institutional" className="mx-auto max-w-[1200px] px-4 py-4 md:px-0"><div className="relative min-h-[300px] overflow-hidden rounded-[24px] bg-[#ff8a19] md:min-h-[215px]"><Image src="/images/vsale/banners/institutional-orders.png" alt="ห้องเรียนพร้อมกล่องอุปกรณ์สำหรับจัดส่งจำนวนมาก" fill sizes="(max-width: 767px) 100vw, 1200px" className="object-cover object-center"/><div className="absolute inset-0 bg-gradient-to-r from-[#d94700] via-[#f25d00]/94 to-[#ff8a19]/12"/><div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-center p-6 text-white md:p-9"><span className="w-fit rounded-full bg-[#fff06a] px-3 py-1 text-[10px] font-black text-[#4b260a]">สำหรับองค์กร</span><h2 className="mt-3 text-[clamp(1.8rem,3vw,2.5rem)] font-black leading-tight">สั่งยกชุด ยิ่งคุ้มกว่า</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/88">สำหรับโรงเรียนและสำนักงาน ร้านช่วยตรวจจำนวนและจัดข้อเสนอให้เหมาะกับการใช้งาน</p><Link href="#contact" className="mt-4 inline-flex min-h-10 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-[#d94700]">สอบถามการสั่งซื้อ <ArrowRight className="size-4"/></Link></div></div></section></Reveal>;
}

export function CustomerReviews({ reviews }: { reviews: HomeReview[] }) {
  if (!reviews.length) return null;
  return <Reveal><section className="compact-section mx-auto max-w-[1200px] px-4 md:px-0"><SectionHeading title="ลูกค้าช้อปแล้วบอกต่อ" accent="purple"/><div className="grid gap-3 md:grid-cols-3">{reviews.map((review, index) => <article key={review.id} className={`rounded-[20px] p-4 ${index === 0 ? "bg-[#fff0dc]" : index === 1 ? "bg-[#fff0b8]" : "bg-[#ffe1d5]"}`}><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-white text-sm font-black text-[#d94b00]">{review.authorInitial}</span><span><span className="block text-xs text-[#f4a600]">{"★".repeat(review.rating)}</span>{review.verified && <small className="text-[10px] font-bold text-[#16855b]">ซื้อแล้ว ✓</small>}</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#705648]">“{review.excerpt}”</p></article>)}</div></section></Reveal>;
}
