import React from 'react';
import { X, Calendar as CalendarIcon, Clock, CheckCircle2, Circle } from 'lucide-react';
import { Doc } from '../../convex/_generated/dataModel';

interface DayOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: any[]; // Using any to match the enhanced task type
  onTaskClick: (task: any) => void;
}

const DayOverviewModal: React.FC<DayOverviewModalProps> = ({ isOpen, onClose, date, tasks, onTaskClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1A1C23] w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
              <CalendarIcon size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} scheduled
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No tasks scheduled for this day.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task._id}
                onClick={() => onTaskClick(task)}
                className="group p-4 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${task.status === 'Completed' ? 'text-green-500' : 'text-gray-400 group-hover:text-purple-500'}`}>
                    {task.status === 'Completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{task.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-0.5 rounded-md font-medium ${
                        task.priority === 'Urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        task.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300'
                      }`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                         <span className="flex items-center gap-1">
                           <Clock size={12} />
                           {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 dark:border-white/5 shrink-0 bg-gray-50/50 dark:bg-white/5">
           <button 
             onClick={onClose}
             className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

export default DayOverviewModal;
