import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Filter, Mail, MoreHorizontal, Plus, Trash2, Shield, Check } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import MemberProfileModal from './modals/MemberProfileModal';

interface TeamMembersProps {
  onAddMember?: () => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ onAddMember }) => {
  const { currentTeamId } = useStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [memberToView, setMemberToView] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Queries & Mutations
  const teamMembers = useQuery(api.teams.listMembers, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  const users = useQuery(api.users.list);
  const currentUser = useQuery(api.users.getAuthUserIdQuery);
  const updateRole = useMutation(api.teams.updateMemberRole);
  const removeMember = useMutation(api.teams.removeMember);
  
  // Computed Data
  const teamMembersWithDetails = useMemo(() => {
    if (!teamMembers || !users) return [];
    return teamMembers.map(member => {
      const user = users.find(u => u._id === member.userId);
      return user ? { 
        ...user, 
        role: member.role,
        status: 'Online', 
        id: member._id,
        userId: member.userId // needed for mutations
      } : null;
    }).filter(Boolean);
  }, [teamMembers, users]);

  // Determine Current User's Role
  const myRole = useMemo(() => {
    if (!teamMembers || !currentUser) return null;
    const myMembership = teamMembers.find(m => m.userId === currentUser);
    return myMembership?.role || null;
  }, [teamMembers, currentUser]);

  const canManage = (targetRole: string) => {
    if (myRole === 'owner') return true;
    if (myRole === 'admin' && targetRole !== 'owner' && targetRole !== 'admin') return true;
    return false;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setEditingRoleId(null); // Close role editor too
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (openMenuId === id) {
      setOpenMenuId(null);
      setEditingRoleId(null);
    } else {
      setOpenMenuId(id);
      setEditingRoleId(null);
    }
  };

  const handleUpdateRole = async (memberId: string, userId: string, newRole: "admin" | "member" | "viewer") => {
    try {
      await updateRole({ teamId: currentTeamId as any, userId: userId as any, role: newRole });
      setEditingRoleId(null);
      setOpenMenuId(null);
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      try {
        await removeMember({ teamId: currentTeamId as any, userId: userId as any });
        setOpenMenuId(null);
      } catch (err: any) {
        alert(err.message || "Failed to remove member");
      }
    }
  };

  return (
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">Team Members</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage permissions and view team availability.</p>
          </div>
          
          {(myRole === 'owner' || myRole === 'admin') && (
            <button 
              onClick={onAddMember}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
            >
               <Plus size={14} />
               Add Member
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 shrink-0">
         <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm text-gray-900 dark:text-white"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors">
               <Filter size={16} />
               Filter Status
            </button>
         </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-4" ref={menuRef}>
        {teamMembersWithDetails.map((member: any) => (
          <div key={member.id} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:bg-white/60 dark:hover:bg-white/10 transition-all group relative overflow-visible">
             
             {/* Decorative Top Gradient */}
             <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/40 dark:from-white/5 to-transparent pointer-events-none rounded-t-[2rem]"></div>

             {/* Header with Z-Index 20 to stay above profile */}
             <div className="flex justify-between items-start mb-4 relative z-20">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    member.status === 'Online' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50' :
                    member.status === 'Busy' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}>
                    {member.status}
                </div>
                
                {canManage(member.role) && (
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, member.id)}
                      className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg transition-colors ${openMenuId === member.id ? 'bg-white/50 dark:bg-white/10 text-gray-900 dark:text-white' : ''}`}
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === member.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in origin-top-right">
                          {editingRoleId === member.id ? (
                            <div className="p-2 space-y-1">
                              <div className="px-2 py-1 text-[10px] uppercase font-bold text-gray-400">Select Role</div>
                              {['admin', 'member', 'viewer'].map(role => (
                                <button
                                  key={role}
                                  onClick={() => handleUpdateRole(member.id, member.userId, role as any)}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors ${member.role === role ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                  <span className="capitalize">{role}</span>
                                  {member.role === role && <Check size={14} />}
                                </button>
                              ))}
                              <button 
                                onClick={() => setEditingRoleId(null)}
                                className="w-full text-center text-[10px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mt-1 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="p-1.5 space-y-0.5">
                                  <button 
                                    onClick={() => setEditingRoleId(member.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                                  >
                                      <Shield size={14} className="text-gray-400" />
                                      Edit Role
                                  </button>
                              </div>
                              <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-0.5"></div>
                              <div className="p-1.5">
                                  <button 
                                    onClick={() => handleRemoveMember(member.id, member.userId, member.name)}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                  >
                                      <Trash2 size={14} />
                                      Remove Member
                                  </button>
                              </div>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                )}
             </div>

             {/* Profile Section with Z-Index 10 */}
             <div className="flex flex-col items-center mb-6 relative z-10 w-full">
                <div className="relative mb-3">
                   <img 
                     src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                     alt={member.name} 
                     className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                   />
                   <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                      member.status === 'Online' ? 'bg-green-500' :
                      member.status === 'Busy' ? 'bg-red-500' : 'bg-gray-400'
                   }`}></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 capitalize">{member.role}</p>
             </div>

             <div className="flex flex-col gap-3 mb-6 relative z-10">
                <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/50 dark:border-white/5">
                   <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400">
                      <Mail size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{member.email}</p>
                   </div>
                </div>
             </div>

             <div className="flex gap-3 relative z-10">
                <button 
                  onClick={() => {
                    setMemberToView(member);
                    setIsProfileModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                >
                   View Profile
                </button>
             </div>

          </div>
        ))}
        
        {/* Add New Card Placeholder */}
        {(myRole === 'owner' || myRole === 'admin') && (
          <button 
            onClick={onAddMember}
            className="border-2 border-dashed border-white/40 dark:border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all min-h-[300px]"
          >
             <div className="w-16 h-16 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center shadow-sm">
                <Plus size={32} />
             </div>
             <span className="font-bold">Add New Member</span>
          </button>
        )}
      </div>
      
      {/* Profile Modal */}
      <MemberProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        member={memberToView} 
      />
    </main>
  );
};

export default TeamMembers;