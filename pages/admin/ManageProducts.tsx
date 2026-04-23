
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadToImgbb } from '../../services/imgbb';
import { useNotify, useConfirm } from '../../components/Notifications';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/Icon';

const ManageProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();
  const confirm = useConfirm();

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    category: 'Mobile',
    stock: 10,
    imageFiles: [] as File[],
    isOffer: false,
    offerPrice: 0
  });

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, 'products'));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      imageFiles: [],
      isOffer: product.isOffer || false,
      offerPrice: product.offerPrice || 0
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls: string[] = [];
      if (formData.imageFiles.length > 0) {
        for (const file of formData.imageFiles) {
          const url = await uploadToImgbb(file);
          imageUrls.push(url);
        }
      }

      const productData: any = {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        stock: Number(formData.stock),
        isOffer: Boolean(formData.isOffer),
        offerPrice: Number(formData.offerPrice || 0),
      };

      if (imageUrls.length > 0) {
        productData.image = imageUrls[0];
        productData.images = imageUrls;
      }

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        notify("Product updated successfully", "success");
      } else {
        productData.rating = 5;
        productData.numReviews = 0;
        await addDoc(collection(db, 'products'), productData);
        notify("Product added to catalog", "success");
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', price: 0, description: '', category: 'Mobile', stock: 10, imageFiles: [] });
      fetchProducts();
    } catch (err: any) {
      notify(err.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Product?",
      message: "This product will be permanently removed from the store.",
      onConfirm: async () => {
        await deleteDoc(doc(db, 'products', id));
        notify("Product deleted", "info");
        fetchProducts();
      }
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 pb-32 min-h-screen bg-white">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/admin')} className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-200 text-[#06331e] rounded-full shadow-sm hover:bg-[#06331e] hover:text-white transition-all active:scale-95"><Icon name="chevron-left" className="text-xs" /></button>
          <div>
             <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#06331e] mb-1.5">Products Inventory</h1>
             <p className="text-zinc-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Catalog Management</p>
          </div>
        </div>
        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); setFormData({ name: '', price: 0, description: '', category: 'Mobile', stock: 10, imageFiles: [] }); }}
          className={`px-6 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-sm transition-all active:scale-95 border ${isAdding ? 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50' : 'bg-zinc-900 text-white border-zinc-900 hover:bg-black'}`}
        >
          {isAdding ? "Cancel" : "Add Product"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit} 
            className="bg-white p-8 md:p-12 rounded-2xl shadow-sm mb-12 space-y-8 max-w-4xl mx-auto border border-zinc-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Product Name</label>
                <input 
                  type="text" className="w-full p-4 bg-zinc-50 rounded-xl outline-none border border-zinc-200 focus:border-black transition-all font-medium text-sm" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Category</label>
                <select 
                  className="w-full p-4 bg-zinc-50 rounded-xl outline-none border border-zinc-200 focus:border-black transition-all font-medium text-sm cursor-pointer"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Mobile</option>
                  <option>Accessories</option>
                  <option>Gadgets</option>
                  <option>Chargers</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Price (৳)</label>
                <input 
                  type="number" className="w-full p-4 bg-zinc-50 rounded-xl outline-none border border-zinc-200 focus:border-black transition-all font-medium text-sm" required
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Stock Amount</label>
                <input 
                  type="number" className="w-full p-4 bg-zinc-50 rounded-xl outline-none border border-zinc-200 focus:border-black transition-all font-medium text-sm" required
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Upload Images (One or More)</label>
              <input 
                type="file" className="w-full p-5 bg-white rounded-xl outline-none text-[11px] font-bold shadow-sm border border-dashed border-zinc-300 cursor-pointer text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-50 file:text-black hover:file:bg-zinc-100" accept="image/*" multiple
                onChange={e => { if (e.target.files) setFormData({...formData, imageFiles: Array.from(e.target.files)}); }}
              />
              {editingId && <p className="text-[10px] text-zinc-400 mt-3 font-medium px-1">Leave empty to keep existing images.</p>}
            </div>

            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
               <div className="flex items-center mb-6">
                  <input 
                    type="checkbox" 
                    id="isOfferCheckbox"
                    className="w-5 h-5 rounded text-red-500 focus:ring-red-500 border border-red-200 accent-red-500 bg-white"
                    checked={formData.isOffer}
                    onChange={e => setFormData({...formData, isOffer: e.target.checked})}
                  />
                  <label htmlFor="isOfferCheckbox" className="ml-3 text-[11px] font-black text-red-600 uppercase tracking-widest cursor-pointer mt-0.5">Special Offer Event Product</label>
               </div>
               
               <AnimatePresence>
                 {formData.isOffer && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                     <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 px-1">Offer Price (৳)</label>
                     <input 
                       type="number" className="w-full p-4 bg-white rounded-xl outline-none border border-red-200 focus:border-red-400 transition-all font-medium text-sm text-red-600 shadow-inner" required={formData.isOffer}
                       value={formData.offerPrice}
                       onChange={e => setFormData({...formData, offerPrice: Number(e.target.value)})}
                     />
                     <p className="text-[9px] text-red-400 font-bold uppercase mt-3 tracking-widest px-1">Original Price: {formData.price}৳ (Will show struck through)</p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Product Description</label>
              <textarea 
                className="w-full p-5 bg-zinc-50 rounded-xl h-40 outline-none border border-zinc-200 focus:border-black transition-all leading-relaxed text-sm font-medium"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm disabled:opacity-50 transition-all hover:bg-zinc-900"
            >
              {loading ? "Processing..." : (editingId ? "Update Product" : "Save Product")}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex flex-col space-y-3">
        {products.map(p => (
          <motion.div 
            layout
            key={p.id} 
            className="bg-white rounded-full p-2 pr-6 flex items-center justify-between border border-zinc-100 shadow-sm transition-all hover:shadow-md hover:border-zinc-200 group"
          >
             <div className="flex items-center space-x-4">
               <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                  <img src={p.image} className="w-full h-full object-contain p-1 mix-blend-multiply" alt={p.name} />
               </div>
               <div className="flex flex-col justify-center">
                  <h4 className="font-bold text-[13px] text-zinc-900 tracking-tight max-w-[200px] md:max-w-xs truncate">{p.name}</h4>
                  <div className="flex items-center space-x-3 mt-1">
                     <p className="text-xs font-black text-emerald-600">৳{p.isOffer && p.offerPrice ? p.offerPrice : p.price}</p>
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest"><span className="text-zinc-500">{p.stock}</span> in stock</p>
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center"><Icon name="eye" className="mr-1" /> {p.views || 0}</p>
                     {p.isOffer && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[8px] font-black uppercase tracking-widest">Offer</span>}
                  </div>
               </div>
             </div>
             
             <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center text-zinc-600 hover:text-black hover:bg-zinc-100 transition-all shadow-sm">
                   <Icon name="pen" className="text-xs" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="w-10 h-10 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                   <Icon name="trash" className="text-xs" />
                </button>
             </div>
          </motion.div>
        ))}
        {products.length === 0 && (
           <div className="py-32 text-center text-zinc-400 font-bold uppercase tracking-[0.2em] text-[11px] bg-white rounded-3xl border border-zinc-100 shadow-sm">Inventory is empty</div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
