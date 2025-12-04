
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { TabStatus } from '../types';
import { TEAM_MEMBERS } from '../constants';
import TaskCard from './TaskCard';
import ChatWidget from './ChatWidget';
import CalendarWidget from './CalendarWidget';
import TaskGraphWidget from './TaskGraphWidget';
import CreateFolderModal from './modals/CreateFolderModal';
import CreateProjectModal from './modals/CreateProjectModal';
import CreateTaskModal from './modals/CreateTaskModal';

interface DashboardProps {
  onAddTask?: () => void;
  onAddMember?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddTask, onAddMember }) => {
  const { currentTeamId, setCurrentTeamId, openTaskModal } = useStore();
  const [activeTab, setActiveTab] = useState<TabStatus>(TabStatus.ToDo);

  // Fetch user's teams
  const teams = useQuery(api.teams.getByUser);
  
  // Fetch projects and tasks for the current team
  const projects = useQuery(api.projects.list, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  
  // Get the first project's tasks (for now, we'll improve this later)
  const firstProjectId = projects?.[0]?._id;
  const tasks = useQuery(api.tasks.list, firstProjectId ? { projectId: firstProjectId } : "skip");

  // Set current team on mount
  useEffect(() => {
    if (teams && teams.length > 0 && !currentTeamId) {
      setCurrentTeamId(teams[0]._id);
    }
  }, [teams, currentTeamId, setCurrentTeamId]);

  // Get current team name
  const currentTeam = teams?.find(t => t._id === currentTeamId);
  const teamName = currentTeam?.name || 'Taskly - Saas Dashboard';

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
            <div className="flex items-center gap-4">
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{teamName}</h1>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Mock Deadline Display */}
               <div className="hidden md:flex items-center gap-3 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm transition-all hover:bg-white/60 dark:hover:bg-white/10">
                  <div className="relative flex items-center justify-center w-3 h-3">
                     <div className="absolute w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                     <div className="relative w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-400/50"></div>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Deadline</span>
                     <span className="text-xs font-bold text-gray-900 dark:text-white leading-none">Sep 24, 2025</span>
                  </div>
               </div>

               <div className="flex items-center gap-3 ml-4">
                  <div className="flex -space-x-2">
                    {TEAM_MEMBERS.map((m, i) => (
                      <img key={i} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800" alt={m.name} />
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">+6</div>
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
           {filteredTasks.map(task => (
             <TaskCard key={task.id} task={task} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[24rem]">
          <TaskGraphWidget />
          <ChatWidget />
        </div>

      </div>
    </main>
    
    {/* Modals */}
    <CreateFolderModal />
    <CreateProjectModal />
    <CreateTaskModal />
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
