import { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/getImageUrl';
import { Link } from 'react-router-dom';

const Promotions = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await axios.get('/api/products');
                // Filter only products with an active (non-expired) promotion
                const now = new Date();
                const promoProducts = res.data.filter(p => {
                    if (!p.Promotion_id || p.Promotion_id.Promotion_discount <= 0) return false;
                    if (!p.Promotion_id.Promotion_end) return true;
                    return new Date(p.Promotion_id.Promotion_end) > now;
                });
                setProducts(promoProducts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    return (
        <div className="py-16 px-6 max-w-7xl mx-auto animate-fade-in">
            <div className="text-center mb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 opacity-10 select-none pointer-events-none">
                    <h2 className="text-9xl font-black text-rose-500 whitespace-nowrap">คุ้มสุดๆ</h2>
                </div>
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-black mb-6 border border-rose-100 shadow-sm animate-pulse">
                    <svg className="w-5 h-5 font-bold" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.454A1 1 0 005.05 5.556C3.496 7.044 2.5 9.173 2.5 11.5a7.5 7.5 0 1015 0c0-3-1.183-5.703-3.14-7.738a1 1 0 00-1.54 1.14c.261.42.447.853.562 1.285A7.417 7.417 0 0115 11.5a5 5 0 01-5 5 5 5 0 01-4-8.062c.387.254.802.432 1.237.535.114.027.234.041.353.041a1.125 1.125 0 001.089-1.397 15.412 15.412 0 01.3-3.737 32.36 32.36 0 01.623-3.048c.15-.658.337-1.319.584-1.92.253-.612.56-1.124.962-1.46z" clipRule="evenodd" /></svg>
                    สุดยอดโปรโมชั่น
                </div>
                <h1 className="text-6xl font-black text-slate-900 mb-5 tracking-tight">สินค้าโปรโมชั่น</h1>
                <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light">
                    รวมดีลเด็ด เครื่องมือเบเกอรี่ในราคาที่คุณต้องร้องว้าว <span className="font-bold text-rose-500">ประหยัดสูงสุด70%</span>
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                    <div className="mb-6 inline-flex p-6 bg-slate-50 rounded-full text-slate-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-slate-400 text-2xl font-bold mb-4">ยังไม่มีสินค้าลดราคาในตอนนี้</p>
                    <Link to="/products" className="px-8 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
                        เลือกซื้อสินค้าปกติ
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {products.map(product => {
                        const discount = product.Promotion_id.Promotion_discount;
                        const originalPrice = product.equipment_price;
                        const salePrice = originalPrice * (100 - discount) / 100;

                        return (
                            <div key={product._id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-rose-100 border border-slate-100 overflow-hidden flex flex-col h-full card-hover relative">
                                {/* Hot Badge */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-4 group-hover:-translate-y-2">
                                    <div className="bg-rose-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap uppercase tracking-widest">
                                        ดีลดีที่สุด 🔥
                                    </div>
                                </div>

                                {/* Discount Badge */}
                                <div className="absolute top-5 left-5 z-20 bg-rose-600 text-white font-black px-4 py-2 rounded-2xl shadow-xl transform -rotate-12 group-hover:rotate-0 transition-all duration-300 border-2 border-white/20">
                                    -{discount}%
                                    {product.Promotion_id.Promotion_end && (
                                        <div className="bg-rose-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                                            หมดโปร: {new Date(product.Promotion_id.Promotion_end).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    )}
                                </div>

                                <div className="relative overflow-hidden h-72 bg-slate-50">
                                    {product.images?.length > 0 ? (
                                        <img src={getImageUrl(product.images[0])} alt={product.equipment_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-300">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="mb-3">
                                        <span className="text-[10px] font-black text-rose-500 px-3 py-1 bg-rose-50 rounded-full uppercase tracking-tighter">
                                            ดีลเด็ดเฉพาะคุณ
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-rose-600 transition-colors line-clamp-2 min-h-[3.5rem]" title={product.equipment_name}>{product.equipment_name}</h3>

                                    <div className="mt-auto pt-6 border-t border-slate-50">
                                        <div className="flex flex-col mb-6">
                                            <div className="flex items-end gap-3">
                                                <span className="text-4xl font-black text-rose-600 tracking-tighter leading-none">
                                                    {salePrice.toLocaleString()} <span className="text-lg font-bold">฿</span>
                                                </span>
                                                <span className="text-lg text-slate-300 line-through font-medium mb-1">{originalPrice.toLocaleString()} ฿</span>
                                            </div>
                                            <p className="text-xs text-rose-400 font-bold mt-2 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                                เซฟไปได้เลย {(originalPrice - salePrice).toLocaleString()} ฿
                                            </p>
                                        </div>

                                        <Link
                                            to={`/product/${product._id}`}
                                            className="block w-full text-center py-4 bg-slate-900 group-hover:bg-rose-600 text-white rounded-2xl font-black shadow-xl hover:shadow-rose-300 transform group-hover:-translate-y-1 transition-all duration-300 tracking-wide uppercase text-sm"
                                        >
                                            ซื้อก่อนหมดสิทธิ์!
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Promotions;
