
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const links = [
    { to: '/', icon: 'fas fa-home', label: 'Home' },
    { to: '/wishlist', icon: 'fas fa-heart', label: 'Saved' },
    { to: '/cart', icon: 'fas fa-shopping-bag', label: 'Cart' },
    { to: '/profile', icon: 'fas fa-user', label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 w-full flex justify-center z-[100] pointer-events-none px-4">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[#06331e]/90 backdrop-blur-xl px-1.5 py-1.5 flex justify-between items-center rounded-3xl shadow-2xl pointer-events-auto w-full max-w-xs border border-[#0a4a2b]"
      >
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-0.5 rounded-[1.2rem] transition-all duration-300 ${isActive ? 'text-white' : 'text-emerald-500/50 hover:text-emerald-400'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-emerald-500/20 rounded-[1.2rem] z-0 shadow-inner"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <i className={`${link.icon} text-lg relative z-10 transition-transform ${isActive ? 'scale-110 mb-0.5' : 'mb-0 hover:scale-110'}`}></i>
              <span className={`text-[7px] font-black uppercase tracking-widest relative z-10 transition-all ${isActive ? 'opacity-100 scale-100' : 'opacity-0 h-0 overflow-hidden scale-90'}`}>
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;
