import { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const isPromoActive = (promo) => {
  if (!promo || promo.Promotion_discount <= 0) return false;
  if (!promo.Promotion_end) return true;
  return new Date(promo.Promotion_end) > new Date();
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory ? p.Cat_id?._id === selectedCategory : true;
    const matchSearch = p.equipment_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });


  return (
    <>
      <div className="py-12 px-6 max-w-7xl mx-auto animate-fade-in">
        <div className="text-center mb-16 relative z-10 animate-fade-in pt-8 pb-4">
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 tracking-tighter drop-shadow-sm">
            ค้นหา <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">อุปกรณ์ทำเบเกอรี่</span> ที่คุณต้องการ
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            เลือกซื้ออุปกรณ์ทำเบเกอรี่ที่คัดสรรมาอย่างพิถีพิถัน
          </p>
        </div>

        {/* Featured Products Slideshow */}
        {products.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">สินค้าแนะนำ</h2>
            </div>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 4 },
              }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="pb-16 px-4 -mx-4"
            >
              {products.slice(0, 8).map(product => (
                <SwiperSlide key={`promo-${product._id}`} className="h-auto py-4">
                  <div className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-primary/10 border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative overflow-hidden h-56 bg-slate-50">
                      {product.images?.length > 0 ? (
                        <img src={getImageUrl(product.images[0])} alt={product.equipment_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Link to={`/product/${product._id}`} className="px-6 py-2.5 bg-white text-primary rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          ดูรายละเอียด
                        </Link>
                      </div>

                      {isPromoActive(product.Promotion_id) && (
                        <div className="absolute top-4 left-4 z-20 bg-rose-600 text-white font-black px-3 py-1.5 rounded-xl shadow-lg text-sm">
                          -{product.Promotion_id.Promotion_discount}%
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-1" title={product.equipment_name}>
                        {product.equipment_name}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-slate-50">
                        <div className="flex items-end justify-between">
                          <div className="flex flex-col">
                            {isPromoActive(product.Promotion_id) ? (
                              <>
                                <span className="text-xs text-slate-400 line-through mb-0.5">{product.equipment_price.toLocaleString()} ฿</span>
                                <span className="text-xl font-black text-rose-500 tracking-tight">
                                  {(product.equipment_price * (100 - product.Promotion_id.Promotion_discount) / 100).toLocaleString()} <span className="text-xs">฿</span>
                                </span>
                              </>
                            ) : (
                              <span className="text-xl font-black text-slate-900 tracking-tight">{product.equipment_price.toLocaleString()} <span className="text-xs">฿</span></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        <div className="mb-12 flex flex-col md:flex-row gap-6 justify-center items-center">
          <div className="relative w-full max-w-md group">
            <input
              type="text"
              placeholder="ค้นหาอุปกรณ์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm group-hover:border-primary/30 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="relative group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-6 pr-12 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm group-hover:border-primary/30 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none cursor-pointer transition-all min-w-[200px]"
            >
              <option value="">หมวดหมู่ทั้งหมด</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.Cat_name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          <div className="col-span-full">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">สินค้าทั้งหมด</h2>
          </div>
          {filteredProducts.map(product => (
            <div key={product._id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-primary/5 border border-slate-100 overflow-hidden flex flex-col h-full card-hover">
              <div className="relative overflow-hidden h-72 bg-slate-50">
                {product.images?.length > 0 ? (
                  <img src={getImageUrl(product.images[0])} alt={product.equipment_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link to={`/product/${product._id}`} className="px-6 py-2.5 bg-white text-primary rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    ดูรายละเอียด
                  </Link>
                </div>

                {isPromoActive(product.Promotion_id) && (
                  <div className="absolute top-5 left-5 z-20 bg-rose-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl transform -rotate-12 group-hover:rotate-0 transition-all duration-300 border-2 border-white/20">
                    <div className=" text-white ">
                      -{product.Promotion_id.Promotion_discount}%
                      {product.Promotion_id.Promotion_end && (
                        <div className="bg-rose-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                          หมดโปร: {new Date(product.Promotion_id.Promotion_end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}</div>

                  </div>
                )}
              </div>

              <div className="p-7 flex flex-col flex-grow">
                <div className="mb-2">
                  <span className="text-xs font-bold text-primary px-2.5 py-1 bg-primary/5 rounded-full uppercase tracking-wider">
                    {product.Cat_id?.Cat_name || 'ทั่วไป'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]" title={product.equipment_name}>
                  {product.equipment_name}
                </h3>

                <div className="mt-auto pt-6 border-t border-slate-50">
                  <div className="flex items-end justify-between mb-0">
                    <div className="flex flex-col">
                      {isPromoActive(product.Promotion_id) ? (
                        <>
                          <span className="text-xs text-slate-400 line-through mb-1">{product.equipment_price.toLocaleString()} ฿</span>
                          <span className="text-3xl font-black text-rose-500 tracking-tight">
                            {(product.equipment_price * (100 - product.Promotion_id.Promotion_discount) / 100).toLocaleString()} <span className="text-lg">฿</span>
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{product.equipment_price.toLocaleString()} <span className="text-lg">฿</span></span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${product.equipment_stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {product.equipment_stock > 0 ? `คงเหลือ: ${product.equipment_stock}` : 'สินค้าหมด'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-4 bg-primary text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${showScrollTop ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
          }`}
        title="เลื่อนขึ้นบนสุด"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
};

export default Products;