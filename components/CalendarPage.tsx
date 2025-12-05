import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarPageProps {
  onAddTask?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onAddTask }) => {
  const { currentProjectId } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  
  // Fetch tasks for the current project
  const tasks = useQuery(
    api.tasks.list,
    currentProjectId ? { projectId: currentProjectId as any } : "skip"
  );

  // Transform tasks into calendar events
  const events = useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter(task => task.dueDate) // Only tasks with due dates
      .map(task => {
        const start = new Date(task.dueDate!);
        const end = new Date(task.dueDate!);
        
        // Set end time to be 1 hour after start for better visualization
        end.setHours(end.getHours() + 1);
        
        return {
          id: task._id,
          title: task.title,
          start,
          end,
          resource: task, // Store full task data
        };
      });
  }, [tasks]);

  // Custom event style getter
  const eventStyleGetter = (event: any) => {
    const task = event.resource;
    let backgroundColor = '#3b82f6'; // Default blue
    
    if (task.priority === 'Urgent') {
      backgroundColor = '#f97316'; // Orange
    } else if (task.priority === 'High') {
      backgroundColor = '#ec4899'; // Pink
    } else if (task.status === 'Completed') {
      backgroundColor = '#22c55e'; // Green
    } else if (task.status === 'Under Review') {
      backgroundColor = '#a855f7'; // Purple
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '2px 6px',
      },
    };
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const currentMonth = moment(currentDate).format('MMMM YYYY');

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
               <button 
                 onClick={() => handleNavigate(moment(currentDate).subtract(1, 'month').toDate())}
                 className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500"
               >
                  <ChevronLeft size={18} />
               </button>
               <span className="text-sm font-bold text-gray-800 dark:text-gray-200 min-w-[120px] text-center">{currentMonth}</span>
               <button 
                 onClick={() => handleNavigate(moment(currentDate).add(1, 'month').toDate())}
                 className="p-1 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500"
               >
                  <ChevronRight size={18} />
               </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setView('month')}
               className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm ${
                 view === 'month' 
                   ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                   : 'bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10'
               }`}
             >
                <CalendarIcon size={16} />
                Month View
             </button>
             <button 
               onClick={() => setView('week')}
               className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-bold transition-colors shadow-sm ${
                 view === 'week' 
                   ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                   : 'bg-white/50 dark:bg-white/5 border-white/60 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10'
               }`}
             >
                <Filter size={16} />
                Week View
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

      {/* Calendar Container */}
      <div className="flex-1 bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-[2rem] p-6 shadow-sm flex flex-col min-h-0 overflow-hidden">
        {!currentProjectId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="p-4 bg-gray-100 dark:bg-white/10 rounded-2xl inline-block mb-4">
                <CalendarIcon size={32} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No Project Selected</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a project from the sidebar to view tasks</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={handleViewChange}
              date={currentDate}
              onNavigate={handleNavigate}
              eventPropGetter={eventStyleGetter}
              toolbar={false}
              popup
              views={['month', 'week', 'day']}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .calendar-container .rbc-calendar {
          font-family: inherit;
        }
        
        .calendar-container .rbc-header {
          padding: 12px 8px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--tw-text-opacity);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .calendar-container .rbc-month-view {
          border: none;
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .calendar-container .rbc-month-row {
          border: none;
          min-height: 100px;
        }
        
        .calendar-container .rbc-day-bg {
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .calendar-container .rbc-today {
          background-color: rgba(168, 85, 247, 0.1);
        }
        
        .calendar-container .rbc-off-range-bg {
          background-color: rgba(255, 255, 255, 0.02);
        }
        
        .calendar-container .rbc-date-cell {
          padding: 8px;
          text-align: right;
        }
        
        .calendar-container .rbc-date-cell > a {
          font-weight: 700;
          font-size: 0.875rem;
          color: inherit;
        }
        
        .calendar-container .rbc-event {
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .calendar-container .rbc-event-label {
          font-size: 0.7rem;
        }
        
        .calendar-container .rbc-show-more {
          font-size: 0.7rem;
          font-weight: 600;
          color: #a855f7;
          background-color: transparent;
          padding: 2px 4px;
          margin: 2px;
        }
        
        .calendar-container .rbc-time-view {
          border: none;
        }
        
        .calendar-container .rbc-time-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .calendar-container .rbc-time-content {
          border-top: none;
        }
        
        .calendar-container .rbc-timeslot-group {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          min-height: 60px;
        }
        
        .calendar-container .rbc-time-slot {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .calendar-container .rbc-current-time-indicator {
          background-color: #a855f7;
          height: 2px;
        }
      `}</style>
    </main>
  );
};

export default CalendarPage;