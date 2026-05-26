const express = require('express');
const Promotion = require('../models/Promotion');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.json(promotion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(promotion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  try {
    const Equipment = require('../models/Equipment');

    // ตรวจสอบว่าโปรโมชั่นหมดอายุหรือยัง
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ error: 'ไม่พบโปรโมชั่น' });

    const now = new Date();
    const isExpired = promotion.Promotion_end && new Date(promotion.Promotion_end) < now;

    if (isExpired) {
      // โปรหมดอายุแล้ว → ล้าง Promotion_id ออกจากสินค้าและลบโปรได้เลย
      await Equipment.updateMany({ Promotion_id: req.params.id }, { $set: { Promotion_id: null } });
      await Promotion.findByIdAndDelete(req.params.id);
      return res.json({ message: 'ลบโปรโมชั่นที่หมดอายุสำเร็จ' });
    }

    // โปรยังไม่หมดอายุ → เช็คว่ามีสินค้าใช้อยู่หรือไม่
    const productsCount = await Equipment.countDocuments({ Promotion_id: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ error: 'ไม่สามารถลบโปรโมชั่นได้เนื่องจากยังมีสินค้าใช้โปรโมชั่นนี้อยู่' });
    }

    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: 'ลบสำเร็จ' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;