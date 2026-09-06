create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  image_url text not null, sort_order integer not null default 0, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  description text not null default '', price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  category_id uuid references public.categories(id) on delete set null, cover_image text,
  rating numeric(2,1) check (rating is null or rating between 0 and 5), review_count integer not null default 0 check (review_count >= 0),
  sold_count integer not null default 0 check (sold_count >= 0), stock integer not null default 0 check (stock >= 0),
  badge text check (badge is null or badge in ('sale','new','bestseller','ready','recommended','value')),
  is_featured boolean not null default false, is_flash_sale boolean not null default false,
  is_demo boolean not null default false, is_active boolean not null default true,
  published_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  url text not null, alt_text text not null default '', sort_order integer not null default 0,
  created_at timestamptz not null default now(), unique(product_id, url)
);
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(), code text not null unique, title text not null, subtitle text,
  href text not null default '#products', image_url text not null, tone text not null default 'blue' check (tone in ('blue','coral','navy','sky')),
  priority integer not null default 0, starts_at timestamptz, ends_at timestamptz, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null, author_initial text not null, rating integer not null check (rating between 1 and 5),
  excerpt text not null, is_verified boolean not null default false, is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, display_name text, phone text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id, product_id)
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade, quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, product_id)
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','paid','packing','shipped','completed','cancelled')),
  subtotal numeric(12,2) not null default 0, shipping_fee numeric(12,2) not null default 0, discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0, shipping_address jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null, product_name text not null, unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0), created_at timestamptz not null default now()
);
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(), email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  consented_at timestamptz not null default now(), is_active boolean not null default true
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_discovery_idx on public.products(is_active, is_featured, sold_count desc);
create index if not exists products_flash_idx on public.products(is_active, is_flash_sale) where is_flash_sale;
create index if not exists orders_user_id_idx on public.orders(user_id, created_at desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.promotions enable row level security;
alter table public.reviews enable row level security;
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "catalog categories are public" on public.categories for select using (is_active);
create policy "catalog products are public" on public.products for select using (is_active);
create policy "catalog images are public" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy "active promotions are public" on public.promotions for select using (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
create policy "published reviews are public" on public.reviews for select using (is_published);
create policy "profiles belong to users" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "favorites belong to users" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart items belong to users" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders belong to users" on public.orders for select using (auth.uid() = user_id);
create policy "order items follow order owner" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "newsletter signup is public" on public.newsletter_subscribers for insert with check (true);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))) on conflict (id) do nothing; return new; end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.categories (slug,name,image_url,sort_order) values
('forms-documents','แบบฟอร์มและเอกสาร','/images/vsale/categories/category-forms-documents.png',1),
('books-workbooks','หนังสือและแบบเรียน','/images/vsale/categories/category-books-workbooks.png',2),
('stationery','เครื่องเขียน','/images/vsale/categories/category-stationery.png',3),
('art-craft','ศิลปะและงานฝีมือ','/images/vsale/categories/category-art-craft.png',4),
('tape-adhesive','เทปและกาว','/images/vsale/categories/category-tape-adhesive.png',5),
('office-supplies','อุปกรณ์สำนักงาน','/images/vsale/categories/category-office-supplies.png',6),
('flags-ceremony','ธงและอุปกรณ์พิธีการ','/images/vsale/categories/category-flags-ceremony.png',7),
('music','เครื่องดนตรี','/images/vsale/categories/category-music.png',8),
('sports','อุปกรณ์กีฬา','/images/vsale/categories/category-sports.png',9)
on conflict (slug) do update set name=excluded.name,image_url=excluded.image_url,sort_order=excluded.sort_order;

