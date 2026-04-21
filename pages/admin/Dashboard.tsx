
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const pSnap = await getDocs(collection(db, 'products'));
      const uSnap = await getDocs(collection(db, 'users'));
      const oSnap = await getDocs(collection(db, 'orders'));
      setStats({ products: pSnap.size, users: uSnap.size, orders: oSnap.size });
      const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
      const ordersSnap = await getDocs(qOrders);
      setRecentOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 pb-32 min-h-screen bg-white">
      <div className="flex items-center space-x-6 mb-12">
        <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white transition-all active:scale-95"><i className="fas fa-chevron-left text-xs"></i></button>
        <div>
           <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#06331e] mb-1.5">Admin Dashboard</h1>
           <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Store Management</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard title="Products" value={stats.products} color="text-emerald-500" />
        <StatCard title="Users" value={stats.users} color="text-blue-500" />
        <StatCard title="Orders" value={stats.orders} color="text-orange-500" />
      </div>

      <div className="space-y-3 mb-12">
         <AdminNavLink to="products" title="Inventory items" icon="fas fa-box" />
         <AdminNavLink to="users" title="Manage users" icon="fas fa-users" />
         <AdminNavLink to="orders" title="Order fulfillment" icon="fas fa-shipping-fast" />
         <AdminNavLink to="notifications" title="Push notifications" icon="fas fa-paper-plane" />
         <AdminNavLink to="banners" title="Store banners" icon="fas fa-images" />
         <AdminNavLink to="config" title="Settings" icon="fas fa-cogs" />
      </div>

      <div>
         <h3 className="text-sm font-bold text-zinc-800 mb-4 px-2">Latest Orders</h3>
         <div className="space-y-3">
            {recentOrders.map((order, i) => (
               <div key={order.id} className="flex items-center justify-between p-4 px-6 bg-zinc-50 border-2 border-zinc-100 hover:border-zinc-200 rounded-full hover:bg-white transition-all cursor-pointer group" onClick={() => navigate(`orders`)}>
                  <div className="flex items-center space-x-4">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 group-hover:border-[#06331e]/20 text-zinc-400 group-hover:text-[#06331e] transition-colors"><i className="fas fa-shopping-bag text-xs"></i></div>
                     <div>
                       <p className="text-sm font-bold text-zinc-700 group-hover:text-[#06331e]">{order.customerName}</p>
                       <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">#{order.id.slice(0,8)}</p>
                     </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                     <div className="flex flex-col items-end">
                       <p className="text-sm font-bold text-[#06331e]">৳{order.total}</p>
                       <p className={`text-[9px] font-bold tracking-widest ${order.status === 'Delivered' ? 'text-emerald-500' : 'text-blue-500'}`}>{order.status}</p>
                     </div>
                     <i className="fas fa-chevron-right text-[10px] text-zinc-300 group-hover:text-[#06331e] transition-colors group-hover:translate-x-0.5"></i>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#06331e]/20 hover:bg-white transition-all duration-300">
    <p className="text-3xl font-black text-[#06331e] mb-1">{value}</p>
    <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{title}</p>
  </div>
);

const AdminNavLink = ({ to, title, icon }: any) => (
  <Link to={to} className="flex items-center justify-between p-4 px-6 md:px-8 bg-zinc-50/50 border-2 border-zinc-100/50 hover:border-zinc-200 rounded-full hover:bg-white transition-all group">
    <div className="flex items-center space-x-4">
       <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-100 group-hover:border-[#06331e]/20 transition-colors"><i className={`${icon} text-zinc-400 group-hover:text-[#06331e] transition-colors text-xs`}></i></div>
       <span className="font-bold text-sm text-zinc-700 group-hover:text-[#06331e] transition-colors">{title}</span>
    </div>
    <i className="fas fa-chevron-right text-[10px] text-zinc-300 group-hover:text-[#06331e] transition-colors group-hover:translate-x-0.5"></i>
  </Link>
);

export default AdminDashboard;
