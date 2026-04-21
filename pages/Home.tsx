
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { getReadableAddress } from '../services/location';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import Logo from '../components/Logo';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationName, setLocationName] = useState('Locating...');
  const [quickViewImg, setQuickViewImg] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerContainerRef,
    offset: ["start end", "end start"],
    layoutEffect: false
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const smoothY = useSpring(parallaxY, { stiffness: 80, damping: 20, restDelta: 0.001 });

  useEffect(() => {
    const qProds = query(collection(db, 'products'));
    const unsubscribeProds = onSnapshot(qProds, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (err) => {
      console.warn("Products fetch error:", err.message);
    });

    const qBanners = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const unsubscribeBanners = onSnapshot(qBanners, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Banners fetch error:", err.message);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const address = await getReadableAddress(position.coords.latitude, position.coords.longitude);
        setLocationName(address);
      }, () => setLocationName('Dhaka, Bangladesh'));
    }
    return () => { unsubscribeProds(); unsubscribeBanners(); };
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => setActiveBanner(prev => (prev + 1) % banners.length), 6000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
    setSearchResults(results);
  }, [searchQuery, products]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { name: 'Mobile', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=250&h=250&auto=format&fit=crop' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=250&h=250&auto=format&fit=crop' },
    { name: 'Gadgets', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=250&h=250&auto=format&fit=crop' },
    { name: 'Chargers', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=250&h=250&auto=format&fit=crop' }
  ];

  return (
    <div className="px-6 md:px-12 py-10 pb-48 bg-white max-w-[1440px] mx-auto min-h-screen font-inter">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center mb-10 md:mb-12">
        <Logo scale={0.8} className="origin-left" />
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col text-right mr-4">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Delivering to</p>
            <button className="flex items-center justify-end font-bold text-xs hover:text-[#06331e] transition-colors">
              <i className="fas fa-map-marker-alt text-emerald-500 mr-2 text-[10px]"></i>
              {locationName}
            </button>
          </div>
          <button onClick={() => navigate('/notifications')} className="w-12 h-12 flex items-center justify-center bg-zinc-50 rounded-full relative border border-zinc-100 active:scale-95 transition-transform hover:bg-[#06331e] hover:text-white shadow-sm group">
            <i className="fas fa-bell text-sm"></i>
            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white group-hover:border-[#06331e]"></span>
          </button>
        </div>
      </motion.div>

      <div className="mb-10 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 leading-[1.1] mb-2">Find your perfect <br/><span className="text-emerald-600">vibe gadget.</span></h1>
        
        <div ref={searchRef} className="relative w-full max-w-md mt-8 z-50">
          <div className={`relative flex items-center bg-zinc-50 rounded-2xl border transition-all ${isSearchFocused ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-zinc-200'}`}>
            <i className="fas fa-search absolute left-5 text-zinc-400"></i>
            <input 
              type="text" 
              placeholder="Search for iPhones, AirPods, accessories..." 
              className="w-full bg-transparent py-4 pl-12 pr-6 outline-none text-sm font-semibold text-zinc-900 placeholder:text-zinc-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if(e.key === 'Enter') navigate('/search');
              }}
            />
          </div>

          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() !== '' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden"
              >
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex items-center space-x-4 px-5 py-3 hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        <div className="w-12 h-12 bg-white rounded-lg border border-zinc-100 flex-shrink-0 p-1">
                          <img src={product.image} className="w-full h-full object-contain" alt={product.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs truncate text-zinc-900">{product.name}</h4>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">৳{product.price}</p>
                        </div>
                      </div>
                    ))}
                    <div className="px-3 pt-2 pb-1 border-t border-zinc-50">
                      <button onClick={() => navigate('/search')} className="w-full py-2 bg-zinc-50 hover:bg-[#06331e] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 transition-colors">
                        View All Results
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm font-semibold text-zinc-500">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {banners.length > 0 && (
        <motion.div 
          ref={bannerContainerRef}
          className="relative mb-16 overflow-hidden rounded-[2rem] border border-zinc-50 shadow-sm z-10"
        >
          <div className="flex transition-transform duration-1000 ease-[cubic-bezier(0.23, 1, 0.32, 1)]" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {banners.map((banner, i) => (
              <div key={i} className="min-w-full bg-[#06331e] aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] relative overflow-hidden flex items-center">
                 <motion.img 
                  src={banner.imageUrl} 
                  style={{ y: smoothY, scale: 1.2 }}
                  className="absolute inset-0 w-full h-full object-cover origin-center opacity-60 mix-blend-overlay" 
                  alt="" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#06331e]/80 via-[#06331e]/40 to-transparent"></div>
                 <div className="relative z-10 p-6 md:p-14 max-w-lg">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-2 uppercase leading-[1.1] text-white">{banner.title}</h2>
                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6 text-emerald-100">{banner.description}</p>
                    <button onClick={() => banner.link && navigate(banner.link)} className="px-6 py-2.5 bg-white text-[#06331e] rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-50 transition-colors">
                      Explore Now
                    </button>
                 </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 right-6 flex space-x-2 z-20">
             {banners.map((_, i) => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeBanner ? 'w-8 bg-emerald-400' : 'w-2 bg-white/30'}`}></div>
             ))}
          </div>
        </motion.div>
      )}

      {/* Added Feature Section */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 mb-16 pb-2 px-2 mask-linear-fade">
         <div className="bg-zinc-50 rounded-full px-5 py-3 flex items-center shrink-0 border border-zinc-100 shadow-sm">
            <i className="fas fa-shipping-fast text-emerald-600 mr-3 text-sm"></i>
            <span className="text-[11px] font-bold text-zinc-900 whitespace-nowrap">Fast Delivery Across BD</span>
         </div>
         <div className="bg-zinc-50 rounded-full px-5 py-3 flex items-center shrink-0 border border-zinc-100 shadow-sm">
            <i className="fas fa-shield-alt text-emerald-600 mr-3 text-sm"></i>
            <span className="text-[11px] font-bold text-zinc-900 whitespace-nowrap">100% Secure Payments</span>
         </div>
         <div className="bg-zinc-50 rounded-full px-5 py-3 flex items-center shrink-0 border border-zinc-100 shadow-sm">
            <i className="fas fa-medal text-emerald-600 mr-3 text-sm"></i>
            <span className="text-[11px] font-bold text-zinc-900 whitespace-nowrap">Top Quality Original Gadgets</span>
         </div>
         <div className="bg-zinc-50 rounded-full px-5 py-3 flex items-center shrink-0 border border-zinc-100 shadow-sm">
            <i className="fas fa-headset text-emerald-600 mr-3 text-sm"></i>
            <span className="text-[11px] font-bold text-zinc-900 whitespace-nowrap">24/7 Always Here Support</span>
         </div>
      </div>

      <div className="flex justify-start mb-16 overflow-x-auto no-scrollbar gap-6 md:gap-10 pb-4 px-2">
        {categories.map(cat => (
          <motion.button whileHover={{ y: -5 }} key={cat.name} onClick={() => setActiveCategory(cat.name === activeCategory ? 'All' : cat.name)} className={`flex flex-col items-center shrink-0 group`}>
            <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 transition-all border-4 overflow-hidden ${activeCategory === cat.name ? 'border-[#06331e] shadow-xl' : 'border-zinc-100 hover:border-emerald-200 shadow-sm'}`}>
              <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeCategory === cat.name ? 'text-[#06331e]' : 'text-zinc-400 group-hover:text-zinc-600'}`}>{cat.name}</span>
          </motion.button>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Our Collection</h3>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">New Arrivals.</h2>
          </div>
          <button onClick={() => navigate('/all-products')} className="text-[10px] font-bold uppercase tracking-widest text-[#06331e] hover:text-emerald-600 transition-colors flex items-center">
            View All <i className="fas fa-arrow-right ml-2 text-[8px]"></i>
          </button>
        </div>
        
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {products.filter(p => activeCategory === 'All' || p.category === activeCategory).map((product) => (
            <motion.div 
              layout
              key={product.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="break-inside-avoid"
            >
              <div className="block group relative">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="bg-zinc-50/30 rounded-[2rem] mb-4 overflow-hidden relative border border-zinc-100 shadow-sm group-hover:shadow-xl group-hover:border-emerald-500/20 group-hover:-translate-y-2 transition-all duration-300">
                    <img src={product.image} className="w-full h-auto object-contain p-8 group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" alt={product.name} />
                    <div className="absolute top-4 right-4">
                      <div className="bg-[#06331e] text-white px-3 py-1.5 rounded-full text-[9px] font-bold shadow-md tracking-wider">
                        ৳{product.price}
                      </div>
                    </div>
                  </div>
                </Link>
                
                <button 
                  onClick={(e) => { e.preventDefault(); setQuickViewImg(product.image); }}
                  className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-[#06331e] hover:text-white shadow-lg border border-zinc-100/50"
                >
                   <i className="fas fa-expand-alt text-xs"></i>
                </button>
                
                <div className="px-2 pb-1">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-bold text-xs md:text-sm truncate mb-1 tracking-tight group-hover:text-emerald-700 transition-colors uppercase">{product.name}</h4>
                  </Link>
                  <div className="flex items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    <i className="fas fa-star text-emerald-500 mr-1.5 text-[10px]"></i>{product.rating} • {product.category}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {quickViewImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#06331e]/50 backdrop-blur-xl z-[1000] flex items-center justify-center p-6"
            onClick={() => setQuickViewImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl aspect-square bg-white rounded-3xl shadow-2xl p-10 flex items-center justify-center border border-zinc-100"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setQuickViewImg(null)} className="absolute top-6 right-6 w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-[#06331e] hover:text-white transition-all">
                 <i className="fas fa-times text-xs"></i>
              </button>
              <img src={quickViewImg} className="max-w-full max-h-full object-contain" alt="Preview" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
