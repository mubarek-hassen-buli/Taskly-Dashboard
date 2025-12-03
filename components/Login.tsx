import React, { useState } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
  onNavigate: (view: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn("password", { email, password, flow: "signIn" });
      // Auth state change will trigger redirect in App.tsx
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center h-full w-full px-6">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/60 p-8 md:p-12 relative overflow-hidden">
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20l10-10"/>
                <path d="M17 20l-10-10"/>
              </svg>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-8">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
               <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-200" />
                  Remember me
               </label>
               <button type="button" className="text-purple-600 font-bold hover:underline">Forgot Password?</button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}
          </form>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={20} />
          </button>

          <p className="mt-8 text-center text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={() => onNavigate('signup')}
              className="text-gray-900 font-bold hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;