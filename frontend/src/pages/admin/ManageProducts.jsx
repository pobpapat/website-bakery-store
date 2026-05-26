import { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../../utils/getImageUrl';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    equipment_name: '',
    equipment_price: '',
    equipment_description: '',
    Cat_id: '',
    Promotion_id: '',
    equipment_stock: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, promoRes] = await Promise.all([
        axios.get('/api/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('/api/promotions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      const activePromotions = promoRes.data.filter(p => {
        if (!p.Promotion_end) return true;
        return new Date(p.Promotion_end) > new Date();
      });
      setPromotions(activePromotions);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    for (let file of imageFiles) data.append('images', file);
    for (let imgName of deletedImages) data.append('deletedImages', imgName);

    try {
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/products', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchData();
      setFormData({ equipment_name: '', equipment_price: '', equipment_description: '', Cat_id: '', Promotion_id: '', equipment_stock: '' });
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);
      setDeletedImages([]);
      setEditingId(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      equipment_name: product.equipment_name,
      equipment_price: product.equipment_price,
      equipment_description: product.equipment_description || '',
      Cat_id: product.Cat_id?._id || '',
      Promotion_id: product.Promotion_id?._id || '',
      equipment_stock: product.equipment_stock
    });
    setExistingImages(product.images || []);
    setDeletedImages([]);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(product._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบ?')) return;
    try {
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">จัดการสินค้า</h1>
          <p className="text-slate-400 font-light">จัดการสต็อกและข้อมูลสินค้าอุปกรณ์เบเกอรี่ของคุณ</p>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          สินค้าทั้งหมด <span className="font-black text-slate-900">{products.length}</span> รายการ
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-shake">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Entry Form */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden mb-16">
        <div className="p-8 lg:p-12 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            {editingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group lg:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">ชื่อสินค้า</label>
              <input name="equipment_name" value={formData.equipment_name} onChange={handleChange} placeholder="เช่น เครื่องตีแป้งมือโปร 5 ลิตร" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">ราคาสินค้า (฿)</label>
              <input name="equipment_price" type="number" value={formData.equipment_price} onChange={handleChange} placeholder="0.00" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono" required />
            </div>

            <div className="group lg:col-span-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">รายละเอียดสินค้า</label>
              <textarea name="equipment_description" value={formData.equipment_description} onChange={handleChange} placeholder="ระบุขนาด วัสดุ และจุดเด่นของสินค้า..." className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all h-32 resize-none leading-relaxed font-light" />
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">หมวดหมู่</label>
              <select name="Cat_id" value={formData.Cat_id} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer" required>
                <option value="">เลือกหมวดหมู่สินค้า</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.Cat_name}</option>)}
              </select>
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">โปรโมชั่นที่ใช้งาน</label>
              <select name="Promotion_id" value={formData.Promotion_id} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer">
                <option value="">ไม่มีโปรโมชั่น</option>
                {promotions.map(promo => (
                  <option key={promo._id} value={promo._id}>
                    {promo.Promotion_name} (-{promo.Promotion_discount}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">สต็อกสินค้า</label>
              <input name="equipment_stock" type="number" value={formData.equipment_stock} onChange={handleChange} placeholder="ระบุจำนวนชิ้น" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-center" required />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">รูปภาพสินค้าประกอบ</label>

            {/* Existing Images (when editing) */}
            {editingId && existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 mb-3">รูปภาพปัจจุบัน ({existingImages.length} รูป) — อัปโหลดรูปใหม่เพื่อแทนที่</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group/img aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={getImageUrl(img)} alt={`รูปที่ ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setDeletedImages(prev => [...prev, img]);
                            setExistingImages(prev => prev.filter(e => e !== img));
                          }}
                          className="bg-rose-500 text-white rounded-full p-2 shadow-lg hover:bg-rose-600 transition-colors transform hover:scale-110"
                          title="ลบรูปภาพเก่า"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="relative group/upload">
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="product-images" />
              <label htmlFor="product-images" className="cursor-pointer block border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 hover:bg-white hover:border-primary transition-all p-12 text-center overflow-hidden">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mx-auto mb-6 group-hover/upload:scale-110 group-hover/upload:text-primary transition-all">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-400 font-light text-sm">
                  {imageFiles.length > 0 ? (
                    <span className="text-primary font-black uppercase tracking-widest">เลือกไปแล้ว {imageFiles.length} รูป</span>
                  ) : (
                    <>ลากไฟล์มาวางที่นี่ หรือ <span className="text-primary font-bold">อัปโหลดรูปภาพ (เลือกได้หลายรูป)</span></>
                  )}
                </p>
              </label>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 mb-3">ตัวอย่างรูปที่จะอัปโหลด ({imagePreviews.length} รูป)</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group/prev aspect-square rounded-2xl overflow-hidden border-2 border-primary/30 shadow-sm">
                      <img src={src} alt={`preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = imageFiles.filter((_, i) => i !== idx);
                            const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                            setImageFiles(newFiles);
                            setImagePreviews(newPreviews);
                          }}
                          className="bg-rose-500 text-white rounded-full p-1.5 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-slate-50">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setFormData({ equipment_name: '', equipment_price: '', equipment_description: '', Cat_id: '', Promotion_id: '', equipment_stock: '' }); setImageFiles([]); setImagePreviews([]); setExistingImages([]); setDeletedImages([]); }}
                className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                ยกเลิกการแก้ไข
              </button>
            )}
            <button
              type="submit"
              className={`px-12 py-5 rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl
                ${editingId ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark'}
              `}
            >
              {editingId ? 'อัปเดตข้อมูลสินค้า' : 'เพิ่มสินค้าเข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Search Bar */}
        <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/30">
          <div className="relative max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่ออุปกรณ์..."
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ข้อมูลสินค้า</th>
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ราคา</th>
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">สต็อก</th>
                <th className="px-10 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.filter(p => p.equipment_name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{p.equipment_name}</h4>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest mt-2 inline-block border border-slate-100">
                        {p.Cat_id?.Cat_name || 'ไม่ระบุหมวดหมู่'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div>
                      <p className="text-xl font-black text-slate-900 tracking-tighter">{p.equipment_price.toLocaleString()} <span className="text-sm font-bold">฿</span></p>
                      {p.Promotion_id && p.Promotion_id.Promotion_discount > 0 &&
                        (!p.Promotion_id.Promotion_end || new Date(p.Promotion_id.Promotion_end) > new Date()) && (
                          <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">
                            โปรโมชั่น: {p.Promotion_id.Promotion_name}
                          </p>
                        )}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${p.equipment_stock <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                      <span className={`font-mono text-lg font-black ${p.equipment_stock <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                        {p.equipment_stock} <span className="text-xs font-light text-slate-300">ชิ้น</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleEdit(p)} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-amber-500 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-100 rounded-2xl transition-all active:scale-90" title="Modify Product">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-500 hover:shadow-xl hover:shadow-rose-100 rounded-2xl transition-all active:scale-90" title="Delete Merchandise">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;