import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, FolderPlus, Palette, Layout, Check, Calendar } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { Id } from '../convex/_generated/dataModel';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: Id<"folders">; // Optional folder ID to create project in
}

// Color mapping from Tailwind classes to hex
const COLOR_MAP: Record<string, string> = {
  'bg-purple-500': '#8B5CF6',
  'bg-blue-500': '#3B82F6',
  'bg-pink-500': '#EC4899',
  'bg-orange-500': '#F97316',
  'bg-green-500': '#10B981',
  'bg-gray-500': '#6B7280',
  'bg-cyan-500': '#06B6D4',
  'bg-red-500': '#EF4444',
};

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, folderId }) => {
  const { currentTeamId } = useStore();
  const createProject = useMutation(api.projects.create);
  
  const [projectName, setProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-purple-500');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-pink-500', 
    'bg-orange-500', 'bg-green-500', 'bg-gray-500',
    'bg-cyan-500', 'bg-red-500'
  ];

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    if (!currentTeamId) {
      toast.error('No team selected. Please refresh the page.');
      return;
    }

    setLoading(true);

    try {
      await createProject({
        teamId: currentTeamId as any,
        folderId: folderId || undefined,
        name: projectName.trim(),
        color: COLOR_MAP[selectedColor],
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      });

      // Success - close modal and reset
      toast.success('Project created successfully');
      setProjectName('');
      setSelectedColor('bg-purple-500');
      setDueDate('');
      onClose();
    } catch (err: any) {
      console.error('Error creating project:', err);
      const message = err.message ? err.message.replace('Uncaught Error: ', '') : 'Failed to create project';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 dark:bg-black/70 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="w-full max-w-md bg-white/90 dark:bg-[#121212]/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative animate-fade-in overflow-hidden ring-1 ring-black/5 z-10">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100/50 dark:border-white/5">
           <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create New Project</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Add a project to this folder</p>
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
           
           {/* Project Name */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Name</label>
              <div className="relative group">
                 <Layout className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={24} />
                 <input 
                   type="text" 
                   value={projectName}
                   onChange={(e) => setProjectName(e.target.value)}
                   placeholder="e.g. Website Redesign" 
                   className="w-full pl-9 text-2xl font-bold bg-transparent border-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white focus:ring-0 py-2 transition-all"
                   autoFocus
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !loading) {
                       handleCreateProject();
                     }
                   }}
                 />
              </div>
              <div className="h-px w-full bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-white/10 dark:via-white/5"></div>
           </div>

           {/* Due Date */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <Calendar size={14} className="text-blue-500" /> Target Date
              </label>
              <div className="relative">
                 <input 
                   type="date" 
                   value={dueDate}
                   onChange={(e) => setDueDate(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                 />
              </div>
           </div>

           {/* Color Theme */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <Palette size={14} className="text-pink-500" /> Project Color
              </label>
              <div className="flex flex-wrap gap-3">
                 {colors.map((color, idx) => (
                    <button 
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full ${color} transition-all flex items-center justify-center ring-2 ring-transparent ${selectedColor === color ? 'ring-gray-300 dark:ring-gray-600 scale-110' : 'hover:scale-110'}`}
                    >
                        {selectedColor === color && <Check size={14} className="text-white" />}
                    </button>
                 ))}
              </div>
           </div>



        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white/50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3 backdrop-blur-xl">
           <button 
             onClick={onClose}
             disabled={loading}
             className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
           >
             Cancel
           </button>
           <button 
             onClick={handleCreateProject}
             disabled={loading || !projectName.trim()}
             className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
           >
             <FolderPlus size={16} />
             {loading ? 'Creating...' : 'Create Project'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default AddProjectModal;