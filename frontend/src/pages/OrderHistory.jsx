import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const statusMap = {
  pending:         { label: 'รอชำระเงิน',   color: 'bg-yellow-100 text-yellow-700' },
  verifying:       { label: 'รอตรวจสอบ',    color: 'bg-blue-100 text-blue-700' },
  paid:            { label: 'ชำระแล้ว',      color: 'bg-green-100 text-green-700' },
  shipped:         { label: 'กำลังจัดส่ง',  color: 'bg-indigo-100 text-indigo-700' },
  delivered:       { label: 'ส่งถึงแล้ว',   color: 'bg-green-100 text-green-700' },
  completed:       { label: 'เสร็จสิ้น',    color: 'bg-emerald-100 text-emerald-700' },
  cancelled:       { label: 'ยกเลิก',       color: 'bg-red-100 text-red-600' },
  claim_pending:   { label: 'กำลังเคลม',    color: 'bg-yellow-100 text-yellow-700' },
  claim_approved:  { label: 'เคลมอนุมัติ', color: 'bg-purple-100 text-purple-700' },
  claim_shipped:   { label: 'ส่งของเคลม',  color: 'bg-indigo-100 text-indigo-700' },
  claim_completed: { label: 'เคลมสำเร็จ',  color: 'bg-emerald-100 text-emerald-700' },
  claim_rejected:  { label: 'เคลมปฏิเสธ',  color: 'bg-orange-100 text-orange-700' },
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">กำลังโหลดประวัติการสั่งซื้อ...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">ประวัติการสั่งซื้อของคุณ</h1>

      {orders.length === 0 ? (
        <div className="bg-white border p-12 text-center rounded-xl shadow-sm">
          <p className="text-gray-400 mb-6 text-lg italic">คุณยังไม่มีรายการสั่งซื้อในขณะนี้</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            ไปดูสินค้าพรีเมียมกัน!
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold border-b">
              <tr>
                <th className="p-4 text-left">วันที่สั่งซื้อ</th>
                <th className="p-4 text-left">รหัสออเดอร์</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-right">ยอดเงินสุทธิ</th>
                <th className="p-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => {
                const status = statusMap[order.order_status] || { label: order.order_status, color: 'bg-gray-100 text-gray-400' };
                return (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium">
                      {new Date(order.order_date).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 font-mono text-xs text-blue-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">
                      {order.order_total?.toLocaleString()} ฿
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="px-4 py-2 border border-blue-100 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;