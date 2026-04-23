
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, 'users', user.uid), {
        lastActive: Date.now()
      }, { merge: true });

      notify("Welcome back!", "success");
      navigate('/');
    } catch (err: any) {
      console.error(err);
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/30 flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center mb-8 shadow-sm hover:bg-zinc-50 transition-all text-zinc-600"
        >
          <Icon name="arrow-left" className="text-xs" />
        </motion.button>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-500 font-medium">Welcome back! Please enter your details.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-zinc-100 rounded-3xl sm:px-10">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 tracking-wide mb-2">Email address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full bg-white px-4 py-3.5 rounded-xl outline-none border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium text-sm shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 tracking-wide mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-white px-4 py-3.5 rounded-xl outline-none border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium text-sm shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button disabled={loading} className="w-full py-4 mt-2 bg-[#06331e] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#0a4a2b] transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs font-medium text-zinc-500">
            Don't have an account? <Link to="/signup" className="text-emerald-600 font-bold underline decoration-emerald-200 underline-offset-4 ml-1 hover:decoration-emerald-500 transition-colors">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
