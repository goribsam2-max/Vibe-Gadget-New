
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { OrderStatus, UserProfile } from '../types';
import { sendOrderToTelegram } from '../services/telegram';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIp, setUserIp] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shipping, setShipping] = useState({
    name: '',
    address: localStorage.getItem('vibe_shipping_address') || '',
    phone: '',
    payment: 'Cash on Delivery',
    paymentOption: 'Full Payment',
    trxId: ''
  });

  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Unavailable'));

    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    if (cart.length === 0) { navigate('/'); return; }
    setItems(cart);
    
    if (auth.currentUser) {
      getDoc(doc(db, 'users', auth.currentUser.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setShipping(prev => ({ ...prev, name: data.displayName || '', phone: data.phoneNumber || '' }));
        }
      });
    }
  }, []);

  const BKASH_NUMBER = "01747708843";

  const copyNumber = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    notify("bKash Number copied!", "success");
  };

  const placeOrder = async () => {
    setValidationError(null);
    if (!shipping.name || !shipping.address || !shipping.phone) {
      return notify("Complete all shipping info.", "error");
    }
    if (shipping.payment === 'bKash') {
      if (!shipping.trxId || shipping.trxId.trim().length < 8) {
        setValidationError("trxId");
        return notify("Valid bKash TrxID required.", "error");
      }
    }
    
    setLoading(true);
    try {
      const orderData = {
        userId: auth.currentUser?.uid || 'guest',
        customerName: shipping.name,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price, name: i.name, image: i.image })),
        total: items.reduce((a,c)=>a+(c.price*c.quantity), 0) + 150,
        status: OrderStatus.PROCESSING,
        paymentMethod: shipping.payment,
        paymentOption: shipping.payment === 'bKash' ? shipping.paymentOption : 'N/A',
        transactionId: shipping.trxId.trim(),
        shippingAddress: shipping.address,
        contactNumber: shipping.phone,
        ipAddress: userIp,
        createdAt: Date.now()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await sendOrderToTelegram({ ...orderData, id: docRef.id });
      localStorage.removeItem('f_cart');
      notify("Order Placed!", "success");
      navigate(`/success?orderId=${docRef.id}`);
    } catch (err) { notify("Order failed.", "error"); } finally { setLoading(false); }
  };

  const subTotal = items.reduce((a,c)=>a+(c.price*c.quantity), 0);
  const deliveryFee = 150;
  const totalAmount = subTotal + deliveryFee;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-48 bg-white min-h-screen font-inter">
      <div className="flex items-center space-x-6 mb-12">
          <button onClick={() => navigate(-1)} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:bg-[#06331e] hover:text-white transition-all">
             <i className="fas fa-arrow-left text-xs"></i>
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Checkout</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Order Processing</p>
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">1. Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input label="Name" placeholder="Full name" value={shipping.name} onChange={(v: string) => setShipping({...shipping, name: v})} />
              <Input label="Phone" placeholder="01XXXXXXXXX" value={shipping.phone} onChange={(v: string) => setShipping({...shipping, phone: v})} />
            </div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase mb-3 block tracking-widest px-1">Detailed Address</label>
            <textarea 
              placeholder="House, Road, Area, City..."
              className="w-full bg-zinc-50 px-5 py-4 rounded-xl text-sm font-medium h-28 outline-none border border-zinc-200 focus:border-[#06331e] transition-all" 
              value={shipping.address} 
              onChange={e => setShipping({...shipping, address: e.target.value})} 
            />
          </section>

          <section className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">2. Payment Method</h2>
            <div className="flex bg-zinc-50 border border-zinc-200 p-1 rounded-xl mb-8 max-w-xs shadow-inner">
              {['Cash on Delivery', 'bKash'].map(m => (
                <button key={m} onClick={() => setShipping({...shipping, payment: m})} className={`flex-1 py-3.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${shipping.payment === m ? 'bg-white text-[#06331e] shadow-sm border border-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}>
                  {m === 'bKash' ? 'bKash' : 'COD'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {shipping.payment === 'bKash' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                   <div className="space-y-3">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-1">Select Payment Type</p>
                      <div className="flex gap-3">
                         {['Full Payment', 'Delivery Fee Only'].map(opt => (
                           <button key={opt} onClick={() => setShipping({...shipping, paymentOption: opt})} className={`flex-1 py-3 rounded-lg text-[9px] font-bold uppercase border transition-all ${shipping.paymentOption === opt ? 'bg-[#06331e] text-white border-[#06331e] shadow-sm' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}>
                             {opt === 'Full Payment' ? `Full (৳${totalAmount})` : `Fee (৳${deliveryFee})`}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                      <div>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase mb-0.5 tracking-widest">bKash Number (Send Money)</p>
                        <p className="font-bold text-lg tracking-widest text-[#06331e]">{BKASH_NUMBER}</p>
                      </div>
                      <button onClick={copyNumber} className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-[#06331e] hover:text-white transition-all"><i className="fas fa-copy text-xs"></i></button>
                   </div>

                   <div className="p-4 bg-[#0a4a2b] rounded-xl shadow-lg">
                      <p className="text-[10px] text-zinc-200 font-medium leading-relaxed flex items-start">
                        <i className="fas fa-info-circle mt-0.5 mr-2 text-white"></i>
                        Send money to our number above and enter your TrxID below to verify order.
                      </p>
                   </div>

                   <div className={validationError === "trxId" ? "animate-shake" : ""}>
                     <Input label="TrxID" value={shipping.trxId} onChange={(v: string) => setShipping({...shipping, trxId: v.toUpperCase()})} placeholder="e.g. 8K67A9XYZ" error={validationError === "trxId"} />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-[#0a4a2b] text-white p-8 md:p-10 rounded-3xl sticky top-12 border border-zinc-800 shadow-2xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 mb-8">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>৳{subTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  <span>Delivery</span>
                  <span>৳150</span>
                </div>
                <div className="h-px bg-white/10 my-6"></div>
                <div className="flex justify-between font-black text-3xl tracking-tight py-2">
                  <span>Total</span>
                  <span>৳{totalAmount}</span>
                </div>
              </div>
              <button disabled={loading} onClick={placeOrder} className="w-full mt-10 py-5 bg-white text-[#06331e] rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? "Processing..." : "Complete Order"}
              </button>
              <p className="text-[7px] text-center mt-6 text-white/20 font-bold uppercase tracking-widest">IP: {userIp}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, error }: any) => (
  <div className="w-full">
    <label className={`text-[9px] font-bold uppercase mb-2 block px-1 tracking-widest ${error ? 'text-red-500' : 'text-zinc-300'}`}>{label}</label>
    <input type="text" placeholder={placeholder} className={`w-full bg-zinc-50 px-5 py-4 rounded-xl text-sm font-medium outline-none border transition-all ${error ? 'border-red-500' : 'border-transparent focus:border-[#06331e]'}`} value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

export default CheckoutPage;
