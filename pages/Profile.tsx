
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
    <div className="p-6 md:p-12 pb-48 bg-white max-w-2xl mx-auto min-h-screen font-inter">
       {localUserData ? (
          <div>
            <div className="flex items-center justify-between mb-16">
               <div className="flex items-center space-x-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[6px] border-zinc-50 overflow-hidden shadow-md bg-zinc-100"
                  >
                     <img src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}&background=000&color=fff`} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                  </motion.div>
                  
                  <div>
                     <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#06331e] mb-1.5">{localUserData?.displayName}</h2>
                     <p className="text-zinc-500 text-[11px] md:text-sm font-bold tracking-widest mb-3 uppercase opacity-90">{localUserData?.email}</p>
                     <span className="px-4 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-full text-[9px] font-bold uppercase tracking-widest leading-none shadow-sm">{isAdmin ? 'Administrator' : 'Verified Member'}</span>
                  </div>
               </div>
               
               <button onClick={() => navigate('/profile/edit')} className="w-14 h-14 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white hover:border-[#06331e] transition-all active:scale-95 group">
                   <i className="fas fa-pen text-sm group-hover:-translate-y-0.5 transition-transform"></i>
               </button>
            </div>

            <div className="space-y-4">
               {isAdmin && (
                 <Link to="/admin" className="flex items-center justify-between p-5 px-8 bg-zinc-50 border border-emerald-100 hover:border-emerald-300 rounded-2xl hover:bg-white shadow-sm transition-all group relative overflow-hidden mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent"></div>
                    <div className="relative flex items-center space-x-5 z-10">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 shadow-sm">
                           <i className="fas fa-crown text-sm"></i>
                       </div>
                       <span className="font-bold text-base text-[#06331e]">Deploy Dashboard</span>
                    </div>
                    <i className="fas fa-arrow-right text-xs text-emerald-600 group-hover:translate-x-1 transition-transform relative z-10"></i>
                 </Link>
               )}
               
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-2 mt-8">General Options</h3>
               {menuItems.map((item, idx) => (
                 <Link key={idx} to={item.path} className="flex items-center justify-between p-5 px-8 bg-white border border-zinc-100 hover:border-zinc-300 rounded-2xl hover:shadow-md transition-all group">
                    <div className="flex items-center space-x-5">
                       <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-[#06331e] group-hover:border-[#06331e] transition-colors shadow-sm">
                          <i className={`${item.icon} text-zinc-500 group-hover:text-white transition-colors text-sm`}></i>
                       </div>
                       <div>
                           <div className="font-bold text-base text-zinc-900 group-hover:text-[#06331e] transition-colors">{item.label}</div>
                           <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.desc}</div>
                       </div>
                    </div>
                    <i className="fas fa-chevron-right text-xs text-zinc-300 group-hover:text-[#06331e] transition-colors group-hover:translate-x-1"></i>
                 </Link>
               ))}

               <div className="pt-8">
                   <button onClick={handleLogout} className="w-full flex items-center justify-between p-6 bg-red-50/50 border border-red-100 hover:border-red-300 rounded-2xl hover:bg-red-50 transition-all group mt-6 shadow-sm">
                     <div className="flex items-center space-x-5">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-red-100 shadow-sm group-hover:bg-red-500 transition-colors">
                          <i className="fas fa-sign-out-alt text-sm text-red-500 group-hover:text-white transition-colors"></i>
                       </div>
                       <div>
                           <div className="font-black text-base text-red-500 group-hover:text-red-700 transition-colors">End Session</div>
                       </div>
                     </div>
                   </button>
               </div>
            </div>
          </div>
       ) : (
          <div className="flex flex-col items-center justify-center text-center py-32">
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 border border-zinc-100 shadow-sm">
               <i className="fas fa-user-lock text-3xl text-zinc-300"></i>
             </div>
             <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-[#06331e]">Access Restricted</h2>
             <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-10 max-w-sm leading-relaxed">Sign in to track orders, manage preferences, and secure your account.</p>
             <button onClick={() => navigate('/auth-selector')} className="px-12 py-5 bg-[#06331e] text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#06331e]/20 hover:bg-[#0a4a2b] hover:scale-105 active:scale-95 transition-all">Authenticate Now</button>
          </div>
       )}
    </div>
  );
};

export default Profile;
