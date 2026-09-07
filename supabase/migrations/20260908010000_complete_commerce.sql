-- Additive commerce extension. Existing catalog records are preserved.
create table public.staff_members (user_id uuid primary key references auth.users(id), role text not null default 'admin' check(role='admin'), created_at timestamptz default now());
alter table public.staff_members enable row level security;
create or replace function public.is_store_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from staff_members where user_id=auth.uid()) $$;
create policy "staff visible to admins" on public.staff_members for select using(public.is_store_admin());
-- Bootstrap/revoke staff via trusted database administration, never a client-editable profile.
create table public.store_settings (id text primary key default 'store', value jsonb not null default '{}'::jsonb, updated_at timestamptz default now());
insert into public.store_settings(id,value) values('store','{"name":"VSaleMart","vat_registered":true,"vat_rate":null,"prices_include_vat":true,"bank_name":"","bank_account":"","bank_holder":"","tax_id":"","address":"","checkout_enabled":false,"payment_hours":24}');
create table public.shipping_methods (id uuid primary key default gen_random_uuid(), name text not null, mode text not null default 'flat' check(mode in ('flat','weight')), base_fee numeric(12,2) check(base_fee>=0), per_kg numeric(12,2) check(per_kg>=0), free_over numeric(12,2) check(free_over>=0), active boolean not null default false, created_at timestamptz default now(), check(not active or (base_fee is not null and (mode='flat' or per_kg is not null))));
create table public.addresses (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id), name text not null, phone text not null, address text not null, province text not null, postcode text not null check(postcode ~ '^[0-9]{5}$'), created_at timestamptz default now());
create table public.tax_profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id), name text not null, tax_id text not null check(tax_id ~ '^[0-9]{13}$'), branch text not null default '00000', address text not null, created_at timestamptz default now());
create table public.business_accounts (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id) unique, name text not null, tax_id text not null check(tax_id ~ '^[0-9]{13}$'), branch text not null default '00000', address text not null, contact_name text not null, phone text not null, status text not null default 'submitted' check(status in ('submitted','approved','rejected')), admin_note text, created_at timestamptz default now());
create table public.wholesale_prices (id uuid primary key default gen_random_uuid(), product_id uuid not null references products(id), variant_id uuid references product_variants(id), price numeric(12,2) not null check(price>=0), minimum_quantity integer not null default 1 check(minimum_quantity>0), created_at timestamptz default now());
create table public.coupons (id uuid primary key default gen_random_uuid(), code text unique not null, kind text not null check(kind in ('fixed','percent')), amount numeric(12,2) not null check(amount>0), minimum_total numeric(12,2) not null default 0 check(minimum_total>=0), starts_at timestamptz, ends_at timestamptz, active boolean not null default false, created_at timestamptz default now(), check(kind<>'percent' or amount<=100));
create table public.quotes (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id), items jsonb not null, note text, status text not null default 'submitted' check(status in ('submitted','sent','accepted','rejected')), offered_total numeric(12,2) check(offered_total>=0), expires_at timestamptz, admin_note text, created_at timestamptz default now());
alter table public.orders add column if not exists reference text default ('VS-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))), add column payment_status text not null default 'pending' check(payment_status in ('pending','submitted','paid','rejected','refunded')), add column shipping_method_id uuid references shipping_methods(id), add column carrier text, add column tracking_number text, add column tax_snapshot jsonb, add column seller_snapshot jsonb, add column vat_amount numeric(12,2), add column vat_rate numeric(6,3), add column quote_id uuid unique references quotes(id), add column payment_due_at timestamptz, add column idempotency_key uuid, add column customer_note text;
create unique index orders_idempotency on orders(user_id,idempotency_key);
create unique index orders_reference on orders(reference);
alter table public.order_items add column variant_id uuid references product_variants(id), add column variant_name text;
create table public.payment_slips (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id), order_id uuid not null references orders(id), storage_path text not null, amount numeric(12,2) not null check(amount>0), transferred_at timestamptz not null, status text not null default 'submitted' check(status in ('submitted','approved','rejected')), admin_note text, created_at timestamptz default now());
create table public.return_requests (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id), order_id uuid not null references orders(id), reason text not null, resolution text not null check(resolution in ('refund','replacement')), status text not null default 'requested' check(status in ('requested','approved','rejected','refunded','closed')), admin_note text, created_at timestamptz default now());
create table public.support_tickets (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users(id), subject text not null, message text not null, reply text, status text not null default 'open' check(status in ('open','closed')), created_at timestamptz default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), title text not null, message text not null, href text, created_at timestamptz default now());
create table public.audit_log (id uuid primary key default gen_random_uuid(), actor uuid references auth.users(id), action text not null, entity_id text, details jsonb, created_at timestamptz default now());
create table public.content_pages (id text primary key, title text not null, body text not null, published boolean not null default false, created_at timestamptz default now());
create index slips_order_idx on payment_slips(order_id);
create index quote_user_idx on quotes(user_id,created_at desc);
create index returns_user_idx on return_requests(user_id,created_at desc);
create index notifications_user_idx on notifications(user_id,created_at desc);
-- No anonymous access to customer, financial or staff data.
do $$ declare t text; begin
 foreach t in array array['store_settings','shipping_methods','addresses','tax_profiles','business_accounts','wholesale_prices','coupons','quotes','payment_slips','return_requests','support_tickets','notifications','audit_log','content_pages'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy "admin read" on public.%I for select using(public.is_store_admin())',t);
 end loop;
 foreach t in array array['store_settings','shipping_methods','wholesale_prices','coupons','content_pages'] loop
 execute format('create policy "admin writes" on public.%I for all using(public.is_store_admin()) with check(public.is_store_admin())',t);
 end loop;
 foreach t in array array['addresses','tax_profiles'] loop
 execute format('create policy "owner manages" on public.%I for all using(user_id=auth.uid()) with check(user_id=auth.uid())',t);
 end loop;
 foreach t in array array['business_accounts','quotes','payment_slips','return_requests','support_tickets','notifications'] loop
 execute format('create policy "owner reads" on public.%I for select using(user_id=auth.uid())',t);
 end loop;
 foreach t in array array['products','product_variants','categories','product_images','reviews','promotions'] loop
 execute format('create policy "admin catalog" on public.%I for all using(public.is_store_admin()) with check(public.is_store_admin())',t);
 end loop;
end $$;
create policy "admin orders read" on orders for select using(public.is_store_admin());
create policy "admin order items read" on order_items for select using(public.is_store_admin());
create policy "admin profiles read" on profiles for select using(public.is_store_admin());
create policy "published content" on content_pages for select using(published);
create policy "active shipping" on shipping_methods for select using(active);
create policy "wholesale approved read" on wholesale_prices for select using(exists(select 1 from business_accounts where user_id=auth.uid() and status='approved'));
create policy "apply organization" on business_accounts for insert with check(user_id=auth.uid() and status='submitted' and admin_note is null);
create policy "request quote" on quotes for insert with check(user_id=auth.uid() and status='submitted' and offered_total is null and admin_note is null and jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 100 and exists(select 1 from business_accounts where user_id=auth.uid() and status='approved'));
create policy "customer support" on support_tickets for insert with check(user_id=auth.uid() and reply is null and status='open');
create policy "customer return" on return_requests for insert with check(user_id=auth.uid() and status='requested' and admin_note is null and exists(select 1 from orders where id=order_id and user_id=auth.uid() and payment_status='paid'));
create policy "customer review" on reviews for insert with check(user_id=auth.uid() and not is_published and not is_verified and exists(select 1 from order_items i join orders o on o.id=i.order_id where i.product_id=reviews.product_id and o.user_id=auth.uid() and o.status='completed'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-slips','payment-slips',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "owner uploads slip" on storage.objects for insert to authenticated with check(bucket_id='payment-slips' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "owner reads slip" on storage.objects for select to authenticated using(bucket_id='payment-slips' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_store_admin()));

-- Public checkout configuration omits internal settings.
create or replace function public.checkout_config() returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('name',value->>'name','checkout_enabled',value->'checkout_enabled','vat_rate',value->'vat_rate','prices_include_vat',value->'prices_include_vat','bank_name',value->>'bank_name','bank_account',value->>'bank_account','bank_holder',value->>'bank_holder','payment_hours',value->'payment_hours') from store_settings where id='store'
$$;
create or replace function public.store_checkout(lines jsonb, address_id uuid, shipping_id uuid, billing_id uuid, coupon_code text, request_key uuid, quote_ref uuid default null, note text default '', commit_order boolean default false, expected_total numeric default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); oid uuid; existing uuid; cfg jsonb; addr jsonb; tax jsonb; sm shipping_methods; p products; v product_variants; line jsonb; qty int; vid uuid; unit numeric; subtotal numeric:=0; discount_value numeric:=0; fee numeric; total_weight numeric:=0; tax_value numeric; total_value numeric; cp coupons; q quotes; snapshot jsonb:='[]'; wt numeric; rate numeric;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if commit_order is null then raise exception 'คำขอไม่ถูกต้อง';end if;
 if request_key is null then raise exception 'คำขอไม่สมบูรณ์'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||request_key::text,0));
 select id into existing from orders where user_id=uid and idempotency_key=request_key;
 if existing is not null then return jsonb_build_object('id',existing); end if;
 select value into cfg from store_settings where id='store';
 if not coalesce((cfg->>'checkout_enabled')::boolean,false) or coalesce(cfg->>'bank_account','')='' or coalesce(cfg->>'bank_holder','')='' or coalesce(cfg->>'tax_id','')='' or coalesce(cfg->>'address','')='' or cfg->>'vat_rate' is null then raise exception 'ร้านยังไม่เปิดรับคำสั่งซื้อ กรุณาติดต่อร้าน'; end if;
 rate:=(cfg->>'vat_rate')::numeric; if rate<0 or rate>100 then raise exception 'การตั้งค่าภาษีไม่ถูกต้อง'; end if;
 select to_jsonb(a)-'user_id' into addr from addresses a where a.id=address_id and user_id=uid;
 if addr is null then raise exception 'กรุณาเลือกที่อยู่จัดส่ง'; end if;
 if billing_id is not null then select to_jsonb(t)-'user_id' into tax from tax_profiles t where t.id=billing_id and user_id=uid; if tax is null then raise exception 'ข้อมูลภาษีไม่ถูกต้อง'; end if; end if;
 select * into sm from shipping_methods where id=shipping_id and active;
 if sm.id is null or sm.base_fee is null then raise exception 'ยังไม่มีวิธีจัดส่งที่พร้อมใช้งาน'; end if;
 if quote_ref is not null then
 select * into q from quotes where id=quote_ref and user_id=uid for update;
 if q.id is null or q.status<>'sent' or q.offered_total is null or q.expires_at is null or q.expires_at<=now() then raise exception 'ใบเสนอราคาไม่พร้อมใช้งานหรือหมดอายุ'; end if;
 if not exists(select 1 from business_accounts where user_id=uid and status='approved') then raise exception 'บัญชีองค์กรยังไม่ได้รับอนุมัติ'; end if;
 lines:=q.items;
 end if;
 if lines is null or jsonb_typeof(lines)<>'array' or jsonb_array_length(lines) not between 1 and 100 then raise exception 'กรุณาเลือกสินค้า 1–100 รายการ'; end if;
 -- Consistent lock order limits cross-order deadlocks. Each duplicate is decremented within this transaction.
 for line in select value from jsonb_array_elements(lines) order by value->>'product_id',value->>'variant_id' loop
 qty:=(line->>'quantity')::int; if qty is null or qty<1 or qty>10000 then raise exception 'จำนวนสินค้าไม่ถูกต้อง'; end if;
 select * into p from products where id=(line->>'product_id')::uuid and is_active and not is_demo for update;
 if p.id is null then raise exception 'สินค้าไม่พร้อมจำหน่าย'; end if;
 vid:=nullif(line->>'variant_id','')::uuid; unit:=p.price; wt:=null;
 if exists(select 1 from product_variants where product_id=p.id) and vid is null then raise exception 'กรุณาเลือกตัวเลือกสินค้า'; end if;
 if vid is not null then
 select * into v from product_variants where id=vid and product_id=p.id for update;
 if v.id is null or v.stock<qty then raise exception 'ตัวเลือกสินค้ามีสต็อกไม่เพียงพอ'; end if;
 if qty<coalesce(v.minimum_purchase_quantity,1) or qty>coalesce(v.maximum_purchase_quantity,10000) then raise exception 'จำนวนสินค้าอยู่นอกเงื่อนไขการซื้อ'; end if;
 unit:=v.price;wt:=v.weight_kg;if commit_order then update product_variants set stock=stock-qty where id=vid;end if;
 end if;
 if p.stock<qty then raise exception 'สินค้ามีสต็อกไม่เพียงพอ'; end if;
 if exists(select 1 from business_accounts where user_id=uid and status='approved') then
 select least(unit,coalesce(min(w.price),unit)) into unit from wholesale_prices w where w.product_id=p.id and w.variant_id is not distinct from vid and w.minimum_quantity<=qty;
 end if;
 if sm.mode='weight' and (wt is null or wt<=0) then raise exception 'สินค้ายังไม่มีน้ำหนัก กรุณาเลือกขนส่งราคาเดียวหรือติดต่อร้าน'; end if;
 total_weight:=total_weight+coalesce(wt,0)*qty;
 if commit_order then update products set stock=stock-qty where id=p.id;end if;
 subtotal:=subtotal+unit*qty;
 snapshot:=snapshot||jsonb_build_array(jsonb_build_object('product_id',p.id,'product_name',p.name,'variant_id',vid,'variant_name',case when vid is not null then v.name else null end,'unit_price',unit,'quantity',qty));
 end loop;
 if quote_ref is not null then
 -- An offered total is a merchandise discount, never a client-supplied order price.
 if q.offered_total>subtotal then raise exception 'ราคาสินค้าเปลี่ยน กรุณาขอใบเสนอราคาใหม่'; end if;
 discount_value:=subtotal-q.offered_total;
 elsif coalesce(trim(coupon_code),'')<>'' then
 select * into cp from coupons where upper(code)=upper(trim(coupon_code)) and active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now());
 if cp.id is null or subtotal<cp.minimum_total then raise exception 'คูปองไม่ถูกต้องหรือยอดไม่ถึงเงื่อนไข'; end if;
 discount_value:=least(subtotal,case when cp.kind='percent' then round(subtotal*cp.amount/100,2) else cp.amount end);
 end if;
 fee:=case when sm.free_over is not null and subtotal-discount_value>=sm.free_over then 0 else sm.base_fee+case when sm.mode='weight' then ceil(total_weight)*sm.per_kg else 0 end end;
 total_value:=subtotal-discount_value+fee;
 if coalesce((cfg->>'prices_include_vat')::boolean,true) then tax_value:=round(total_value*rate/(100+rate),2);else tax_value:=round(total_value*rate/100,2);total_value:=total_value+tax_value;end if;
 if not commit_order then return jsonb_build_object('subtotal',subtotal,'discount',discount_value,'shipping_fee',fee,'vat_amount',tax_value,'vat_rate',rate,'total',total_value,'items',snapshot,'prices_include_vat',coalesce((cfg->>'prices_include_vat')::boolean,true)); end if;
 if expected_total is null or total_value<>expected_total then raise exception 'ยอดชำระเปลี่ยน กรุณาตรวจสอบยอดอีกครั้ง';end if;
 insert into orders(user_id,status,subtotal,shipping_fee,discount,total,shipping_address,tax_snapshot,seller_snapshot,vat_amount,vat_rate,shipping_method_id,idempotency_key,payment_due_at,quote_id,customer_note)
 values(uid,'pending',subtotal,fee,discount_value,total_value,addr,tax,jsonb_build_object('name',cfg->>'name','tax_id',cfg->>'tax_id','address',cfg->>'address','branch',cfg->>'branch'),tax_value,rate,sm.id,request_key,now()+make_interval(hours=>greatest(1,least(168,coalesce((cfg->>'payment_hours')::int,24)))),quote_ref,left(note,2000)) returning id into oid;
 insert into order_items(order_id,product_id,product_name,variant_id,variant_name,unit_price,quantity) select oid,(j->>'product_id')::uuid,j->>'product_name',(j->>'variant_id')::uuid,j->>'variant_name',(j->>'unit_price')::numeric,(j->>'quantity')::int from jsonb_array_elements(snapshot)j;
 if quote_ref is not null then update quotes set status='accepted' where id=quote_ref; else delete from cart_items where user_id=uid;end if;
 insert into notifications(user_id,title,message,href) values(uid,'รับคำสั่งซื้อแล้ว','กรุณาชำระเงินและแนบสลิปก่อนหมดเวลา','/account/orders/'||oid);
 return jsonb_build_object('id',oid);
