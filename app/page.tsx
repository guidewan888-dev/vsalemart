import Script from "next/script";
import { CartDrawer, CartToast } from "@/components/commerce/cart-drawer";
import { CommerceProvider } from "@/components/commerce/commerce-provider";
import { ProductSection } from "@/components/home/product-sections";
import { CustomerReviews, EditorialBanner, HeroSection, InstitutionalBanner, PromotionGrid, ShopByUseSection, CategoryGrid, TrustBenefits } from "@/components/home/sections";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { AnnouncementBar, SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav, SiteFooter } from "@/components/layout/site-footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { getHomeData } from "@/lib/commerce/home";

export const revalidate = 300;

export default async function HomePage() {
  const data = await getHomeData();
  const bestSellers = [...data.products].sort((a,b) => (b.soldCount ?? 0) - (a.soldCount ?? 0)).slice(0, 6);
  const bundles = data.products.filter((product) => product.badge === "value" || (product.compareAtPrice && product.compareAtPrice > product.price)).slice(0, 6);
  const newArrivals = [...data.products].sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 6);
  const realProducts = data.products.filter((product) => !product.isDemo).slice(0, 10);
  const organizationLd = { "@context": "https://schema.org", "@type": "Organization", name: "V SALE", url: "https://vsalemart.com" };
  const productLd = realProducts.length ? { "@context": "https://schema.org", "@graph": realProducts.map((product) => ({ "@type": "Product", name: product.name, image: new URL(product.image.src, "https://vsalemart.com").toString(), description: product.description, offers: { "@type": "Offer", priceCurrency: "THB", price: product.price, availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } })) } : null;

  return <MotionProvider><CommerceProvider products={data.products} dataSource={data.source}>
    <Script id="organization-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}/>
    {productLd ? <Script id="products-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}/> : null}
    <AnnouncementBar/><SiteHeader products={data.products} categories={data.categories}/>
    <main id="top" className="site-main">
      <HeroSection/><CategoryGrid categories={data.categories}/><TrustBenefits/>
      <PromotionGrid promotions={data.promotions}/>
      <div id="products" className="scroll-mt-28"><span id="flash-sale" className="block scroll-mt-28"/><ProductSection id="best-sellers" title="ขายดีตอนนี้" subtitle="สินค้าที่ลูกค้าเลือกซื้อมากที่สุด" products={bestSellers}/></div>
      <EditorialBanner/><ShopByUseSection/>
      <ProductSection id="bundles" title="เซตที่จัดมาให้แล้ว" subtitle="ซื้อเป็นชุด คุ้มกว่า และพร้อมใช้งาน" products={bundles.length ? bundles : data.products.slice(0, 4)}/>
      <ProductSection id="new-arrivals" title="มาใหม่ น่าใช้" subtitle="ของใหม่สำหรับห้องเรียนและโต๊ะทำงาน" products={newArrivals}/>
      <InstitutionalBanner/><CustomerReviews reviews={data.reviews}/><NewsletterSection/>
    </main>
    <SiteFooter/><MobileBottomNav/><CartDrawer/><CartToast/>
  </CommerceProvider></MotionProvider>;
}
