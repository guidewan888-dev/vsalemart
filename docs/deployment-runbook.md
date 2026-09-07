# VSaleMart — เชื่อมระบบเดิมและเปิดใช้งาน

## สิ่งที่คงไว้

- Next.js 16 / React 19 / Tailwind 4 / Supabase / Vercel และ lockfile เดิม
- ใช้ `components/admin/admin-shell.tsx` เดิมเป็นกรอบทุกหน้าหลังบ้าน รวมหัว Seller Center และเมนู drawer มือถือ
- ใช้ `products`, `product_variants`, `product_images`, `categories`, `profiles`, `orders`, `order_items`, `cart_items`, `favorites`, `reviews` และ `catalog_sync_runs` เดิม
- ไม่แก้ไข migration นำเข้า Shopee เดิม และไม่รันสคริปต์นำเข้าทับข้อมูล
- สต็อกเว็บและ Shopee กองเดียว พนักงานปรับเอง ไม่อ้างว่าซิงก์ Shopee อัตโนมัติ

## ก่อนนำขึ้นจริง

1. ทดสอบสาขานี้กับ Supabase staging ที่มีสำเนา schema เดิม และสำรองข้อมูล production ก่อน migration
2. รัน migration เพิ่มเติม `supabase/migrations/20260908010000_complete_commerce.sql` หลัง migration เดิมทั้งหมด ไม่รันไฟล์ seed/import Shopee ซ้ำ
3. ตรวจว่าตะกร้าเดิมมี constraint `cart_items_user_id_product_id_key` ตาม migration เดิม; migration ใหม่แทนด้วย unique user/product/variant
4. ใช้ environment variables ของ Vercel เดิม:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` เป็น origin ที่เชื่อถือได้
5. ตั้ง Supabase Auth site URL และ redirect allowlist สำหรับ `/account` และ `/reset-password` ของ preview/production ตามโดเมนที่ใช้ พร้อมตรวจอีเมลสมัคร เข้าสู่ระบบ และ recovery
6. ให้เจ้าของร้านสมัครบัญชี แล้วผู้ดูแลฐานข้อมูลกำหนดสิทธิ์โดย UUID ที่ตรวจสอบแล้ว:

```sql
insert into public.staff_members(user_id, role)
values ('REPLACE_WITH_VERIFIED_AUTH_USER_UUID', 'admin');
```

7. เข้าหลังบ้าน → ตั้งค่าร้าน กรอกชื่อ/ที่อยู่/เลขภาษี/สาขา/อัตราภาษี/รูปแบบราคารวมภาษี บัญชีรับเงิน และเวลาชำระ ระบบไม่เดาอัตราภาษีหรือบัญชีรับเงิน
8. ตั้งขนส่งอย่างน้อย 1 วิธี ค่าพื้นฐานต้องไม่ว่าง กรณีตามน้ำหนักต้องมีค่าต่อกิโลและน้ำหนักทุกตัวเลือกที่ซื้อ สินค้าที่ไม่มีน้ำหนักใช้ขนส่งราคาเดียวหรือเติมข้อมูลก่อน
9. เผยแพร่ข้อมูลร้านและนโยบายฉบับที่เจ้าของร้านตรวจแล้วผ่านหลังบ้าน → เนื้อหาเว็บ
10. ทดสอบออเดอร์จริงแบบควบคุมหนึ่งรายการ: ราคาปลีก/ราคาส่ง → ตรวจยอด → สั่งซื้อ → สลิป → แอดมินตรวจ → จัดสินค้า → เลขพัสดุ → เอกสารภาษี → การแจ้งเตือน และทดสอบคำขอคืนสินค้า
11. เปิดรับคำสั่งซื้อในหน้าตั้งค่าหลังการตรวจข้อมูลและการเชื่อมเสร็จ

## คืนสต็อกเมื่อหมดเวลาชำระ

ติดตั้งตัวตั้งเวลาที่เชื่อถือได้ให้เรียก `public.expire_store_orders()` ทุก 5–15 นาที ฟังก์ชันประมวลผลครั้งละไม่เกิน 100 รายการและไม่ยกเลิกออเดอร์ที่มีสลิปรอตรวจหรือชำระแล้ว

ทางเลือก HTTP: เรียก `GET /api/cron/expire-orders` พร้อม `Authorization: Bearer <CRON_SECRET>` จากตัวตั้งเวลา ตั้ง `CRON_SECRET` และ `SUPABASE_SERVICE_ROLE_KEY` ใน server environment เท่านั้น ห้ามใช้คีย์ service role ในตัวแปร `NEXT_PUBLIC_` หรือ commit ลง Git

ไม่มี cron schedule ที่ติดตั้งบนบริการจริงจากสาขานี้ ต้องตั้ง scheduler ก่อนถือว่าการคืนสต็อกอัตโนมัติพร้อมใช้งาน

## การทำงานที่ตั้งใจเป็นงานพนักงาน

- ตรวจสลิปเทียบยอดเงินจริง แล้วอนุมัติหรือปฏิเสธพร้อมเหตุผล
- เลือกขนส่งและบันทึกเลขพัสดุ ไม่มีการจองพัสดุผ่าน API
- คืนเงินผ่านธนาคาร แล้วบันทึกผลและอ้างอิงในคำขอคืนเงิน; ตรวจสินค้าคืนและปรับสต็อกแยก
- เพิ่ม/ถอนสิทธิ์พนักงานผ่าน trusted database administration
- นำเข้า Shopee ใช้สคริปต์เดิม ต้องตรวจผลต่อ stock ที่กันไว้บนเว็บก่อนนำเข้ารอบใหม่

## QR และบัตร

เจ้าของร้านยังไม่มีบัญชี payment provider. UI แสดงเป็นช่องทางยังไม่เปิดและปุ่มเลือกถูกปิดจริง ไม่มีการรับเลขบัตรหรือจำลองผลชำระสำเร็จ. การเชื่อม provider/webhook/refund อัตโนมัติยังไม่รวมเป็นบริการพร้อมใช้งานในสาขานี้

## ขอบเขตการทดสอบ

- TypeScript และ Next production build
- PostgreSQL integration ผ่าน PGlite ในฐานข้อมูลแยก: migration, RLS, ยอด/ภาษี, idempotency, rollback สต็อก, สิทธิ์องค์กร, ใบเสนอราคา, สลิป, ส่งของ, ใบกำกับภาษี และหมดอายุ
- ยังไม่ทดสอบกับ Supabase/Vercel production, SMTP, real payment provider, หรือ browser end-to-end ในเซสชันนี้
- การทดสอบ PGlite เป็น PostgreSQL เดี่ยว ไม่ใช่หลักฐาน concurrency/performance ของ Supabase production

รันทดสอบฐานข้อมูลโดยติดตั้ง `@electric-sql/pglite` ในพื้นที่ทดสอบแยก แล้วกำหนด `PGLITE_MODULE` เป็น absolute path ของโมดูล:

```bash
PGLITE_MODULE=/absolute/path/to/pglite/dist/index.js node scripts/commerce-integration-test.mjs
```

## ถอยกลับ

เก็บข้อมูลออเดอร์และ audit ใหม่ไว้ ไม่ drop ตารางเพื่อ rollback UI. หากต้องถอยกลับ ให้ปิด `checkout_enabled` และคืนรุ่นแอปเดิมหลังตรวจผลของ constraint ตะกร้าแบบ variant กับโค้ดเดิม. ออเดอร์และสลิปที่เกิดแล้วต้องถูกตรวจและดำเนินการต่อโดยพนักงาน
