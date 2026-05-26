import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';

const statusMap = {
    pending: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700' },
    verifying: { label: 'รอตรวจสอบ', color: 'bg-blue-100 text-blue-700' },
    paid: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-700' },
    shipped: { label: 'กำลังจัดส่ง', color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'ส่งถึงแล้ว', color: 'bg-green-100 text-green-700' },
    completed: { label: 'เสร็จสิ้น', color: 'bg-emerald-100 text-emerald-700' },
    cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-600' },
    claim_pending: { label: 'กำลังเคลม', color: 'bg-yellow-100 text-yellow-700' },
    claim_approved: { label: 'เคลมอนุมัติ', color: 'bg-purple-100 text-purple-700' },
    claim_shipped: { label: 'ส่งของเคลม', color: 'bg-indigo-100 text-indigo-700' },
    claim_completed: { label: 'เคลมสำเร็จ', color: 'bg-emerald-100 text-emerald-700' },
    claim_rejected: { label: 'เคลมปฏิเสธ', color: 'bg-orange-100 text-orange-700' },
};

const REASON_MAP = {
    damaged: 'สินค้าเสียหาย/ชำรุด',
    wrong_item: 'ได้รับสินค้าผิด',
    incomplete: 'ของไม่ครบ/ขาดหาย',
};

