const express = require('express');
const Cart = require('../models/Cart');
const Equipment = require('../models/Equipment');
const ImageEquipment = require('../models/ImageEquipment');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) {
      cart = new Cart({ user_id: req.user.id, items: [] });
      await cart.save();
      return res.json(cart);
    }

    // Recalculate prices from current Equipment + Promotion data (real-time)
    let priceChanged = false;
    for (const item of cart.items) {
      const equipment = await Equipment.findById(item.equipment_id).populate('Promotion_id');
      if (!equipment) continue; // สินค้าถูกลบแล้ว ข้ามไป

      const originalPrice = equipment.equipment_price;
      let currentPrice = originalPrice;
      if (equipment.Promotion_id && equipment.Promotion_id.Promotion_discount > 0) {
        currentPrice = originalPrice * (100 - equipment.Promotion_id.Promotion_discount) / 100;
      }

      // อัปเดตถ้าราคาหรือชื่อเปลี่ยน
      if (
        item.cart_price !== currentPrice ||
        item.cart_original_price !== originalPrice ||
        item.cart_name !== equipment.equipment_name
      ) {
        item.cart_name = equipment.equipment_name;
        item.cart_price = currentPrice;
        item.cart_original_price = originalPrice;
        item.cart_amount = item.cart_qty * currentPrice;
        priceChanged = true;
      }
    }

    if (priceChanged) {
      await cart.save();
    }

    const cartObj = cart.toObject();
    for (const item of cartObj.items) {
      const images = await ImageEquipment.find({ equipment_id: item.equipment_id });
      if (images && images.length > 0) {
        item.image = images[0].ImageEquipment_name;
      }
    }

    res.json(cartObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role === 'admin') return res.status(403).json({ error: 'ผู้ดูแลระบบไม่สามารถสั่งซื้อสินค้าได้' });
  try {
    const { equipment_id, qty } = req.body;
    const equipment = await Equipment.findById(equipment_id).populate('Promotion_id');
    if (!equipment) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
    if (equipment.equipment_stock < qty) return res.status(400).json({ error: 'สินค้าในสต็อกไม่พอ' });

    let price = equipment.equipment_price;
    if (equipment.Promotion_id && equipment.Promotion_id.Promotion_discount > 0) {
      price = price * (100 - equipment.Promotion_id.Promotion_discount) / 100;
    }

    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) cart = new Cart({ user_id: req.user.id, items: [] });

    const itemIndex = cart.items.findIndex(i => i.equipment_id.toString() === equipment_id);
    if (itemIndex > -1) {
      cart.items[itemIndex].cart_qty += qty;
      cart.items[itemIndex].cart_price = price; // Update price in case it changed
      cart.items[itemIndex].cart_original_price = equipment.equipment_price;
      cart.items[itemIndex].cart_amount = cart.items[itemIndex].cart_qty * price;
    } else {
      cart.items.push({
        equipment_id,
        cart_name: equipment.equipment_name,
        cart_price: price,
        cart_original_price: equipment.equipment_price,
        cart_qty: qty,
        cart_amount: qty * price
      });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item quantity
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { qty } = req.body;
    const cart = await Cart.findOne({ user_id: req.user.id });
    const item = cart.items.id(req.params.itemId);

    if (!item) return res.status(404).json({ error: 'ไม่พบสินค้าในตะกร้า' });

    // Check stock and price
    const equipment = await Equipment.findById(item.equipment_id).populate('Promotion_id');
    if (equipment.equipment_stock < qty) return res.status(400).json({ error: 'สินค้าในสต็อกไม่พอ' });

    let price = equipment.equipment_price;
    if (equipment.Promotion_id && equipment.Promotion_id.Promotion_discount > 0) {
      price = price * (100 - equipment.Promotion_id.Promotion_discount) / 100;
    }

    item.cart_qty = qty;
    item.cart_price = price; // Update price
    item.cart_original_price = equipment.equipment_price;
    item.cart_amount = qty * price;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.id });
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;