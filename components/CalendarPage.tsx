import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, X, Clock, Flag, Users, Paperclip, CheckCircle2 } from 'lucide-react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarPageProps {
  onAddTask?: () => void;
}

// Task Details Modal Component
const TaskDetailsModal = ({ task, onClose }: { task: any; onClose: () => void }) => {
  if (!task) return null;

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'No due date';
    return moment(timestamp).format('MMM DD, YYYY');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'High': return 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30';
      case 'Medium': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'Under Review': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
      case 'In Progress': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-white/10 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-purple-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Due Date</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(task.dueDate)}</p>
            </div>

            {/* Priority */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag size={16} className="text-orange-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Priority</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{task.priority}</p>
            </div>

            {/* Status */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-green-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{task.status}</p>
            </div>

            {/* Attachments */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip size={16} className="text-cyan-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Attachments</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{task.attachmentsCount || 0} files</p>
            </div>
          </div>

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((user: any) => (
                  <div key={user._id} className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2">
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      alt={user.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 dark:border-white/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Event Wrapper for showing more events
const CustomEvent = ({ event, onClick }: any) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      title={event.title}
    >
      <span className="font-semibold">{event.title}</span>
    </div>
  );
};

const CalendarPage: React.FC<CalendarPageProps> = ({ onAddTask }) => {
  const { currentProjectId } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showMoreEvents, setShowMoreEvents] = useState<{ events: any[]; date: Date } | null>(null);
  
  // Fetch tasks for the current project
  const tasks = useQuery(
    api.tasks.list,
    currentProjectId ? { projectId: currentProjectId as any } : "skip"
  );

  // Transform tasks into calendar events
  const events = useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter(task => task.dueDate)
      .map(task => {
        const start = new Date(task.dueDate!);
        const end = new Date(task.dueDate!);
        end.setHours(end.getHours() + 1);
        
        return {
          id: task._id,
          title: task.title,
          start,
          end,
          resource: task,
        };
      });
  }, [tasks]);

  const eventStyleGetter = (event: any) => {
    const task = event.resource;
    let backgroundColor = '#3b82f6';
    
    if (task.priority === 'Urgent') {
      backgroundColor = '#f97316';
    } else if (task.priority === 'High') {
      backgroundColor = '#ec4899';
    } else if (task.status === 'Completed') {
      backgroundColor = '#22c55e';
    } else if (task.status === 'Under Review') {
      backgroundColor = '#a855f7';
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

  const handleSelectEvent = (event: any) => {
    setSelectedTask(event.resource);
  };

  const handleShowMore = (events: any[], date: Date) => {
    setShowMoreEvents({ events, date });
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
              onSelectEvent={handleSelectEvent}
              onShowMore={handleShowMore}
              toolbar={false}
              popup
              views={['month', 'week', 'day']}
              components={{
                event: CustomEvent,
              }}
            />
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* Show More Events Popup */}
      {showMoreEvents && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md" 
            onClick={() => setShowMoreEvents(null)}
          />
          <div className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {moment(showMoreEvents.date).format('MMMM DD, YYYY')}
              </h3>
              <button 
                onClick={() => setShowMoreEvents(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {showMoreEvents.events.map((event: any) => {
                const task = event.resource;
                const getPriorityColor = (priority: string) => {
                  switch (priority) {
                    case 'Urgent': return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
                    case 'High': return 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
                    case 'Medium': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                    default: return 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
                  }
                };

                return (
                  <div
                    key={event.id}
                    onClick={() => {
                      setShowMoreEvents(null);
                      setSelectedTask(task);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${getPriorityColor(task.priority)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-1">{task.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium opacity-75">{task.priority}</span>
                          <span className="text-xs">•</span>
                          <span className="text-xs font-medium opacity-75">{task.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

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
          cursor: pointer;
        }
        
        .calendar-container .rbc-show-more:hover {
          text-decoration: underline;
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