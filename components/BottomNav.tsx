
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
    <div className="fixed bottom-6 left-0 right-0 w-full flex justify-center z-[100] pointer-events-none px-4 md:hidden">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white px-2 py-2 flex justify-between items-center rounded-full shadow-2xl pointer-events-auto w-full max-w-xs border border-zinc-100"
      >
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={`relative flex flex-col items-center justify-center flex-1 w-12 h-12 rounded-full transition-all duration-300 ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-[#06331e] rounded-full z-0 shadow-md"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <i className={`${link.icon} text-lg relative z-10 transition-transform ${isActive ? 'scale-100' : 'hover:scale-110'}`}></i>
            </NavLink>
          );
        })}
      </motion.div>
    </div>
  );
};

export default BottomNav;
