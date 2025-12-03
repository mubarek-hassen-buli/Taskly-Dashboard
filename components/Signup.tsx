import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  User, 
  Camera, 
  Briefcase, 
  Building2, 
  Phone, 
  ChevronLeft, 
  Check, 
  Code2, 
  PenTool, 
  BarChart, 
  Globe 
} from 'lucide-react';

interface SignupProps {
  onNavigate: (view: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    workspace: '',
    phone: '',
    avatar: ''
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  // Step 1: Credentials
  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="relative group">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Full Name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
        />
      </div>

      <div className="relative group">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
        />
      </div>
      
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
        />
      </div>
    </div>
  );

  // Step 2: Profile Setup (Avatar & Role)
  const renderStep2 = () => {
    const roles = [
      { id: 'designer', label: 'Designer', icon: <PenTool size={18} /> },
      { id: 'developer', label: 'Developer', icon: <Code2 size={18} /> },
      { id: 'manager', label: 'Manager', icon: <BarChart size={18} /> },
      { id: 'other', label: 'Other', icon: <Globe size={18} /> },
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center gap-3">
           <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-purple-500 group-hover:bg-purple-50 transition-all overflow-hidden">
                 {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <Camera size={24} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                 )}
              </div>
              <div className="absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-full text-white shadow-md">
                 <User size={12} />
              </div>
           </div>
           <p className="text-xs font-bold text-gray-500">Upload Profile Picture</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
             <Briefcase size={12} /> Select Role
           </label>
           <div className="grid grid-cols-2 gap-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setFormData({...formData, role: role.label})}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.role === role.label 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                      : 'bg-white/50 border-white/40 text-gray-600 hover:bg-white hover:border-white'
                  }`}
                >
                  {role.icon}
                  <span className="text-sm font-bold">{role.label}</span>
                  {formData.role === role.label && <Check size={14} className="ml-auto" />}
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  };

  // Step 3: Workspace Info
  const renderStep3 = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="relative group">
        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Workspace Name" 
          value={formData.workspace}
          onChange={(e) => setFormData({...formData, workspace: e.target.value})}
          className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
        />
      </div>

      <div className="relative group">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
        />
      </div>

      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl mt-4">
         <h4 className="text-sm font-bold text-gray-900 mb-1">Almost Done!</h4>
         <p className="text-xs text-gray-500 leading-relaxed">
           By clicking "Create Account", you agree to our Terms of Service and Privacy Policy.
         </p>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center h-full w-full px-6">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/60 p-8 md:p-12 relative overflow-hidden transition-all duration-500">
        
        <div className="relative z-10">
          
          {/* Header & Back Button */}
          <div className="flex items-center justify-between mb-8">
             {step > 1 ? (
               <button 
                 onClick={handleBack}
                 className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-white/50"
               >
                 <ChevronLeft size={24} />
               </button>
             ) : (
               <div className="w-8"></div> // Spacer
             )}
             
             {/* Logo */}
             <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 20l10-10"/>
                  <path d="M17 20l-10-10"/>
                </svg>
             </div>
             
             <div className="w-8"></div> // Spacer
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
             {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'flex-1 bg-gray-900' : 'w-2 bg-gray-200'}`}></div>
             ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 1 ? 'Create Account' : step === 2 ? 'Profile Setup' : 'Workspace Info'}
            </h2>
            <p className="text-gray-500">
               {step === 1 ? 'Start managing your tasks effectively.' : step === 2 ? 'Tell us a bit about yourself.' : 'Finalize your team settings.'}
            </p>
          </div>

          {/* Step Content */}
          <div className="min-h-[220px]">
             {step === 1 && renderStep1()}
             {step === 2 && renderStep2()}
             {step === 3 && renderStep3()}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-4">
             {step < 3 ? (
               <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  Next Step
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
             ) : (
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Create Account
                  <Check size={20} />
                </button>
             )}
          </div>

          <p className="mt-8 text-center text-gray-500">
            Already have an account?{' '}
            <button 
              onClick={() => onNavigate('login')}
              className="text-gray-900 font-bold hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;