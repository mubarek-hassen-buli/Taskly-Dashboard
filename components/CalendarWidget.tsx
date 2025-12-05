import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';

const CalendarWidget = () => {
  const { currentProjectId } = useStore();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  // Fetch tasks for the current project
  const tasks = useQuery(
    api.tasks.list,
    currentProjectId ? { projectId: currentProjectId as any } : "skip"
  );

  // Get calendar data
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate offset for first day of month
    const firstDayOfWeek = getDay(monthStart);
    
    return {
      monthName: format(currentDate, 'MMM'),
      daysInMonth,
      firstDayOfWeek,
    };
  }, [currentDate]);

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    if (!tasks) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-50 dark:border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-50 dark:bg-white/10 rounded-full">
             <CalendarIcon size={18} className="text-gray-900 dark:text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Calendar</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500"
          >
            <ChevronLeft size={14} />
          </button>
          <button className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/10 px-2 py-1 rounded-lg min-w-[40px] justify-center">
            {calendarData.monthName}
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500"
          >
            <ChevronRight size={14} />
          </button>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
             <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-bold text-gray-400 py-1">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 justify-items-center flex-1 content-center">
        {/* Empty slots for start of month */}
        {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8"></div>
        ))}
        
        {calendarData.daysInMonth.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const hasTask = dayTasks.length > 0;
          const isTodayDate = isToday(day);
          const dayNumber = format(day, 'd');
          
          // Determine styling based on task priority
          let bgClass = "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10";
          
          if (isTodayDate) {
            bgClass = "bg-purple-600 text-white shadow-sm";
          } else if (hasTask) {
            const hasUrgent = dayTasks.some(t => t.priority === 'Urgent');
            const hasHigh = dayTasks.some(t => t.priority === 'High');
            
            if (hasUrgent) {
              bgClass = "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50";
            } else if (hasHigh) {
              bgClass = "bg-pink-200 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 shadow-sm shadow-pink-100 dark:shadow-none";
            } else {
              bgClass = "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
            }
          }

          return (
            <div 
              key={index} 
              className={`w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer transition-all rounded-full ${bgClass}`}
              title={hasTask ? `${dayTasks.length} task(s)` : ''}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;