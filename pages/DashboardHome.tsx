
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Calendar, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageCircle,
  Video,
  Users
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { useDashboard } from '../context/DashboardContext';
import { TabStatus } from '../types';
import TaskCard from '../components/TaskCard';
import ChatWidget from '../components/ChatWidget';
import CalendarWidget from '../components/CalendarWidget';
import MeetingWidget from '../components/MeetingWidget';
import TaskGraphWidget from '../components/TaskGraphWidget';
import CreateFolderModal from '../components/modals/CreateFolderModal';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import AddTaskModal from '../components/AddTaskModal';
import AddMemberModal from '../components/AddMemberModal';
import SmartTaskInput from '../components/SmartTaskInput';

interface DashboardProps {
  onAddTask: () => void;
  onAddMember: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddTask, onAddMember }) => {
  const { currentTeamId, setCurrentTeamId, currentProjectId, openTaskModal, clearUnreadMessages } = useStore();
  const [activeTab, setActiveTab] = useState<TabStatus>(TabStatus.ToDo);

  useEffect(() => {
    // Clear notifications when entering dashboard (where chat lives)
    clearUnreadMessages();
  }, [clearUnreadMessages]);

  // Fetch user's teams (Needed for header/context)
  const teams = useQuery(api.teams.getByUser);

  // useDashboard hook for global data
  const { tasks: allTasks, projects, teamMembers, currentUser, isLoading } = useDashboard();
  
  // Derived state: Filter tasks by current project
  // If no project selected, show nothing or all? Usually dashboard shows by project.
  // If currentProjectId is null, maybe show all 'My Tasks'? 
  // For now, filtering by project if selected, else show allTasks (or empty).
  // The original code filtered by projectId if present, else returned everything? No, useQuery skipped specific args.
  const tasks = useMemo(() => {
      if (!allTasks) return [];
      if (currentProjectId) {
          return allTasks.filter(t => t.projectId === currentProjectId);
      }
      return allTasks; // Return all tasks if no project selected? Or empty?
  }, [allTasks, currentProjectId]);

  // Fetch user details for team members - GlobalDataManager handles users.list, we can use that from context eventually
  // But DashboardContext has 'users'
  const { users } = useDashboard(); // Destructuring users from context
  
  // Map team members to user details
  const teamMembersWithDetails = useMemo(() => {
    if (!teamMembers || !users) return [];
    return teamMembers.map(member => {
      const user = users.find(u => u._id === member.userId);
      return user ? { ...user, role: member.role } : null;
    }).filter(Boolean);
  }, [teamMembers, users]);

  // Set current team on mount
  useEffect(() => {
    if (teams && teams.length > 0 && !currentTeamId) {
      setCurrentTeamId(teams[0]._id);
    }
  }, [teams, currentTeamId, setCurrentTeamId]);

  // Get current team and project details
  const currentTeam = teams?.find(t => t._id === currentTeamId);
  const teamName = currentTeam?.name || 'Taskly - Saas Dashboard';
  const currentProject = projects?.find(p => p._id === currentProjectId);

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter(task => task.status === activeTab);
  }, [tasks, activeTab]);

  // Calculate counts dynamically
  const getCount = (status: TabStatus) => {
    if (!tasks) return 0;
    return tasks.filter(t => t.status === status).length;
  };

  // Loading State
  if (isLoading) {
    return (
        <div className="h-full flex flex-col p-8 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 h-64 bg-gray-200 dark:bg-white/10 rounded-3xl"></div>
                <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-3xl"></div>
            </div>
        </div>
    );
  }

  return (
    <>
      <main className="flex-1 p-8 h-full overflow-y-auto custom-scrollbar">
        {/* Breadcrumbs & Meta */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
            <span>Workspace</span>
            <span>&gt;</span>
            <span className="flex items-center gap-1">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
               {teamName}
            </span>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{teamName}</h1>
               {currentProject && (
                 <div className="flex items-center gap-2 text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Project:</span>
                   <span 
                     className="font-semibold text-purple-600 dark:text-purple-400 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                     style={{ borderLeft: currentProject.color ? `3px solid ${currentProject.color}` : undefined }}
                   >
                     {currentProject.name}
                   </span>
                 </div>
               )}
               {!currentProject && (
                 <p className="text-sm text-gray-400 dark:text-gray-500 italic">Select a project from the sidebar to view tasks</p>
               )}
            </div>
            
            <div className="flex items-center gap-4">
               {/* AI Smart Input */}
               <SmartTaskInput className="w-full md:w-auto z-20" />

               {/* Mock Deadline Display */}
                  <div className="hidden md:flex items-center gap-3 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm transition-all hover:bg-white/60 dark:hover:bg-white/10">
                     <div className="relative flex items-center justify-center w-3 h-3">
                        {currentProject?.dueDate ? (
                          <>
                            <div className="absolute w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-400/50"></div>
                          </>
                        ) : (
                          <div className="relative w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Deadline</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                          {currentProject?.dueDate 
                            ? new Date(currentProject.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'No Deadline Set'}
                        </span>
                     </div>
                  </div>

               <div className="flex items-center gap-3 ml-4">
                  <div className="flex -space-x-2">
                    {teamMembersWithDetails.slice(0, 4).map((member: any, i) => (
                      <img 
                        key={i} 
                        src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" 
                        alt={member.name}
                        title={member.name}
                      />
                    ))}
                    {teamMembersWithDetails.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                        +{teamMembersWithDetails.length - 4}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={onAddMember}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                  >
                    Add <Users size={14} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
        
        {/* Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton 
            label={TabStatus.ToDo} 
            count={getCount(TabStatus.ToDo)} 
            active={activeTab === TabStatus.ToDo} 
            onClick={() => setActiveTab(TabStatus.ToDo)}
          />
          <TabButton 
            label={TabStatus.InProgress} 
            count={getCount(TabStatus.InProgress)} 
            active={activeTab === TabStatus.InProgress}
            onClick={() => setActiveTab(TabStatus.InProgress)}
          />
          <TabButton 
            label={TabStatus.UnderReview} 
            count={getCount(TabStatus.UnderReview)} 
            active={activeTab === TabStatus.UnderReview}
            onClick={() => setActiveTab(TabStatus.UnderReview)}
          />
          <TabButton 
            label={TabStatus.Completed} 
            count={getCount(TabStatus.Completed)} 
            active={activeTab === TabStatus.Completed}
            onClick={() => setActiveTab(TabStatus.Completed)}
          />
          
          <button 
            onClick={openTaskModal}
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Top Section: Tasks and Calendar sharing the same row grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
           {/* Render Tasks */}
           {filteredTasks?.map(task => (
             <TaskCard key={task._id} task={task} />
           ))}

           {/* Render Calendar inline with tasks */}
           <CalendarWidget />
           
           {/* Placeholder if empty */}
           {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 bg-white/30 dark:bg-white/5 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
                <p className="text-sm font-medium">No tasks in this category.</p>
                <button onClick={onAddTask} className="mt-2 text-purple-600 dark:text-purple-400 text-sm font-bold hover:underline">Create one?</button>
              </div>
           )}
        </div>

        {/* Bottom Section: Graph & Chat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[30rem]">
             <TaskGraphWidget />
          </div>
          <div className="h-[30rem]">
             <ChatWidget />
          </div>
        </div>

      </div>
    </main>
    
    {/* Modals are rendered in App.tsx or Layout now, but keeping local if needed? 
        The DashboardLayout handles global modals, but App.tsx passed onAddMember...
        Actually App.tsx renders AddTaskModal etc.
        So we don't need to render them here unless they are local.
        Original code rendered CreateFolderModal etc.
        Let's keep them if they are controlled by local state, but they seem to be controlled by useStore.
        App.tsx/DashboardLayout renders the modals based on store...
        Wait, App.tsx renders <AddTaskModal isOpen={isTaskModalOpen} ... />
        So we DO NOT need to render them here.
        But Original Dashboard.tsx rendered:
        <CreateFolderModal />
        <CreateProjectModal />
        <CreateTaskModal />
        Wait, these are the "old" modals? Or definitions?
        Let's check file list. `CreateFolderModal` exists in `modals/`.
        `AddTaskModal.tsx` is at `components/AddTaskModal.tsx`.
        The user previously implemented "Add Task Modal" in `AddTaskModal.tsx`.
        So `CreateTaskModal` inside `modals` might be legacy or alternative.
        I'll stick to what App.tsx renders. App.tsx renders `AddTaskModal`.
        So I will NOT render them here to avoid duplication.
    */}
  </>
  );
};

interface TabButtonProps {
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, count, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
      active 
        ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-none scale-105' 
        : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'
    }`}
  >
    {label}
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
      active ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800' : 'bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300'
    }`}>
      {count}
    </span>
  </button>
);

export default Dashboard;
