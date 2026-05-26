import { useState, useEffect } from 'react';
import axios from 'axios';

const FIELD_LABELS = {
  name: 'ชื่อ',
  surname: 'นามสกุล',
  phone: 'เบอร์โทรศัพท์',
  email: 'อีเมล',
};

const InputField = ({ label, name, value, onChange, type = 'text', required }) => (
  <div className="group">
    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all group-hover:bg-slate-100 placeholder:text-slate-300 font-light"
    />
  </div>
);

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({ name: '', surname: '', phone: '', email: '' });
  const [addresses, setAddresses] = useState(['']);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const { name, surname, phone, email, addresses: addrs, address, updatedAt: ua } = res.data;
        setFormData({ name: name || '', surname: surname || '', phone: phone || '', email: email || '' });
        // ใช้ addresses array ถ้ามี ไม่งั้น fallback จาก address เดิม
        const addrList = Array.isArray(addrs) && addrs.length > 0 ? addrs : (address ? [address] : ['']);
        setAddresses(addrList);
        setUpdatedAt(ua);
      } catch (err) {
        setError('โหลดข้อมูลไม่สำเร็จ');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddressChange = (idx, value) => {
    const updated = [...addresses];
    updated[idx] = value;
    setAddresses(updated);
  };

  const addAddress = () => setAddresses([...addresses, '']);

  const removeAddress = (idx) => {
    if (addresses.length <= 1) return;
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await axios.put('/api/users/profile', { ...formData, addresses }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('บันทึกข้อมูลสำเร็จ');
      setUpdatedAt(res.data.updatedAt);
      setUser({ ...user, ...formData });
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = (e) => setPwData({ ...pwData, [e.target.name]: e.target.value });

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');
    if (pwData.newPassword !== pwData.confirmPassword) {
      return setPwError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
    }
    if (pwData.newPassword.length < 6) {
      return setPwError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
    }
    setPwSaving(true);
    try {
      await axios.put('/api/users/change-password',
        { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPwMessage('เปลี่ยนรหัสผ่านสำเร็จ');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMessage(''), 4000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">บัญชีของฉัน</h1>
          {updatedAt && (
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-light">
                แก้ไขเมื่อ:{' '}
                <span className="font-bold text-slate-500">
                  {new Date(updatedAt).toLocaleString('th-TH', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
            {formData.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xs font-black text-primary uppercase tracking-widest">เข้าสู่ระบบในชื่อ</p>
            <p className="text-lg font-bold text-slate-700">{formData.name} {formData.surname}</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        {/* Profile Form Section */}
        <div className="w-full">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              <p className="text-rose-600 text-sm font-bold">{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <p className="text-emerald-600 text-sm font-bold">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">1</div>
                ข้อมูลส่วนตัว
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="ชื่อ" name="name" value={formData.name} onChange={handleChange} required />
                <InputField label="นามสกุล" name="surname" value={formData.surname} onChange={handleChange} required />
                <InputField label="เบอร์โทรศัพท์" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                <InputField label="อีเมล" name="email" value={formData.email} onChange={handleChange} type="email" required />
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">2</div>
                ที่อยู่สำหรับการจัดส่ง
              </h2>
              <p className="text-sm text-slate-400 mb-8 ml-11 font-light italic">
                * ที่อยู่ลำดับแรกจะถูกใช้เป็นที่อยู่หลักสำหรับการจัดส่งสินค้า
              </p>

              <div className="space-y-6">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="relative group">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        ที่อยู่ {idx + 1}
                        {idx === 0 && <span className="text-[10px] text-primary font-black bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">ที่อยู่หลัก</span>}
                      </label>
                      {addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(idx)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                    <textarea
                      value={addr}
                      onChange={(e) => handleAddressChange(idx, e.target.value)}
                      placeholder="ระบุ บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์..."
                      rows={3}
                      required={idx === 0}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none group-hover:bg-slate-100 placeholder:text-slate-300 font-light"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAddress}
                  className="flex items-center gap-2 text-sm font-black text-primary hover:text-primary-dark transition-all px-2"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  เพิ่มที่อยู่ใหม่
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-primary shadow-2xl shadow-slate-200 transition-all disabled:opacity-50 active:scale-[0.98] transform hover:-translate-y-1"
            >
              {saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </form>

          {/* Change Password Section */}
          <form onSubmit={handlePwSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 mt-6">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">3</div>
                เปลี่ยนรหัสผ่าน
              </h2>
              <p className="text-sm text-slate-400 ml-11 font-light italic">* ปล่อยว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
            </div>

            {pwError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <p className="text-rose-600 text-sm font-bold">{pwError}</p>
              </div>
            )}
            {pwMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <p className="text-emerald-600 text-sm font-bold">{pwMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current Password */}
              {[{ key: 'current', name: 'currentPassword', label: 'รหัสผ่านปัจจุบัน', required: true },
                { key: 'new', name: 'newPassword', label: 'รหัสผ่านใหม่', required: true },
                { key: 'confirm', name: 'confirmPassword', label: 'ยืนยันรหัสผ่านใหม่', required: true }]
                .map(({ key, name, label, required }) => (
                  <div key={key} className="group">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-primary transition-colors">
                      {label} {required && <span className="text-rose-500">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        name={name}
                        type={showPw[key] ? 'text' : 'password'}
                        value={pwData[name]}
                        onChange={handlePwChange}
                        required={required}
                        placeholder="••••••••"
                        className="w-full px-6 py-4 pr-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 text-base focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all group-hover:bg-slate-100 placeholder:text-slate-300 font-light"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                        tabIndex={-1}
                      >
                        {showPw[key] ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <button
              type="submit"
              disabled={pwSaving}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-dark shadow-2xl shadow-primary/20 transition-all disabled:opacity-50 active:scale-[0.98] transform hover:-translate-y-1"
            >
              {pwSaving ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;