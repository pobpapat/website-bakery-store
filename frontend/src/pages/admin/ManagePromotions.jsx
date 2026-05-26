import { useState, useEffect } from 'react';
import axios from 'axios';

const ManagePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({ Promotion_name: '', Promotion_discount: '', Promotion_type: '', Promotion_condition: '', Promotion_start: '', Promotion_end: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get('/api/promotions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPromotions(res.data);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/promotions/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/promotions', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      fetchPromotions();
      setFormData({ Promotion_name: '', Promotion_type: '', Promotion_condition: '', Promotion_start: '', Promotion_end: '' });
      setEditingId(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (promo) => {
    setFormData({
      Promotion_name: promo.Promotion_name,
      Promotion_discount: promo.Promotion_discount || 0,
      Promotion_type: promo.Promotion_type || '',
      Promotion_condition: promo.Promotion_condition || '',
      Promotion_start: promo.Promotion_start ? promo.Promotion_start.split('T')[0] : '',
      Promotion_end: promo.Promotion_end ? promo.Promotion_end.split('T')[0] : ''
    });
    setEditingId(promo._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบ?')) return;
    try {
      await axios.delete(`/api/promotions/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchPromotions();
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">ระบบจัดการโปรโมชั่น</h1>
          <p className="text-slate-400 font-light">สร้างและจัดการกิจกรรมส่งเสริมการขายเพื่อเพิ่มยอดขายให้กับร้านของคุณ</p>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          โปรโมชั่นที่เปิดใช้งาน <span className="font-black text-slate-900">{promotions.length}</span> รายการ
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
            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            {editingId ? 'แก้ไขรายละเอียดโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-rose-500 transition-colors">ชื่อโปรโมชั่น</label>
              <input name="Promotion_name" value={formData.Promotion_name} onChange={handleChange} placeholder="เช่น ฉลองเปิดร้านใหม่ 2024" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all" required />
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-rose-500 transition-colors">ส่วนลด (%)</label>
              <input name="Promotion_discount" type="number" value={formData.Promotion_discount} onChange={handleChange} placeholder="0" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-mono text-center" required />
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-rose-500 transition-colors">ประเภทโปรโมชั่น</label>
              <input name="Promotion_type" value={formData.Promotion_type} onChange={handleChange} placeholder="เช่น Flash Sale, รายเดือน" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all" />
            </div>

            <div className="group lg:col-span-3">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-rose-500 transition-colors">เงื่อนไขโปรโมชั่น</label>
              <input name="Promotion_condition" value={formData.Promotion_condition} onChange={handleChange} placeholder="เช่น ใช้ได้เฉพาะหมวดเครื่องตีแป้ง..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all" />
            </div>

            <div className="group md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-rose-500 transition-colors">วันที่เริ่มใช้งาน</label>
              <input name="Promotion_start" type="date" value={formData.Promotion_start} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all cursor-pointer" />
            </div>

            <div className="group md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-rose-500 transition-colors">วันที่สิ้นสุด</label>
              <input name="Promotion_end" type="date" value={formData.Promotion_end} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all cursor-pointer" />
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-4 border-t border-slate-50">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setFormData({ Promotion_name: '', Promotion_discount: '', Promotion_type: '', Promotion_condition: '', Promotion_start: '', Promotion_end: '' }); }}
                className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                ยกเลิกการแก้ไข
              </button>
            )}
            <button
              type="submit"
              className={`px-12 py-5 rounded-[1.5rem] font-black text-sm tracking-widest uppercase transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl
                ${editingId ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'}
              `}
            >
              {editingId ? 'อัปเดตข้อมูลแคมเปญ' : 'เปิดตัวแคมเปญใหม่'}
            </button>
          </div>
        </form>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ข้อมูลแคมเปญ</th>
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ส่วนลด</th>
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ระยะเวลา</th>
                <th className="px-10 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {promotions.map(promo => {
                const isExpired = promo.Promotion_end && new Date(promo.Promotion_end) < new Date();
                return (
                  <tr key={promo._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8">
                      <div>
                        <h4 className={`text-xl font-black tracking-tight group-hover:text-rose-500 transition-colors ${isExpired ? 'text-slate-300' : 'text-slate-800'}`}>
                          {promo.Promotion_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                            {promo.Promotion_type || 'Standard'}
                          </span>
                          {isExpired && (
                            <span className="text-[10px] font-black bg-rose-50 text-rose-400 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
                              หมดอายุ / ปิดใช้งาน
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-black tracking-tighter ${isExpired ? 'text-slate-300' : 'text-rose-500'}`}>
                          {promo.Promotion_discount}%
                        </span>
                        <div className="text-[10px] font-black text-slate-300 uppercase leading-none">Off<br />Yield</div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`space-y-1 font-mono text-xs ${isExpired ? 'text-slate-300' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          </span>
                          {promo.Promotion_start ? new Date(promo.Promotion_start).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                          </span>
                          {promo.Promotion_end ? new Date(promo.Promotion_end).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(promo)} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-amber-500 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-100 rounded-2xl transition-all active:scale-90" title="Revise Campaign">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(promo._id)} className="p-4 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-500 hover:shadow-xl hover:shadow-rose-100 rounded-2xl transition-all active:scale-90" title="Terminate Campaign">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePromotions;