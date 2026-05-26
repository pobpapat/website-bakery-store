import { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ user }) => {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    const interval = setInterval(fetchCart, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (itemId, qty) => {
    try {
      await axios.put(`/api/cart/${itemId}`, { qty }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCart();
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  if (user && user.role === 'admin') {
    return <div className="text-center py-20 text-red-600 text-2xl font-bold">ผู้ดูแลระบบไม่สามารถใช้งานตะกร้าสินค้าได้</div>;
  }

  if (!cart) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div></div>;

  const total = cart.items.reduce((sum, item) => sum + item.cart_amount, 0);
  const totalOriginal = cart.items.reduce((sum, item) => {
    const origPrice = item.cart_original_price || item.cart_price;
    return sum + origPrice * item.cart_qty;
  }, 0);
  const totalDiscount = totalOriginal - total;

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-primary/10 rounded-2xl">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">ตะกร้าสินค้า</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-100">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p className="text-2xl font-bold text-slate-400 mb-8">ตะกร้าของคุณยังว่างอยู่เลย</p>
          <button
            onClick={() => navigate('/products')}
            className="px-10 py-5 bg-primary text-white rounded-[1.5rem] font-black hover:bg-primary-dark shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all active:scale-95"
          >
            ไปดูสินค้าพรีเมียมกัน!
          </button>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-12 items-start">
          <div className="flex-grow w-full space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="hidden lg:grid grid-cols-12 gap-6 p-6 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-6">รายละเอียดสินค้า</div>
                <div className="col-span-3 text-center">จำนวน</div>
                <div className="col-span-2 text-right">ยอดรวม</div>
                <div className="col-span-1"></div>
              </div>

              {cart.items.map((item, index) => {
                const origPrice = item.cart_original_price || item.cart_price;
                const hasDiscount = origPrice > item.cart_price;
                const discountPerItem = origPrice - item.cart_price;
                const discountPct = origPrice > 0 ? Math.round((discountPerItem / origPrice) * 100) : 0;

                return (
                  <div key={item._id} className={`p-8 lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center hover:bg-slate-50/50 transition-colors ${index !== cart.items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="col-span-6 flex items-center gap-6 mb-4 lg:mb-0">
                      <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50">
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.cart_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{item.cart_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {hasDiscount ? (
                            <>
                              <span className="text-lg font-black text-rose-500">{item.cart_price.toLocaleString()} ฿</span>
                              <span className="text-sm text-slate-300 line-through font-light mt-0.5">{origPrice.toLocaleString()} ฿</span>
                              <span className="ml-2 text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-lg uppercase tracking-widest">-{discountPct}%</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-slate-500">{item.cart_price.toLocaleString()} ฿</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-center mb-4 lg:mb-0">
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner">
                        <button
                          onClick={() => handleUpdate(item._id, Math.max(1, item.cart_qty - 1))}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>
                        </button>
                        <span className="w-10 text-center text-lg font-black text-slate-800">{item.cart_qty}</span>
                        <button
                          onClick={() => handleUpdate(item._id, item.cart_qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-right mb-4 lg:mb-0">
                      <p className="text-xl font-black text-slate-900 leading-none">{item.cart_amount.toLocaleString()} <span className="text-sm">฿</span></p>
                      {hasDiscount && (
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                          คุณประหยัดเงินไป {((origPrice - item.cart_price) * item.cart_qty).toLocaleString()} ฿
                        </p>
                      )}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => handleDelete(item._id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center px-4">
              <Link to="/products" className="group flex items-center gap-3 text-slate-400 hover:text-primary transition-colors font-bold">
                <svg className="w-5 h-5 bg-slate-50 p-1 rounded-full group-hover:bg-primary/10 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                กลับไปเลือกซื้อสินค้า
              </Link>
              <p className="text-xs text-slate-400 font-light italic">ราคาสินค้าจะอัปเดตอัตโนมัติตามโปรโมชั่นที่ใช้งานอยู่</p>
            </div>
          </div>

          <div className="w-full xl:w-[400px]">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl sticky top-24">
              <h2 className="text-2xl font-black mb-8 border-b border-white/10 pb-6 tracking-tight">สรุปยอดชำระ</h2>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-slate-400">
                  <span className="font-light">ยอดรวมชุดสินค้า</span>
                  <span className="font-bold text-white tracking-widest">{totalOriginal.toLocaleString()} ฿</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <span className="text-rose-400 text-sm font-bold uppercase tracking-widest">ส่วนลดพิเศษ</span>
                    <span className="text-rose-400 font-black">-{totalDiscount.toLocaleString()} ฿</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span className="font-light">ค่าจัดส่ง</span>
                  <span className="text-emerald-400 font-black uppercase tracking-widest text-xs">คำนวณในขั้นตอนสุดท้าย</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-light text-slate-400 mb-1">ราคาสุทธิ</span>
                  <span className="text-5xl font-black tracking-tighter">{total.toLocaleString()} <span className="text-2xl font-bold">฿</span></span>
                </div>
                {totalDiscount > 0 && (
                  <p className="text-right text-xs text-rose-300 font-bold mt-3 uppercase tracking-widest">
                    🔥 คุณได้รับส่วนลดสุดคุ้มในเซ็ตนี้
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="group relative w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xl hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-xl shadow-primary/20 overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  ไปหน้าชำระเงิน
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
