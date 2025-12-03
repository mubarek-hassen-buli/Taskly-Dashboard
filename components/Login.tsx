import React from 'react';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';

interface LoginProps {
  onNavigate: (view: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
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

          <div className="space-y-4 mb-8">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
               <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-200" />
                  Remember me
               </label>
               <button className="text-purple-600 font-bold hover:underline">Forgot Password?</button>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Sign In
            <ArrowRight size={20} />
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/40 backdrop-blur-xl text-gray-500 rounded-full">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 py-3 bg-white/50 border border-white/40 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-700 font-bold text-sm backdrop-blur-sm">
               <Github size={18} />
               Github
             </button>
             <button className="flex items-center justify-center gap-2 py-3 bg-white/50 border border-white/40 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-700 font-bold text-sm backdrop-blur-sm">
               <div className="w-4 h-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500 rounded-full"></div>
               Google
             </button>
          </div>

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