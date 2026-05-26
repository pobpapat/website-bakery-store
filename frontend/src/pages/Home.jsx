import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const isPromoActive = (promo) => {
  if (!promo || promo.Promotion_discount <= 0) return false;
  if (!promo.Promotion_end) return true;
  return new Date(promo.Promotion_end) > new Date();
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        // Get up to 8 products for the slideshow
        setFeaturedProducts(res.data.slice(0, 8)); 
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="relative isolate overflow-hidden min-h-[80vh] animate-fade-in pb-20">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-float" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '4s', animationDuration: '9s' }}></div>

      <div className="text-center px-6 max-w-4xl mx-auto pt-24 pb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white glass mb-8 animate-fade-in shadow-sm hover:scale-105 transition-transform cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">สินค้าใหม่ในร้าน</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-800 mb-8 tracking-tighter leading-tight drop-shadow-sm">
          สร้างสรรค์เรื่องราว <span className="bg-gradient-to-r from-primary via-indigo-500 to-rose-400 bg-clip-text text-transparent animate-pulse">เบเกอรี่</span> ที่สมบูรณ์แบบ
        </h1>

        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          ยกระดับการทำขนมของคุณด้วยอุปกรณ์เบเกอรี่เกรดพรีเมียม คัดสรรจากแบรนด์ชั้นนำทั่วโลก เพื่อทุกผลงานที่สมบูรณ์แบบ
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            to="/products"
            className="group relative px-10 py-5 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-[2rem] text-xl font-black hover:scale-105 transform hover:-translate-y-1 transition-all shadow-2xl shadow-primary/40 flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">ช้อปอุปกรณ์เลย</span>
            <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4 4H3" /></svg>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </Link>

          <Link
            to="/promotions"
            className="px-10 py-5 bg-white/80 backdrop-blur-sm text-rose-500 border-2 border-rose-100 rounded-[2rem] text-xl font-bold hover:bg-rose-50 hover:border-rose-200 hover:scale-105 transform hover:-translate-y-1 transition-all shadow-xl shadow-rose-500/10 flex items-center gap-3"
          >
            โปรโมชั่นสุดคุ้ม <span className="animate-bounce">🔥</span>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-8 border-t border-slate-100 pt-12 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">5k+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">สินค้า</div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">50+</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">แบรนด์</div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800 tracking-tighter">100%</div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">พรีเมียม</div>
          </div>
        </div>
      </div>

      {/* Featured Products Slideshow */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">สินค้าแนะนำ</h2>
            <Link to="/products" className="text-primary font-bold hover:text-primary-dark flex items-center gap-1 group">
              ดูทั้งหมด
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </Link>
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
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="pb-16 px-4 -mx-4"
          >
            {featuredProducts.map(product => (
              <SwiperSlide key={product._id} className="h-auto py-4">
                <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-primary/10 border border-slate-100 overflow-hidden flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative overflow-hidden h-64 bg-slate-50">
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
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-2 flex justify-between items-start">
                      <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-wider">
                        {product.Cat_id?.Cat_name || 'ทั่วไป'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2" title={product.equipment_name}>
                      {product.equipment_name}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                          {isPromoActive(product.Promotion_id) ? (
                            <>
                              <span className="text-xs text-slate-400 line-through mb-0.5">{product.equipment_price.toLocaleString()} ฿</span>
                              <span className="text-2xl font-black text-rose-500 tracking-tight">
                                {(product.equipment_price * (100 - product.Promotion_id.Promotion_discount) / 100).toLocaleString()} <span className="text-sm">฿</span>
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-black text-slate-900 tracking-tight">{product.equipment_price.toLocaleString()} <span className="text-sm">฿</span></span>
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
    </div>
  );
};

export default Home;  