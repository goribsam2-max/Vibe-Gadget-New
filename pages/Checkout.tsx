
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { OrderStatus, UserProfile } from '../types';
import { sendOrderToTelegram } from '../services/telegram';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';

const CheckoutPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userIp, setUserIp] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [shipping, setShipping] = useState({
    name: '',
    address: localStorage.getItem('vibe_shipping_address') || '',
    phone: '',
    payment: 'Cash on Delivery',
    paymentOption: 'Full Payment',
    trxId: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('Unavailable'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'platform'), (doc) => {
      if (doc.exists()) setSettings(doc.data());
    });

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

    return () => unsubSettings();
  }, [navigate]);

  const BKASH_NUMBER = "01747708843";

  const copyNumber = () => {
    navigator.clipboard.writeText(BKASH_NUMBER);
    notify("bKash Number copied!", "success");
  };

  const applyCoupon = async () => {
     setCouponError('');
     if(!couponCode.trim()) return;
     
     setLoading(true);
     try {
       // Search for coupon
       const { query, where, getDocs, collection } = await import('firebase/firestore');
       const q = query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()));
       const snap = await getDocs(q);
       
       if(snap.empty) {
          setCouponError('Invalid coupon code');
       } else {
          const c = snap.docs[0].data();
          if(!c.isActive) {
             setCouponError('Coupon is no longer active');
          } else if (c.usedCount >= c.maxUses) {
             setCouponError('Coupon usage limit reached');
          } else {
             setAppliedCoupon({ id: snap.docs[0].id, ...c });
             notify("Coupon applied!", "success");
             setCouponError('');
          }
       }
     } catch (e) {
       setCouponError('Error verifying coupon');
     }
     setLoading(false);
  };

  const removeCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode('');
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
      let isSuspicious = false;
      let riskReason = "";

      const phoneRe = /^(01\d{9})$/;
      if (!phoneRe.test(shipping.phone.replace(/[^0-9]/g, ''))) {
          isSuspicious = true;
          riskReason += "Invalid phone formatting. ";
      }
      
      const repeats = /(.)\1{5,}/; // Same digit repeated 6+ times (e.g. 01000000000)
      if (repeats.test(shipping.phone.replace(/[^0-9]/g, ''))) {
          isSuspicious = true;
          riskReason += "Fake phone sequence. ";
      }

      const total = items.reduce((a,c)=>a+(c.price*c.quantity), 0) + (settings?.deliveryCharge || 150) - discountAmount;
      if (shipping.payment === 'Cash on Delivery' && total > 20000) {
          isSuspicious = true;
          riskReason += "High value COD. ";
      }

      const orderData = {
        userId: auth.currentUser?.uid || 'guest',
        customerName: shipping.name,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, priceAtPurchase: i.price, name: i.name, image: i.image })),
        total: total,
        subTotal: subTotal,
        discount: discountAmount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        status: OrderStatus.PROCESSING,
        paymentMethod: shipping.payment,
        paymentOption: shipping.payment === 'bKash' ? shipping.paymentOption : 'N/A',
        transactionId: shipping.trxId.trim(),
        shippingAddress: shipping.address,
        contactNumber: shipping.phone,
        ipAddress: userIp,
        createdAt: Date.now(),
        isSuspicious,
        riskReason: riskReason.trim()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);

      // Increment coupon usage
      if (appliedCoupon) {
         try {
            const { increment } = await import('firebase/firestore');
            await updateDoc(doc(db, 'coupons', appliedCoupon.id), { usedCount: increment(1) });
         } catch(e) { console.error("Error updating coupon", e); }
      }

      await sendOrderToTelegram({ ...orderData, id: docRef.id });
      localStorage.removeItem('f_cart');
      notify("Order Placed!", "success");
      navigate(`/success?orderId=${docRef.id}`);
    } catch (err) { notify("Order failed.", "error"); } finally { setLoading(false); }
  };

  const subTotal = items.reduce((a,c)=>a+(c.price*c.quantity), 0);
  const deliveryFee = settings?.deliveryCharge || 150;
  
  let discountAmount = 0;
  if(appliedCoupon) {
      if(appliedCoupon.type === 'percent') {
          discountAmount = Math.round(subTotal * (appliedCoupon.discount / 100));
      } else {
          discountAmount = appliedCoupon.discount;
      }
  }

  const totalAmount = subTotal + deliveryFee - discountAmount;

  if (settings && !settings.storeOpen) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-white p-6">
              <div className="text-center bg-zinc-50 p-10 rounded-3xl max-w-md border border-zinc-100">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"><Icon name="store-slash" /></div>
                  <h2 className="text-xl font-black tracking-tight mb-2">Store is Currently Closed</h2>
                  <p className="text-xs text-zinc-500 font-bold mb-6">We are not accepting orders at this moment. Please check back later.</p>
                  <button onClick={() => navigate('/')} className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Return Home</button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-48 bg-white min-h-screen font-inter">
      <div className="flex items-center space-x-6 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 hover:bg-[#06331e] hover:text-white transition-all">
             <Icon name="arrow-left" className="text-xs" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">Checkout</h1>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Order Processing</p>
          </div>
      </div>

      {settings?.storeNotice && (
          <div className="mb-10 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start space-x-3 text-blue-800">
              <Icon name="info-circle" className="mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{settings.storeNotice}</p>
          </div>
      )}
      
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
                      <button onClick={copyNumber} className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-[#06331e] hover:text-white transition-all"><Icon name="copy" className="text-xs" /></button>
                   </div>

                   <div className="p-4 bg-[#0a4a2b] rounded-xl shadow-lg">
                      <p className="text-[10px] text-zinc-200 font-medium leading-relaxed flex items-start">
                        <Icon name="info-circle" className="mt-0.5 mr-2 text-white" />
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

          <section className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
             <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">3. Promo Code</h2>
             {appliedCoupon ? (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Icon name="check" className="text-xs" /></div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">{appliedCoupon.code}</p>
                         <p className="text-[9px] font-bold text-emerald-600 mt-0.5 uppercase tracking-widest">Applied Successfully</p>
                      </div>
                   </div>
                   <button onClick={removeCoupon} className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600"><Icon name="times" /> Remove</button>
                </div>
             ) : (
                <div className="flex space-x-3 relative">
                   <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="ENTER CODE" className={`flex-1 p-4 bg-zinc-50 border rounded-xl text-sm font-bold uppercase transition-all ${couponError ? 'border-red-300 focus:border-red-500' : 'border-zinc-200 focus:border-[#06331e]'}`} />
                   <button onClick={applyCoupon} disabled={!couponCode} className="px-6 bg-[#06331e] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-900 transition-colors disabled:opacity-50">Apply</button>
                   {couponError && <p className="absolute -bottom-5 left-0 text-[9px] text-red-500 font-bold uppercase tracking-widest">{couponError}</p>}
                </div>
             )}
          </section>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-zinc-900 text-white p-8 md:p-10 rounded-3xl sticky top-12 border border-zinc-800 shadow-2xl">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-8">Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>৳{subTotal}</span>
                </div>
                {appliedCoupon && (
                <div className="flex justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-৳{discountAmount}</span>
                </div>
                )}
                <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  <span>Delivery</span>
                  <span>৳150</span>
                </div>
                <div className="h-px bg-white/10 my-6"></div>
                <div className="flex justify-between font-black text-3xl tracking-tight py-2">
                  <span>Total</span>
                  <span>৳{totalAmount}</span>
                </div>
              </div>
              <button disabled={loading} onClick={placeOrder} className="w-full mt-10 py-5 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-50">
                {loading ? "Processing..." : "Complete Order"}
              </button>
              <p className="text-[7px] text-center mt-6 text-white/30 font-bold uppercase tracking-widest">IP: {userIp}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, error }: any) => (
  <div className="w-full">
    <label className={`text-[9px] font-bold uppercase mb-2 block px-1 tracking-widest ${error ? 'text-red-500' : 'text-zinc-500'}`}>{label}</label>
    <input type="text" placeholder={placeholder} className={`w-full bg-zinc-50 hover:bg-white px-5 py-4 rounded-xl text-sm font-medium outline-none border transition-all shadow-sm ${error ? 'border-red-500 bg-red-50' : 'border-zinc-200 focus:border-black focus:ring-4 focus:ring-black/5'}`} value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

export default CheckoutPage;
