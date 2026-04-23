
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'framer-motion';
import { useNotify } from '../../components/Notifications';
import Icon from '../../components/Icon';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
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

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    notify("This module will be available in the next update.", "info");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pb-32 min-h-screen bg-zinc-50/50">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/')} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white transition-all active:scale-95"><Icon name="arrow-left" className="text-xs" /></button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 mb-1">Command Center</h1>
            <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Admin Overview</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Products" value={stats.products} icon="fas fa-box" color="text-zinc-800" />
        <StatCard title="Registered Users" value={stats.users} icon="fas fa-users" color="text-blue-600" />
        <StatCard title="Total Orders" value={stats.orders} icon="fas fa-shopping-bag" color="text-orange-600" />
        <StatCard title="Pending Tickets" value="0" icon="fas fa-ticket-alt" color="text-emerald-600" />
      </div>

      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1 mt-12">Management Modules</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
         <AdminBentoLink to="products" title="Inventory Catalog" subtitle="Add, edit, or remove store products." icon="fas fa-cubes" />
         <AdminBentoLink to="users" title="Customer Database" subtitle="Manage registered users and accounts." icon="fas fa-users-cog" />
         <AdminBentoLink to="orders" title="Order Fulfillment" subtitle="Process and updates active orders." icon="fas fa-truck-fast" />
         <AdminBentoLink to="fake-orders" title="Risk & Security" subtitle="Review AI-flagged suspicious orders." icon="fas fa-shield-virus" highlight="border-red-200 bg-red-50/20" iconColor="text-red-500" />
         <AdminBentoLink to="notifications" title="Push Messaging" subtitle="Send targeted alerts to users." icon="fas fa-comment-dots" />
         <AdminBentoLink to="banners" title="Storefront Design" subtitle="Manage homepage hero banners." icon="fas fa-images" />
         <AdminBentoLink to="config" title="Global Settings" subtitle="Configure platform variables & API Keys." icon="fas fa-sliders-h" />
         
         {/* Extended modules for professional look */}
         <AdminBentoLink to="coupons" title="Coupons & Promos" subtitle="Create discount codes and campaigns." icon="fas fa-ticket" />
         <AdminBentoLink to="riders" title="Rider Management" subtitle="Assign and track delivery riders." icon="fas fa-motorcycle" />
         <AdminBentoLink to="mock/analytics" title="Sales Analytics" subtitle="View detailed revenue reports." icon="fas fa-chart-line" />
         <AdminBentoLink to="helpdesk" title="Help Desk" subtitle="Respond to customer support tickets." icon="fas fa-headset" />
         <AdminBentoLink to="mock/refunds" title="Refund Requests" subtitle="Process returned items and payouts." icon="fas fa-undo" />
         
         <AdminBentoLink to="mock/affiliates" title="Affiliate Program" subtitle="Manage influencer partnerships." icon="fas fa-bullhorn" />
         <AdminBentoLink to="staff" title="Staff Roles" subtitle="Manage RBAC and admin permissions." icon="fas fa-id-badge" />
         <AdminBentoLink to="mock/seo" title="SEO Manager" subtitle="Meta tags, sitemaps, indexing." icon="fas fa-search" />
         <AdminBentoLink to="mock/taxes" title="Tax Configuration" subtitle="Set regional tax and VAT rates." icon="fas fa-file-invoice-dollar" />
         <AdminBentoLink to="mock/bulk" title="Stock Export" subtitle="Bulk import/export CSV actions." icon="fas fa-file-csv" />
      </div>

      <div>
         <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Recent Activity</h3>
            <Link to="orders" className="text-[10px] font-bold text-[#06331e] uppercase tracking-widest hover:text-emerald-600 transition-colors flex items-center">
               View All <Icon name="arrow-right" className="ml-1.5 text-[8px]" />
            </Link>
         </div>
         <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            {recentOrders.map((order, i) => (
               <div key={order.id} className={`flex items-center justify-between p-6 ${i !== recentOrders.length - 1 ? 'border-b border-zinc-100' : ''} hover:bg-zinc-50 transition-colors cursor-pointer group`} onClick={() => navigate(`orders`)}>
                  <div className="flex items-center space-x-5">
                     <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 shadow-sm transition-colors group-hover:shadow-md"><Icon name="shopping-bag" className="text-zinc-500 text-sm" /></div>
                     <div>
                       <p className="text-sm font-black text-zinc-900 mb-0.5 tracking-tight group-hover:text-[#06331e] transition-colors">{order.customerName}</p>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{order.id.slice(0,8)}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-sm md:text-base font-black text-black">৳{order.total}</p>
                     <p className={`text-[9px] md:text-[10px] font-bold tracking-widest uppercase mt-0.5 ${order.status === 'Delivered' ? 'text-emerald-500' : order.status === 'Cancelled' ? 'text-red-500' : 'text-blue-500'}`}>{order.status}</p>
                  </div>
               </div>
            ))}
            {recentOrders.length === 0 && (
               <div className="p-12 text-center flex flex-col items-center justify-center text-zinc-400">
                   <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4"><Icon name="inbox" className="text-xl text-zinc-300" /></div>
                   <div className="font-bold text-xs uppercase tracking-widest">No recent orders</div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 ${color}`}><Icon name={icon.replace(/fa[sbrl]? fa-/, '').replace('-alt', '')} className="text-lg" /></div>
    <div>
      <p className="text-2xl font-black text-zinc-900 leading-none mb-1">{value}</p>
      <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">{title}</p>
    </div>
  </div>
);

const AdminBentoLink = ({ to, title, subtitle, icon, highlight, iconColor, onClick }: any) => (
  <Link to={to} onClick={onClick} className={`bg-white p-6 rounded-3xl border ${highlight || 'border-zinc-200 hover:border-zinc-300'} shadow-sm hover:shadow-md transition-all group flex items-start space-x-4`}>
     <div className={`w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors shrink-0 ${iconColor || 'text-zinc-500 group-hover:text-black'}`}>
        <Icon name={icon.replace(/fa[sbrl]? fa-/, '').replace('-alt', '')} className="text-lg transition-transform group-hover:scale-110" />
     </div>
     <div>
        <h4 className={`text-sm font-bold mb-1 ${iconColor ? iconColor : 'text-zinc-900'}`}>{title}</h4>
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed pr-2">{subtitle}</p>
     </div>
  </Link>
);

export default AdminDashboard;
