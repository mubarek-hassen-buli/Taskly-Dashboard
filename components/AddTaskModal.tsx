import React from 'react';
import { X, Calendar, User, AlignLeft, Flag, Tag, Plus, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { TEAM_MEMBERS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Changed absolute to fixed to ensure it sits on top of the entire viewport
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="w-full max-w-lg bg-white/90 dark:bg-[#121212]/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative animate-fade-in overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar ring-1 ring-black/5 z-10">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between sticky top-0 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-xl z-20 border-b border-gray-100/50 dark:border-white/5">
           <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create New Task</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Fill in the details below</p>
           </div>
           <button 
             onClick={onClose}
             className="p-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/20 rounded-full transition-colors text-gray-500 dark:text-gray-400"
           >
             <X size={18} />
           </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-8">
           
           {/* Task Name */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Task Title</label>
              <input 
                type="text" 
                placeholder="e.g. Redesign Homepage" 
                className="w-full text-2xl font-bold bg-transparent border-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white focus:ring-0 px-0 py-2"
                autoFocus
              />
              <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-white/10 dark:via-white/5"></div>
           </div>

           {/* Meta Inputs (Grid) */}
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar size={14} className="text-purple-500" /> Due Date
                 </label>
                 <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Flag size={14} className="text-orange-500" /> Priority
                 </label>
                 <div className="relative">
                    <select className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer">
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                        <option>Low Priority</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                    </div>
                 </div>
              </div>
           </div>

           {/* Description */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <AlignLeft size={14} className="text-blue-500" /> Description
              </label>
              <textarea 
                rows={4} 
                placeholder="Add details about this task..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 resize-none placeholder-gray-400 dark:placeholder-gray-600 transition-all"
              />
           </div>

           {/* Assignees */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <User size={14} className="text-pink-500" /> Assign Team
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide pt-1">
                 <button className="w-11 h-11 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shrink-0 bg-transparent">
                    <Plus size={20} />
                 </button>
                 {TEAM_MEMBERS.map(user => (
                    <div key={user.id} className="relative group cursor-pointer shrink-0">
                       <img 
                         src={user.avatar} 
                         alt={user.name} 
                         className="w-11 h-11 rounded-full border-2 border-transparent group-hover:border-purple-500 transition-all object-cover grayscale group-hover:grayscale-0" 
                       />
                       <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                          <div className={`w-3 h-3 rounded-full ${user.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'} border border-white dark:border-black`}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* File Upload Area */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <UploadCloud size={14} className="text-cyan-500" /> Attachments
              </label>
              <div className="w-full h-28 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-white/5 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all cursor-pointer group">
                  <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm group-hover:scale-110 transition-transform text-gray-400 group-hover:text-purple-500">
                     <UploadCloud size={20} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">Click to upload</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">SVG, PNG, JPG or PDF (max. 10MB)</p>
                  </div>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white/50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-between sticky bottom-0 z-20 backdrop-blur-xl">
           <div className="flex items-center gap-2">
              <button className="p-2.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors" title="Add Link">
                 <LinkIcon size={18} />
              </button>
              <button className="p-2.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors" title="Add Tag">
                 <Tag size={18} />
              </button>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
                className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Create Task
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AddTaskModal;