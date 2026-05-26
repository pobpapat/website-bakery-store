import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    surname: '',
    address: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', formData);
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  return (
    <div className="py-16 px-6 animate-fade-in flex items-center justify-center min-h-[90vh]">
      <div className="w-full max-w-2xl relative">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 lg:p-14 border border-white relative overflow-hidden">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">สมัครสมาชิกใหม่</h2>
            <p className="text-slate-500 text-lg">เริ่มต้นสร้างสรรค์เมนูโปรดของคุณไปกับเรา</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[1.5rem] flex items-center gap-4 animate-shake">
              <svg className="w-6 h-6 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <p className="text-rose-600 text-sm font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">ชื่อผู้ใช้งาน</label>
                <input name="username" value={formData.username} onChange={handleChange} placeholder="ระบุชื่อผู้ใช้งาน" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">รหัสผ่าน</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">ชื่อ</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="สมชาย" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
              </div>
            </div>

            <div className="space-y-6">

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">เบอร์โทรศัพท์</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="08x-xxx-xxxx" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
              </div>

              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">อีเมล</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="somchai@mail.com" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
              </div>
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">นามสกุล</label>
                <input name="surname" value={formData.surname} onChange={handleChange} placeholder="รักการอบ" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" required />
              </div>
            </div>

            <div className="md:col-span-2 group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">ที่อยู่สำหรับการจัดส่ง</label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="ระบุ บ้านเลขที่, ถนน, แขวง/ตำบล..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none" rows="3" required />
            </div>

            <button type="submit" className="md:col-span-2 bg-slate-900 text-white py-5 rounded-[1.5rem] text-xl font-black hover:bg-emerald-600 shadow-2xl shadow-slate-200 transform hover:-translate-y-1 transition-all active:scale-95 mt-4">
              ยืนยันการสมัครสมาชิก
            </button>
          </form>

          <p className="text-center mt-10 text-slate-400">
            มีบัญชีอยู่แล้ว? <a href="/login" className="text-primary font-black hover:underline ml-1">เข้าสู่ระบบ</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;