end $$;
create or replace function public.cancel_store_order(order_ref uuid) returns void language plpgsql security definer set search_path=public as $$
declare o orders; i order_items; begin
 select * into o from orders where id=order_ref for update;
 if o.id is null or (o.user_id is distinct from auth.uid() and not public.is_store_admin()) then raise exception 'ไม่มีสิทธิ์'; end if;
 if o.status='cancelled' then return; end if;
 if o.status<>'pending' or o.payment_status not in ('pending','rejected') then raise exception 'ยกเลิกไม่ได้ กรุณาติดต่อร้าน'; end if;
 for i in select * from order_items where order_id=o.id order by product_id,variant_id loop
 update products set stock=stock+i.quantity where id=i.product_id;
 if i.variant_id is not null then update product_variants set stock=stock+i.quantity where id=i.variant_id;end if;
 end loop;
 update orders set status='cancelled',updated_at=now() where id=o.id;
 insert into audit_log(actor,action,entity_id) values(auth.uid(),'cancel_order',o.id::text);
end $$;
create or replace function public.submit_store_slip(order_ref uuid, path text, paid_amount numeric, paid_at timestamptz) returns void language plpgsql security definer set search_path=public as $$
declare o orders;begin
 select * into o from orders where id=order_ref and user_id=auth.uid() for update;
 if o.id is null or o.status<>'pending' or o.payment_status not in ('pending','rejected') or o.payment_due_at<=now() then raise exception 'ออเดอร์ไม่พร้อมรับสลิป กรุณาติดต่อร้าน'; end if;
 if paid_amount<>o.total or paid_at>now()+interval '5 minutes' then raise exception 'ยอดหรือเวลาชำระเงินไม่ถูกต้อง'; end if;
 if split_part(path,'/',1)<>auth.uid()::text or not exists(select 1 from storage.objects where bucket_id='payment-slips' and name=path) then raise exception 'ไม่พบไฟล์สลิป'; end if;
 insert into payment_slips(user_id,order_id,storage_path,amount,transferred_at) values(auth.uid(),o.id,path,paid_amount,paid_at);
 update orders set payment_status='submitted',updated_at=now() where id=o.id;
