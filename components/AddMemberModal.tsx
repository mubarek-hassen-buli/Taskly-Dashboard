import React from 'react';
import { X, Mail, User, Shield, Link as LinkIcon, Copy } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="w-full max-w-lg bg-white/90 dark:bg-[#121212]/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative animate-fade-in overflow-hidden ring-1 ring-black/5 z-10">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between sticky top-0 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-xl z-20 border-b border-gray-100/50 dark:border-white/5">
           <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Invite Team Member</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Collaborate with your team</p>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full transition-colors text-gray-500 dark:text-gray-400"
           >
             <X size={18} />
           </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
           
           {/* Email Input */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <Mail size={14} className="text-purple-500" /> Email Address
              </label>
              <input 
                type="email" 
                placeholder="colleague@taskly.com" 
                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all"
                autoFocus
              />
           </div>

           {/* Name & Role Grid */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" /> Full Name
                 </label>
                 <input 
                   type="text" 
                   placeholder="e.g. Sarah Smith" 
                   className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Shield size={14} className="text-orange-500" /> Access Level
                 </label>
                 <div className="relative">
                    <select className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer">
                        <option>Member</option>
                        <option>Admin</option>
                        <option>Viewer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                    </div>
                 </div>
              </div>
           </div>

           {/* Invite Link Section */}
           <div className="pt-4 border-t border-gray-100 dark:border-white/5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                 <LinkIcon size={14} className="text-green-500" /> Invite Link
              </label>
              <div className="flex gap-2">
                 <div className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate font-medium">
                    taskly.com/invite/team/8x9s0d...
                 </div>
                 <button className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm">
                    <Copy size={18} />
                 </button>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white/50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3 sticky bottom-0 z-20 backdrop-blur-xl">
           <button 
             onClick={onClose}
             className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={onClose}
             className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
           >
             Send Invite
           </button>
        </div>

      </div>
    </div>
  );
};

export default AddMemberModal;