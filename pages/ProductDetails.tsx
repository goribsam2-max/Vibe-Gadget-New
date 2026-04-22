
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Product, Review } from '../types';
import { useNotify } from '../components/Notifications';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const notify = useNotify();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, 'products', id));
      if (snap.exists()) {
        const productData = { id: snap.id, ...snap.data() } as Product;
        setProduct(productData);
      }
    };
    fetchProduct();

    if (id) {
      const q = query(collection(db, 'reviews'), where('productId', '==', id));
      const unsubscribeReviews = onSnapshot(q, (snapshot) => {
        const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        reviewList.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(reviewList);
      }, (err) => console.warn("Reviews fetch error:", err.message));

      let unsubscribeWishlist = () => {};
      if (auth.currentUser) {
        const wishlistRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', id);
        unsubscribeWishlist = onSnapshot(wishlistRef, (snap) => {
          setIsWishlisted(snap.exists());
        }, (err) => console.warn("Wishlist fetch error:", err.message));
      }

      return () => {
        unsubscribeReviews();
        unsubscribeWishlist();
      }
    }
  }, [id, auth.currentUser]);

  const toggleWishlist = async () => {
    if (!auth.currentUser) return notify("Please sign in to save items", "info");
    if (!product || !id) return;

    const wishlistRef = doc(db, 'users', auth.currentUser.uid, 'wishlist', id);
    try {
      if (isWishlisted) {
        await deleteDoc(wishlistRef);
        notify("Removed from wishlist.", "info");
      } else {
        await setDoc(wishlistRef, {
          productId: id,
          name: product.name,
          image: product.image,
          price: product.price,
          rating: product.rating,
          addedAt: Date.now()
        });
        notify("Added to wishlist!", "success");
      }
    } catch (e) {
      notify("Failed to update wishlist.", "error");
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('f_cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product?.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('f_cart', JSON.stringify(cart));
    notify("Added to cart!", "success");
    navigate('/cart');
  };

  const changeImage = (index: number) => {
    setDirection(index > activeImg ? 1 : -1);
    setActiveImg(index);
  };

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-black border-t-transparent rounded-full" />
    </div>
  );

  const images = product.images || [product.image];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)'
    })
  };

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start lg:p-12 lg:gap-20">
      
      <div className="w-full lg:w-1/2 lg:sticky lg:top-12">
        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-zinc-50 rounded-b-[3rem] lg:rounded-[3rem] overflow-hidden flex items-center justify-center border border-zinc-100 group">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-10 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full text-zinc-600 shadow-sm border border-zinc-200 hover:bg-zinc-900 hover:text-white transition-all active:scale-95">
            <i className="fas fa-arrow-left text-xs"></i>
          </button>
          
          <AnimatePresence initial={false} custom={direction}>
            <motion.img 
              key={activeImg}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 400, damping: 35 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                filter: { duration: 0.3 }
              }}
              src={images[activeImg]} 
              className="absolute w-full h-full object-contain p-8 md:p-12 lg:p-16 cursor-zoom-in bg-zinc-50/50"
              onClick={() => setFullScreenImg(images[activeImg])}
              alt={product.name}
            />
          </AnimatePresence>
          
          {images.length > 1 && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 bg-white/30 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl z-10">
              {images.map((_, i) => (
                <button key={i} onClick={() => changeImage(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeImg ? 'w-8 bg-black' : 'w-2 bg-black/20'}`}></button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center flex-wrap gap-5 mt-10 px-8">
          {images.map((img, i) => (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={i} 
              onClick={() => changeImage(i)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 p-1 bg-white transition-all overflow-hidden relative ${i === activeImg ? 'border-black shadow-md' : 'border-zinc-100 opacity-60 hover:opacity-100 hover:border-zinc-300'}`}
            >
              <img src={img} className="w-full h-full object-contain rounded-lg bg-zinc-50/50" alt="" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-8 py-12 lg:py-0 flex-1 max-w-2xl">
        <div className="mb-14 px-2">
           <p className="text-xs text-emerald-600 font-bold uppercase tracking-[0.3em] mb-4">{product.category}</p>
           <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6 leading-tight text-zinc-900">{product.name}</h1>
           <div className="flex flex-row items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                 <div className="bg-[#06331e] text-white px-5 py-2 rounded-full inline-flex items-center shadow-lg shadow-emerald-900/20 shrink-0">
                    <span className="text-xs font-bold opacity-80 mr-1">৳</span>
                    <span className="text-2xl font-black tracking-tight">{(product.isOffer && product.offerPrice ? product.offerPrice : product.price).toLocaleString()}</span>
                 </div>
                 {product.isOffer && product.offerPrice && (
                    <span className="text-zinc-400 font-bold line-through text-lg mt-1">৳{product.price.toLocaleString()}</span>
                 )}
              </div>
              <div className="flex items-center space-x-1.5 bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-full shadow-sm shrink-0">
                 <i className="fas fa-star text-yellow-500 text-[10px]"></i>
                 <span className="text-[10px] font-bold text-zinc-700">{product.rating}</span>
                 <span className="text-[9px] font-bold text-zinc-400 capitalize">({product.numReviews || 0} revs)</span>
              </div>
           </div>
        </div>

        <div className="mb-16">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 mb-6">Product Description</h3>
            <p className="text-base md:text-lg text-zinc-500 leading-relaxed font-medium whitespace-pre-wrap">
              {product.description || "High-quality premium accessory designed for ultimate performance and style."}
            </p>
        </div>

        <div className="mb-16">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">Customer Reviews</h3>
              <button onClick={() => navigate(`/leave-review?productId=${product.id}`)} className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase tracking-widest transition-all">Write a Review</button>
           </div>

           <div className="space-y-8">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm transition-all hover:border-zinc-200 hover:shadow-md">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-5">
                         <img src={review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}&background=000&color=fff`} className="w-14 h-14 rounded-2xl border-4 border-white shadow-md" alt="" />
                         <div>
                            <p className="text-sm font-black tracking-tight">{review.userName}</p>
                            <div className="flex text-[9px] text-yellow-400 mt-1">
                               {[...Array(5)].map((_, i) => <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star mr-1`}></i>)}
                            </div>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-300 uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm text-zinc-600 font-medium italic mb-6 leading-relaxed">"{review.comment}"</p>
                   {review.images && review.images.length > 0 && (
                      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                         {review.images.map((img, i) => (
                           <img 
                            key={i} src={img} 
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white shadow-xl cursor-zoom-in shrink-0 hover:scale-105 transition-transform" 
                            onClick={() => setFullScreenImg(img)}
                            alt="" 
                           />
                         ))}
                      </div>
                   )}
                </div>
              ))}
              {reviews.length === 0 && <div className="py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-300">No reviews yet</div>}
           </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-0 md:relative bg-white/90 backdrop-blur-lg border-t border-zinc-100 md:border-0 md:bg-transparent z-50 flex items-center space-x-4">
           <button 
             onClick={addToCart} 
             className="flex-1 py-4 md:py-4 bg-zinc-900 border border-zinc-900 text-white rounded-full flex items-center justify-center space-x-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
           >
              <span>Add to Cart</span>
              <i className="fas fa-arrow-right text-[10px] opacity-70"></i>
           </button>
           <button 
             onClick={toggleWishlist}
             className={`w-14 h-14 md:w-14 md:h-14 flex items-center justify-center rounded-full border transition-all active:scale-90 shadow-sm ${isWishlisted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600'}`}
           >
             <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-sm`}></i>
           </button>
        </div>
      </div>

      <AnimatePresence>
        {fullScreenImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[40px] z-[10000] flex items-center justify-center p-6 md:p-20"
            onClick={() => setFullScreenImg(null)}
          >
            <motion.button 
              whileHover={{ scale: 1.1 }}
              className="absolute top-10 right-10 text-white p-5 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[10001]"
            >
              <i className="fas fa-times text-2xl"></i>
            </motion.button>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              src={fullScreenImg} 
              className="max-w-full max-h-full object-contain rounded-3xl md:rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10" 
              alt="Immersive product view" 
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;
