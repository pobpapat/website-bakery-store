const mongoose = require('mongoose');

const detailOrderSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  equipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  detailorder_name: String,
  detailorder_qty: Number,
  detailorder_date: { type: Date, default: Date.now },
  equipment_price: Number,
  equipment_discount: { type: Number, default: 0 },
  price_total: Number,

  // --- Claim Fields ---
  claim_reason: {
    type: String,
    enum: ['damaged', 'wrong_item', 'incomplete', null],
    default: null
  },
  claim_detail: String,
  claim_qty: { type: Number, min: 1, default: null },
  claim_image: String,
  claim_status: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  admin_note: String,
  claim_date: Date,
  resolved_at: Date
});

module.exports = mongoose.model('DetailOrder', detailOrderSchema);