import React, { useState, useRef, useEffect } from 'react';
import { User, Bell, Shield, Key, Globe, Moon, Monitor, Trash2, Camera, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { useDashboard } from '../context/DashboardContext';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useStore();
  const [activeTab, setActiveTab] = useState('profile');

  // useDashboard hook for global data
  const { currentUser, isLoading } = useDashboard();
  
  // Local state for editing
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Mutations
  const updateProfile = useMutation(api.users.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize local state when currentUser loads
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);
  
  const sections = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        bio,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
    }

    setIsUploading(true);
    try {
        // 1. Generate Upload URL
        const postUrl = await generateUploadUrl();
        
        // 2. Upload File
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
        });

        if (!result.ok) throw new Error("Upload failed");
        
        const { storageId } = await result.json();

        // 3. Update Profile with Storage ID
        await updateProfile({
            avatarStorageId: storageId,
        });
        
        toast.success('Avatar updated successfully');
    } catch (error) {
        console.error(error);
        toast.error('Failed to upload avatar');
    } finally {
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  // Determine Image Source
  const imageUrl = currentUser?.avatar || currentUser?.image;
  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : currentUser?.email?.charAt(0).toUpperCase() || '?';

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
                 <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <div className="w-24 h-24 rounded-full p-1 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors overflow-hidden flex items-center justify-center">
                       {isUploading ? (
                           <Loader2 className="animate-spin text-purple-500" size={32} />
                       ) : imageUrl ? (
                            <img 
                                src={imageUrl} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover"
                            />
                       ) : (
                           <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center text-4xl font-bold text-purple-600 dark:text-purple-300">
                               {initial}
                           </div>
                       )}

                       {/* Overlay */}
                       <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                       </div>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                 </div>

                 <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser?.name || 'User Name'}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{currentUser?.email || 'email@example.com'}</p>
                    <button 
                        onClick={handleAvatarClick}
                        className="mt-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
                        disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Change Avatar'}
                    </button>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Full Name</label>
                       <input 
                         type="text" 
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-900 dark:text-white"
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
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none text-gray-900 dark:text-white"
                      placeholder="Tell us a little about yourself..."
                    ></textarea>
                 </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                 <button 
                    onClick={() => {
                        setName(currentUser?.name || '');
                        setBio(currentUser?.bio || '');
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                 >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
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