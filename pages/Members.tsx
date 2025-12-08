import React, { useMemo, useState, useRef } from 'react';
import { Mail, Phone, MoreVertical, Plus, Search, Shield, User, Trash2 } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { useDashboard } from '../context/DashboardContext';
import MemberMenu from '../components/MemberMenu';
import AddMemberModal from '../components/AddMemberModal';

interface TeamMembersProps {
  onAddMember?: () => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ onAddMember }) => {
  const { currentTeamId } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Menu State
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<string | null>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // useDashboard hook for global data
  const { teamMembers, users, currentUser, isLoading } = useDashboard();
  
  // Map team members to user details
  const members = useMemo(() => {
    if (!teamMembers || !users) return [];
    return teamMembers.map(member => {
      const user = users.find(u => u._id === member.userId);
      return user ? { ...user, role: member.role, joinedAt: member._creationTime, userId: member.userId, teamMemberId: member._id } : null;
    }).filter(Boolean);
  }, [teamMembers, users]);

  // Filter members based on search
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery) return members;
    
    return members.filter(member => 
      member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'owner': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const toggleMenu = (e: React.MouseEvent, memberId: string) => {
      e.stopPropagation();
      if (activeMenuMemberId === memberId) {
          setActiveMenuMemberId(null);
      } else {
          setActiveMenuMemberId(memberId);
      }
  };

  if (isLoading) {
      return (
          <div className="p-8 h-full flex flex-col animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-white/10 w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl"></div>
                  ))}
              </div>
          </div>
      )
  }

  return (
    <>
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">Team</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage your team, roles, and permissions.
            </p>
          </div>
          
          <button 
            onClick={onAddMember}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
          >
             <Plus size={14} />
             Add Member
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 shrink-0">
         <div className="relative max-w-md w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search members by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
            />
         </div>
         <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing <span className="text-gray-900 dark:text-white font-bold">{filteredMembers.length}</span> members
         </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4">
        {filteredMembers.map((member: any) => {
          // Determine Image Source: Check bio, image, avatar fields
          const imageUrl = member.avatar || member.image;
          const initial = member.name ? member.name.charAt(0).toUpperCase() : member.email?.charAt(0).toUpperCase() || '?';
          const isMenuOpen = activeMenuMemberId === member._id;

          return (
          <div key={member._id} className="group bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 relative overflow-hidden">
             
             {/* Hover Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

             <div className="relative flex flex-col items-center text-center">
                <div className="absolute top-0 right-0">
                   <button 
                     ref={(el) => { menuButtonRefs.current[member._id] = el; }}
                     onClick={(e) => toggleMenu(e, member._id)} 
                     className={`p-2 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-white/10 ${isMenuOpen ? 'text-gray-900 dark:text-white bg-white/50 dark:bg-white/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                   >
                      <MoreVertical size={16} />
                   </button>
                   
                   {/* Render Menu if active */}
                   {isMenuOpen && (
                       <MemberMenu 
                           member={member} 
                           isOpen={isMenuOpen} 
                           onClose={() => setActiveMenuMemberId(null)} 
                           triggerRef={{ current: menuButtonRefs.current[member._id] }} // Pass a ref object wrapper
                       />
                   )}
                </div>

                <div className="w-20 h-20 rounded-full p-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm mb-4 relative flex items-center justify-center overflow-hidden">
                   {imageUrl ? (
                       <img 
                          src={imageUrl} 
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                       />
                   ) : (
                       <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-300">
                           {initial}
                       </div>
                   )}
                   
                   <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${member.role === 'owner' ? 'bg-yellow-400' : 'bg-purple-500'}`}>
                      {member.role === 'owner' ? <Shield size={10} className="text-white fill-current" /> : <User size={10} className="text-white" />}
                   </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{member.email}</p>

                <div className={`px-3 py-1 rounded-full text-xs font-bold border mb-6 ${getRoleColor(member.role)}`}>
                   {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </div>

                <div className="w-full flex items-center justify-center gap-3 border-t border-gray-100 dark:border-white/10 pt-4 opacity-0">
                  {/* Invisible spacer to keep layout if needed, or just remove since we have menu now. 
                      User originally asked to remove icons but keep delete functionality working.
                      With the new menu, delete is IN the menu. So we can probably remove this row entirely or leave empty?
                      User said "make the delete icon work correctly" previously, but now "make the modal that open when u touch the three dots too be like this image".
                      The image likely handles all actions. I will remove the bottom row to clean up if icons are gone. 
                      Actually, I'll keep it simple and clean as requested - no icons. 
                  */}
                </div>
             </div>
          </div>
        )})}

        {/* Add New Card */}
        <button 
          onClick={onAddMember}
          className="group flex flex-col items-center justify-center bg-white/20 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-[2rem] p-6 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:border-purple-500/50 dark:hover:bg-purple-900/10 transition-all min-h-[300px]"
        >
           <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
              <Plus size={32} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
           </div>
           <h3 className="font-bold text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Add Team Member</h3>
        </button>
      </div>
    </main>
    </>
  );
};

export default TeamMembers;