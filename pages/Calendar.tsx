import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { useDashboard } from '../context/DashboardContext';

interface CalendarPageProps {
  onAddTask?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onAddTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // useDashboard hook for global data
  const { tasks: allTasks, projects, teamMembers, currentUser, isLoading } = useDashboard();
  
  // Derived state: Use all tasks or filter by project?
  // Calendar usually shows everything.
  const tasks = allTasks || [];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday
  
  // Adjust so Monday is 0? Optional. Let's stick to standard Sunday=0 for grid logic or adapt.
  // Standard calendars usually start Sunday or Monday.
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayTasks = (day: number) => {
    if (!tasks) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    // Determine if task falls on this day
    return tasks.filter(task => {
        if (!task.dueDate) return false;
        const d = new Date(task.dueDate);
        return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  if (isLoading) {
      return (
          <div className="p-8 h-full flex flex-col animate-pulse">
             <div className="h-8 bg-gray-200 dark:bg-white/10 w-1/4 mb-8"></div>
             <div className="flex-1 bg-gray-200 dark:bg-white/10 rounded-3xl"></div>
          </div>
      )
  }

  return (
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 shrink-0">
        <div>
           <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
             <span>Workspace</span>
             <span>&gt;</span>
             <span className="text-gray-800 dark:text-gray-200 font-bold">Calendar</span>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Schedule</h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl p-1">
              <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-gray-300">
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 text-sm font-bold min-w-[140px] text-center text-gray-900 dark:text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-gray-300">
                <ChevronRight size={20} />
              </button>
           </div>
           
           <button 
             onClick={onAddTask}
             className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
           >
              <Plus size={14} />
              Add Event
           </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden flex flex-col">
          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-4">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                 <div key={day} className="text-center text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-2">
                     {day}
                 </div>
             ))}
          </div>
          
          {/* Days */}
          <div className="grid grid-cols-7 grid-rows-5 gap-4 flex-1">
             {/* Empty slots for start of month */}
             {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                 <div key={`empty-${i}`} className="opacity-0"></div>
             ))}
             
             {/* Days */}
             {Array.from({ length: daysInMonth }).map((_, i) => {
                 const day = i + 1;
                 const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                 const dayTasks = getDayTasks(day);
                 
                 return (
                     <div 
                        key={day} 
                        className={`
                            relative rounded-2xl p-3 flex flex-col gap-1 transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 group cursor-pointer
                            ${isToday ? 'bg-white dark:bg-white/10 shadow-md ring-1 ring-purple-500/20' : 'bg-white/20 dark:bg-white/5'}
                        `}
                     >
                         <div className={`
                             text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mb-1
                             ${isToday ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none' : 'text-gray-700 dark:text-gray-300'}
                         `}>
                             {day}
                         </div>
                         
                         {/* Tasks/Events */}
                         <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                             {dayTasks.map(task => (
                                 <div key={task._id} className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg truncate font-medium border-l-2 border-purple-500">
                                     {task.title}
                                 </div>
                             ))}
                             {dayTasks.length === 0 && (
                                 <div className="flex-1 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Plus size={14} className="text-gray-400" />
                                 </div>
                             )}
                         </div>
                     </div>
                 );
             })}
          </div>
      </div>
    </main>
  );
};

export default CalendarPage;
