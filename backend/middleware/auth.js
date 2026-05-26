// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1. ดึง token จาก header
  const authHeader = req.header('Authorization');

  // ถ้าไม่มี header หรือไม่ขึ้นต้นด้วย Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ไม่มีสิทธิ์เข้าใช้งาน (No token)' });
  }

  // 2. แยก token ออกมา
  const token = authHeader.split(' ')[1];

  try {
    // 3. ตรวจสอบ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_please_change');
    
    // 4. เก็บข้อมูลผู้ใช้ไว้ใน req.user (ใช้ต่อใน route ต่าง ๆ)
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user'
    };

    next(); // ผ่านไปยัง route ถัดไป
  } catch (error) {
    return res.status(401).json({ error: 'โทเคนไม่ถูกต้องหรือหมดอายุแล้ว' });
  }
};

module.exports = auth;