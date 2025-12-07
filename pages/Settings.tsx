import React, { useState } from 'react';
import { User, Bell, Shield, Key, Globe, Moon, Monitor, Trash2, Camera, LogOut } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { useDashboard } from '../context/DashboardContext';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  // useDashboard hook for global data
  // Even Settings page benefits from shared currentUser to avoid re-fetch logic
  const { currentUser, isLoading } = useDashboard();
  
  // NOTE: If SettingsPage allows mutating user data, it should use mutations.
  // The 'currentUser' from context matches the one from api.users.current.
  
  const sections = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  if (isLoading) {
      return (
          <div className="p-8 h-full flex flex-col animate-pulse">
             <div className="h-8 bg-gray-200 dark:bg-white/10 w-1/4 mb-8"></div>
             <div className="flex gap-8 h-full">
                 <div className="w-64 h-full bg-gray-200 dark:bg-white/10 rounded-3xl"></div>
                 <div className="flex-1 h-full bg-gray-200 dark:bg-white/10 rounded-3xl"></div>
             </div>
          </div>
      )
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-[2rem] p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === section.id 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
                }`}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm overflow-y-auto custom-scrollbar">
          
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-8 animate-fade-in">
              <div className="flex items-center gap-6">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors">
                       <img 
                          src={currentUser?.image || `https://ui-avatars.com/api/?name=${currentUser?.name || 'User'}&background=random`} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                       />
                       <button className="absolute bottom-0 right-0 p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={14} />
                       </button>
                    </div>
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser?.name || 'User Name'}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{currentUser?.email || 'email@example.com'}</p>
                    <button className="mt-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline">
                      Change Avatar
                    </button>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Full Name</label>
                       <input 
                         type="text" 
                         defaultValue={currentUser?.name}
                         className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Email Address</label>
                       <input 
                         type="email" 
                         defaultValue={currentUser?.email}
                         disabled
                         className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-500 cursor-not-allowed"
                       />
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Bio</label>
                    <textarea 
                      rows={4} 
                      className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                      placeholder="Tell us a little about yourself..."
                    ></textarea>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                 <button className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Cancel
                 </button>
                 <button className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                    Save Changes
                 </button>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeTab === 'preferences' && (
             <div className="max-w-2xl space-y-8 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                     onClick={() => theme === 'light' && toggleTheme()}
                     className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                       theme === 'dark' 
                       ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' 
                       : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                     }`}
                   >
                      <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                         <Moon size={20} />
                      </div>
                      <div className="text-left">
                         <div className="font-bold text-gray-900 dark:text-white">Dark Mode</div>
                         <div className="text-xs text-gray-500">Easy on the eyes</div>
                      </div>
                      {theme === 'dark' && <div className="ml-auto w-4 h-4 rounded-full bg-purple-500"></div>}
                   </button>

                   <button 
                     onClick={() => theme === 'dark' && toggleTheme()}
                     className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                       theme === 'light' 
                       ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10' 
                       : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                     }`}
                   >
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900">
                         <Monitor size={20} />
                      </div>
                      <div className="text-left">
                         <div className="font-bold text-gray-900 dark:text-white">Light Mode</div>
                         <div className="text-xs text-gray-500">Classic bright look</div>
                      </div>
                      {theme === 'light' && <div className="ml-auto w-4 h-4 rounded-full bg-purple-500"></div>}
                   </button>
                </div>
             </div>
          )}
          
          {/* Other sections placeholders */}
          {(activeTab === 'notifications' || activeTab === 'security') && (
             <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
                 <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Key size={24} />
                 </div>
                 <h3 className="font-bold text-gray-900 dark:text-white">Coming Soon</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This section is under development.</p>
             </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default SettingsPage;