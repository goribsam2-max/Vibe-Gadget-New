
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ToastProvider } from './components/Notifications';
import { UserProfile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

// Page Imports
import AuthSelector from './pages/AuthSelector';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import NotificationsPage from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import VerifyCode from './pages/VerifyCode';
import LocationAccess from './pages/LocationAccess';
import CheckoutPage from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import CompleteProfile from './pages/CompleteProfile';
import EditProfile from './pages/EditProfile';
import NewPassword from './pages/NewPassword';
import Wishlist from './pages/Wishlist';
import ShippingAddress from './pages/ShippingAddress';
import Coupon from './pages/Coupon';
import PaymentMethods from './pages/PaymentMethods';
import AddCard from './pages/AddCard';
import Search from './pages/Search';
import TrackOrder from './pages/TrackOrder';
import LeaveReview from './pages/LeaveReview';
import EReceipt from './pages/EReceipt';
import Settings from './pages/Settings';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PasswordManager from './pages/PasswordManager';
import AllProducts from './pages/AllProducts';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageBanners from './pages/admin/ManageBanners';
import ManageConfig from './pages/admin/ManageConfig';
import AdminNotifications from './pages/admin/AdminNotifications';

// Components
import BottomNav from './components/BottomNav';
import OneSignalPopup from './components/OneSignalPopup';
import ScrollToTop from './components/ScrollToTop';
import Logo from './components/Logo';
import DesktopLayout from './components/DesktopLayout';

import ManageFakeOrders from './pages/admin/ManageFakeOrders';
import GenericAdminMock from './pages/admin/GenericAdminMock';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageHelpDesk from './pages/admin/ManageHelpDesk';
import ManageStaff from './pages/admin/ManageStaff';

import ManageRiders from './pages/admin/ManageRiders';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 5 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -5 }} 
    transition={{ duration: 0.15 }} 
    className="w-full min-h-screen"
  >
    {children}
  </motion.div>
);

const AppContent: React.FC = () => {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserProfile);
          }
          setLoading(false);
        }, (err) => {
          console.warn("Profile fetch error:", err.message);
          setUserData(null);
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-white fixed inset-0 z-50">
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} 
        transition={{ repeat: Infinity, duration: 2 }} 
      >
        <div className="inline-flex items-center bg-[#06331e] px-6 py-4 rounded-2xl shadow-lg border border-[#0a4a2b]">
          <i className="fas fa-store text-emerald-400 mr-3 text-2xl"></i>
          <h1 className="font-black tracking-tight leading-none flex items-baseline text-3xl">
            <span className="text-white">Vibe</span>
            <span className="text-emerald-400 ml-1">Gadget</span>
          </h1>
        </div>
      </motion.div>
    </div>
  );

  const showNav = ['/', '/profile'].includes(location.pathname);
  
  // Basic check: we allow access to admin routes if they are an admin or we assume staff will be blocked on specific routes later.
  // Ideally, we'd fetch the document from `staff` collection to see if they are staff.
  const isAdminOrStaff = userData?.role === 'admin' || userData?.email === 'admin@vibe.shop' || userData?.role === 'staff' || ['admin', 'staff'].includes(userData?.role || '');

  return (
    <DesktopLayout>
      <div className="min-h-screen selection:bg-black selection:text-white relative">
        <OneSignalPopup />
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/onboarding" element={<PageWrapper><Onboarding onFinish={() => {}} /></PageWrapper>} />
          <Route path="/auth-selector" element={<PageWrapper><AuthSelector /></PageWrapper>} />
          <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
          <Route path="/verify" element={<PageWrapper><VerifyCode /></PageWrapper>} />
          <Route path="/complete-profile" element={<PageWrapper><CompleteProfile /></PageWrapper>} />
          <Route path="/location" element={<PageWrapper><LocationAccess /></PageWrapper>} />
          <Route path="/product/:slug/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/checkout" element={<PageWrapper><CheckoutPage /></PageWrapper>} />
          <Route path="/success" element={<PageWrapper><OrderSuccess /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile userData={userData} /></PageWrapper>} />
          <Route path="/profile/edit" element={<PageWrapper><EditProfile /></PageWrapper>} />
          <Route path="/orders" element={<PageWrapper><MyOrders /></PageWrapper>} />
          <Route path="/notifications" element={<PageWrapper><NotificationsPage /></PageWrapper>} />
          <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
          <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />
          <Route path="/all-products" element={<PageWrapper><AllProducts /></PageWrapper>} />
          <Route path="/track-order/:id" element={<PageWrapper><TrackOrder /></PageWrapper>} />
          <Route path="/e-receipt/:id" element={<PageWrapper><EReceipt /></PageWrapper>} />
          <Route path="/leave-review" element={<PageWrapper><LeaveReview /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          <Route path="/settings/password" element={<PageWrapper><PasswordManager /></PageWrapper>} />
          <Route path="/help-center" element={<PageWrapper><HelpCenter /></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
          <Route path="/shipping-address" element={<PageWrapper><ShippingAddress /></PageWrapper>} />
          <Route path="/payment-methods" element={<PageWrapper><PaymentMethods /></PageWrapper>} />
          <Route path="/coupon" element={<PageWrapper><Coupon /></PageWrapper>} />
          <Route path="/add-card" element={<PageWrapper><AddCard /></PageWrapper>} />
          <Route path="/new-password" element={<PageWrapper><NewPassword /></PageWrapper>} />
          
          <Route path="/admin/*" element={isAdminOrStaff ? (
             <Routes>
                <Route index element={<PageWrapper><AdminDashboard /></PageWrapper>} />
                <Route path="products" element={<PageWrapper><ManageProducts /></PageWrapper>} />
                <Route path="users" element={<PageWrapper><ManageUsers /></PageWrapper>} />
                <Route path="orders" element={<PageWrapper><ManageOrders /></PageWrapper>} />
                <Route path="fake-orders" element={<PageWrapper><ManageFakeOrders /></PageWrapper>} />
                <Route path="notifications" element={<PageWrapper><AdminNotifications /></PageWrapper>} />
                <Route path="banners" element={<PageWrapper><ManageBanners /></PageWrapper>} />
                <Route path="config" element={<PageWrapper><ManageConfig /></PageWrapper>} />
                <Route path="coupons" element={<PageWrapper><ManageCoupons /></PageWrapper>} />
                <Route path="helpdesk" element={<PageWrapper><ManageHelpDesk /></PageWrapper>} />
                <Route path="staff" element={<PageWrapper><ManageStaff /></PageWrapper>} />
                <Route path="riders" element={<PageWrapper><ManageRiders /></PageWrapper>} />
                <Route path="mock/*" element={<PageWrapper><GenericAdminMock /></PageWrapper>} />
             </Routes>
          ) : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </div>
    </DesktopLayout>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
};

export default App;
