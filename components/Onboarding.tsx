import React from 'react';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';

interface OnboardingProps {
  onNavigate: (view: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onNavigate }) => {
  return (
    <div className="flex items-center justify-center h-full w-full p-6">
      <div className="w-full max-w-5xl h-[85vh] bg-white/60 backdrop-blur-3xl rounded-[3rem] shadow-2xl border border-white/60 relative overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Content Section */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 20l10-10"/>
                  <path d="M17 20l-10-10"/>
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Taskly</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Manage your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">daily tasks</span> 
              <br/> with style.
            </h1>
            
            <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">
              Experience the new era of productivity with our liquid glass interface. Organize, collaborate, and track progress effortlessly.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://picsum.photos/seed/${i}/100/100`} className="w-12 h-12 rounded-full border-2 border-white" alt="User" />
                 ))}
              </div>
              <div className="text-sm font-bold text-gray-600">
                <div className="flex items-center gap-1 text-yellow-500">
                   <Star size={14} fill="currentColor" />
                   <Star size={14} fill="currentColor" />
                   <Star size={14} fill="currentColor" />
                   <Star size={14} fill="currentColor" />
                   <Star size={14} fill="currentColor" />
                </div>
                Trusted by 20,000+ teams
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('signup')}
                className="group px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:scale-105 hover:bg-black transition-all flex items-center gap-3"
              >
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="px-8 py-4 bg-white/50 text-gray-900 rounded-2xl font-bold text-lg hover:bg-white transition-all"
              >
                Log In
              </button>
            </div>
          </div>
        </div>

        {/* Right Visual Section (Glass Mockup) */}
        <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-purple-100/50 to-pink-100/50">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
          
          {/* Abstract Decorations */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Floating UI Cards (Mock Visuals) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-[4/3]">
             <div className="relative w-full h-full">
                {/* Back Card */}
                <div className="absolute top-0 right-0 w-[90%] h-[90%] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 rotate-6 transform transition-transform hover:rotate-3 duration-500 z-10 flex items-center justify-center p-8">
                   <div className="w-full space-y-4 opacity-50">
                      <div className="h-4 bg-gray-200 rounded-full w-1/3"></div>
                      <div className="h-32 bg-gray-100 rounded-2xl w-full"></div>
                      <div className="flex gap-4">
                        <div className="h-20 bg-gray-100 rounded-2xl w-1/2"></div>
                        <div className="h-20 bg-gray-100 rounded-2xl w-1/2"></div>
                      </div>
                   </div>
                </div>

                {/* Front Card */}
                <div className="absolute bottom-0 left-0 w-[90%] h-[90%] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 -rotate-3 transform transition-transform hover:rotate-0 duration-500 z-20 p-8 flex flex-col justify-between">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                           <Star size={20} fill="currentColor" />
                         </div>
                         <div>
                            <h3 className="font-bold text-gray-900">Task Overview</h3>
                            <p className="text-xs text-gray-500">Today's Progress</p>
                         </div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                        <ArrowRight size={14} className="text-gray-400" />
                      </div>
                   </div>

                   <div className="space-y-4">
                      {['Review Sidebar Design', 'Onboarding Flow', 'Mobile Responsive'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                           <CheckCircle2 size={20} className="text-green-500" />
                           <span className="text-sm font-semibold text-gray-700">{item}</span>
                        </div>
                      ))}
                   </div>

                   <div className="mt-6 flex items-center justify-between">
                      <div className="flex -space-x-2">
                         <div className="w-8 h-8 rounded-full bg-purple-200 border-2 border-white"></div>
                         <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white"></div>
                         <div className="w-8 h-8 rounded-full bg-pink-200 border-2 border-white"></div>
                      </div>
                      <span className="text-xs font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">Pro Team</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Onboarding;