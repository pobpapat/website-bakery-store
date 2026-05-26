import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';

const isPromoActive = (promo) => {
  if (!promo || promo.Promotion_discount <= 0) return false;
  if (!promo.Promotion_end) return true;
  return new Date(promo.Promotion_end) > new Date();
};

const EquipmentDetail = ({ user }) => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setEquipment(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return alert('กรุณาเข้าสู่ระบบก่อน');
    try {
      await axios.post('/api/cart', { equipment_id: id, qty: quantity }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('เพิ่มลงตะกร้าเรียบร้อย');
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  if (!equipment) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const discountedPrice = isPromoActive(equipment?.Promotion_id)
    ? equipment.equipment_price * (100 - equipment.Promotion_id.Promotion_discount) / 100
    : null;

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery Section */}
          <div className="bg-slate-50 flex flex-col h-full">
            {/* Main Image */}
            <div className="relative flex-1 min-h-[420px] lg:min-h-[460px] overflow-hidden group">
              {equipment.images?.length > 0 ? (
                <img
                  src={getImageUrl(equipment.images[selectedImage])}
                  alt={equipment.equipment_name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
              )}

              {/* Image counter */}
              {equipment.images?.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {selectedImage + 1} / {equipment.images.length}
                </div>
              )}

              {/* Nav arrows for multiple images */}
              {equipment.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => (prev - 1 + equipment.images.length) % equipment.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2.5 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => (prev + 1) % equipment.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2.5 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}

              {discountedPrice && (
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <div className="glass-dark text-white text-base font-bold px-6 py-2.5 rounded-full shadow-2xl z-10 animate-bounce">
                    คุ้มสุดๆ ลด {equipment.Promotion_id.Promotion_discount}%
                  </div>
                  {equipment.Promotion_id.Promotion_end && (
                    <div className="bg-rose-500/90 text-white text-sm font-bold px-5 py-2 rounded-full shadow-2xl z-10 backdrop-blur-md flex items-center gap-2 border border-white/20">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      หมดโปร: {new Date(equipment.Promotion_id.Promotion_end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {equipment.images?.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide bg-white border-t border-slate-100">
                {equipment.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-primary shadow-md scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img)} alt={`thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-10 lg:p-16 flex flex-col justify-center">
            <div className="mb-4">
              <span className="text-sm font-bold text-primary px-4 py-1.5 bg-primary/5 rounded-full uppercase tracking-widest">
                {equipment.Cat_id?.Cat_name || 'อุปกรณ์เบเกอรี่'}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              {equipment.equipment_name}
            </h1>

            <div className="mb-10">
              {discountedPrice ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-black text-rose-500 tracking-tighter">
                      {discountedPrice.toLocaleString()} <span className="text-2xl font-bold">฿</span>
                    </span>
                    <span className="text-2xl text-slate-300 line-through font-medium">
                      {equipment.equipment_price.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-rose-600 font-bold text-sm mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                    ประหยัดทันที {(equipment.equipment_price - discountedPrice).toLocaleString()} ฿
                  </div>
                </div>
              ) : (
                <span className="text-5xl font-black text-slate-900 tracking-tighter">
                  {equipment.equipment_price.toLocaleString()} <span className="text-2xl font-bold">฿</span>
                </span>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-10">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">รายละเอียดสินค้า</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-light">
                {equipment.equipment_description || 'อุปกรณ์เบเกอรี่คุณภาพสูงที่คัดสรรมาเพื่อคุณโดยเฉพาะ มั่นใจในคุณภาพและมาตรฐานระดับสากล'}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-10">
              <div className={`w-2.5 h-2.5 rounded-full ${equipment.equipment_stock > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
              <span className={`text-sm font-bold ${equipment.equipment_stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {equipment.equipment_stock > 0 ? `พร้อมส่งทันที (${equipment.equipment_stock} ชิ้น)` : 'สินค้าหมดชั่วคราว'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex items-center bg-white border-2 border-slate-100 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  disabled={quantity <= 1}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max={equipment.equipment_stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(equipment.equipment_stock, Math.max(1, Number(e.target.value))))}
                  className="w-16 text-center font-black text-xl text-slate-800 focus:outline-none bg-transparent"
                />
                <button
                  onClick={() => setQuantity(Math.min(equipment.equipment_stock, quantity + 1))}
                  className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  disabled={quantity >= equipment.equipment_stock}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
              </div>

              {user && user.role === 'admin' ? (
                <button
                  disabled
                  className="flex-1 bg-slate-100 text-slate-400 font-bold text-lg rounded-2xl px-8 py-4 border border-slate-200"
                >
                  แอดมินดูได้อย่างเดียว
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={equipment.equipment_stock < 1}
                  className="flex-1 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all disabled:bg-slate-200 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed px-10 py-4 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  เพิ่มลงตะกร้าเลย
                </button>
              )}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;