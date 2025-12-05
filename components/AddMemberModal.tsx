import React, { useState } from 'react';
import { X, Mail, User, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { currentTeamId } = useStore();
  const sendInvitation = useAction(api.invitations.sendInvitation);
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!currentTeamId) {
      setError('No team selected');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendInvitation({
        email: email.trim(),
        teamId: currentTeamId as any,
        role,
        fullName: fullName.trim() || undefined,
      });

      setSuccess(true);
      setEmail('');
      setFullName('');
      setRole('member');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to send invitation:', err);
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setRole('member');
    setError('');
    setSuccess(false);
    onClose();
  };

  const getRoleDescription = (selectedRole: string) => {
    switch (selectedRole) {
      case 'admin':
        return 'Full control: create, update, delete tasks, invite members, assign roles';
      case 'member':
        return 'Can create tasks and update/delete tasks assigned to them';
      case 'viewer':
        return 'Can only view tasks, cannot create, update, or delete';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={handleClose}
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
             onClick={handleClose}
             className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full transition-colors text-gray-500 dark:text-gray-400"
           >
             <X size={18} />
           </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           
           {/* Email Input */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <Mail size={14} className="text-purple-500" /> Email Address *
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@taskly.com" 
                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all"
                autoFocus
                disabled={loading}
              />
           </div>

           {/* Name & Role Grid */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" /> Full Name (Optional)
                 </label>
                 <input 
                   type="text" 
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   placeholder="e.g. Sarah Smith" 
                   className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all"
                   disabled={loading}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Shield size={14} className="text-orange-500" /> Access Level *
                 </label>
                 <div className="relative">
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                      disabled={loading}
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                    </div>
                 </div>
              </div>
           </div>

           {/* Role Description */}
           <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Access Level Details:</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {getRoleDescription(role)}
              </p>
           </div>

           {/* Error Message */}
           {error && (
             <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
               <AlertCircle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
               <div className="flex-1">
                 <p className="text-sm font-bold text-red-600 dark:text-red-400">Error</p>
                 <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
               </div>
             </div>
           )}

           {/* Success Message */}
           {success && (
             <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
               <CheckCircle2 size={18} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
               <div className="flex-1">
                 <p className="text-sm font-bold text-green-600 dark:text-green-400">Invitation Sent!</p>
                 <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                   An email invitation has been sent to {email}
                 </p>
               </div>
             </div>
           )}

        </form>

        {/* Footer */}
        <div className="px-8 py-5 bg-white/50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3 sticky bottom-0 z-20 backdrop-blur-xl">
           <button 
             type="button"
             onClick={handleClose}
             disabled={loading}
             className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={loading || !email.trim() || success}
             className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
           >
             {loading ? 'Sending...' : success ? 'Sent!' : 'Send Invite'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default AddMemberModal;