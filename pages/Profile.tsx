
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { uploadToImgbb } from '../services/imgbb';
import { motion } from 'framer-motion';

const Profile: React.FC<{ userData: UserProfile | null }> = ({ userData: initialUserData }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserProfile | null>(initialUserData);

  useEffect(() => { 
    setLocalUserData(initialUserData); 
  }, [initialUserData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('f_cart');
    navigate('/auth-selector');
  };

  const menuItems = [
    { label: 'Orders', icon: 'fas fa-shopping-bag', path: '/orders', desc: 'Manage your history' },
    { label: 'Favorites', icon: 'fas fa-heart', path: '/wishlist', desc: 'Saved gadgets' },
    { label: 'Settings', icon: 'fas fa-cog', path: '/settings', desc: 'Profile options' },
    { label: 'Support', icon: 'fas fa-headset', path: '/help-center', desc: 'Help desk' }
  ];

  const isAdmin = localUserData?.role === 'admin' || 
                  localUserData?.email?.toLowerCase().trim() === 'admin@vibe.shop';

  return (
    <div className="p-6 md:p-12 pb-48 bg-white max-w-3xl mx-auto min-h-screen font-inter">
       {localUserData ? (
          <div>
            <div className="flex items-center justify-between mb-12">
               <div className="flex items-center space-x-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-zinc-200 overflow-hidden shadow-sm bg-zinc-50"
                  >
                     <img src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}&background=000&color=fff`} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                  </motion.div>
                  
                  <div>
                     <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#06331e] mb-1.5">{localUserData?.displayName}</h2>
                     <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest mb-3 uppercase">{localUserData?.email}</p>
                     <span className="px-3 py-1 bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-full text-[8px] font-bold uppercase tracking-widest">{isAdmin ? 'Administrator' : 'Verified Member'}</span>
                  </div>
               </div>
               
               <button onClick={() => navigate('/profile/edit')} className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white hover:border-[#06331e] transition-all active:scale-95">
                   <i className="fas fa-pen text-xs"></i>
               </button>
            </div>

            <div className="space-y-3 mt-8">
               {isAdmin && (
                 <Link to="/admin" className="flex items-center justify-between p-4 px-6 md:px-8 bg-zinc-50 border-2 border-emerald-100 hover:border-emerald-300 rounded-full hover:bg-white transition-all group shadow-sm">
                    <div className="flex items-center space-x-4">
                       <i className="fas fa-crown text-emerald-500 text-sm"></i>
                       <span className="font-bold text-sm text-[#06331e]">Admin Dashboard</span>
                    </div>
                    <i className="fas fa-arrow-right text-xs text-emerald-500 group-hover:translate-x-1 transition-transform"></i>
                 </Link>
               )}
               
               {menuItems.map((item, idx) => (
                 <Link key={idx} to={item.path} className="flex items-center justify-between p-4 px-6 md:px-8 bg-zinc-50/50 border-2 border-zinc-100/50 hover:border-zinc-200 rounded-full hover:bg-white transition-all group">
                    <div className="flex items-center space-x-4">
                       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 group-hover:border-[#06331e]/20 transition-colors">
                          <i className={`${item.icon} text-zinc-400 group-hover:text-[#06331e] transition-colors text-xs`}></i>
                       </div>
                       <span className="font-bold text-sm text-zinc-700 group-hover:text-[#06331e] transition-colors">{item.label}</span>
                    </div>
                    <i className="fas fa-chevron-right text-[10px] text-zinc-300 group-hover:text-[#06331e] transition-colors group-hover:translate-x-0.5"></i>
                 </Link>
               ))}

               <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 px-6 md:px-8 bg-zinc-50/50 border-2 border-red-50 hover:border-red-100 rounded-full hover:bg-red-50/30 transition-all group mt-6">
                 <div className="flex items-center space-x-4">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-red-50 group-hover:border-red-200 transition-colors">
                      <i className="fas fa-sign-out-alt text-xs text-red-400 group-hover:text-red-500 transition-colors"></i>
                   </div>
                   <span className="font-bold text-sm text-red-500 group-hover:text-red-600 transition-colors">Log out</span>
                 </div>
               </button>
            </div>
          </div>
       ) : (
          <div className="flex flex-col items-center justify-center text-center py-32">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 border border-zinc-100 shadow-sm">
               <i className="fas fa-user-lock text-3xl text-zinc-300"></i>
             </div>
             <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-[#06331e]">Please Login</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-10 max-w-sm leading-relaxed">Sign in to track orders, manage preferences, and secure your account.</p>
             <button onClick={() => navigate('/auth-selector')} className="px-12 py-5 bg-[#06331e] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#06331e]/20 hover:bg-[#0a4a2b] hover:scale-105 active:scale-95 transition-all">Authenticate Now</button>
          </div>
       )}
    </div>
  );
};

export default Profile;
