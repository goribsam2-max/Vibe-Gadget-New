import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const DesktopLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
      const count = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
      const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      setCartCount(count);
      setCartTotal(total);
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    const interval = setInterval(updateCart, 1000); // Polling for fast local updates
    return () => {
      window.removeEventListener('storage', updateCart);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('f_cart');
    navigate('/auth-selector');
  };

  const menuLinks = [
    { to: '/', icon: 'fas fa-home', label: 'Home' },
    { to: '/search', icon: 'fas fa-search', label: 'Search' },
    { to: '/all-products', icon: 'fas fa-box', label: 'Catalog' },
    { to: '/wishlist', icon: 'fas fa-heart', label: 'Saved' },
    { to: '/orders', icon: 'fas fa-shopping-bag', label: 'My Orders' },
    { to: '/notifications', icon: 'fas fa-bell', label: 'Alerts' },
    { to: '/profile', icon: 'fas fa-user', label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-100 h-screen sticky top-0 shrink-0 p-6 z-40">
        <div className="mb-12 px-2">
           <h1 className="text-2xl font-black tracking-tighter text-[#06331e]">VibeGadget.</h1>
           <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Premium Tech Hub</p>
        </div>

        <nav className="flex-1 space-y-2">
          {menuLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <NavLink 
                key={link.to} 
                to={link.to}
                className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all font-bold text-sm tracking-tight ${isActive ? 'bg-[#06331e] text-white shadow-md' : 'text-zinc-500 hover:text-[#06331e] hover:bg-zinc-50'}`}
              >
                <i className={`${link.icon} w-5 text-center`}></i>
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-zinc-100 pt-6">
           {auth.currentUser ? (
              <button onClick={handleLogout} className="flex items-center space-x-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 w-full font-bold text-sm transition-colors">
                <i className="fas fa-sign-out-alt w-5 text-center"></i>
                <span>Log out</span>
              </button>
           ) : (
              <button onClick={() => navigate('/signin')} className="flex items-center justify-center space-x-2 px-4 py-3 rounded-full bg-[#06331e] text-white w-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-lg">
                <i className="fas fa-lock"></i>
                <span>Sign in</span>
              </button>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden bg-white md:bg-zinc-50/30">
        {children}
      </div>

      {/* Desktop Right Cart Sidebar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="hidden xl:flex flex-col w-80 bg-white border-l border-zinc-100 h-screen sticky top-0 shrink-0 p-6 shadow-xl z-40"
          >
            <div className="mb-8">
               <h2 className="text-xl font-black tracking-tight text-[#06331e]">Your Cart</h2>
               <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{cartCount} items</p>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
               {JSON.parse(localStorage.getItem('f_cart') || '[]').map((item: any) => (
                 <div key={item.id} className="flex items-center space-x-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                    <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 border border-zinc-50 shadow-sm">
                       <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt=""/>
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="text-[10px] font-bold text-zinc-900 truncate uppercase tracking-tighter">{item.name}</h4>
                       <p className="text-xs font-black text-emerald-600">৳{item.price * item.quantity}</p>
                    </div>
                    <div className="text-[10px] font-black text-zinc-400 px-2">x{item.quantity}</div>
                 </div>
               ))}
            </div>

            <div className="mt-8 border-t border-zinc-100 pt-6">
               <div className="flex justify-between items-end mb-6">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black tracking-tighter text-[#06331e]">৳{cartTotal}</span>
               </div>
               <button onClick={() => navigate('/checkout')} className="w-full py-4 bg-[#06331e] text-white rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                 Proceed to Checkout
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesktopLayout;
