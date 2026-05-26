import { useState, useEffect } from 'react';
import axios from 'axios';

const statusMap = {
  pending: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700' },
  verifying: { label: 'รอตรวจสอบ', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-700' },
  shipped: { label: 'จัดส่งแล้ว', color: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'เสร็จสิ้น', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-600' },
};

// ---------- User Detail Modal ----------
const UserDetailModal = ({ userId, onClose, onDelete }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUserData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">รายละเอียดสมาชิก</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
          </div>
        ) : !userData ? (
          <p className="text-center text-red-500 py-12">ไม่พบข้อมูล</p>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Info */}
            <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-0.5">ชื่อผู้ใช้</p>
                <p className="font-bold text-slate-800">{userData.username}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">ชื่อ-นามสกุล</p>
                <p className="font-medium text-slate-700">{userData.name || ''} {userData.surname || ''}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">อีเมล</p>
                <p className="font-medium text-slate-700">{userData.email || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-0.5">เบอร์โทร</p>
                <p className="font-medium text-slate-700">{userData.phone || '-'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-400 text-xs mb-0.5">บทบาท</p>
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${userData.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                  {userData.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
                </span>
              </div>
              {/* Addresses */}
              {(userData.addresses?.length > 0 || userData.address) && (
                <div className="sm:col-span-2">
                  <p className="text-slate-400 text-xs mb-1">ที่อยู่จัดส่ง</p>
                  {(userData.addresses?.length > 0 ? userData.addresses : [userData.address]).map((addr, i) => (
                    <p key={i} className="font-medium text-slate-700 text-sm mb-1">
                      {i + 1}. {addr}
                    </p>
                  ))}
                </div>
              )}
              <div>
                <p className="text-slate-400 text-xs mb-0.5">สมัครเมื่อ</p>
                <p className="font-medium text-slate-700 text-xs">
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </p>
              </div>
            </div>

            {/* Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-700">ประวัติการสั่งซื้อ ({userData.orders?.length || 0} รายการ)</h3>
                <p className="text-sm font-semibold text-blue-600">
                  รวมทั้งหมด: {(userData.orders || []).reduce((s, o) => s + (o.order_total || 0), 0).toLocaleString()} ฿
                </p>
              </div>

              {userData.orders?.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6 bg-slate-50 rounded-xl">ยังไม่มีประวัติการสั่งซื้อ</p>
              ) : (
                <div className="space-y-2">
                  {userData.orders.map(order => {
                    const st = statusMap[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-600' };
                    const isOpen = expandedOrder === order._id;
                    return (
                      <div key={order._id} className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left"
                          onClick={() => setExpandedOrder(isOpen ? null : order._id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                            <span className="text-xs text-slate-400 font-mono">#{order._id.slice(-8)}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(order.order_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 text-sm">{order.order_total?.toLocaleString()} ฿</span>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="border-t border-slate-100 px-4 pb-4 pt-2 bg-slate-50">
                            {order.details?.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm py-1.5">
                                <span className="text-slate-700">{item.detailorder_name} <span className="text-slate-400">× {item.detailorder_qty}</span></span>
                                <span className="font-medium text-slate-700">{item.price_total?.toLocaleString()} ฿</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delete */}
            {userData.role !== 'admin' && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => onDelete(userData._id, userData.username)}
                  className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition"
                >
                  ลบสมาชิกนี้
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Main ManageUsers ----------
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(res.data);
    } catch { setError('ไม่สามารถโหลดข้อมูลได้'); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`ยืนยันการลบสมาชิก "${username}"?`)) return;
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSelectedId(null);
      fetchUsers();
    } catch { setError('เกิดข้อผิดพลาดในการลบ'); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    ((u.name || '') + ' ' + (u.surname || '')).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">รายชื่อสมาชิก</h1>
          <p className="text-slate-400 font-light">ตรวจสอบและจัดการสมาชิกที่ลงทะเบียนในระบบและสิทธิ์การเข้าใช้งาน</p>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          สมาชิกทั้งหมด <span className="font-black text-slate-900">{users.length}</span> ท่าน
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-shake">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Modern Search */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-4 mb-12">
        <div className="relative group">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาสมาชิกโดย: ชื่อผู้ใช้, ชื่อ-นามสกุล, หรืออีเมล..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-300"
          />
          <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-light italic">ไม่พบข้อมูลสมาชิกที่ค้นหา</div>
        ) : (
          filtered.map(u => (
            <div
              key={u._id}
              onClick={() => setSelectedId(u._id)}
              className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 font-black text-2xl group-hover:from-primary group-hover:to-primary-dark group-hover:text-white transition-all shadow-inner">
                  {(u.name || u.username || '?')[0]?.toUpperCase()}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${u.role === 'admin' ? 'bg-violet-50 text-violet-500 border-violet-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                  {u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกทั่วไป'}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors truncate">{u.username.toLowerCase()}</h3>
              <p className="text-sm text-slate-400 font-light truncate mt-1">{u.name || 'สมาชิก'} {u.surname || 'ทั่วไป'}</p>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white"></div>
                </div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                  ดูข้อมูลสมาชิก
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedId && (
        <UserDetailModal
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ManageUsers;