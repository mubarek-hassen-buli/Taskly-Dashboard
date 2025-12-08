import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, Shield, User, Eye, CheckCircle, ChevronRight } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';

interface MemberMenuProps {
  member: any;
  triggerRef: React.RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
}

const MemberMenu: React.FC<MemberMenuProps> = ({ member, triggerRef, isOpen, onClose }) => {
  const { currentTeamId } = useStore();
  const updateRole = useMutation(api.teams.updateMemberRole);
  const removeMember = useMutation(api.teams.removeMember);
  
  const [menuPos, setMenuPos] = useState<{top: number, right: number} | null>(null);
  const [showRoleSubmenu, setShowRoleSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, triggerRef]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleUpdateRole = async (newRole: string) => {
    if (!member || !currentTeamId) return;
    try {
      await updateRole({
        teamId: currentTeamId as any,
        userId: member.userId || member._id,
        role: newRole as 'admin' | 'member' | 'viewer',
      });
      onClose();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveMember = async () => {
    if (!member || !currentTeamId) return;
    if (!confirm(`Are you sure you want to remove ${member.name}?`)) return;
    try {
      await removeMember({
        teamId: currentTeamId as any,
        userId: member.userId || member._id,
      });
      onClose();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  if (!isOpen || !member || !menuPos) return null;

  return createPortal(
    <div 
      ref={menuRef}
      className="fixed z-[100] w-56 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-1.5 animate-fade-in origin-top-right overflow-visible"
      style={{ top: menuPos.top, right: menuPos.right }}
    >
        {/* Role Submenu Trigger */}
        <div className="relative">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowRoleSubmenu(!showRoleSubmenu);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Change Role</span>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
            </button>

            {/* Submenu */}
            {showRoleSubmenu && (
                <div className="absolute top-0 right-full mr-2 w-48 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-1.5 animate-fade-in">
                    {/* Admin */}
                    <button 
                        onClick={() => handleUpdateRole('admin')}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-colors ${member.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {member.role === 'admin' && <CheckCircle size={14} />}
                        <span className={member.role === 'admin' ? '' : 'ml-5.5'}>Admin</span>
                    </button>
                    {/* Member */}
                    <button 
                        onClick={() => handleUpdateRole('member')}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-colors ${member.role === 'member' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {member.role === 'member' && <CheckCircle size={14} />}
                        <span className={member.role === 'member' ? '' : 'ml-5.5'}>Member</span>
                    </button>
                    {/* Viewer */}
                    <button 
                        onClick={() => handleUpdateRole('viewer')}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-xl transition-colors ${member.role === 'viewer' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        {member.role === 'viewer' && <CheckCircle size={14} />}
                        <span className={member.role === 'viewer' ? '' : 'ml-5.5'}>Viewer</span>
                    </button>
                </div>
            )}
        </div>

        <div className="h-px bg-gray-50 dark:bg-white/5 my-1 mx-2"></div>

        {/* Custom Role / Edit Profile (Optional placeholder if needed) */}
        
        {/* Delete */}
        <button 
            onClick={handleRemoveMember}
            disabled={member.role === 'owner'}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors disabled:opacity-50"
        >
            <Trash2 size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="text-sm font-bold text-red-600 dark:text-red-400">Remove from Team</span>
        </button>
    </div>,
    document.body
  );
};

export default MemberMenu;
