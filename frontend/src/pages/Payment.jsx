import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Payment = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('กรุณาเลือกไฟล์สลิป');

        const formData = new FormData();
        formData.append('slip', file);

        setLoading(true);
        try {
            await axios.post(`/api/orders/${id}/pay`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('แจ้งชำระเงินเรียบร้อย รอแอดมินตรวจสอบ');
            navigate('/orders');
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-16 px-6 animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-10 lg:p-14 text-white text-center">
                    <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter">แจ้งชำระเงิน</h1>
                    <p className="text-slate-400 font-light max-w-xs mx-auto text-sm leading-relaxed">
                        กรุณาโอนเงินตามยอดที่ระบุและอัปโหลดหลักฐานการโอนเพื่อให้ระบบตรวจสอบ
                    </p>
                </div>

                <div className="p-10 lg:p-14">
                    {/* Bank Info Card */}
                    <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-12 flex flex-col items-center border border-slate-100 relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 mb-8 transform group-hover:scale-105 transition-transform">
                            <img src="/qrcode.png" alt="QR Code" className="w-56 h-56 object-contain" />
                        </div>

                        <div className="text-center space-y-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-1 rounded-full border border-primary/10">ข้อมูลบัญชีธนาคาร</span>
                            <h2 className="text-2xl font-black text-slate-800 pt-2 tracking-tight">Kasikorn Bank (KBank)</h2>
                            <div className="flex items-center justify-center gap-3">
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">123-456-7890</p>
                                <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400" title="Copy Number">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                            <p className="text-slate-400 font-light">ชื่อบัญชี: บจก. เบเกอรี่ สโตร์</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">อัปโหลดสลิปการโอนเงิน</label>

                            <div className="group relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="slip-upload"
                                />
                                <label
                                    htmlFor="slip-upload"
                                    className={`cursor-pointer block border-4 border-dashed rounded-[2.5rem] transition-all p-1 items-center justify-center overflow-hidden
                    ${preview ? 'border-primary shadow-2xl shadow-primary/10' : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white'}
                  `}
                                >
                                    {preview ? (
                                        <div className="relative group/preview">
                                            <img src={preview} alt="Preview" className="w-full max-h-[400px] object-cover rounded-[2.2rem]" />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <span className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm tracking-widest uppercase">เปลี่ยนรูปสลิป</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-20 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <p className="text-slate-400 font-light text-sm">ลากไฟล์สลิปมาวาง หรือ <span className="text-primary font-bold">เลือกไฟล์</span></p>
                                            <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-2">รองรับ JPG, PNG, PDF</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className={`group relative w-full py-6 rounded-[2rem] font-black text-2xl transition-all shadow-2xl overflow-hidden active:scale-95 transform hover:-translate-y-1
                ${loading || !file
                                    ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200'
                                }
              `}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-4 uppercase tracking-tighter">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        กำลังดำเนินการ...
                                    </>
                                ) : (
                                    <>
                                        ยืนยันการชำระเงิน
                                        <svg className="w-8 h-8 opacity-50 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </>
                                )}
                            </span>
                            {!loading && file && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>}
                        </button>
                        <p className="text-center text-slate-300 text-xs font-light">
                            ระบบจะตรวจสอบยอดเงินภายใน 30 นาที
                        </p>
                    </form>
                </div>
            </div>

            <button
                onClick={() => navigate(`/orders/${id}`)}
                className="w-full mt-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition tracking-widest text-xs uppercase"
            >
                กลับไปหน้ารายละเอียดการสั่งซื้อ
            </button>
        </div>
    );
};

export default Payment;
