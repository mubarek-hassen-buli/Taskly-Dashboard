import React, { useState, useRef, useEffect } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { signupStep2Schema, signupStep3Schema } from "../lib/validations";
import { fileToDataUrl, validateImageFile } from "../lib/imageUpload";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { 
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
  Globe,
  Github
} from 'lucide-react';

interface SignupProps {
  onNavigate: (view: string) => void;
}

const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.update);
  const createTeam = useMutation(api.teams.create);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // If already authenticated, start at step 2 (Profile Setup)
  const [step, setStep] = useState(isAuthenticated ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    workspace: '',
    phone: '',
    avatar: ''
  });

  // Pre-fill form data from OAuth user info
  useEffect(() => {
    if (currentUser && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        avatar: currentUser.avatar || ''
      }));
    }
  }, [currentUser]);

  // Update step if auth state changes (e.g. after social login)
  useEffect(() => {
    if (isAuthenticated && step === 1) {
      setStep(2);
    }
  }, [isAuthenticated, step]);

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

  const handleNext = () => {
    setValidationErrors({});
    setError('');
    
    // Validate current step
    try {
      if (step === 2) {
        signupStep2Schema.parse({
          role: formData.role,
          avatar: formData.avatar
        });
      }
      setStep(prev => prev + 1);
    } catch (err: any) {
      const errors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        errors[error.path[0]] = error.message;
      });
      setValidationErrors(errors);
      setError('Please fill in all required fields correctly');
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setFormData({ ...formData, avatar: dataUrl });
      setError('');
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleCompleteSignup = async () => {
    setLoading(true);
    setError('');
    setValidationErrors({});
    
    // Validate step 3
    try {
      signupStep3Schema.parse({
        workspace: formData.workspace,
        phone: formData.phone
      });
    } catch (err: any) {
      const errors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        errors[error.path[0]] = error.message;
      });
      setValidationErrors(errors);
      setLoading(false);
      return;
    }
    
    try {
      // Step 2: Update profile with additional info
      await updateProfile({
        name: formData.name || undefined,
        role: formData.role,
        phone: formData.phone,
        avatar: formData.avatar
      });

      // Step 3: Create team/workspace
      if (formData.workspace) {
        await createTeam({
          name: formData.workspace,
          privacy: "private"
        });
      }

      // Navigate to dashboard
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  // Step 1: Social Login
  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in">
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
          Sign up with Google
        </button>

        <button 
          onClick={() => handleSocialLogin("github")}
          disabled={loading}
          className="w-full py-4 bg-[#24292F] text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-[#24292F]/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Github size={20} />
          Sign up with GitHub
        </button>
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
           <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
           <input 
             ref={fileInputRef}
             type="file" 
             accept="image/*" 
             onChange={handleImageUpload}
             className="hidden"
           />
           <p className="text-xs font-bold text-gray-500">Upload Profile Picture (Optional)</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
           <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
             <Briefcase size={12} /> Select Role
           </label>
           {validationErrors.role && <p className="text-red-500 text-xs">{validationErrors.role}</p>}
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
          className={`w-full bg-white/50 border ${validationErrors.workspace ? 'border-red-300' : 'border-white/40'} rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm`}
        />
        {validationErrors.workspace && <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.workspace}</p>}
      </div>

      <div className="relative group">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" size={20} />
        <PhoneInput
          international
          defaultCountry="US"
          value={formData.phone}
          onChange={(value) => setFormData({...formData, phone: value || ''})}
          className="phone-input-custom"
          inputComponent={({ className, ...props }) => (
            <input
              {...props}
              className="w-full bg-white/50 border border-white/40 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white/80 transition-all font-medium backdrop-blur-sm"
            />
          )}
        />
      </div>

      <style>{`
        .phone-input-custom {
          position: relative;
        }
        .phone-input-custom .PhoneInputCountry {
          position: absolute;
          left: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 0.25rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        .phone-input-custom .PhoneInputCountrySelect {
          opacity: 0;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .phone-input-custom .PhoneInputCountrySelectArrow {
          display: none;
        }
        .phone-input-custom input {
          padding-left: 5.5rem !important;
        }
      `}</style>

      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl mt-4">
         <h4 className="text-sm font-bold text-gray-900 mb-1">Almost Done!</h4>
         <p className="text-xs text-gray-500 leading-relaxed">
           By clicking "Complete Setup", you agree to our Terms of Service and Privacy Policy.
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
             {step > 1 && !isAuthenticated ? (
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
             {step === 2 && (
               <button 
                  onClick={handleNext}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  Next Step
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
             )}
             
             {step === 3 && (
                <button 
                  onClick={handleCompleteSignup}
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Completing Setup...' : 'Complete Setup'}
                  <Check size={20} />
                </button>
             )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}
          </div>

          {!isAuthenticated && (
            <p className="mt-8 text-center text-gray-500">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate('login')}
                className="text-gray-900 font-bold hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;