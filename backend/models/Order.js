const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_total: Number,
  order_date: { type: Date, default: Date.now },
  order_pay: Date,
  order_name: String,
  order_address: String,
  order_phone: String,
  order_status: { type: String, default: 'pending' },
  order_number: String,
  order_approval_status: String,
  order_delivered_at: Date  // วันที่ลูกค้าได้รับสินค้า (ใช้คำนวณ 7 วันเคลม)
});

module.exports = mongoose.model('Order', orderSchema);