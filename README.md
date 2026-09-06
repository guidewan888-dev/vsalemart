# VSALE MART

Next.js + TypeScript + Supabase starter for vsalemart.com.

## Development

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and set the Supabase publishable key.
3. Run `npm run dev` and open http://localhost:3000.
4. Run `npm run build` and `npm run typecheck` before pushing.

## Services

- GitHub: https://github.com/guidewan888-dev/vsalemart
- Vercel: https://vercel.com/bcgotour/vsalemart
- Supabase: https://supabase.com/dashboard/project/hrcjowrlmcxvofnsmlcu
- Domain: https://vsalemart.com (Namecheap DNS)

Vercel is connected to GitHub. Pushes to main deploy production; branches and pull requests generate previews.

Use `createSupabaseClient` from `lib/supabase.ts` when building data features. No tables or customer authentication flow have been created yet. Add database migrations in `supabase/migrations`, enable row level security on exposed tables, and define policies before using them in the app. Never put a service-role key or database password in NEXT_PUBLIC variables or commit secrets.

The local Supabase CLI is linked to this project. Do not run `supabase db push` until you have reviewed migrations for the intended environment.