end $$;
create or replace function public.store_admin_action(action text, entity uuid, payload jsonb default '{}') returns void language plpgsql security definer set search_path=public as $$
declare o orders; s payment_slips; b business_accounts; q quotes; target_status text:=payload->>'status'; delta int; old_stock int;begin
 if not public.is_store_admin() then raise exception 'ไม่มีสิทธิ์จัดการร้าน'; end if;
 case action
 when 'inventory' then
 if coalesce(trim(payload->>'reason'),'')='' then raise exception 'กรุณาระบุเหตุผล'; end if;
 delta:=(payload->>'delta')::int;if delta is null or delta=0 then raise exception 'ระบุจำนวนเพิ่มหรือลด';end if;
 if nullif(payload->>'variant_id','') is not null then
 select product_id into entity from product_variants where id=(payload->>'variant_id')::uuid;
 end if;
 select stock into old_stock from products where id=entity for update;
 if old_stock is null or old_stock+delta<0 then raise exception 'สต็อกไม่ถูกต้อง';end if;
 if nullif(payload->>'variant_id','') is not null then
 update product_variants set stock=stock+delta where id=(payload->>'variant_id')::uuid and stock+delta>=0;
 if not found then raise exception 'สต็อกตัวเลือกไม่เพียงพอ';end if;
 elsif exists(select 1 from product_variants where product_id=entity) then raise exception 'กรุณาปรับสต็อกแยกตามตัวเลือกสินค้า';
 end if;
 update products set stock=stock+delta,updated_at=now() where id=entity;
 when 'payment' then
 select order_id into entity from payment_slips where id=entity;
 select * into o from orders where id=entity for update;
 select * into s from payment_slips where order_id=entity and status='submitted' order by created_at desc limit 1 for update;
 if s.id is null or o.status<>'pending' or o.payment_status<>'submitted' then raise exception 'รายการถูกดำเนินการแล้ว';end if;
 if target_status not in ('approved','rejected') then raise exception 'สถานะไม่ถูกต้อง';end if;
 if target_status='rejected' and coalesce(trim(payload->>'note'),'')='' then raise exception 'กรุณาระบุเหตุผล';end if;
 update payment_slips set status=target_status,admin_note=payload->>'note' where id=s.id;
 update orders set payment_status=case when target_status='approved' then 'paid' else 'rejected' end,status=case when target_status='approved' then 'paid' else 'pending' end,updated_at=now() where id=o.id;
 insert into notifications(user_id,title,message,href) values(o.user_id,'ผลตรวจการชำระเงิน',case when target_status='approved' then 'ชำระเงินเรียบร้อย ร้านจะจัดเตรียมสินค้า' else 'สลิปไม่ผ่าน: '||coalesce(payload->>'note','') end,'/account/orders/'||o.id);
 when 'order' then
 select * into o from orders where id=entity for update;
 if o.payment_status<>'paid' or not ((o.status='paid' and target_status='packing') or (o.status='packing' and target_status='shipped') or (o.status='shipped' and target_status='completed')) then raise exception 'ไม่สามารถเปลี่ยนสถานะนี้ได้';end if;
 if target_status='shipped' and (coalesce(trim(payload->>'carrier'),'')='' or coalesce(trim(payload->>'tracking_number'),'')='') then raise exception 'กรุณาระบุขนส่งและเลขพัสดุ';end if;
 update orders set status=target_status,carrier=coalesce(nullif(payload->>'carrier',''),carrier),tracking_number=coalesce(nullif(payload->>'tracking_number',''),tracking_number),updated_at=now() where id=entity;
 insert into notifications(user_id,title,message,href) values(o.user_id,'อัปเดตคำสั่งซื้อ',case when target_status='shipped' then 'จัดส่งแล้ว เลขพัสดุ '||(payload->>'tracking_number') else 'ร้านอัปเดตสถานะคำสั่งซื้อแล้ว' end,'/account/orders/'||o.id);
 when 'business' then
 if target_status not in ('approved','rejected') then raise exception 'สถานะไม่ถูกต้อง';end if;
 update business_accounts set status=target_status,admin_note=payload->>'note' where id=entity returning * into b;
 insert into notifications(user_id,title,message,href) values(b.user_id,'ผลตรวจบัญชีองค์กร',case when target_status='approved' then 'บัญชีได้รับอนุมัติสิทธิ์ราคาส่งแล้ว' else 'กรุณาติดต่อร้าน: '||coalesce(payload->>'note','') end,'/business');
 when 'quote' then
 select * into q from quotes where id=entity for update;
 if q.status not in ('submitted','sent') or (payload->>'total')::numeric<0 or (payload->>'expires_at')::timestamptz<=now() then raise exception 'ใบเสนอราคาหรือวันหมดอายุไม่ถูกต้อง';end if;
 if payload->>'total' is null or payload->>'expires_at' is null then raise exception 'กรุณาระบุราคาและวันหมดอายุ';end if;
 update quotes set offered_total=(payload->>'total')::numeric,expires_at=(payload->>'expires_at')::timestamptz,status='sent',admin_note=payload->>'note' where id=entity;
 insert into notifications(user_id,title,message,href) values(q.user_id,'ได้รับใบเสนอราคา','เปิดดูราคาและยืนยันการสั่งซื้อได้แล้ว','/account/quotes/'||q.id);
 when 'return' then
 if target_status not in ('approved','rejected','refunded','closed') or coalesce(trim(payload->>'note'),'')='' then raise exception 'กรุณาระบุสถานะและรายละเอียด';end if;
 update return_requests set status=target_status,admin_note=payload->>'note' where id=entity;
 -- Refund is recorded only after staff completes the bank refund; inventory is adjusted separately after inspection.
 when 'support' then
 update support_tickets set reply=payload->>'reply',status='closed' where id=entity;
 else raise exception 'คำสั่งไม่ถูกต้อง';end case;
 insert into audit_log(actor,action,entity_id,details) values(auth.uid(),action,entity::text,payload);
