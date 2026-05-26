const Order = require('../models/Order');
const DetailOrder = require('../models/DetailOrder');
const Equipment = require('../models/Equipment');

const cancelExpiredOrders = async () => {
  try {
    // เวลาปัจจุบันย้อนหลังไป 30 นาที
    const oneHourAgo = new Date(Date.now() - 30 * 60 * 1000);

    // ดึงออเดอร์ที่มีสถานะ `pending` (รอชำระเงิน) และเก่ากว่า 30 นาที
    const expiredOrders = await Order.find({
      order_status: 'pending',
      order_date: { $lt: oneHourAgo }
    });

    if (expiredOrders.length === 0) return;

    console.log(`[Background Job] พบออเดอร์ค้างชำระเกิน 30 นาที จำนวน ${expiredOrders.length} รายการ กำลังดำเนินการยกเลิก...`);

    for (const order of expiredOrders) {
      // 1. อัปเดตสถานะเป็น 'cancelled'
      order.order_status = 'cancelled';
      await order.save();

      // 2. ดึงรายละเอียดสินค้าในออเดอร์เพื่อทำการคืนสต็อก
      const details = await DetailOrder.find({ order_id: order._id });
      for (const item of details) {
        if (item.equipment_id && item.detailorder_qty) {
          await Equipment.findByIdAndUpdate(item.equipment_id, {
            $inc: { equipment_stock: item.detailorder_qty }
          });
        }
      }
      console.log(`[Background Job] สลิปขาดหาย ยกเลิกออเดอร์ ID: ${order._id} และคืนสต็อกสำเร็จ`);
    }
  } catch (error) {
    console.error('[Background Job] เกิดข้อผิดพลาดในการยกเลิกออเดอร์:', error);
  }
};

const startJob = () => {
  // ทำงานทันที 1 ครั้งเมื่อสตาร์ทเซิร์ฟเวอร์ใหม่
  cancelExpiredOrders();
  
  // ตั้งเวลารันซ้ำทุกๆ 5 นาที (300,000 ms)
  setInterval(cancelExpiredOrders, 5 * 60 * 1000);
  
  console.log('[Background Job] ระบบรันอัตโนมัติ: ยกเลิกออเดอร์ที่ไม่ชำระเงินภายใน 30 นาที เริ่มทำงานแล้ว');
};

module.exports = startJob;
