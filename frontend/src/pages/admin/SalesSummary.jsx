import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// helper: แปลง "YYYY-MM-DD" หรือ "YYYY-MM" หรือ "YYYY" ให้อ่านได้ภาษาไทย
const formatPeriodLabel = (id, type) => {
  if (type === 'day') {
    const d = new Date(id + 'T00:00:00');
    return d.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (type === 'month') {
    const [y, m] = id.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
  }
  if (type === 'year') {
    return `ปี ${Number(id) + 543}`;
  }
  return id;
};

const typeOptions = [
  { value: 'day', label: 'รายวัน' },
  { value: 'month', label: 'รายเดือน' },
  { value: 'year', label: 'รายปี' },
];

const SalesSummary = () => {
  const [summary, setSummary] = useState([]);
  const [type, setType] = useState('day');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [type]);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ type });
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      const res = await axios.get(`/api/sales/summary?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSummary(res.data);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSummary();
  };

  const clearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setTimeout(() => fetchSummary(), 0);
  };

  const grandTotalAll = summary.reduce((s, p) => s + (p.grandTotal || 0), 0);
  const totalQty = summary.reduce((s, p) => s + p.products.reduce((ps, pr) => ps + pr.quantity, 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">สรุปยอดขาย</h1>
          <p className="text-slate-400 font-light">วิเคราะห์ข้อมูลรายได้อย่างละเอียดและประสิทธิภาพของสินค้าแต่ละรายการ</p>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <span className="font-black text-slate-900">{summary.length}</span> ช่วงเวลาที่รายงาน
        </div>
      </div>

      {/* Modern Analytics Hub */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 lg:p-12 mb-12">
        <form onSubmit={handleSearch} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">ช่วงเวลาที่ต้องการตรวจสอบ</label>
              <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
                {typeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === opt.value
                      ? 'bg-white text-primary shadow-xl shadow-primary/10 border border-slate-100 scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-600'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 group-focus-within:text-primary transition-colors">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1 group-focus-within:text-primary transition-colors">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-slate-50">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              เชื่อมต่อข้อมูลล่าสุดจากระบบแล้ว
            </div>
            <div className="flex gap-4">
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={clearFilter}
                  className="px-8 py-4 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  ล้างตัวกรอง
                </button>
              )}
              <button
                type="submit"
                className="px-12 py-4 bg-primary text-white hover:bg-primary-dark rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95"
              >
                เริ่มการประมวลผล
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-12 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold animate-shake">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {loading && (
        <div className="py-32 flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-8 border-slate-100 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">กำลังประมวลผลข้อมูลการขาย...</p>
        </div>
      )}

      {/* Analytics Feed */}
      {!loading && (
        <div className="space-y-12">
          {summary.length === 0 ? (
            <div className="py-32 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
              <p className="text-slate-400 font-light italic text-xl">ไม่พบข้อมูลการขายในช่วงเวลาที่เลือกระบุ</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 lg:p-12 mb-12">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-8">กราฟสรุปยอดขาย (รายได้สุทธิ)</h3>
                <div className="h-96 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...summary].reverse().map(p => ({ ...p, label: formatPeriodLabel(p._id, type) }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => value.toLocaleString()} />
                      <Tooltip 
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value.toLocaleString()} ฿`, 'รายได้สุทธิ']}
                      />
                      <Bar dataKey="grandTotal" name="รายได้สุทธิ" fill="#0ea5e9" radius={[8, 8, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {summary.map(period => (
                <div key={period._id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group">
                  <div className="p-8 lg:p-12 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">ช่วงเวลาประกอบการ</p>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-primary transition-colors">
                      {formatPeriodLabel(period._id, type)}
                    </h2>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">ยอดขายรวม</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter">
                      {period.products.reduce((s, p) => s + p.quantity, 0).toLocaleString()} <span className="text-lg">ชิ้น</span>
                    </p>
                  </div>
                </div>

                <div className="p-8 lg:p-12 bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รายการสินค้า</th>
                        <th className="pb-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">จำนวนชิ้น</th>
                        <th className="pb-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รายได้สุทธิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...period.products]
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-6 text-slate-800 font-bold group-hover/row:text-primary transition-colors">{p.name}</td>
                            <td className="py-6 text-slate-500 font-mono text-right">{p.quantity.toLocaleString()}</td>
                            <td className="py-6 text-slate-800 font-black text-right">{p.revenue.toLocaleString()} <span className="text-slate-400 font-light">฿</span></td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="pt-8 text-right text-sm font-black text-slate-400 uppercase tracking-widest">ยอดรวมประจำช่วงเวลา</td>
                        <td className="pt-8 text-right text-3xl font-black text-primary tracking-tighter italic">
                          {period.grandTotal.toLocaleString()} <span className="text-lg">฿</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              ))}
            </>
          )}

          {/* Master Dashboard Footer */}
          {summary.length > 0 && (
            <div className="mt-20 relative p-12 lg:p-16 rounded-[4rem] bg-slate-900 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-2xl text-primary border border-primary/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </span>
                    <p className="text-xs font-black text-primary uppercase tracking-[0.3em]">รายงานสรุปผลประกอบการรวม</p>
                  </div>
                  <h2 className="text-6xl font-black text-white tracking-tighter mb-4 italic">
                    {grandTotalAll.toLocaleString()} <span className="text-3xl text-slate-500 ml-2">฿</span>
                  </h2>
                  {(dateFrom || dateTo) && (
                    <p className="text-slate-400 font-light text-sm italic">
                      ช่วงเวลาที่แสดง: {dateFrom ? new Date(dateFrom).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'เริ่มต้น'} ถึง {dateTo ? new Date(dateTo).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'ปัจจุบัน'}
                    </p>
                  )}
                </div>
                <div className="lg:text-right">
                  <div className="inline-block p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">จำนวนสินค้าที่ขายได้ทั้งหมด</p>
                    <p className="text-4xl font-black text-white tracking-tighter mb-1">{totalQty.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 font-light">รายการสินค้าที่ประมวลผลจาก {summary.length} ช่วงเวลา</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesSummary;
