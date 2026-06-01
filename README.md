# Bakery Store E-Commerce Project

**Live Website:** [https://website-bakery-store.vercel.app/](https://website-bakery-store.vercel.app/)

โปรเจคนี้เป็นระบบร้านค้าออนไลน์ (E-commerce) สำหรับอุปกรณ์ทำเบเกอรี่ ที่ประกอบด้วย:


### Deployment & Hosting (การให้บริการและจัดเก็บข้อมูล)
- **Vercel** - สำหรับ Deploy และ Hosting ฝั่ง Frontend
- **Render** - สำหรับ Deploy และ Hosting ฝั่ง Backend (API)
- **MongoDB Atlas** - สำหรับให้บริการฐานข้อมูลบนคลาวด์ (Cloud Database)
- **Cloudinary** - สำหรับจัดเก็บรูปภาพบนคลาวด์

## เทคโนโลยีที่ใช้ 

### Frontend
- **React.js** (Vite) - สำหรับสร้าง User Interface
- **TailwindCSS** - สำหรับตกแต่งสไตล์ (Styling)
- **React Router Dom** - สำหรับจัดการเส้นทางหน้าเว็บ (Routing)
- **Axios** - สำหรับเรียกใช้ API
- **Swiper** - สำหรับทำสไลด์โชว์
- **Recharts** - สำหรับแสดงกราฟในหน้าระบบหลังบ้าน
- **jwt-decode** - สำหรับถอดรหัส JWT Token บนฝั่งไคลเอนต์
- **date-fns** - สำหรับจัดการรูปแบบวันที่

### Backend
- **Node.js** & **Express.js** - สำหรับสร้าง API Server
- **MongoDB** & **Mongoose** - สำหรับจัดการฐานข้อมูล
- **JWT (JSON Web Token)** - สำหรับระบบยืนยันตัวตน (Authentication)
- **Bcrypt.js** - สำหรับเข้ารหัสรหัสผ่าน
- **Multer** - สำหรับจัดการอัปโหลดไฟล์
- **Cloudinary** - สำหรับจัดเก็บรูปภาพบนคลาวด์
- **Nodemailer** - สำหรับระบบส่งอีเมล



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




