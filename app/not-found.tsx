import Link from 'next/link';
export default function NotFound(){return <div className="panel empty"><p className="eyebrow">404</p><h1>ไม่พบหน้าที่ต้องการ</h1><p>ลิงก์อาจเปลี่ยนหรือรายการนี้ไม่พร้อมใช้งาน</p><Link className="btn" href="/products">เลือกซื้อสินค้า</Link></div>}
