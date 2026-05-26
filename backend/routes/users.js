const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();

// ดึงข้อมูลโปรไฟล์ตัวเอง
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// แก้ไขข้อมูลตัวเอง
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, surname, addresses, phone, email } = req.body;
    const updates = {
      name,
      surname,
      addresses: Array.isArray(addresses) ? addresses.filter(a => a.trim() !== '') : [],
      phone,
      email,
    };
    // sync address หลัก (ตัวแรก) เพื่อ backward compat กับ orders
    updates.address = updates.addresses[0] || '';
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// เปลี่ยนรหัสผ่าน
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'กรุณากรอกรหัสผ่านให้ครบ' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
    }
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: ดึงรายชื่อสมาชิกทั้งหมด
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: ดูรายละเอียดสมาชิก + orders
router.get('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'ไม่พบสมาชิก' });
    const Order = require('../models/Order');
    const DetailOrder = require('../models/DetailOrder');
    const orders = await Order.find({ user_id: req.params.id }).sort({ order_date: -1 });
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      const details = await DetailOrder.find({ order_id: order._id });
      return { ...order.toObject(), details };
    }));
    res.json({ ...user.toObject(), orders: ordersWithDetails });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Admin: แก้ไขสมาชิก
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: ลบสมาชิก
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบสมาชิกสำเร็จ' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;