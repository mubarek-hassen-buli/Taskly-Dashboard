import React, { useMemo } from 'react';
import { Plus, Search, Filter, Columns, List } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { TabStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskOverviewProps {
  onAddTask?: () => void;
  onAddMember?: () => void;
}

const TaskOverview: React.FC<TaskOverviewProps> = ({ onAddTask, onAddMember }) => {
  const { currentTeamId, currentProjectId } = useStore();

  // Fetch tasks for the selected project
  const tasks = useQuery(api.tasks.list, currentProjectId ? { projectId: currentProjectId as any } : "skip");
  
  // Fetch team members for the current team
  const teamMembers = useQuery(api.teams.listMembers, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  
  // Fetch user details for team members
  const users = useQuery(api.users.list);
  
  // Map team members to user details
  const teamMembersWithDetails = useMemo(() => {
    if (!teamMembers || !users) return [];
    return teamMembers.map(member => {
      const user = users.find(u => u._id === member.userId);
      return user ? { ...user, role: member.role } : null;
    }).filter(Boolean);
  }, [teamMembers, users]);

  const columns = [
    { id: TabStatus.ToDo, label: 'To Do', color: 'bg-yellow-500' },
    { id: TabStatus.InProgress, label: 'In Progress', color: 'bg-blue-500' },
    { id: TabStatus.UnderReview, label: 'Under Review', color: 'bg-purple-500' },
    { id: TabStatus.Completed, label: 'Completed', color: 'bg-green-500' },
  ];

  return (
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">Task Overview</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Task Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {currentProjectId ? 'Manage and track your project tasks in real-time.' : 'Select a project from the sidebar to view tasks.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* View Toggle */}
             <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-1 rounded-xl flex border border-white/60 dark:border-white/10">
                <button className="p-2 bg-white dark:bg-gray-700 shadow-sm rounded-lg text-gray-900 dark:text-white">
                    <Columns size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <List size={18} />
                </button>
             </div>

             <div className="h-8 w-px bg-gray-300/50 dark:bg-white/10 mx-2"></div>

             <div className="flex -space-x-2 mr-2">
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
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    +{teamMembersWithDetails.length - 4}
                  </div>
                )}
                <button 
                  onClick={onAddMember}
                  className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Plus size={14} />
                </button>
             </div>
             
             <button 
               onClick={onAddTask}
               className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
             >
                <Plus size={14} />
                New Task
             </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 shrink-0">
         <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900 transition-all font-medium placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors">
               <Filter size={16} />
               Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors">
               Sort By: Priority
            </button>
         </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-4 h-full custom-scrollbar">
        {columns.map(col => {
          const colTasks = tasks?.filter(t => t.status === col.id) || [];
          
          return (
            <div key={col.id} className="min-w-[320px] max-w-[320px] flex flex-col h-full">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300">{col.label}</h3>
                    <span className="bg-white/50 dark:bg-white/10 px-2 py-0.5 rounded-md text-xs font-bold text-gray-500 dark:text-gray-400 border border-white/50 dark:border-white/5">
                        {colTasks.length}
                    </span>
                 </div>
                 <button onClick={onAddTask} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Plus size={18} />
                 </button>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-[2rem] p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                  {colTasks.map(task => (
                      <TaskCard key={task._id} task={task} />
                  ))}
                  
                  {colTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600 border-2 border-dashed border-white/40 dark:border-white/10 rounded-3xl">
                          <span className="text-sm">No tasks</span>
                      </div>
                  )}
              </div>
            </div>
          );
        })}
        
        {/* Add Column Button */}
        <div className="min-w-[50px] flex items-start justify-center pt-2">
             <button onClick={onAddTask} className="w-10 h-10 rounded-full bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-white/40 dark:border-white/10 transition-colors">
                 <Plus size={20} />
             </button>
        </div>
      </div>
    </main>
  );
};

export default TaskOverview;