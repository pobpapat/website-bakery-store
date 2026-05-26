import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setUser({ id: res.data.id, role: res.data.role });
      alert('เข้าสู่ระบบสำเร็จ');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md relative">
        {/* Background blobs */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10 animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary-light/20 rounded-full blur-2xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/50 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/5 rounded-3xl mb-4">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-1.17-15.69c1.273.772 3.991 3.031 3.991 3.031l2.257-2.257m3.42 2.11C15.823 8.368 13 4 13 4s-2.823 4.368-4.748 7.784M15 11h3m-3-4h2m-6 4v.01M12 21c4.418 0 8-3.582 8-8V7l-8-4-8 4v6c0 4.418 3.582 8 8 8z" /></svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">ยินดีต้อนรับกลับมา</h2>
            <p className="text-slate-400 mt-2 font-light">เข้าสู่ระบบเพื่อจัดการความหวานของคุณ</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <p className="text-rose-600 text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">ชื่อผู้ใช้งาน</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งานของคุณ"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all group-hover:bg-slate-100"
                  required
                />
                <svg className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">รหัสผ่าน</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all group-hover:bg-slate-100"
                  required
                />
                <svg className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-5 rounded-2xl text-lg font-black hover:bg-primary-dark shadow-xl shadow-primary/30 transform hover:-translate-y-1 transition-all active:scale-95"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="text-center mt-8 text-slate-400">
            ยังไม่มีบัญชี? <a href="/register" className="text-primary font-black hover:underline ml-1">สมัครสมาชิก</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;