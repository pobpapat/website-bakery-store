const mongoose = require('mongoose');

const imagePaySchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imagepay_name: { type: String, required: true },
  imagepay_extension: String
});

module.exports = mongoose.model('ImagePay', imagePaySchema);