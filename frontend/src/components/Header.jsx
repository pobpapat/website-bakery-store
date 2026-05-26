import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
    window.location.reload(); // Force reload to clear state cleanly
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent tracking-tight hover:opacity-80 transition-opacity">
          Bakery Store
        </Link>
        <ul className="flex items-center space-x-8 font-medium text-slate-600">
          <li>
            <Link to="/products" className="hover:text-primary transition-colors hover:scale-105 inline-block">อุปกรณ์ทั้งหมด</Link>
          </li>
          <li>
            <Link to="/promotions" className="text-rose-500 font-bold hover:text-rose-600 transition flex items-center gap-1.5 group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              โปรโมชั่น
            </Link>
          </li>
          {user ? (
            <>
              {user.role !== 'admin' && (
                <>
                  <li><Link to="/cart" className="hover:text-primary transition-colors">ตะกร้าสินค้า</Link></li>
                  <li><Link to="/orders" className="hover:text-primary transition-colors">ประวัติการสั่งซื้อ</Link></li>
                  <li>
                    <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      ข้อมูลสมาชิก
                    </Link>
                  </li>
                </>
              )}
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className="px-5 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-semibold">
                    จัดการระบบ
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-slate-500 hover:text-rose-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  ออก
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:text-primary transition-colors">เข้าสู่ระบบ</Link></li>
              <li>
                <Link to="/register" className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary-dark shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all font-semibold">
                  สมัครสมาชิก
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;