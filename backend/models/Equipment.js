const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  equipment_name: { type: String, required: true },
  equipment_price: { type: Number, required: true },
  equipment_stock: { type: Number, required: true, default: 0 },
  equipment_description: String,
  Cat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  Promotion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }
});
module.exports = mongoose.model('Equipment', equipmentSchema);