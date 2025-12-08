import React, { useState } from 'react';
import { X, Trash2, Shield, User, Check } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStore } from '../../store/useStore';

interface MemberActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

const MemberActionsModal: React.FC<MemberActionsModalProps> = ({ isOpen, onClose, member }) => {
  const { currentTeamId } = useStore();
  const updateRole = useMutation(api.teams.updateMemberRole);
  const removeMember = useMutation(api.teams.removeMember);
  
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(member?.role || 'member');

  // Sync state when member changes
  React.useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member]);

  const handleUpdateRole = async (newRole: string) => {
    if (!member || !currentTeamId) return;
    setLoading(true);
    try {
      await updateRole({
        teamId: currentTeamId as any,
        userId: member.userId || member._id, 
        role: newRole as 'admin' | 'member' | 'viewer',
      });
      setSelectedRole(newRole);
      onClose();
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!member || !currentTeamId) return;
    if (!confirm(`Are you sure you want to remove ${member.name}?`)) return;
    
    setLoading(true);
    try {
      await removeMember({
        teamId: currentTeamId as any,
        userId: member.userId || member._id,
      });
      onClose();
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      <div className="w-full max-w-sm bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative animate-fade-in overflow-hidden z-10">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
           <h3 className="font-bold text-lg text-gray-900 dark:text-white">Member Options</h3>
           <button 
             onClick={onClose}
             className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
           >
             <X size={16} />
           </button>
        </div>

        <div className="p-6 space-y-6">
           {/* Edit Role Section */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edit Role</label>
              <div className="grid grid-cols-1 gap-2">
                 {['admin', 'member'].map(role => (
                   <button
                     key={role}
                     onClick={() => handleUpdateRole(role)}
                     disabled={loading || member.role === 'owner'} // Cannot demote owner easily here logic
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                       selectedRole === role 
                         ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300' 
                         : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-500/30'
                     }`}
                   >
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-full ${role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                            {role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                         </div>
                         <span className="font-bold capitalize">{role}</span>
                      </div>
                      {selectedRole === role && <Check size={16} className="text-purple-600" />}
                   </button>
                 ))}
              </div>
           </div>

           {/* Delete Action */}
           <div className="pt-2">
              <button 
                onClick={handleRemoveMember}
                disabled={loading || member.role === 'owner'}
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Remove from Team
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MemberActionsModal;
