const express = require('express');
const Order = require('../models/Order');
const DetailOrder = require('../models/DetailOrder');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');
const router = express.Router();

// สรุปยอดขาย (เฉพาะ admin)
router.get('/summary', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

  try {
    const type = req.query.type || 'day'; // day, month, year
    const { dateFrom, dateTo } = req.query;

    let groupFormat = '%Y-%m-%d';
    if (type === 'month') groupFormat = '%Y-%m';
    if (type === 'year') groupFormat = '%Y';

    // รวมยอดออเดอร์ที่จ่ายเงินแล้วทั้งหมด
    const matchCondition = { 
      order_status: { 
        $in: [
          'paid', 'shipped', 'delivered', 'completed', 
          'claim_pending', 'claim_approved', 'claim_shipped', 'claim_completed', 'claim_rejected'
        ] 
      } 
    };
    if (dateFrom || dateTo) {
      matchCondition.order_date = {};
      if (dateFrom) matchCondition.order_date.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999); // ครอบคลุมถึงสิ้นวัน
        matchCondition.order_date.$lte = end;
      }
    }

    const summary = await Order.aggregate([
      { $match: matchCondition },
      { $lookup: { from: 'detailorders', localField: '_id', foreignField: 'order_id', as: 'details' } },
      { $unwind: '$details' },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: groupFormat, date: '$order_date' } },
            name: '$details.detailorder_name' // ใช้ชื่อที่บันทึกไว้ในออเดอร์โดยตรง มั่นใจว่าข้อมูลไม่หายแม้สินค้าถูกลบ
          },
          qty: { $sum: '$details.detailorder_qty' },
          revenue: { $sum: '$details.price_total' }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          products: {
            $push: {
              name: '$_id.name',
              quantity: '$qty',
              revenue: '$revenue'
            }
          },
          grandTotal: { $sum: '$revenue' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json(summary);
  } catch (err) {
    console.error('Sales summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;