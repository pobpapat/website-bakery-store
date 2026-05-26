

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ต้อง require ทุก model ก่อนใช้ route ใด ๆ 
require('./models/User');
require('./models/Equipment');
require('./models/Category');
require('./models/Promotion');
require('./models/Order');
require('./models/DetailOrder');
require('./models/Cart');
require('./models/ImageEquipment');
require('./models/ImagePay');

// เชื่อมต่อ MongoDB (เวอร์ชันใหม่ ไม่ต้องใส่ option)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bakery_store')
  .then(() => console.log('เชื่อมต่อ MongoDB สำเร็จ'))
  .catch(err => console.error('เชื่อมต่อ MongoDB ไม่สำเร็จ:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/claims', require('./routes/claims'));

// 404 - ใช้แบบนี้แทน app.use('*', ...)
app.use((req, res) => {
  res.status(404).json({ error: 'ไม่พบเส้นทางนี้' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
  console.log(`http://localhost:${PORT}`);

  // เริ่ม Background Jobs
  require('./jobs/cancelExpiredOrders')();
});