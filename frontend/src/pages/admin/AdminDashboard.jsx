import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-1 bg-primary rounded-full"></div>
          <p className="text-xl font-black text-primary uppercase tracking-[0.3em]">หน้าผู้ดูแลระบบ</p>
        </div>

        <p className="text-slate-400 font-light mt-4 text-lg">จัดการหน้าร้าน, ติดตามออเดอร์ และตรวจสอบประสิทธิภาพได้จากที่เดียว</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { to: "/admin/products", title: "จัดการอุปกรณ์", desc: "จัดการอุปกรณ์และสต็อกสินค้า", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "bg-blue-500" },
          { to: "/admin/categories", title: "จัดการหมวดหมู่", desc: "จัดระเบียบประเภทสินค้า", icon: "M4 6h16M4 10h16M4 14h16M4 18h16", color: "bg-emerald-500" },
          { to: "/admin/promotions", title: "จัดการโปรโมชั่น", desc: "จัดการส่วนลดและข้อเสนอพิเศษ", icon: "M11 5.882V19.297A1.697 1.697 0 0110.154 18l-6.105-3.374a2.25 2.25 0 01-1.049-1.92v-5.412a2.3 2.3 0 011.053-1.921L10.165 2A1.697 1.697 0 0111 5.882z", color: "bg-rose-500" },
          { to: "/admin/orders", title: "จัดการรายการสั่งซื้อ", desc: "ติดตามและประมวลผลออเดอร์", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "bg-amber-500" },
          { to: "/admin/users", title: "จัดการสมาชิก", desc: "จัดการข้อมูลสมาชิก", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-11a4 4 0 01-4 4H9a4 4 0 01-4-4 4 4 0 014-4h8a4 4 0 014 4z", color: "bg-violet-500" },
          { to: "/admin/sales", title: "สรุปยอดขาย", desc: "รายงานรายได้และสถิติเชิงลึก", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "bg-indigo-500" },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="group relative bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all transform hover:-translate-y-2 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rounded-bl-[5rem]`}></div>

            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-current/20 group-hover:scale-110 transition-transform`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} />
              </svg>
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-primary transition-colors">{item.title}</h2>
            <p className="text-slate-400 font-light text-sm">{item.desc}</p>

            <div className="mt-8 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              เข้าใช้งาน
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;