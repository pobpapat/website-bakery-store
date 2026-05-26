import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getImageUrl } from '../../utils/getImageUrl';

const REASON_MAP = {
  damaged:    'สินค้าเสียหาย/ชำรุด',
  wrong_item: 'ได้รับสินค้าผิด',
  incomplete: 'ของไม่ครบ/ขาดหาย',
};

const statusMap = {
  pending:         { label: 'รอชำระเงิน',   color: 'bg-yellow-100 text-yellow-700' },
  verifying:       { label: 'รอตรวจสอบ',    color: 'bg-blue-100 text-blue-700' },
  paid:            { label: 'ชำระแล้ว',      color: 'bg-green-100 text-green-700' },
  shipped:         { label: 'กำลังจัดส่ง',  color: 'bg-indigo-100 text-indigo-700' },
  delivered:       { label: 'ส่งถึงแล้ว',   color: 'bg-teal-100 text-teal-700' },
  completed:       { label: 'เสร็จสิ้น',    color: 'bg-emerald-100 text-emerald-700' },
  cancelled:       { label: 'ยกเลิก',       color: 'bg-red-100 text-red-600' },
  claim_pending:   { label: 'ลูกค้าเคลมของ', color: 'bg-pink-100 text-pink-700' },
  claim_approved:  { label: 'เคลมอนุมัติ', color: 'bg-purple-100 text-purple-700' },
  claim_shipped:   { label: 'ส่งของเคลม',  color: 'bg-indigo-100 text-indigo-700' },
  claim_completed: { label: 'เคลมสำเร็จ',  color: 'bg-emerald-100 text-emerald-700' },
  claim_rejected:  { label: 'เคลมปฏิเสธ',  color: 'bg-orange-100 text-orange-700' },
};

