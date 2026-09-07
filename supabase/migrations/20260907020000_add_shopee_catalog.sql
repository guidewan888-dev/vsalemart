alter table public.products
  add column if not exists source text not null default 'manual',
  add column if not exists source_product_id text,
  add column if not exists source_url text,
  add column if not exists parent_sku text,
  add column if not exists category_path text,
  add column if not exists preparation_days integer check (preparation_days is null or preparation_days >= 0),
  add column if not exists synced_at timestamptz;

alter table public.products
  drop constraint if exists products_source_product_unique;
alter table public.products
  add constraint products_source_product_unique unique (source, source_product_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_variant_id text not null,
  name text,
  sku text,
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  gtin text,
  weight_kg numeric(10,3),
  length_cm numeric(10,2),
  width_cm numeric(10,2),
  height_cm numeric(10,2),
  minimum_purchase_quantity integer,
  maximum_purchase_quantity integer,
  shipping_options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, source_variant_id)
);

create table if not exists public.catalog_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_shop_id text,
  import_key text not null unique,
  status text not null check (status in ('running','completed','failed')),
  product_count integer not null default 0,
  active_product_count integer not null default 0,
  variant_count integer not null default 0,
  image_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists products_source_idx on public.products(source, source_product_id);
create index if not exists product_variants_product_id_idx on public.product_variants(product_id);
create index if not exists product_variants_sku_idx on public.product_variants(sku) where sku is not null;

alter table public.product_variants enable row level security;
alter table public.catalog_sync_runs enable row level security;

drop policy if exists "catalog variants are public" on public.product_variants;
create policy "catalog variants are public" on public.product_variants for select using (
  exists (
    select 1 from public.products p
    where p.id = product_id and p.is_active
  )
);

comment on table public.product_variants is 'Product variants imported from a commerce source such as Shopee';
comment on table public.catalog_sync_runs is 'Server-side audit log for catalog imports';