// ─── Sub-component: แสดง badge สถานะเคลม ────────────────────────────────────
const ClaimBadge = ({ status }) => {
    const cfg = {
        pending: { label: 'รอตรวจสอบ', cls: 'bg-blue-100 text-blue-700' },
        approved: { label: 'อนุมัติแล้ว', cls: 'bg-purple-100 text-purple-700' },
        rejected: { label: 'ปฏิเสธแล้ว', cls: 'bg-red-100 text-red-700' },
    }[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
            {cfg.label}
        </span>
    );
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSlip, setShowSlip] = useState(false);
    const [enlargedImg, setEnlargedImg] = useState(null);

    // Claim states
    const [existingClaims, setExistingClaims] = useState([]);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimForm, setClaimForm] = useState({
        equipment_id: '',
        claim_product_name: '',
        claim_reason: 'damaged',
        claim_detail: '',
        claim_qty: 1,
        claim_image: null,
    });
    const [claimLoading, setClaimLoading] = useState(false);
    const [claimMsg, setClaimMsg] = useState('');

    const fetchOrder = async () => {
        try {
            const res = await axios.get(`/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOrder(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyClaims = async () => {
        try {
            const res = await axios.get('/api/claims/my', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // กรองเอาเฉพาะข้อมูลเคลมที่เป็นของออเดอร์นี้
            const orderClaims = res.data.filter(c =>
                (c.order_id?._id === id) || (c.order_id === id)
            );
            setExistingClaims(orderClaims || []);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchOrder();
        fetchMyClaims();
    }, [id]);

    // คำนวณวันที่เหลือสำหรับเคลม (7 วันจากวันรับสินค้า)
    const claimDeadlineInfo = (() => {
        if (!order?.order_delivered_at) return null;
        const delivered = new Date(order.order_delivered_at).getTime();
        const deadline = delivered + 7 * 24 * 60 * 60 * 1000;
        const diffMs = deadline - Date.now();
        if (diffMs <= 0) return { expired: true, daysLeft: 0 };
        return { expired: false, daysLeft: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) };
    })();

    const canClaim = order?.order_status === 'delivered'
        && claimDeadlineInfo
        && !claimDeadlineInfo.expired;

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        setClaimLoading(true);
        setClaimMsg('');
        try {
            const fd = new FormData();
            fd.append('order_id', order._id);
            fd.append('equipment_id', claimForm.equipment_id);
            fd.append('claim_product_name', claimForm.claim_product_name);
            fd.append('claim_reason', claimForm.claim_reason);
            fd.append('claim_detail', claimForm.claim_detail);
            fd.append('claim_qty', claimForm.claim_qty);
            if (claimForm.claim_image) fd.append('claim_image', claimForm.claim_image);

            await axios.post('/api/claims', fd, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsClaiming(false);
            setClaimForm({
                equipment_id: '',
                claim_product_name: '',
                claim_reason: 'damaged',
                claim_detail: '',
                claim_qty: 1,
                claim_image: null,
            });
            await fetchMyClaims();
            await fetchOrder();
        } catch (err) {
            setClaimMsg(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setClaimLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">กำลังโหลด...</div>;
    if (!order) return <div className="text-center py-20">ไม่พบข้อมูลคำสั่งซื้อ</div>;

    const status = statusMap[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-600' };

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <button onClick={() => navigate('/orders')} className="mb-6 text-blue-600 hover:underline">
                &larr; กลับไปที่ประวัติการสั่งซื้อ
            </button>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b flex justify-between items-start bg-gray-50/50">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">รายละเอียดคำสั่งซื้อ</h1>
                        <p className="text-sm text-gray-400 font-mono mt-1">#{order._id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm ${status.color}`}>
                        {status.label}
                    </span>
                </div>

                <div className="p-8 space-y-8">
                    {/* Claim deadline banner */}
                    {order.order_status === 'delivered' && claimDeadlineInfo && existingClaims.length === 0 && (
                        <div className={`px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-sm ${claimDeadlineInfo.expired
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}>
                            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {claimDeadlineInfo.expired
                                ? 'หมดระยะเวลาเคลมสินค้าแล้ว (เกิน 7 วันนับจากวันรับสินค้า)'
                                : `เหลือเวลาเคลมสินค้า ${claimDeadlineInfo.daysLeft} วัน`}
                        </div>
                    )}

                    {/* Shipping & Payment info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 border rounded-xl p-5">
                            <h3 className="font-black text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                ที่อยู่จัดส่ง
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-gray-800">{order.order_name}</p>
                                <p className="text-sm text-gray-600">{order.order_phone}</p>
                                <p className="text-sm text-gray-600 mt-2">{order.order_address}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 border rounded-xl p-5">
                            <h3 className="font-black text-gray-700 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                ข้อมูลการชำระเงิน
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600"><span className="text-gray-400">วันที่สั่งซื้อ:</span> {new Date(order.order_date).toLocaleString('th-TH')}</p>
                                <p className="text-sm text-gray-600"><span className="text-gray-400">สถานะ:</span> {status.label}</p>
                                {order.order_delivered_at && (
                                    <p className="text-sm text-teal-700 font-semibold">
                                        วันที่รับสินค้า: {new Date(order.order_delivered_at).toLocaleString('th-TH')}
                                    </p>
                                )}
                                {order.slip && (
                                    <button
                                        onClick={() => setShowSlip(true)}
                                        className="mt-2 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        ดูหลักฐานการโอนเงิน
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order items table */}
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4 text-left">สินค้า</th>
                                    <th className="p-4 text-center">จำนวน</th>
                                    <th className="p-4 text-right">ราคา</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.details?.map((item, idx) => {
                                    const hasDiscount = item.equipment_discount && item.equipment_discount > 0;
                                    const fullPrice = item.equipment_price * item.detailorder_qty;
                                    const discountAmount = hasDiscount
                                        ? Math.round(fullPrice * (item.equipment_discount / 100))
                                        : 0;
                                    
                                    // ค้นหาข้อมูลเคลมของสินค้าชิ้นนี้
                                    const itemClaim = existingClaims.find(c => c._id === item._id);

                                    return (
                                        <tr key={idx} className={itemClaim ? 'bg-amber-50/30' : ''}>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{item.detailorder_name}</div>
                                                {itemClaim && (
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <ClaimBadge status={itemClaim.claim_status} />
                                                        <span className="text-[10px] text-amber-600 font-bold">
                                                            เคลมเฉพาะรายการนี้ ({itemClaim.claim_qty} ชิ้น)
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">{item.detailorder_qty}</td>
                                            <td className="p-4 text-right">
                                                {hasDiscount ? (
                                                    <div>
                                                        <p className="text-gray-400 line-through text-xs">{fullPrice.toLocaleString()} ฿</p>
                                                        <p className="text-red-500 text-xs font-semibold">
                                                            ลด {item.equipment_discount}% (-{discountAmount.toLocaleString()} ฿)
                                                        </p>
                                                        <p className="font-bold text-gray-900">{item.price_total?.toLocaleString()} ฿</p>
                                                    </div>
                                                ) : (
                                                    <p className="font-bold text-gray-900">{item.price_total?.toLocaleString()} ฿</p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-xl shadow-md">
                        <span className="text-lg font-medium">รวมยอดเงินทั้งสิ้น</span>
                        <span className="text-3xl font-black">{order.order_total?.toLocaleString()} ฿</span>
                    </div>

                    {/* ══════════════════════════════════════════════
                        ── ส่วนเคลมสินค้า (Inline) ──
                    ══════════════════════════════════════════════ */}
                    <div className="border-t border-gray-200 pt-8 mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                ข้อมูลการเคลมสินค้า
                            </h2>
                        </div>

                        {/* กรณีมีเคลมแล้ว แสดงข้อมูล (แสดงเป็น List ของสินค้าที่เคลมทั้งหมด) */}
                        {existingClaims.length > 0 ? (
                            <div className="space-y-4">
                                {existingClaims.map((claim, cIdx) => (
                                    <div key={cIdx} className={`p-6 rounded-2xl border shadow-sm ${claim.claim_status === 'pending'
                                            ? 'bg-amber-50 border-amber-200'
                                            : claim.claim_status === 'approved'
                                                ? 'bg-purple-50 border-purple-200'
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-extrabold text-gray-800 text-lg">{claim.claim_product_name}</p>
                                                <p className="text-sm font-medium text-gray-600 mt-1">
                                                    เหตุผล: {REASON_MAP[claim.claim_reason]} · จำนวนที่เคลม {claim.claim_qty} ชิ้น
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ยื่นเคลมเมื่อ: {new Date(claim.claim_date).toLocaleDateString('th-TH')}
                                                </p>
                                            </div>
                                            <ClaimBadge status={claim.claim_status} />
                                        </div>

                                        {claim.claim_detail && (
                                            <div className="bg-white/80 rounded-xl px-4 py-3 border border-white text-sm text-gray-700 mb-4 shadow-sm">
                                                {claim.claim_detail}
                                            </div>
                                        )}

                                        {claim.claim_image && (
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-gray-500 mb-2">รูปหลักฐาน:</p>
                                                <img
                                                    src={getImageUrl(claim.claim_image)}
                                                    alt="หลักฐานเคลม"
                                                    className="max-h-32 rounded-xl border shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => setEnlargedImg(getImageUrl(claim.claim_image))}
                                                />
                                            </div>
                                        )}

                                        {claim.claim_status !== 'pending' && (
                                            <div className={`rounded-xl px-4 py-3 text-sm flex gap-3 ${claim.claim_status === 'approved'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                <span className="text-xl">
                                                    {claim.claim_status === 'approved' ? '✅' : '❌'}
                                                </span>
                                                <div>
                                                    <p className="font-bold">
                                                        {claim.claim_status === 'approved'
                                                            ? 'อนุมัติแล้ว — เราจะดำเนินการส่งสินค้าทดแทนให้คุณ'
                                                            : 'คำร้องเคลมถูกปฏิเสธ'}
                                                    </p>
                                                    {claim.admin_note && (
                                                        <p className="mt-1 font-medium bg-white/50 inline-block px-2 py-1 rounded">
                                                            หมายเหตุ: {claim.admin_note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {canClaim && !isClaiming && (
                                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                                        <button
                                            onClick={() => { setClaimMsg(''); setIsClaiming(true); }}
                                            className="text-amber-600 font-bold hover:underline text-sm"
                                        >
                                            + แจ้งเคลมสินค้าชิ้นอื่นเพิ่ม
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : canClaim ? (
                            /* กรณียังไม่เคลม และเข้าเงื่อนไขเคลมได้ */
                            <>
                                {!isClaiming ? (
                                    <div className="bg-gray-50 rounded-2xl border p-8 text-center space-y-4">
                                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">สินค้ามีปัญหา?</h3>
                                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                                            หากสินค้าเสียหาย ได้ของผิด หรือของไม่ครบ คุณสามารถกดแจ้งเคลมรายชิ้นได้ภายใน 7 วัน
                                        </p>
                                        <button
                                            onClick={() => { setClaimMsg(''); setIsClaiming(true); }}
                                            className="px-8 py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all hover:-translate-y-0.5"
                                        >
                                            แจ้งเคลมสินค้าเลย
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-amber-200 shadow-lg p-6 lg:p-8 animate-fade-in relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10"></div>

                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-black text-amber-600">กรอกแบบฟอร์มเคลมสินค้า</h3>
                                            <button
                                                onClick={() => setIsClaiming(false)}
                                                className="text-gray-400 hover:text-gray-700 text-sm font-semibold px-3 py-1 bg-gray-100 rounded-full"
                                            >
                                                ยกเลิก
                                            </button>
                                        </div>

                                        {claimMsg && (
                                            <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-6">
                                                {claimMsg}
                                            </div>
                                        )}

                                        <form onSubmit={handleClaimSubmit} className="space-y-5 relative z-10">
                                            {/* เลือกสินค้า */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                                    <span className="text-amber-500">*</span> สินค้าที่ต้องการเคลม
                                                </label>
                                                <select
                                                    required
                                                    value={claimForm.equipment_id}
                                                    onChange={e => {
                                                        const detail = order.details?.find(d =>
                                                            (d.equipment_id && d.equipment_id.toString() === e.target.value) ||
                                                            (d._id && d._id.toString() === e.target.value)
                                                        );
                                                        setClaimForm(f => ({
                                                            ...f,
                                                            equipment_id: e.target.value,
                                                            claim_product_name: detail?.detailorder_name || '',
                                                            claim_qty: detail?.detailorder_qty || 1
                                                        }));
                                                    }}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                >
                                                    <option value="">-- กรุณาเลือกสินค้าใบออเดอร์นี้ --</option>
                                                    {order.details?.filter(item => {
                                                        const isAlreadyClaimed = existingClaims.some(c => c._id === item._id);
                                                        return !isAlreadyClaimed;
                                                    }).map((item, i) => {
                                                        return (
                                                            <option key={i} value={item._id}>
                                                                {item.detailorder_name} (ซื้อ {item.detailorder_qty} ชิ้น)
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                {/* เหตุผล */}
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                                        <span className="text-amber-500">*</span> เหตุผลการเคลม
                                                    </label>
                                                    <select
                                                        required
                                                        value={claimForm.claim_reason}
                                                        onChange={e => setClaimForm(f => ({ ...f, claim_reason: e.target.value }))}
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                    >
                                                        <option value="damaged">สินค้าเสียหาย/ชำรุด</option>
                                                        <option value="wrong_item">ได้รับสินค้าผิด</option>
                                                        <option value="incomplete">ของไม่ครบ/ขาดหาย</option>
                                                    </select>
                                                </div>

                                                {/* จำนวน */}
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                                        <span className="text-amber-500">*</span> จำนวนที่เคลม
                                                    </label>
                                                    {(() => {
                                                        const targetItem = order.details?.find(d => (d.equipment_id && d.equipment_id.toString() === claimForm.equipment_id) || (d._id && d._id.toString() === claimForm.equipment_id));
                                                        const maxQty = targetItem ? targetItem.detailorder_qty : 1;
                                                        return (
                                                            <input
                                                                type="number" min="1" max={maxQty}
                                                                value={claimForm.claim_qty}
                                                                onChange={e => {
                                                                    let val = parseInt(e.target.value);
                                                                    if (isNaN(val)) {
                                                                        setClaimForm(f => ({ ...f, claim_qty: '' }));
                                                                        return;
                                                                    }
                                                                    if (val > maxQty) val = maxQty;
                                                                    setClaimForm(f => ({ ...f, claim_qty: val }));
                                                                }}
                                                                onBlur={e => {
                                                                    let val = parseInt(e.target.value);
                                                                    if (isNaN(val) || val < 1) setClaimForm(f => ({ ...f, claim_qty: 1 }));
                                                                }}
                                                                required
                                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            </div>

                                            {/* รายละเอียด */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">รายละเอียดเพิ่มเติม</label>
                                                <textarea
                                                    rows={3}
                                                    value={claimForm.claim_detail}
                                                    onChange={e => setClaimForm(f => ({ ...f, claim_detail: e.target.value }))}
                                                    placeholder="กรุณาอธิบายปัญหาที่พบเพื่อความรวดเร็วในการประเมิน..."
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                                />
                                            </div>

                                            {/* รูปหลักฐาน */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">แนบรูปหลักฐาน <span className="text-gray-400 font-normal">(ถ้ามี)</span></label>
                                                <input
                                                    type="file" accept="image/*"
                                                    onChange={e => setClaimForm(f => ({ ...f, claim_image: e.target.files[0] }))}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer transition-colors"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={claimLoading}
                                                className="w-full py-4 bg-amber-500 text-white rounded-xl font-black hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 disabled:opacity-50 mt-4 text-base tracking-wide"
                                            >
                                                {claimLoading ? 'กำลังส่งคำร้อง...' : 'ยืนยันและส่งคำร้องเคลม'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl border px-6 py-5 text-center">
                                <p className="text-gray-500 text-sm font-medium">ไม่มีสิทธิ์ยื่นเคลมสำหรับออเดอร์นี้</p>
                                <p className="text-gray-400 text-xs mt-1">ออเดอร์ต้องอยู่ในสถานะ 'ส่งถึงแล้ว' และต้องไม่เกิน 7 วัน นับจากวันรับสินค้า</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Total Action for pending state */}
            {order.order_status === 'pending' && (
                <div className="mt-6">
                    <button
                        onClick={() => navigate(`/payment/${order._id}`)}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl transition-all hover:-translate-y-0.5 text-lg"
                    >
                        ไปที่หน้าชำระเงิน
                    </button>
                </div>
            )}

            {/* ── Slip Modal ── */}
            {showSlip && order.slip && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowSlip(false)}
                >
                    <div
                        className="relative max-w-3xl max-h-[90vh] overflow-auto bg-white rounded-2xl p-2 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowSlip(false)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors z-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={getImageUrl(order.slip.imagepay_name)}
                            alt="หลักฐานการโอนเงิน"
                            className="max-w-full h-auto rounded-lg shadow-inner"
                            onError={e => { e.target.src = 'https://via.placeholder.com/400x600?text=ไม่สามารถโหลดรูปภาพได้'; }}
                        />
                        <div className="p-4 text-center">
                            <p className="text-gray-500 text-sm font-medium">หลักฐานการโอนเงิน #{order._id}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Enlarged Image Viewer ── */}
            {enlargedImg && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setEnlargedImg(null)}
                >
                    <img
                        src={enlargedImg}
                        alt="ขยาย"
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
