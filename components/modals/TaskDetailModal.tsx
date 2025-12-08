import React from 'react';
import { X, Calendar, Flag, AlignLeft, CheckCircle2, Circle, Paperclip, Download } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task }) => {
  // Fetch attachments for this task
  const attachments = useQuery(
    api.files.listByTask,
    task?._id ? { taskId: task._id } : "skip"
  );

  if (!isOpen || !task) return null;

  const priorityColors = {
    'Urgent': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    'High': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    'Medium': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    'Low Priority': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const statusColors = {
    'Completed': 'text-green-500',
    'In Progress': 'text-blue-500',
    'Under Review': 'text-purple-500',
    'To Do': 'text-gray-400',
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="w-full max-w-lg bg-white/95 dark:bg-[#121212]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative animate-fade-in overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar ring-1 ring-black/5 z-10">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-start justify-between bg-white/50 dark:bg-[#121212]/50 backdrop-blur-xl border-b border-gray-100/50 dark:border-white/5">
           <div className="flex-1 pr-4">
             <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors['Medium']}`}>
                    {task.priority}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${statusColors[task.status as keyof typeof statusColors]}`}>
                    {task.status === 'Completed' ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {task.status}
                </span>
             </div>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">{task.title}</h2>
             <p className="text-xs text-gray-400 font-medium mt-1">
               Created {new Date(task._creationTime).toLocaleDateString()}
             </p>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full transition-colors text-gray-500 dark:text-gray-400 shrink-0"
           >
             <X size={18} />
           </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
           
           {/* Date & Assignees */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={14} /> Due Date
                 </label>
                 <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {task.dueDate 
                        ? new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                        : 'No due date'}
                 </p>
              </div>
           </div>

           {/* Description */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                 <AlignLeft size={14} /> Description
              </label>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                 {task.description || "No description provided."}
              </div>
           </div>

           {/* Attachments */}
           {attachments && attachments.length > 0 && (
             <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                   <Paperclip size={14} /> Attachments ({attachments.length})
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {attachments.map((file: any) => (
                        <a 
                           key={file._id}
                           href={file.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all group"
                        >
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg text-purple-600 dark:text-purple-400">
                                <Paperclip size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                            <div className="p-2 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                <Download size={16} />
                            </div>
                        </a>
                    ))}
                </div>
             </div>
           )}

        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50/50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
           >
             Close
           </button>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailModal;
