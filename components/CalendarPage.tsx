import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { TASKS } from '../constants';

interface CalendarPageProps {
  onAddTask?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onAddTask }) => {
  // Mock Date: September 2025
  const currentMonth = 'September 2025';
  const daysInMonth = 30;
  const startDayOffset = 1; // September 1st 2025 is a Monday (0=Sun, 1=Mon)

  // Generate calendar grid
  const calendarDays = [];
  // Empty slots for previous month
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ day: null });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i });
  }
  // Remaining slots to fill 6 weeks (42 slots)
  const remainingSlots = 42 - calendarDays.length;
  for (let i = 0; i < remainingSlots; i++) {
    calendarDays.push({ day: null });
  }

  const getTasksForDay = (day: number) => {
    // Matches tasks with dueDate string "Sep {day}" or "Sep 0{day}"
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    return TASKS.filter(task => {
        // Simple string matching for demo purposes based on constant data format "Sep 14"
        return task.dueDate === `Sep ${day}` || task.dueDate === `Sep ${dayStr}`;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-6 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">Calendar</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Schedule</h1>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-sm">
               <button className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500">
                  <ChevronLeft size={18} />
               </button>
               <span className="text-sm font-bold text-gray-800 dark:text-gray-200 min-w-[120px] text-center">{currentMonth}</span>
               <button className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500">
                  <ChevronRight size={18} />
               </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm">
                <CalendarIcon size={16} />
                Month View
             </button>
             <button className="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm">
                <Filter size={16} />
                Filter
             </button>
             <button 
                onClick={onAddTask}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
             >
                <Plus size={14} />
                Add Event
             </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-[2rem] p-6 shadow-sm flex flex-col min-h-0 overflow-hidden">
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-4">
           {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider opacity-60">
                 {day}
              </div>
           ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1 min-h-0">
           {calendarDays.map((cell, index) => {
              if (cell.day === null) {
                 return <div key={index} className="bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 dark:border-white/5"></div>;
              }

              const tasks = getTasksForDay(cell.day);
              const isToday = cell.day === 12; // Mocking today as Sep 12 based on other widgets

              return (
                 <div 
                   key={index} 
                   className={`
                      relative p-3 rounded-2xl border transition-all duration-200 flex flex-col gap-1 overflow-hidden group
                      ${isToday 
                        ? 'bg-white/80 dark:bg-gray-700 border-purple-200 dark:border-purple-800 ring-2 ring-purple-100 dark:ring-purple-900/30 shadow-lg' 
                        : 'bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-md hover:border-white/80 dark:hover:border-white/20'
                      }
                   `}
                 >
                    <div className="flex justify-between items-start">
                       <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-700 dark:text-gray-300'}`}>
                          {cell.day}
                       </span>
                       {tasks.length > 0 && (
                          <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                            {tasks.length} tasks
                          </span>
                       )}
                    </div>

                    <div className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto custom-scrollbar">
                       {tasks.map(task => {
                          const isUrgent = task.priority === 'Urgent';
                          const isHigh = task.priority === 'High';
                          
                          let bgClass = 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
                          if (isUrgent) bgClass = 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/50';
                          if (isHigh) bgClass = 'bg-pink-100/80 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800/50';

                          return (
                             <div 
                               key={task.id}
                               className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border truncate cursor-pointer hover:opacity-80 transition-opacity ${bgClass}`}
                               title={task.title}
                             >
                                {task.title}
                             </div>
                          );
                       })}
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