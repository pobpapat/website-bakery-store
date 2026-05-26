const express = require('express');
const { uploadCloud } = require('../config/cloudinary');
const path = require('path');
const Order = require('../models/Order');
const DetailOrder = require('../models/DetailOrder');
const ImagePay = require('../models/ImagePay');
const Cart = require('../models/Cart');
const Equipment = require('../models/Equipment');
const auth = require('../middleware/auth');
const router = express.Router();

// const upload = multer({ dest: 'uploads/' });

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ order_date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all (admin)
router.get('/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    // ใช้ .lean() เพื่อให้ได้ plain JavaScript object ทันที ลดปัญหา circular reference และช่วย performance
    const orders = await Order.find()
      .sort({ order_date: -1 })
      .populate('user_id', 'username')
      .lean();

    const ordersWithData = [];

    // วนลูปประมวลผลทีละออเดอร์เพื่อแยก error และจัดโครสร้างข้อมูลอย่างปลอดภัย
    for (const order of orders) {
      try {
        const slip = await ImagePay.findOne({ order_id: order._id }).lean();
        const details = await DetailOrder.find({ order_id: order._id }).lean();

        // จัดการกรณีผู้ใช้ถูกลบหรือไม่มีข้อมูล
        if (!order.user_id) {
          order.user_id = { username: 'ไม่พบผู้ใช้' };
        }

        ordersWithData.push({
          ...order,
          ImagePay: slip,
          details: details || []
        });
      } catch (orderErr) {
        console.error(`Resilient fetch failed for order ${order._id}:`, orderErr);
        // ถ้าดึงข้อมูลเสริมนอกเหนือจากตัวออเดอร์พลาด ให้ส่งข้อมูลพื้นฐานของออเดอร์ไปก่อน
        const fallback = { ...order };
        if (!fallback.user_id) fallback.user_id = { username: 'ไม่พบผู้ใช้' };
        fallback.ImagePay = null;
        fallback.details = [];
        ordersWithData.push(fallback);
      }
    }

    res.json(ordersWithData);
  } catch (err) {
    console.error('Fetch all orders fatal error:', err);
    res.status(500).json({
      error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
      message: err.message,
      stack: err.stack
    });
  }
});

// Get single order detail (user)
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'ไม่พบออเดอร์' });
    if (order.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const details = await DetailOrder.find({ order_id: order._id });
    const slip = await ImagePay.findOne({ order_id: order._id });
    res.json({ ...order.toObject(), details, slip });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create order
router.post('/', auth, async (req, res) => {
  if (req.user.role === 'admin') return res.status(403).json({ error: 'ผู้ดูแลระบบไม่สามารถสั่งซื้อสินค้าได้' });
  try {
    const cart = await Cart.findOne({ user_id: req.user.id }).populate('items.equipment_id');
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'ตะกร้าว่างเปล่า' });

    const total = cart.items.reduce((sum, item) => sum + item.cart_amount, 0);

    const order = new Order({
      user_id: req.user.id,
      order_total: total,
      order_address: req.body.order_address,
      order_name: req.body.order_name,
      order_phone: req.body.order_phone,
      order_email: req.body.order_email
    });
    await order.save();

    for (const item of cart.items) {
      // คำนวณ % ส่วนลด จาก cart_original_price และ cart_price
      let discountPercent = 0;
      if (item.cart_original_price && item.cart_original_price > item.cart_price) {
        discountPercent = Math.round(((item.cart_original_price - item.cart_price) / item.cart_original_price) * 100);
      }

      const detail = new DetailOrder({
        order_id: order._id,
        user_id: req.user.id,
        equipment_id: item.equipment_id,
        detailorder_name: item.cart_name,
        detailorder_qty: item.cart_qty,
        equipment_price: item.cart_original_price || item.cart_price, // ราคาเต็มก่อนลด
        equipment_discount: discountPercent,
        price_total: item.cart_amount
      });
      await detail.save();
      await Equipment.findByIdAndUpdate(item.equipment_id, { $inc: { equipment_stock: -item.cart_qty } });
    }

    cart.items = [];
    await cart.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload slip
router.post('/:id/pay', auth, uploadCloud.single('slip'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    order.order_status = 'verifying'; // เปลี่ยนสถานะเป็นรอตรวจสอบ
    order.order_pay = Date.now();
    await order.save();

    const imagePay = new ImagePay({
      order_id: order._id,
      user_id: req.user.id,
      imagepay_name: req.file.path,
      imagepay_extension: path.extname(req.file.originalname)
    });
    await imagePay.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status (admin)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const update = { order_status: req.body.order_status };
    // เมื่อเปลี่ยนเป็น 'delivered' ให้บันทึกวันที่รับสินค้า เพื่อใช้คำนวณช่วง 7 วันเคลม
    if (req.body.order_status === 'delivered') {
      update.order_delivered_at = new Date();
    }
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;