import React, { useState } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { Github, ArrowRight } from 'lucide-react';

interface LoginProps {
  onNavigate: (view: string) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialLogin = async (provider: "google" | "github") => {
    setLoading(true);
    setError('');
    try {
      await signIn(provider);
    } catch (err: any) {
      setError('Authentication failed. Please try again.');
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
            <p className="text-gray-500">Please sign in to continue.</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-lg shadow-sm hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <button 
              onClick={() => handleSocialLogin("github")}
              disabled={loading}
              className="w-full py-4 bg-[#24292F] text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-[#24292F]/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github size={20} />
              Sign in with GitHub
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

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