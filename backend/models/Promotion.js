const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  Promotion_name: { type: String, required: true },
  Promotion_discount: { type: Number, required: true, default: 0 }, // Percent discount
  Promotion_type: String,
  Promotion_condition: String,
  Promotion_start: Date,
  Promotion_end: Date,
  Promotion_status: { type: String, default: 'active' }
});

module.exports = mongoose.model('Promotion', promotionSchema);