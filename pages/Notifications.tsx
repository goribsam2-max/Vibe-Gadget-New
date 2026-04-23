
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { Notification, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data() as UserProfile);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !userProfile) return;
    
    // Query notifications
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      
      // Filter logic:
      // 1. Must be targeted to the user OR be a broadcast ('all')
      // 2. Must be created AFTER the user's registration date
      const filtered = allNotifs.filter(n => {
        const isTargeted = n.userId === auth.currentUser?.uid || n.userId === 'all';
        const isFresh = n.createdAt > (userProfile.registrationDate || userProfile.createdAt);
        return isTargeted && isFresh;
      });

      setNotifications(filtered);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-32 min-h-screen bg-white font-inter">
      <div className="flex items-center space-x-6 mb-12">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white transition-all active:scale-95">
          <Icon name="chevron-left" className="text-xs" />
        </button>
        <div>
           <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#06331e] mb-1.5">System Alerts</h1>
           <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Admin Broadcasts</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-32 flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center mb-6">
             <Icon name="bell-slash" className="text-xl text-zinc-300" />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-zinc-400">No Alerts for You</p>
          <p className="text-[10px] mt-2 font-medium text-zinc-400">New alerts will appear here after they are sent.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-zinc-50 p-6 md:p-8 rounded-[2rem] border border-zinc-100/50 shadow-sm animate-fade-in hover:bg-white hover:border-zinc-200 transition-all flex flex-col md:flex-row gap-6">
              {notif.image && (
                <div className="w-full md:w-48 h-32 md:h-auto rounded-2xl overflow-hidden shadow-sm border border-zinc-100 shrink-0">
                   <img src={notif.image} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-sm tracking-tight text-zinc-900 pr-2">{notif.title}</h3>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0 bg-white border border-zinc-100 px-3 py-1 rounded-full">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-16 text-[9px] text-center text-zinc-300 font-bold uppercase tracking-[0.3em]">Vibegadget all rights reserved</p>
    </div>
  );
};

export default NotificationsPage;
