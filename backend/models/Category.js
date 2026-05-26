// backend/models/Category.js ← แก้ทั้งไฟล์เป็นแบบนี้

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  Cat_name: { type: String, required: true }
});

module.exports = mongoose.model('Category', categorySchema);