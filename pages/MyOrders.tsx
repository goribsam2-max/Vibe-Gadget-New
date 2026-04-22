
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotify } from '../components/Notifications';

const StatusIconSmall = ({ status }: { status: OrderStatus }) => {
  const base = "w-10 h-10 rounded-2xl flex items-center justify-center text-xs shadow-inner ";
  switch (status) {
    case OrderStatus.HOLD: return <div className={base + "bg-yellow-50 text-yellow-600"}><i className="fas fa-pause"></i></div>;
    case OrderStatus.PROCESSING: return <div className={base + "bg-blue-50 text-blue-600"}><i className="fas fa-sync-alt animate-spin"></i></div>;
    case OrderStatus.SHIPPED: return <div className={base + "bg-orange-50 text-orange-600"}><i className="fas fa-truck-moving"></i></div>;
    case OrderStatus.ON_THE_WAY: return <div className={base + "bg-purple-50 text-purple-600"}><i className="fas fa-motorcycle"></i></div>;
    case OrderStatus.DELIVERED: return <div className={base + "bg-green-50 text-green-600"}><i className="fas fa-check"></i></div>;
    case OrderStatus.CANCELLED: return <div className={base + "bg-red-50 text-red-600"}><i className="fas fa-times"></i></div>;
    default: return <div className={base + "bg-zinc-100 text-zinc-500"}><i className="fas fa-box"></i></div>;
  }
};

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    const uid = auth.currentUser?.uid || 'guest';
    const q = query(collection(db, 'orders'), where('userId', '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(data);
      setLoading(false);
    });

    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => {
        unsubscribe();
        clearInterval(timer);
    };
  }, []);

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
          await updateDoc(doc(db, 'orders', orderId), { status: OrderStatus.CANCELLED });
          notify("Order has been cancelled.", "info");
      } catch (err) {
          notify("Failed to cancel order.", "error");
      }
  };

  const isCancelable = (order: Order) => {
      if (order.status !== OrderStatus.PENDING) return false;
      const minutesPassed = (currentTime - order.createdAt) / (1000 * 60);
      return minutesPassed <= 5;
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 pb-40 animate-fade-in min-h-screen bg-white font-inter">
      <div className="flex items-center space-x-6 mb-12">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white transition-all active:scale-95">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <div>
           <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#06331e] mb-1.5">My Orders</h1>
           <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Purchase History</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><div className="w-8 h-8 border-2 border-[#06331e] border-t-transparent rounded-full animate-spin"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-32 flex flex-col items-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-full border border-zinc-100 flex items-center justify-center mb-8 shadow-inner">
             <i className="fas fa-shopping-bag text-3xl text-zinc-300"></i>
          </div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No order history found</p>
          <button onClick={() => navigate('/')} className="mt-8 px-8 py-4 bg-[#06331e] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#06331e]/20 hover:bg-[#0a4a2b] transition-all">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => {
            const recent = index === 0;

            if (recent) {
              return (
                <motion.div 
                  whileTap={{ scale: 0.99 }}
                  key={order.id} 
                  onClick={() => navigate(`/track-order/${order.id}`)} 
                  className="bg-zinc-50/50 p-6 md:p-10 rounded-[2.5rem] border border-zinc-200/50 shadow-sm hover:bg-white hover:border-zinc-200 transition-all cursor-pointer relative group flex flex-col"
                >
                  <div className="absolute top-0 left-10 bg-[#06331e] text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-b-lg shadow-sm">
                     Latest Order
                  </div>
                  <div className="flex justify-between items-start mb-8 mt-4">
                    <div className="flex items-center space-x-5">
                      <StatusIconSmall status={order.status} />
                      <div>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Order Ref</p>
                        <p className="text-xs font-mono font-black uppercase text-zinc-900 border border-zinc-200/60 bg-white px-2 py-0.5 rounded-md">#{order.id.slice(0, 10)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-[#06331e] uppercase tracking-widest">{order.status}</p>
                       <p className="text-[9px] text-zinc-400 font-bold mt-1.5 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center -space-x-3 mb-10 overflow-hidden px-2">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="w-14 h-14 rounded-2xl bg-white p-2 border-2 border-zinc-100 shadow-sm shrink-0">
                         <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                       <div className="w-14 h-14 rounded-2xl bg-[#06331e] text-white flex items-center justify-center text-[10px] font-black border-2 border-zinc-50 shadow-sm">
                          +{order.items.length - 4}
                       </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-6 border-t border-zinc-200/50">
                    <div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Grand Total</p>
                      <p className="text-2xl font-black tracking-tighter text-[#06331e]">৳{order.total}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {isCancelable(order) && (
                            <button 
                              onClick={(e) => handleCancelOrder(order.id, e)}
                              className="px-5 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm transition-all"
                            >
                               Cancel Order
                            </button>
                        )}
                        <button className="px-6 py-3 bg-[#06331e] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg group-hover:scale-105 transition-transform flex items-center">
                           <span>Track Now</span>
                           <i className="fas fa-arrow-right ml-2 text-[8px]"></i>
                        </button>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Older orders as generic pills
            return (
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  key={order.id} 
                  onClick={() => navigate(`/track-order/${order.id}`)} 
                  className="bg-white p-4 pr-6 rounded-full border border-zinc-100 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2 shrink-0">
                         <img src={order.items[0]?.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" alt="" />
                      </div>
                      <div>
                         <p className="text-xs font-black tracking-tight text-zinc-900 uppercase">#{order.id.slice(0, 8)}</p>
                         <p className="text-[9px] font-bold text-zinc-400 mt-0.5 tracking-widest uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center space-x-6">
                      <div className="hidden sm:block text-right">
                          <p className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase mb-0.5">Status</p>
                          <p className={`text-[10px] font-black uppercase tracking-tight ${order.status === OrderStatus.CANCELLED ? 'text-red-500' : 'text-[#06331e]'}`}>{order.status}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:bg-[#06331e] group-hover:text-white transition-all shadow-sm">
                         <i className="fas fa-chevron-right text-xs"></i>
                      </div>
                   </div>
                </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