end $$;
-- Restrict executable mutation functions to authenticated sessions.
revoke all on function public.store_checkout(jsonb,uuid,uuid,uuid,text,uuid,uuid,text,boolean,numeric) from public,anon;
revoke all on function public.cancel_store_order(uuid) from public,anon;
revoke all on function public.submit_store_slip(uuid,text,numeric,timestamptz) from public,anon;
revoke all on function public.store_admin_action(text,uuid,jsonb) from public,anon;
grant execute on function public.store_checkout(jsonb,uuid,uuid,uuid,text,uuid,uuid,text,boolean,numeric),public.cancel_store_order(uuid),public.submit_store_slip(uuid,text,numeric,timestamptz),public.store_admin_action(text,uuid,jsonb) to authenticated;
create policy "admin import reads" on catalog_sync_runs for select using(public.is_store_admin());
create or replace function public.store_dashboard() returns jsonb language plpgsql stable security definer set search_path=public as $$
begin if not public.is_store_admin() then raise exception 'ไม่มีสิทธิ์';end if;
return jsonb_build_object('stats',jsonb_build_object('products',(select count(*) from products where is_active),'slips',(select count(*) from payment_slips where status='submitted'),'toShip',(select count(*) from orders where status in ('paid','packing')),'paidTotal',(select coalesce(sum(total),0) from orders where payment_status='paid')),'recent',(select coalesce(jsonb_agg(t),'[]') from (select id,reference,total,status,created_at from orders order by created_at desc limit 10)t));end $$;
revoke all on function public.store_dashboard() from public,anon;
grant execute on function public.store_dashboard() to authenticated;
-- Immutable invoice snapshot and sequential document number, issued by staff after payment.
create sequence public.tax_document_sequence;
create table public.tax_documents (id uuid primary key default gen_random_uuid(),order_id uuid not null unique references orders(id),user_id uuid not null references auth.users(id),number text not null unique,issued_at timestamptz not null default now(),snapshot jsonb not null);
alter table public.tax_documents enable row level security;
create policy "owner or admin reads invoice" on tax_documents for select using(user_id=auth.uid() or public.is_store_admin());
create or replace function public.issue_store_invoice(order_ref uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare o orders;doc uuid;begin
 if not public.is_store_admin() then raise exception 'ไม่มีสิทธิ์';end if;
 select * into o from orders where id=order_ref for update;
 select id into doc from tax_documents where order_id=order_ref;if doc is not null then return doc;end if;
 if o.id is null or o.payment_status<>'paid' or o.tax_snapshot is null then raise exception 'ต้องชำระเงินและมีข้อมูลผู้ซื้อสำหรับใบกำกับภาษี';end if;
 if coalesce(o.seller_snapshot->>'tax_id','')='' or coalesce(o.seller_snapshot->>'address','')='' then raise exception 'ข้อมูลผู้ขายไม่ครบ';end if;
 insert into tax_documents(order_id,user_id,number,snapshot) values(o.id,o.user_id,'INV-'||to_char(now(),'YYYY')||'-'||lpad(nextval('tax_document_sequence')::text,8,'0'),to_jsonb(o)||jsonb_build_object('order_items',(select jsonb_agg(i) from order_items i where i.order_id=o.id))) returning id into doc;
 insert into audit_log(actor,action,entity_id) values(auth.uid(),'issue_invoice',doc::text);
 insert into notifications(user_id,title,message,href) values(o.user_id,'ออกใบกำกับภาษีแล้ว','เปิดดูและพิมพ์เอกสารได้จากคำสั่งซื้อ','/account/orders/'||o.id||'/invoice');
 return doc;end $$;
revoke all on function public.issue_store_invoice(uuid) from public,anon;
grant execute on function public.issue_store_invoice(uuid) to authenticated;
create or replace function public.audit_store_changes() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into audit_log(actor,action,entity_id,details) values(auth.uid(),TG_TABLE_NAME||':'||TG_OP,coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id'),jsonb_build_object('before',to_jsonb(old),'after',to_jsonb(new)));return coalesce(new,old);end $$;
do $$ declare t text;begin foreach t in array array['store_settings','shipping_methods','products','product_variants','categories','wholesale_prices','coupons','content_pages'] loop execute format('create trigger store_change_audit after insert or update or delete on public.%I for each row execute function public.audit_store_changes()',t);end loop;end $$;
-- Call from a trusted scheduled job; pending review or paid orders are never expired.
create or replace function public.expire_store_orders() returns integer language plpgsql security definer set search_path=public as $$
declare o orders;i order_items;n integer:=0;begin
 for o in select * from orders where status='pending' and payment_status in ('pending','rejected') and payment_due_at<now() order by payment_due_at limit 100 for update skip locked loop
 for i in select * from order_items where order_id=o.id order by product_id,variant_id loop
 update products set stock=stock+i.quantity where id=i.product_id;
 if i.variant_id is not null then update product_variants set stock=stock+i.quantity where id=i.variant_id;end if;
 end loop;
 update orders set status='cancelled',updated_at=now() where id=o.id;
 insert into audit_log(action,entity_id) values('expire_order',o.id::text);
 insert into notifications(user_id,title,message,href) values(o.user_id,'คำสั่งซื้อหมดเวลาชำระ','ระบบยกเลิกคำสั่งซื้อและคืนสินค้าเข้าสต็อกแล้ว','/account/orders/'||o.id);
 n:=n+1;end loop;return n;end $$;
revoke all on function public.expire_store_orders() from public,anon,authenticated;
-- Supabase service_role is the trusted scheduler identity.
grant execute on function public.expire_store_orders() to service_role;
-- Retain existing signed-in carts while adding variant-aware line identity.
alter table cart_items add column variant_id uuid references product_variants(id);
alter table cart_items drop constraint if exists cart_items_user_id_product_id_key;
create unique index cart_user_product_variant on cart_items(user_id,product_id,variant_id) nulls not distinct;
create or replace function public.save_store_basket(lines jsonb, favorite_ids jsonb) returns void language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid();l jsonb;begin
 if uid is null or lines is null or favorite_ids is null or jsonb_typeof(lines)<>'array' or jsonb_typeof(favorite_ids)<>'array' or jsonb_array_length(lines)>100 or jsonb_array_length(favorite_ids)>500 then raise exception 'ตะกร้าไม่ถูกต้อง';end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text||':basket',0));
 delete from cart_items where user_id=uid;
 for l in select value from jsonb_array_elements(lines) loop
 if (l->>'quantity')::int not between 1 and 10000 then raise exception 'จำนวนไม่ถูกต้อง';end if;
 if not exists(select 1 from products where id=(l->>'product_id')::uuid and is_active and not is_demo) then continue;end if;
 if nullif(l->>'variant_id','') is not null and not exists(select 1 from product_variants where id=(l->>'variant_id')::uuid and product_id=(l->>'product_id')::uuid) then raise exception 'ตัวเลือกไม่ตรงกับสินค้า';end if;
 insert into cart_items(user_id,product_id,variant_id,quantity) values(uid,(l->>'product_id')::uuid,nullif(l->>'variant_id','')::uuid,(l->>'quantity')::int);
 end loop;
 delete from favorites where user_id=uid;
 insert into favorites(user_id,product_id) select uid,p.id from products p where p.id in (select value::uuid from jsonb_array_elements_text(favorite_ids)) and p.is_active and not p.is_demo;
end $$;
revoke all on function public.save_store_basket(jsonb,jsonb) from public,anon;
grant execute on function public.save_store_basket(jsonb,jsonb) to authenticated;

create policy "admin uploads catalog images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_store_admin());
