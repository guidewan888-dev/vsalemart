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

The orange storefront and expanded backend use the existing commerce tables. The original Seller Center in `components/admin/admin-shell.tsx` remains the admin frame; new operations render inside it. Existing Shopee catalog import code and data are preserved.

The new additive migration supplies server-calculated checkout, stock reservations, manual bank-transfer review, shipping settings, approved organization pricing, quotation acceptance, returns, private slips, staff authorization, audit records, invoice snapshots, and expiration jobs. QR and card payments remain unavailable until a real provider is connected.

Signed-in baskets continue using `cart_items` and `favorites`, now with variant-aware cart lines. Guest baskets stay on-device. Auth supports the existing email link plus password sign-in, registration, and recovery.

## Design and rollout

- `/design-system`: live tokens, components, and the page directory
- `docs/design-handoff.html`: standalone searchable design handoff, printable to PDF
- `docs/page-specifications.md`: 53 page specifications and 15 detail templates
- `docs/deployment-runbook.md`: staging, migration, staff setup, scheduler, and production configuration
- `scripts/commerce-integration-test.mjs`: isolated PostgreSQL integration checks

The migration must be applied and store settings completed before checkout is enabled. The source branch does not itself migrate production or connect a payment provider.

## Connected services

- GitHub: https://github.com/guidewan888-dev/vsalemart
- Vercel: https://vercel.com/bcgotour/vsalemart
- Supabase: https://supabase.com/dashboard/project/hrcjowrlmcxvofnsmlcu
- Domain: https://vsalemart.com

Vercel deploys production from `main`. Never commit a service-role key or database password, and never put either value in a `NEXT_PUBLIC_` variable.
