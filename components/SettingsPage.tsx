import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { 
  User, 
  Bell, 
  Moon, 
  Smartphone, 
  Mail, 
  Camera, 
  Save,
  Globe,
  Monitor
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const currentUser = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.update);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatar: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync form data when user loads
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        role: currentUser.role || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await updateProfile({
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        avatar: formData.avatar
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  return (
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">Settings</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account and preferences.</p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <Save size={16} />
             {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          {success && (
            <div className="absolute top-full mt-2 right-0 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium shadow-lg">
              Profile updated successfully!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-8">
        
        {/* Left Column - Profile Card */}
        <div className="col-span-1">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2rem] p-6 shadow-sm sticky top-0">
            <div className="flex flex-col items-center">
               <div className="relative group cursor-pointer mb-4">
                  <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors">
                     <img 
                       src={currentUser.avatar || 'https://via.placeholder.com/128'} 
                       alt={currentUser.name} 
                       className="w-full h-full rounded-full object-cover" 
                     />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md text-gray-500 hover:text-purple-600 dark:text-gray-400 transition-colors">
                     <Camera size={16} />
                  </div>
               </div>
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
               <p className="text-purple-600 dark:text-purple-400 font-medium text-sm">{currentUser.role}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="col-span-1 xl:col-span-2 space-y-8">
          
          {/* Profile Information */}
          <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                   <User size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Update your personal details here.</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Full Name</label>
                   <input 
                     type="text" 
                     value={formData.name} 
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Email Address</label>
                   <input 
                     type="email" 
                     value={formData.email} 
                     disabled
                     className="w-full bg-gray-100 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Phone Number</label>
                   <input 
                     type="tel" 
                     value={formData.phone} 
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     className="w-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Role</label>
                   <input 
                     type="text" 
                     value={formData.role} 
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                   />
                </div>
             </div>
          </section>

          {/* Preferences */}
          <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                   <Globe size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h2>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Customize your workspace experience.</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300">
                         <Moon size={18} />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-gray-900 dark:text-white">Dark Mode</h4>
                         <p className="text-xs text-gray-500">Toggle system theme</p>
                      </div>
                   </div>
                   <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-not-allowed opacity-70" title="Use Header Toggle">
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                   </div>
                </div>

                 <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300">
                         <Globe size={18} />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-gray-900 dark:text-white">Language</h4>
                         <p className="text-xs text-gray-500">Select your preferred language</p>
                      </div>
                   </div>
                   <select className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-0 cursor-pointer">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                   </select>
                </div>
             </div>
          </section>

          {/* Notifications */}
          <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2rem] p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                   <Bell size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Manage how you receive alerts.</p>
                </div>
             </div>

             <div className="space-y-4">
                {[
                   { icon: <Mail size={18} />, title: "Email Notifications", desc: "Receive daily digests" },
                   { icon: <Smartphone size={18} />, title: "Push Notifications", desc: "Real-time mobile alerts" },
                   { icon: <Monitor size={18} />, title: "Desktop Notifications", desc: "In-browser popups" }
                ].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-500 dark:text-gray-400">
                            {item.icon}
                         </div>
                         <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                         </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                   </div>
                ))}
             </div>
          </section>

        </div>
      </div>
    </main>
  );
};

export default SettingsPage;