insert into public.products (slug,name,description,price,compare_at_price,category_id,cover_image,rating,review_count,sold_count,stock,badge,is_featured,is_flash_sale,is_demo,published_at) values
('student-health-record','แบบบันทึกสุขภาพประจำตัวนักเรียน','แบบบันทึกข้อมูลสุขภาพสำหรับนักเรียน',20,25,(select id from public.categories where slug='forms-documents'),'/images/vsale/products/demo/student-health-record.svg',4.9,128,885,240,'bestseller',true,true,true,'2026-08-01'),
('rotring-black-lanyard','ป้ายห้อยคอ Rotring สีดำ','ป้ายห้อยคอสีดำสำหรับสำนักงานและกิจกรรม',125,175,(select id from public.categories where slug='office-supplies'),'/images/vsale/products/demo/rotring-black-lanyard.svg',4.9,36,158,38,'sale',true,true,true,'2026-08-06'),
('attendance-book-pp03','บัญชีเรียกชื่อ ปพ.03 ระดับประถม','สมุดบัญชีเรียกชื่อสำหรับระดับประถมศึกษา',27,40,(select id from public.categories where slug='forms-documents'),'/images/vsale/products/demo/attendance-book-pp03.svg',5.0,78,432,160,'ready',true,false,true,'2026-08-08'),
('white-wood-flag-pole-1m','เสาธงไม้สีขาว ขนาด 1 เมตร','เสาธงไม้สีขาวสำหรับงานพิธีการ',165,null,(select id from public.categories where slug='flags-ceremony'),'/images/vsale/products/demo/white-wood-flag-pole-1m.svg',4.9,112,844,65,'bestseller',true,false,true,'2026-08-10'),
('thai-flag-80x120','ธงชาติไทย ขนาด 80 × 120 ซม.','ธงชาติไทยสำหรับโรงเรียน สำนักงาน และงานพิธี',695,null,(select id from public.categories where slug='flags-ceremony'),'/images/vsale/products/demo/thai-flag-80x120.svg',4.9,42,187,22,'ready',true,false,true,'2026-08-12'),
('smile-student-book-p5','หนังสือเรียน Smile ป.5','หนังสือเรียนภาษาอังกฤษระดับประถมศึกษาปีที่ 5',100,null,(select id from public.categories where slug='books-workbooks'),'/images/vsale/products/demo/smile-student-book-p5.svg',4.8,58,324,74,'recommended',true,false,true,'2026-08-15'),
('drawing-paper-100lb-a2','กระดาษวาดเขียน 100 ปอนด์ A2','กระดาษวาดเขียนเนื้อหนาสำหรับงานศิลปะ',285,null,(select id from public.categories where slug='art-craft'),'/images/vsale/products/demo/drawing-paper-100lb-a2.svg',4.9,34,219,44,'new',false,false,true,'2026-09-01'),
('student-development-book','สมุดบันทึกพัฒนาคุณภาพผู้เรียน','สมุดติดตามและบันทึกพัฒนาการผู้เรียน',35,null,(select id from public.categories where slug='forms-documents'),'/images/vsale/products/demo/student-development-book.svg',5.0,94,516,125,'bestseller',false,false,true,'2026-08-18'),
('citizen-law-handbook','หนังสือกฎหมายที่ประชาชนควรรู้','คู่มือกฎหมายพื้นฐานสำหรับประชาชน',76,null,(select id from public.categories where slug='books-workbooks'),'/images/vsale/products/demo/citizen-law-handbook.svg',4.8,29,146,31,'recommended',false,false,true,'2026-08-21'),
('gel-pen-set-05-12','ชุดปากกาเจล 0.5 มม. จำนวน 12 ด้าม','ชุดปากกาเจลเขียนลื่นสำหรับเรียนและทำงาน',129,159,(select id from public.categories where slug='stationery'),'/images/vsale/products/demo/gel-pen-set-05-12.svg',4.9,106,672,96,'sale',true,true,true,'2026-09-02'),
('thin-double-sided-tape','เทปกาวสองหน้าแบบบาง','เทปกาวสองหน้าสำหรับงานเอกสารและงานประดิษฐ์',49,null,(select id from public.categories where slug='tape-adhesive'),'/images/vsale/products/demo/thin-double-sided-tape.svg',4.7,55,352,0,'value',false,false,true,'2026-09-03'),
('teacher-office-supply-set','ชุดอุปกรณ์สำนักงานสำหรับครู','รวมอุปกรณ์พื้นฐานสำหรับโต๊ะครูและห้องเรียน',399,490,(select id from public.categories where slug='office-supplies'),'/images/vsale/products/demo/teacher-office-supply-set.svg',4.9,21,98,18,'value',true,false,true,'2026-09-05')
on conflict (slug) do update set name=excluded.name,description=excluded.description,price=excluded.price,compare_at_price=excluded.compare_at_price,category_id=excluded.category_id,cover_image=excluded.cover_image,rating=excluded.rating,review_count=excluded.review_count,sold_count=excluded.sold_count,stock=excluded.stock,badge=excluded.badge,is_featured=excluded.is_featured,is_flash_sale=excluded.is_flash_sale,is_demo=true,published_at=excluded.published_at;

insert into public.product_images (product_id,url,alt_text,sort_order)
select id,cover_image,name || ' ภาพตัวอย่าง',0 from public.products where is_demo and cover_image is not null
on conflict (product_id,url) do update set alt_text=excluded.alt_text;

insert into public.promotions (code,title,subtitle,href,image_url,tone,priority) values
('back-to-school','โปรเปิดเทอม','อุปกรณ์ครบ พร้อมลุยทุกการเรียน','#products','/images/vsale/promotions/promo-back-to-school.png','blue',1),
('weekly-deal','ดีลประจำสัปดาห์','สินค้าคุณภาพ ราคาพิเศษ','#flash-sale','/images/vsale/promotions/promo-weekly-deal.png','coral',2),
('office-set','เซตสำนักงาน','จัดโต๊ะให้เป็นระเบียบ','#bundles','/images/vsale/promotions/promo-office-set.png','sky',3),
('under-99','ต่ำกว่า ฿99','ของดี ราคาสบายกระเป๋า','#products','/images/vsale/promotions/promo-under-99.png','navy',4)
on conflict (code) do update set title=excluded.title,subtitle=excluded.subtitle,href=excluded.href,image_url=excluded.image_url,tone=excluded.tone,priority=excluded.priority;
