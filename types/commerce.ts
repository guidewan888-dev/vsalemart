export type ProductBadge = "sale" | "new" | "bestseller" | "ready" | "recommended" | "value" | null;

export interface HomeProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  compareAtPrice?: number | null;
  currency: "THB";
  rating?: number | null;
  reviewCount?: number | null;
  soldCount?: number | null;
  badge?: ProductBadge;
  badgeLabel?: string | null;
  image: { src: string; alt: string };
  inStock: boolean;
  stock: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  isDemo: boolean;
  publishedAt: string;
}

export interface HomeCategory {
  id: string;
  slug: string;
  name: string;
  image: { src: string; alt: string };
}

export interface HomePromotion {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  image: { src: string; alt: string };
  tone: "blue" | "coral" | "navy" | "sky";
  priority: number;
  startsAt?: string;
  endsAt?: string;
}

export interface HomeReview {
  id: string;
  authorInitial: string;
  rating: number;
  excerpt: string;
  verified: boolean;
}

export interface HomeData {
  products: HomeProduct[];
  categories: HomeCategory[];
  promotions: HomePromotion[];
  reviews: HomeReview[];
  source: "supabase" | "demo";
}
