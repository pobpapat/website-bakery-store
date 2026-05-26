const express = require('express');
const { uploadCloud } = require('../config/cloudinary');
const path = require('path');
const DetailOrder = require('../models/DetailOrder');
const Order = require('../models/Order');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');
const router = express.Router();

// const upload = multer({ dest: 'uploads/' });

// ─── POST /api/claims — ลูกค้ายื่นคำร้องเคลม ───────────────────────────────
router.post('/', auth, uploadCloud.single('claim_image'), async (req, res) => {
  if (req.user.role === 'admin') return res.status(403).json({ error: 'แอดมินไม่สามารถยื่นเคลมได้' });
  try {
    const { order_id, equipment_id, claim_reason, claim_detail, claim_qty } = req.body;

    // ตรวจสอบว่าออเดอร์นี้เป็นของลูกค้าและสถานะ delivered
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: 'ไม่พบออเดอร์' });
    if (order.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'ไม่มีสิทธิ์เคลมออเดอร์นี้' });
    if (order.order_status !== 'delivered') return res.status(400).json({ error: 'สามารถเคลมได้เฉพาะออเดอร์ที่ได้รับแล้วเท่านั้น' });

    // ตรวจสอบ 7 วัน นับจากวันจัดส่ง (order_delivered_at) หรือ order_pay
    const deliveredAt = order.order_delivered_at || order.order_pay;
    if (!deliveredAt) return res.status(400).json({ error: 'ไม่พบข้อมูลวันที่รับสินค้า' });
    const diffDays = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) return res.status(400).json({ error: 'หมดระยะเวลาเคลมสินค้า (7 วัน)' });

    // หา DetailOrder ที่ตรงกับเงื่อนไข
    // เรารับ equipment_id มา (อาจจะเป็น _id ของ DetailOrder ก็ได้ขึ้นอยู่กับ frontend โยนอะไรมา)
    // เดี๋ยวเราพยายามหาโดยใช้ _id ของ DetailOrder ก่อน ถ้าไม่เจอ ค่อยหาจาก equipment_id
    let detailOrderToClaim = await DetailOrder.findOne({ _id: equipment_id, order_id: order._id });
    if (!detailOrderToClaim) {
      detailOrderToClaim = await DetailOrder.findOne({ equipment_id: equipment_id, order_id: order._id });
    }

    if (!detailOrderToClaim) return res.status(404).json({ error: 'ไม่พบรายการสินค้าในออเดอร์นี้' });

    if (detailOrderToClaim.claim_status !== 'none' && detailOrderToClaim.claim_status !== undefined) {
      return res.status(400).json({ error: 'สินค้ารายการนี้ได้ยื่นเคลมไปแล้ว' });
    }

    if (parseInt(claim_qty) > detailOrderToClaim.detailorder_qty) {
      return res.status(400).json({ error: 'จำนวนเคลมเกินกว่าจำนวนที่สั่งซื้อ' });
    }

    // อัปเดต DetailOrder ใส่ข้อมูลเคลม
    detailOrderToClaim.claim_reason = claim_reason;
    detailOrderToClaim.claim_detail = claim_detail;
    detailOrderToClaim.claim_qty = parseInt(claim_qty);
    detailOrderToClaim.claim_image = req.file ? req.file.path : null;
    detailOrderToClaim.claim_status = 'pending';
    detailOrderToClaim.claim_date = new Date();
    await detailOrderToClaim.save();

    // เปลี่ยนสถานะออเดอร์เป็น 'กำลังเคลม' หากยังไม่ใช่เพื่อแสดงให้ลูกค้าและแอดมินเห็น
    if (order.order_status !== 'claim_pending') {
      await Order.findByIdAndUpdate(order_id, { order_status: 'claim_pending' });
    }

    res.json({ message: 'ยื่นคำร้องเคลมสำเร็จ', claim: detailOrderToClaim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/claims/my — ลูกค้าดูประวัติเคลมของตัวเอง ─────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const claims = await DetailOrder.find({ 
      user_id: req.user.id,
      claim_status: { $nin: ['none', null] }
    })
      .populate('order_id', 'order_number order_date order_total')
      .populate('equipment_id', 'equipment_name')
      .sort({ claim_date: -1 });

    // เพื่อให้เข้ากันกับ Frontend เดิม อาจจะต้อง map field บางตัวให้เหมือน Claim เดิม 
    // ตัวอย่าง: claim.claim_product_name = claim.detailorder_name
    const mappedClaims = claims.map(c => {
      const obj = c.toObject();
      obj.claim_product_name = obj.detailorder_name;
      return obj;
    });

    res.json(mappedClaims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/claims/all — แอดมินดูทุกคำร้อง ┬──────────────────────────────
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const claims = await DetailOrder.find({
      claim_status: { $nin: ['none', null] }
    })
      .populate('user_id', 'username email')
      .populate('order_id', 'order_number order_date order_total order_delivered_at')
      .populate('equipment_id', 'equipment_name')
      .sort({ claim_date: -1 });
    
    const mappedClaims = claims.map(c => {
      const obj = c.toObject();
      obj.claim_product_name = obj.detailorder_name;
      return obj;
    });

    res.json(mappedClaims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/claims/:id — แอดมินอนุมัติ/ปฏิเสธ ────────────────────────────
// :id ตอนนี้จะเป็น id ของ DetailOrder
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const { claim_status, admin_note } = req.body;
    if (!['approved', 'rejected'].includes(claim_status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    const claim = await DetailOrder.findById(req.params.id);
    if (!claim) return res.status(404).json({ error: 'ไม่พบคำร้องเคลม' });
    if (claim.claim_status !== 'pending') {
      return res.status(400).json({ error: 'คำร้องนี้ดำเนินการไปแล้ว' });
    }

    claim.claim_status = claim_status;
    claim.admin_note = admin_note || '';
    claim.resolved_at = new Date();
    await claim.save();

    // ถ้าอนุมัติการเปลี่ยนสินค้าใหม่ → ต้องหักสต็อกสินค้า (-qty) เพราะถือว่าเราส่งของชิ้นใหม่ทดแทนให้ลูกค้า
    if (claim_status === 'approved' && claim.equipment_id) {
      await Equipment.findByIdAndUpdate(claim.equipment_id, {
        $inc: { equipment_stock: -claim.claim_qty }
      });
    }

    // หาสถานะเคลมรวมของ Order นี้
    const allClaimsInOrder = await DetailOrder.find({ order_id: claim.order_id, claim_status: { $ne: 'none' } });
    
    // หากอันใดอันหนึ่งได้รับการอนุมัติ สถานะ order ให้เป็น claim_approved
    // แต่ถ้าอันเดียว/ทั้งหมดโดน reject ก็เป็น claim_rejected
    const hasApproved = allClaimsInOrder.some(c => c.claim_status === 'approved');
    const allRejected = allClaimsInOrder.every(c => c.claim_status === 'rejected');
    const hasPending = allClaimsInOrder.some(c => c.claim_status === 'pending');

    let newOrderStatus = 'claim_pending';
    if (!hasPending) {
        if (hasApproved) newOrderStatus = 'claim_approved';
        else if (allRejected) newOrderStatus = 'claim_rejected';
    }

    await Order.findByIdAndUpdate(claim.order_id, { order_status: newOrderStatus });

    res.json({ message: `${claim_status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}เคลมสำเร็จ`, claim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
