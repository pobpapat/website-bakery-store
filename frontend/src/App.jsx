import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import EquipmentDetail from './pages/EquipmentDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Promotions from './pages/Promotions';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageCategories from './pages/admin/ManageCategories';
import ManagePromotions from './pages/admin/ManagePromotions';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';
import SalesSummary from './pages/admin/SalesSummary';

import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// ตั้งค่า Global Axios Interceptor สำหรับจัดการ 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// คอมโพเนนต์สำหรับดักเส้นทางที่ต้องการล็อกอินหรือสิทธิ์แอดมิน
const ProtectedRoute = ({ user, adminOnly }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // ตรวจสอบว่า token หมดอายุหรือยัง (decoded.exp มีหน่วยเป็นวินาที ต้องคูณ 1000)
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser({ id: decoded.id, role: decoded.role });
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center py-20">กำลังโหลด...</div>;

  return (
    <Router>
      <Header user={user} setUser={setUser} />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/product/:id" element={<EquipmentDetail user={user} />} />
          <Route element={<ProtectedRoute user={user} />}>
            <Route path="/cart" element={<Cart user={user} />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/orders" element={<OrderHistory user={user} />} />
            <Route path="/orders/:id" element={<OrderDetail user={user} />} />
            <Route path="/payment/:id" element={<Payment user={user} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          </Route>
          
          <Route element={<ProtectedRoute user={user} adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/admin/products" element={<ManageProducts user={user} />} />
            <Route path="/admin/categories" element={<ManageCategories user={user} />} />
            <Route path="/admin/promotions" element={<ManagePromotions user={user} />} />
            <Route path="/admin/orders" element={<ManageOrders user={user} />} />
            <Route path="/admin/users" element={<ManageUsers user={user} />} />
            <Route path="/admin/sales" element={<SalesSummary user={user} />} />
          </Route>
          
          {/* Fallback route สำหรับจัดการ URL ที่ไม่มีอยู่ หรือหน้าที่เข้าไม่ได้ */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;