// ─── Sub-component: แสดง badge สถานะเคลม ────────────────────────────────────
const ClaimBadge = ({ status }) => {
  const cfg = {
    pending:  { label: 'รอตรวจสอบ',  cls: 'bg-blue-100 text-blue-700' },
    approved: { label: 'อนุมัติแล้ว', cls: 'bg-purple-100 text-purple-700' },
    rejected: { label: 'ปฏิเสธแล้ว', cls: 'bg-red-100 text-red-700' },
  }[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ─── Modal: รายละเอียดออเดอร์ + ส่วนเคลม ────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusChange, onRefresh }) => {
  const [enlargedImg, setEnlargedImg]   = useState(null);
  const [claims, setClaims]             = useState([]);
  const [claimLoading, setClaimLoading] = useState(true);
  const [adminNotes, setAdminNotes]     = useState({}); // { detailId: note }
  const [actionLoading, setActionLoading] = useState({}); // { detailId: status }

  // โหลดข้อมูลเคลมของออเดอร์นี้
  const fetchClaims = useCallback(async () => {
    if (!order) return;
    setClaimLoading(true);
    try {
      const res = await axios.get('/api/claims/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const found = res.data.filter(
        c => (c.order_id?._id || c.order_id)?.toString() === order._id?.toString()
      );
      setClaims(found || []);
    } catch { setClaims([]); }
    finally { setClaimLoading(false); }
  }, [order]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  if (!order) return null;

  const status = statusMap[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-600' };
  const theStatus = order.order_status;
  
  const isCancelled    = theStatus === 'cancelled';
  const isCompleted    = theStatus === 'completed' || theStatus === 'claim_completed';
  const isRejected     = theStatus === 'claim_rejected';
  
  const orderDate      = new Date(order.order_date).getTime();
  const isPastDue      = theStatus === 'pending' && Date.now() - orderDate > 24 * 60 * 60 * 1000;
  
  const isLocked       = isCancelled || isPastDue || isCompleted || isRejected;

  // อนุมัติ / ปฏิเสธเคลม
  const handleClaimAction = async (claimId, claimStatus) => {
    const note = adminNotes[claimId] || '';
    if (claimStatus === 'rejected' && !note.trim()) {
      alert('กรุณาใส่เหตุผลที่ปฏิเสธ');
      return;
    }
    setActionLoading(prev => ({ ...prev, [claimId]: claimStatus }));
    try {
      await axios.put(`/api/claims/${claimId}`, {
        claim_status: claimStatus,
        admin_note: note
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchClaims();
      await onRefresh();   // รีโหลดรายการออเดอร์ด้วย
    } catch { alert('เกิดข้อผิดพลาด กรุณาลองใหม่'); }
    finally { setActionLoading(prev => ({ ...prev, [claimId]: '' })); }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-gray-800">
              รายละเอียดคำสั่งซื้อ
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">#{order._id.slice(-8)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}>
              {status.label}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none">&times;</button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ── ข้อมูลลูกค้า ── */}
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-4">
            <p><span className="text-gray-400">ชื่อ-นามสกุล:</span> <strong>{order.order_name}</strong></p>
            <p><span className="text-gray-400">เบอร์โทร:</span> <strong>{order.order_phone}</strong></p>
            <p className="col-span-2"><span className="text-gray-400">วันที่สั่งซื้อ:</span> <strong>{new Date(order.order_date).toLocaleString('th-TH')}</strong></p>
            <p className="col-span-2"><span className="text-gray-400">ที่อยู่:</span> {order.order_address}</p>
            {order.order_delivered_at && (
              <p className="col-span-2 text-teal-700 font-semibold">
                📦 วันที่รับสินค้า: {new Date(order.order_delivered_at).toLocaleString('th-TH')}
              </p>
            )}
          </div>

          {/* ── รายการสินค้า ── */}
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                <tr>
                  <th className="p-3 text-left">สินค้า</th>
                  <th className="p-3 text-center">จำนวน</th>
                  <th className="p-3 text-right">ราคา</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.details?.map((item, i) => {
                  const itemClaim = claims.find(c => c._id === item._id);
                  return (
                    <React.Fragment key={i}>
                    <tr className={itemClaim ? 'bg-amber-50/20' : ''}>
                      <td className="p-3">
                        <div className="font-bold text-gray-800">{item.detailorder_name}</div>
                        {itemClaim && (
                          <div className="mt-1">
                            <ClaimBadge status={itemClaim.claim_status} />
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">{item.detailorder_qty}</td>
                      <td className="p-3 text-right font-semibold">{item.price_total?.toLocaleString()} ฿</td>
                    </tr>
                    
                    {/* ส่วนแสดงแบบฟอร์ม/ข้อมูลเคลมใต้รายการสินค้า */}
                    {itemClaim && (
                      <tr className="bg-amber-50/40 border-t border-amber-100">
                        <td colSpan="3" className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="text-xs space-y-1">
                                <p className="font-bold text-amber-700">📌 รายละเอียดการเคลม ({itemClaim.claim_qty} ชิ้น):</p>
                                <p className="text-gray-600"><strong>เหตุผล:</strong> {REASON_MAP[itemClaim.claim_reason]}</p>
                                {itemClaim.claim_detail && <p className="text-gray-500 italic">"{itemClaim.claim_detail}"</p>}
                                <p className="text-[10px] text-gray-400">ยื่นเคลม: {new Date(itemClaim.claim_date).toLocaleString('th-TH')}</p>
                              </div>

                              {itemClaim.claim_image && (
                                <img
                                  src={getImageUrl(itemClaim.claim_image)}
                                  alt="รูปเคลม"
                                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-zoom-in hover:opacity-90"
                                  onClick={() => setEnlargedImg(getImageUrl(itemClaim.claim_image))}
                                />
                              )}
                            </div>

                            {itemClaim.claim_status === 'pending' ? (
                              <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-inner space-y-2">
                                <textarea
                                  rows="1"
                                  placeholder="หมายเหตุพิจารณา (จำเป็นถ้าปฏิเสธ)..."
                                  className="w-full text-xs p-2 border rounded focus:ring-1 focus:ring-amber-500 outline-none"
                                  value={adminNotes[item._id] || ''}
                                  onChange={e => setAdminNotes(prev => ({ ...prev, [item._id]: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleClaimAction(item._id, 'approved')}
                                    disabled={actionLoading[item._id] === 'approved'}
                                    className="flex-1 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition"
                                  >
                                    อนุมัติ (ส่งของใหม่)
                                  </button>
                                  <button
                                    onClick={() => handleClaimAction(item._id, 'rejected')}
                                    disabled={actionLoading[item._id] === 'rejected'}
                                    className="flex-1 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition"
                                  >
                                    ปฏิเสธ
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] bg-white/50 p-2 rounded-lg border border-white">
                                <span className={itemClaim.claim_status === 'approved' ? 'text-purple-700 font-bold' : 'text-red-600 font-bold'}>
                                  {itemClaim.claim_status === 'approved' ? '✅ อนุมัติแล้ว' : '❌ ปฏิเสธแล้ว'}
                                </span>
                                {itemClaim.admin_note && <span className="text-gray-500 ml-2">หมายเหตุ: {itemClaim.admin_note}</span>}
                                {itemClaim.resolved_at && <span className="text-gray-400 block mt-0.5 italic">ดำเนินการเมื่อ: {new Date(itemClaim.resolved_at).toLocaleString('th-TH')}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-right text-base font-black text-gray-800">
            ยอดรวม: <span className="text-blue-600">{order.order_total?.toLocaleString()} ฿</span>
          </div>

          {/* ── สลิปโอนเงิน ── */}
          {(order.ImagePay?.imagepay_name || order.slip) && (
            <div className="border-t pt-4">
              <p className="font-bold text-sm mb-2 text-gray-700">หลักฐานการโอนเงิน</p>
              <img
                src={getImageUrl(order.ImagePay?.imagepay_name || order.slip)}
                alt="สลิปโอนเงิน"
                className="w-full max-w-[200px] aspect-[3/4] object-cover rounded-xl border border-slate-200 cursor-zoom-in hover:shadow-md transition-shadow mx-auto"
                onClick={() => setEnlargedImg(getImageUrl(order.ImagePay?.imagepay_name || order.slip))}
              />
              <p className="text-[10px] text-gray-400 mt-1">* คลิกเพื่อดูรูปขนาดเต็ม</p>
            </div>
          )}


          {/* ── อัปเดตสถานะออเดอร์ ── */}
          <div className="border-t pt-4">
            <label className="block font-bold text-sm mb-2 text-gray-800">อัปเดตสถานะออเดอร์:</label>
            {isLocked && (
              <p className="text-red-500 text-xs mb-3 font-semibold bg-red-50 px-3 py-2 rounded-lg">
                ⚠️ ไม่สามารถเปลี่ยนสถานะได้ —{' '}
                {isCancelled
                  ? 'คำสั่งซื้อถูกยกเลิกแล้ว'
                  : isRejected
                  ? 'คำร้องเคลมถูกปฏิเสธแล้วจบกระบวนการ'
                  : isCompleted
                  ? 'กระบวนการส่งสินค้า (หรือเคลม) เสร็จสมบูรณ์แล้ว'
                  : 'เลยกำหนดเวลาชำระเงิน (24 ชม.)'}
                {isPastDue && !isCancelled && !isCompleted && !isRejected && ' — อัปเดตเป็นยกเลิกได้เท่านั้น'}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusMap).map(([key, val]) => {
                
                // Logic ป้องกันการข้าม Step
                let disabled = false;
                if (isCancelled && key !== 'cancelled') disabled = true;
                else if (isRejected && key !== 'claim_rejected') disabled = true;
                else if (isCompleted && key !== 'completed' && key !== 'claim_completed') disabled = true;
                else if (isPastDue && key !== 'cancelled') disabled = true;

                // สำหรับ Order ที่อยู่ใน Flow การเคลม ให้ดำเนินเรื่องการเคลมต่อเท่านั้น
                if (!disabled) {
                    if (theStatus === 'claim_pending' && key !== 'claim_pending') disabled = true;
                    if (theStatus === 'claim_approved' && !['claim_approved', 'claim_shipped'].includes(key)) disabled = true;
                    if (theStatus === 'claim_shipped' && !['claim_shipped', 'claim_completed'].includes(key)) disabled = true;
                    // ป้องกันเปลี่ยนมั่วกลับไป flow วันแรก ถ้าออเดอร์เลยด่าน delivered มาแล้ว (ยกเว้นเข้า claim flow)
                    if (theStatus === 'delivered' && ['pending','verifying','paid','shipped'].includes(key)) disabled = true;
                }
                
                // ปุ่มสถานะปัจจุบันไม่ควรถูกล็อคการโชว์สี
                if (theStatus === key) disabled = false;

                return (
                  <button
                    key={key}
                    disabled={disabled}
                    onClick={() => onStatusChange(order._id, key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      order.order_status === key
                        ? val.color + ' border-current shadow-sm'
                        : disabled
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {val.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── รูปขยาย ── */}
      {enlargedImg && (
        <div
          className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
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

// ─── ManageOrders Main ────────────────────────────────────────────────────────
const ManageOrders = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}`, { order_status: status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchOrders();
      setSelected(prev => prev && prev._id === id ? { ...prev, order_status: status } : prev);
    } catch {
      alert('Error updating status');
    }
  };

  if (loading) return (
    <div className="text-center py-20 uppercase tracking-widest text-gray-400">
      Loading Order Management...
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">จัดการคำสั่งซื้อ</h1>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 text-left">วันที่</th>
              <th className="p-4 text-left">ลูกค้า</th>
              <th className="p-4 text-center">สถานะ</th>
              <th className="p-4 text-right">ยอดเงิน</th>
              <th className="p-4 text-center">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr
                key={order._id}
                className={`hover:bg-gray-50 transition-colors ${
                  order.order_status === 'claim_approved' || order.order_status === 'claim_rejected'
                    ? 'bg-purple-50/30'
                    : ''
                }`}
              >
                <td className="p-4 text-sm whitespace-nowrap text-gray-500">
                  {new Date(order.order_date).toLocaleString('th-TH')}
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-gray-800">{order.order_name || 'GUEST'}</div>
                  <div className="text-xs text-gray-400">#{order._id.slice(-8)}</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    statusMap[order.order_status]?.color || 'bg-gray-100 text-gray-400'
                  }`}>
                    {statusMap[order.order_status]?.label || order.order_status}
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-blue-600">
                  {order.order_total?.toLocaleString()} ฿
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => setSelected(order)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      ['claim_approved','claim_rejected'].includes(order.order_status)
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleUpdateStatus}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  );
};

export default ManageOrders;