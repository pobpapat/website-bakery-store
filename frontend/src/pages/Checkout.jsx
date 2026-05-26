import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ user }) => {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchCart();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [showAddressModal, setShowAddressModal] = useState(false);

  const autofill = () => {
    if (userProfile) {
      if (userProfile.name) setFullname(`${userProfile.name} ${userProfile.surname || ''}`.trim());
      if (userProfile.phone) setPhone(userProfile.phone);

      const savedAddresses = userProfile.addresses || (userProfile.address ? [userProfile.address] : []);
      if (savedAddresses.length > 1) {
        setShowAddressModal(true);
      } else if (savedAddresses.length === 1) {
        setAddress(savedAddresses[0]);
      } else {
        alert('คุณยังไม่ได้เพิ่มที่อยู่ในโปรไฟล์');
      }
    } else {
      alert('ไม่พบข้อมูลสมาชิก');
    }
  };

  const selectAddress = (addr) => {
    setAddress(addr);
    setShowAddressModal(false);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/orders', {
        order_name: fullname,
        order_phone: phone,
        order_address: address
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('สั่งซื้อสำเร็จ');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  if (user && user.role === 'admin') {
    return <div className="text-center py-20 text-red-600 text-2xl font-bold">ผู้ดูแลระบบไม่สามารถสั่งซื้อสินค้าได้</div>;
  }

  if (!cart) return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div></div>;

  const total = cart.items.reduce((sum, item) => sum + item.cart_amount, 0);

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-10 lg:p-14 text-white">
          <h1 className="text-4xl lg:text-5xl font-black mb-8 text-center tracking-tighter">ยืนยันการสั่งซื้อ</h1>

          <div className="max-w-sm mx-auto bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col items-center">
            <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">ยอดชำระเงินทั้งหมด</span>
            <span className="text-5xl font-black tracking-tighter text-primary">
              {total.toLocaleString()} <span className="text-2xl font-bold">฿</span>
            </span>
          </div>
        </div>

        <div className="p-10 lg:p-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                สถานที่จัดส่งสินค้า
              </h2>
            </div>
            <button
              onClick={autofill}
              className="group flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ใช้ข้อมูลที่บันทึกไว้
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">ชื่อผู้รับสินค้า</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="ระบุชื่อ-นามสกุล..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">เบอร์โทรศัพท์ติดต่อ</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">ที่อยู่สำหรับการจัดส่งโดยละเอียด</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ระบุ บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์..."
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all h-40 resize-none font-light leading-relaxed"
                required
              />
            </div>

            <div className="pt-6 border-t border-slate-50">
              <button
                type="submit"
                className="group relative w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-2xl hover:bg-emerald-600 shadow-2xl shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-4 uppercase tracking-tighter">
                  สั่งซื้อสินค้าและชำระเงิน
                  <svg className="w-8 h-8 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </button>


            </div>
          </form>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-3xl transform transition-all animate-slide-up">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">เลือกที่อยู่จัดส่ง</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 bg-white rounded-full shadow-sm transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto space-y-6">
              {(userProfile?.addresses || []).map((addr, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAddress(addr)}
                  className="w-full text-left p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all group relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-primary flex items-center justify-center shrink-0 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-black text-slate-800 uppercase tracking-widest text-[10px]">ที่อยู่ {idx + 1}</p>
                        {idx === 0 && <span className="text-[10px] text-primary font-black bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">ที่อยู่หลัก</span>}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed font-light">{addr}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-10 bg-slate-50/50 border-t border-slate-50 flex justify-end">
              <button
                onClick={() => setShowAddressModal(false)}
                className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600 transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Checkout;