const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  equipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  cart_name: String,
  cart_price: Number,
  cart_original_price: Number,
  cart_amount: Number,
  cart_qty: Number
});

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema]
});
module.exports = mongoose.model('Cart', cartSchema);