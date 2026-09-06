# V SALE

Thai ecommerce storefront for school supplies, books, forms, art materials, and office products. Built with Next.js App Router, TypeScript, Tailwind CSS, Motion, Lucide, and Supabase.

## Local development

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and set the Supabase publishable key.
3. Run `npm run dev` and open `http://localhost:3000`.
4. Validate changes with `npm run lint`, `npm run typecheck`, and `npm run build`.

## Commerce data

The homepage reads categories, products, promotions, and reviews through `lib/commerce/home.ts`. When Supabase is unavailable or contains no products, it falls back to the 12 clearly marked demo products in `src/data/demo-products.ts`.

The migrations in `supabase/migrations` create the commerce schema, row level security policies, indexes, profile trigger, newsletter table, a public-read `product-images` Storage bucket, and idempotent starter records. Demo product images live in `public/images/vsale/products/demo`; replace their paths with Supabase Storage URLs when real catalog images are available. Uploads to the bucket remain restricted to trusted dashboard or server-side administration.

Guest cart and favorites use local storage. Signed-in cart changes also sync to Supabase. `/account` provides passwordless magic-link sign-in. The checkout button is the prepared storefront boundary; order placement and payment provider integration are the next backend phase.

## Connected services

- GitHub: https://github.com/guidewan888-dev/vsalemart
- Vercel: https://vercel.com/bcgotour/vsalemart
- Supabase: https://supabase.com/dashboard/project/hrcjowrlmcxvofnsmlcu
- Domain: https://vsalemart.com

Vercel deploys production from `main`. Never commit a service-role key or database password, and never put either value in a `NEXT_PUBLIC_` variable.
