'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="panel empty"><h1>ไม่สามารถโหลดหน้านี้ได้</h1><p>กรุณาลองอีกครั้ง หากยังพบปัญหาติดต่อร้านเพื่อรับความช่วยเหลือ</p><button className="btn" onClick={reset}>ลองอีกครั้ง</button></div>}
