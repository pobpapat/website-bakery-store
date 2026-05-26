import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [Cat_name, setCat_name] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCategories(res.data);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/categories/${editingId}`, { Cat_name }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/categories', { Cat_name }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      fetchCategories();
      setCat_name('');
      setEditingId(null);
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (cat) => {
    setCat_name(cat.Cat_name);
    setEditingId(cat._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบ?')) return;
    try {
      await axios.delete(`/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">หมวดหมู่สินค้า</h1>
        <p className="text-slate-400 font-light">บริหารจัดการประเภทของสินค้าทั้งหมดในระบบ</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-shake">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Entry Form */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full group">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">ชื่อของหมวดหมู่</label>
            <input
              value={Cat_name}
              onChange={(e) => setCat_name(e.target.value)}
              placeholder="เช่น อุปกรณ์อบขนม, วัตถุดิบคุณภาพสูง..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
              required
            />
          </div>
          <button
            type="submit"
            className={`whitespace-nowrap px-10 py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl
              ${editingId ? 'bg-amber-500 text-white shadow-amber-200 hover:bg-amber-600' : 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark'}
            `}
          >
            {editingId ? 'อัปเดตข้อมูล' : 'เพิ่มหมวดหมู่ใหม่'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setCat_name(''); }}
              className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              ยกเลิก
            </button>
          )}
        </form>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-left text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ชื่อหมวดหมู่ที่ลงทะเบียน</th>
                <th className="px-10 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-[0.2em]">การจัดการระบบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((cat, idx) => (
                <tr key={cat._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <span className="text-xl font-black text-slate-800 tracking-tight">{cat.Cat_name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-amber-500 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-100 rounded-xl transition-all active:scale-90"
                        title="Edit Classification"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-500 hover:shadow-lg hover:shadow-rose-100 rounded-xl transition-all active:scale-90"
                        title="Remove Classification"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div className="p-20 text-center">
            <svg className="w-16 h-16 text-slate-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-slate-300 font-light italic">No categories registered yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;