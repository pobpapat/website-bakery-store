const mongoose = require('mongoose');

const imageEquipmentSchema = new mongoose.Schema({
  equipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  ImageEquipment_name: { type: String, required: true },
  ImageEquipment_extension: String
});
module.exports = mongoose.model('ImageEquipment', imageEquipmentSchema);