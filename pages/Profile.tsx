
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { uploadToImgbb } from '../services/imgbb';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';

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
    { label: 'My Orders', icon: 'shopping-bag', path: '/orders', desc: 'Track and view your orders' },
    { label: 'My Wishlist', icon: 'heart', path: '/wishlist', desc: 'View saved products' },
    { label: 'Account Settings', icon: 'user-cog', path: '/settings', desc: 'Manage your profile and security' },
    { label: 'Help Center', icon: 'headset', path: '/help-center', desc: 'Contact customer support' }
  ];

  const isAdmin = localUserData?.role === 'admin' || 
                  localUserData?.email?.toLowerCase().trim() === 'admin@vibe.shop' ||
                  localUserData?.role === 'staff';

  return (
    <div className="p-6 md:p-12 pb-48 bg-white max-w-2xl mx-auto min-h-screen">
       {localUserData ? (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-16 mt-6">
               <div className="flex items-center space-x-6">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-zinc-100 overflow-hidden shadow-sm"
                  >
                     <img src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}&background=000&color=fff`} className="w-full h-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                  </motion.div>
                  
                  <div>
                     <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-1">{localUserData?.displayName}</h2>
                     <p className="text-zinc-500 text-sm font-medium mb-2">{localUserData?.email}</p>
                     <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{isAdmin ? 'Admin' : 'Member'}</span>
                  </div>
               </div>
               
               <button onClick={() => navigate('/profile/edit')} className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-full shadow-sm hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 group">
                   <Icon name="edit" className="text-sm" />
               </button>
            </div>

            <div className="space-y-3">
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-4">Dashboard</h3>
               {isAdmin && (
                 <Link to="/admin" className="flex items-center justify-between p-5 px-6 bg-zinc-900 rounded-2xl hover:bg-black shadow-md shadow-zinc-200 transition-all group overflow-hidden mb-6">
                    <div className="flex items-center space-x-4">
                       <div className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center">
                           <Icon name="shield-alt" className="text-sm" />
                       </div>
                       <div>
                           <div className="font-bold text-base text-white">Admin Panel</div>
                           <div className="text-[10px] font-medium text-white/50 uppercase tracking-widest">Manage store & configuration</div>
                       </div>
                    </div>
                    <Icon name="arrow-right" className="text-xs text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                 </Link>
               )}
               
               <div className="h-px w-full bg-zinc-100 my-8"></div>
               
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-4">Your Account</h3>
               {menuItems.map((item, idx) => (
                 <Link key={idx} to={item.path} className="flex items-center justify-between p-4 px-6 bg-white border border-zinc-200 hover:border-black rounded-2xl hover:shadow-lg hover:shadow-black/5 transition-all group">
                    <div className="flex items-center space-x-5">
                       <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-black transition-colors">
                          <Icon name={item.icon} className="text-zinc-400 group-hover:text-white transition-colors text-sm" />
                       </div>
                       <div>
                           <div className="font-bold text-base text-zinc-900">{item.label}</div>
                           <div className="text-[11px] font-medium text-zinc-500 mt-1">{item.desc}</div>
                       </div>
                    </div>
                    <Icon name="chevron-right" className="text-xs text-zinc-300 group-hover:text-black transition-colors group-hover:translate-x-1" />
                 </Link>
               ))}

               <div className="pt-10">
                   <button onClick={handleLogout} className="w-full flex items-center justify-center p-5 bg-white border border-red-200 text-red-500 rounded-2xl hover:bg-red-50 transition-all font-bold group shadow-sm active:scale-95 space-x-3">
                      <Icon name="sign-out-alt" />
                      <span>Log Out</span>
                   </button>
               </div>
            </div>
          </div>
       ) : (
          <div className="flex flex-col items-center justify-center text-center py-40 animate-fade-in">
             <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-zinc-100">
               <Icon name="user" className="text-3xl text-zinc-300" />
             </div>
             <h2 className="text-3xl font-black mb-4 tracking-tight text-zinc-900">Sign In to Continue</h2>
             <p className="text-sm font-medium text-zinc-500 mb-10 max-w-xs leading-relaxed">Log in to view your profile, track orders, and manage wishlist.</p>
             <button onClick={() => navigate('/auth-selector')} className="px-10 py-4 bg-black text-white rounded-full font-bold text-[11px] uppercase tracking-widest shadow-xl hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all flex items-center space-x-3">
               <span>Sign In</span>
               <Icon name="arrow-right" />
             </button>
          </div>
       )}
    </div>
  );
};

export default Profile;
