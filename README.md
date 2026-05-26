# Exam Project

โปรเจคนี้เป็นระบบร้านค้าออนไลน์ (E-commerce) สำหรับอุปกรณ์ทำอาหาร/เบเกอรี่ ที่ประกอบด้วย:

- `backend/` - API server ด้วย Node.js, Express, MongoDB
- `frontend/` - แอป React + Vite + TailwindCSS


## เทคโนโลยีหลัก

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Nodemailer
- Frontend: React, Vite, TailwindCSS, Axios, React Router Dom, Swiper, Recharts

## โครงสร้างไฟล์สำคัญ

- `backend/index.js` - เริ่มเซิร์ฟเวอร์, เชื่อมต่อ MongoDB, ลงทะเบียน route
- `backend/routes/` - API route สำหรับ auth, products, categories, promotions, orders, cart, users, sales, claims
- `backend/models/` - Mongoose model ของ entities ต่างๆ
- `backend/middleware/auth.js` - ตรวจสอบ JWT และสิทธิ์ผู้ใช้
- `backend/jobs/cancelExpiredOrders.js` - background job ยกเลิกคำสั่งซื้อที่หมดอายุ
- `frontend/src/App.jsx` - ตั้งค่า routing และ Axios interceptor
- `frontend/src/pages/` - เพจผู้ใช้ทั่วไปและหน้า admin
- `frontend/vite.config.js` - ตั้งค่า proxy `/api` เป็น `http://localhost:5000`

## การติดตั้ง

### 1. ติดตั้ง backend

```bash
cd backend
npm install
```

### 2. ติดตั้ง frontend

```bash
cd ../frontend
npm install
```

## ตัวแปรแวดล้อมสำหรับ backend

สร้างไฟล์ `backend/.env` และตั้งค่าตามตัวอย่างนี้:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bakery_store
JWT_SECRET=super_secret_key_should_be_long_and_random
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> อย่าเก็บข้อมูลลับ เช่น รหัสผ่านหรือคีย์ API ไว้ใน repository แบบสาธารณะ

## การรันโปรเจค

### รัน backend

```bash
cd backend
npm run dev
```

### รัน frontend

ในอีกเทอร์มินัลหนึ่ง:

```bash
cd frontend
npm run dev
```

จากนั้นเปิดเว็บที่:

```text
http://localhost:5173
```

## คำสั่งสำคัญ

### Backend

- `npm run dev` - รัน backend ด้วย nodemon
- `npm start` - รัน backend ด้วย node

### Frontend

- `npm run dev` - รัน frontend ในโหมดพัฒนา
- `npm run build` - build frontend สำหรับ production
- `npm run lint` - ตรวจสอบโค้ดด้วย ESLint

## หมายเหตุ

- Backend ต้องทำงานก่อนหรือพร้อมใช้งานก่อนที่จะรัน frontend เพราะ frontend เรียก API ผ่าน proxy
- รูปภาพสินค้าและรูปภาพการชำระเงินจะถูกเรียกจาก backend ที่พอร์ต `5000`
- หากใช้พอร์ตอื่น ต้องอัปเดต `frontend/vite.config.js` และ `backend/index.js`


