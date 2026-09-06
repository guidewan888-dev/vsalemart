'use client';

import { useMemo, useState } from 'react';

type Product = { id: number; name: string; category: string; price: number; originalPrice?: number; badge?: string; color: string; shape: string };

const products: Product[] = [
  { id: 1, name: 'กระเป๋าผ้าอเนกประสงค์ ทรงตั้ง', category: 'ของใช้ในบ้าน', price: 89, originalPrice: 129, badge: 'ขายดี', color: '#dce8bd', shape: 'bag' },
  { id: 2, name: 'สายชาร์จถักแข็งแรง 1 เมตร', category: 'อุปกรณ์มือถือ', price: 59, originalPrice: 99, badge: 'ลด 40%', color: '#d6e4ed', shape: 'cable' },
  { id: 3, name: 'แก้วน้ำพร้อมฝาปิด 450 มล.', category: 'ของใช้ในบ้าน', price: 79, color: '#eed8c9', shape: 'cup' },
  { id: 4, name: 'สมุดโน้ตปกเรียบ A5', category: 'เครื่องเขียน', price: 45, originalPrice: 69, color: '#e4dfef', shape: 'book' },
  { id: 5, name: 'กล่องจัดระเบียบแบบใส', category: 'ของแต่งบ้าน', price: 119, badge: 'มาใหม่', color: '#d5ebe4', shape: 'box' },
  { id: 6, name: 'ขวดสเปรย์ละอองละเอียด', category: 'ของใช้ในบ้าน', price: 39, originalPrice: 59, color: '#f0dfb8', shape: 'bottle' },
  { id: 7, name: 'แท่นวางโทรศัพท์ ปรับระดับได้', category: 'อุปกรณ์มือถือ', price: 99, originalPrice: 159, color: '#d9dce8', shape: 'stand' },
  { id: 8, name: 'ปากกาเจล หมึกดำ แพ็ก 5 ด้าม', category: 'เครื่องเขียน', price: 55, color: '#ead5d0', shape: 'pens' },
];

const categories = ['ทั้งหมด', 'ของใช้ในบ้าน', 'อุปกรณ์มือถือ', 'เครื่องเขียน', 'ของแต่งบ้าน'];

function Icon({ name }: { name: 'search' | 'heart' | 'cart' | 'user' | 'arrow' | 'check' }) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></>,
    heart: <path d="M20.8 5.9c-1.7-1.8-4.5-1.8-6.2 0L12 8.6 9.4 5.9a4.3 4.3 0 0 0-6.2 6L12 21l8.8-9.1a4.3 4.3 0 0 0 0-6Z"/>,
    cart: <><path d="M3 4h2l2.2 10.3a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.6L20.5 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function ProductArt({ product }: { product: Product }) {
  return <div className={`product-art art-${product.shape}`} style={{ background: product.color }} aria-hidden="true"><span className="art-shadow"/><span className="art-object"/><span className="art-detail"/></div>;
}

export default function Home() {
  const [category, setCategory] = useState('ทั้งหมด');
  const [query, setQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<number | null>(null);
  const filtered = useMemo(() => products.filter((product) => (category === 'ทั้งหมด' || product.category === category) && product.name.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);

  function addToCart(id: number) {
    setCartCount((count) => count + 1);
    setAddedId(id);
    window.setTimeout(() => setAddedId(null), 1200);
  }

  return (
    <div className="site-shell">
      <div className="announcement">ส่งฟรีเมื่อช้อปครบ 499 บาท <span>•</span> สินค้าคัดแล้ว ส่งจากไทย</div>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="VSALE MART หน้าแรก">VSALE<span>MART</span><i /></a>
        <label className="search-box"><span className="sr-only">ค้นหาสินค้า</span><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาสินค้าในร้าน" /></label>
        <nav className="header-actions" aria-label="เมนูบัญชีและตะกร้า">
          <button aria-label="สินค้าที่ชอบ"><Icon name="heart"/></button>
          <button aria-label="บัญชีของฉัน"><Icon name="user"/></button>
          <button className="cart-button" aria-label={`ตะกร้า มี ${cartCount} รายการ`}><Icon name="cart"/>{cartCount > 0 && <b>{cartCount}</b>}</button>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="kicker">EVERYDAY FINDS · ราคาดีทุกวัน</p>
            <h1 id="hero-title">ของที่ใช่<br/>ในราคาที่<span>ชอบ</span></h1>
            <p>รวมของใช้ชิ้นเล็กที่ทำให้ทุกวันง่ายขึ้น เลือกง่าย ราคาชัด ส่งไวจากไทย</p>
            <a className="primary-link" href="#products">เลือกดูสินค้า <Icon name="arrow"/></a>
          </div>
          <div className="hero-stage" aria-hidden="true">
            <div className="price-sticker"><small>เริ่มต้น</small><strong>฿39</strong></div>
            <div className="display-plinth"><span className="hero-bag"/><span className="hero-bottle"/><span className="hero-box"/></div>
            <p>คัดของดี<br/>ให้คุณทุกวัน</p>
          </div>
        </section>

        <section className="trust-strip" aria-label="จุดเด่นของร้าน">
          <div><Icon name="check"/><span><b>สินค้าพร้อมส่ง</b><small>แพ็กจากไทย</small></span></div>
          <div><Icon name="check"/><span><b>ราคาตรงไปตรงมา</b><small>ไม่มีค่าใช้จ่ายซ่อน</small></span></div>
          <div><Icon name="check"/><span><b>ช่วยเหลือทุกคำสั่งซื้อ</b><small>ทักหาเราได้เสมอ</small></span></div>
        </section>

        <section className="catalog" id="products" aria-labelledby="products-title">
          <div className="section-heading"><div><p className="kicker">SHOP OUR PICKS</p><h2 id="products-title">เลือกของดีเข้าบ้าน</h2></div><span>ข้อมูลสินค้าตัวอย่างสำหรับออกแบบ</span></div>
          <div className="category-row" role="group" aria-label="กรองตามหมวดสินค้า">
            {categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          {filtered.length > 0 ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="visual-wrap">{product.badge && <span className="badge">{product.badge}</span>}<button className="favorite" aria-label={`บันทึก ${product.name}`}><Icon name="heart"/></button><ProductArt product={product}/></div>
                  <p className="product-category">{product.category}</p><h3>{product.name}</h3>
                  <div className="product-bottom"><p className="price"><strong>฿{product.price}</strong>{product.originalPrice && <del>฿{product.originalPrice}</del>}</p><button className={addedId === product.id ? 'added' : ''} onClick={() => addToCart(product.id)} aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}>{addedId === product.id ? <Icon name="check"/> : '+'}</button></div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><p>ยังไม่พบสินค้าที่ค้นหา</p><button onClick={() => { setQuery(''); setCategory('ทั้งหมด'); }}>ดูสินค้าทั้งหมด</button></div>}
        </section>

        <section className="story"><p className="story-mark">V</p><div><p className="kicker">WHY VSALE MART</p><h2>ของธรรมดา<br/>ที่เลือกมาอย่างตั้งใจ</h2></div><p>เราเชื่อว่าของใช้ที่ดีไม่จำเป็นต้องราคาแพง จึงคัดสินค้าที่ใช้งานจริง คุ้มราคา และพร้อมส่งถึงบ้านคุณ</p></section>
      </main>
      <footer><a className="logo footer-logo" href="#top">VSALE<span>MART</span><i/></a><p>ร้านรวมของใช้ราคาดีสำหรับทุกวัน</p><p>© 2026 VSALE MART</p></footer>
    </div>
  );
}
