import React, { useState, useMemo, useRef } from 'react';
import { X, Calendar, User, AlignLeft, Flag, Tag, Plus, UploadCloud, Link as LinkIcon, FileText, Trash2 } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  storageId?: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { currentTeamId, currentProjectId } = useStore();
  const createTask = useMutation(api.tasks.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch team members for assignment
  const teamMembers = useQuery(api.teams.listMembers, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  const users = useQuery(api.users.list);

  // Map team members to user details
  const teamMembersWithDetails = useMemo(() => {
    if (!teamMembers || !users) return [];
    return teamMembers.map(member => {
      const user = users.find(u => u._id === member.userId);
      return user ? { ...user, role: member.role, status: 'Online' } : null;
    }).filter(Boolean);
  }, [teamMembers, users]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File ${file.name} is too large. Max size is 10MB.`);
          continue;
        }

        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        const { storageId } = await result.json();

        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          storageId,
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setError(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!currentProjectId) {
      setError('Please select a project from the sidebar first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTask({
        projectId: currentProjectId as any,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        priority: priority as any,
        status: 'To Do' as any,
        assigneeIds: selectedAssignees.length > 0 ? selectedAssignees as any : [],
      });

      // Note: File attachments stored in uploadedFiles with storageIds
      // In future, link these to the task using saveAttachment mutation

      // Success - reset form and close
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('Medium');
      setSelectedAssignees([]);
      setUploadedFiles([]);
      onClose();
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
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
      <div className="w-full max-w-lg bg-white/90 dark:bg-[#121212]/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative animate-fade-in overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar ring-1 ring-black/5 z-10">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between sticky top-0 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-xl z-20 border-b border-gray-100/50 dark:border-white/5">
           <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Create New Task</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
               {currentProjectId ? 'Fill in the details below' : 'Select a project first'}
             </p>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Redesign Homepage" 
                className="w-full text-2xl font-bold bg-transparent border-none placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-white focus:ring-0 px-0 py-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleCreateTask();
                  }
                }}
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
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Flag size={14} className="text-orange-500" /> Priority
                 </label>
                 <div className="relative">
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-black/40 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none cursor-pointer"
                    >
                        <option value="Low Priority">Low Priority</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                 {teamMembersWithDetails.map((user: any) => {
                   const isSelected = selectedAssignees.includes(user._id);
                   return (
                    <div 
                      key={user._id} 
                      onClick={() => toggleAssignee(user._id)}
                      className="relative group cursor-pointer shrink-0"
                    >
                       <img 
                         src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                         alt={user.name} 
                         title={user.name}
                         className={`w-11 h-11 rounded-full border-2 transition-all object-cover ${
                           isSelected 
                             ? 'border-purple-500 grayscale-0' 
                             : 'border-transparent grayscale group-hover:grayscale-0 group-hover:border-purple-500'
                         }`} 
                       />
                       {isSelected && (
                         <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-0.5">
                           <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         </div>
                       )}
                    </div>
                   );
                 })}
              </div>
           </div>

           {/* File Upload Area */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <UploadCloud size={14} className="text-cyan-500" /> Attachments (Optional)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".svg,.png,.jpg,.jpeg,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-white/5 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                  <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm group-hover:scale-110 transition-transform text-gray-400 group-hover:text-purple-500">
                     {uploading ? (
                       <div className="animate-spin">
                         <UploadCloud size={20} />
                       </div>
                     ) : (
                       <UploadCloud size={20} />
                     )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {uploading ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">SVG, PNG, JPG or PDF (max. 10MB)</p>
                  </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <FileText size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
           </div>

           {error && (
             <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
               {error}
             </div>
           )}

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
                disabled={loading || uploading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTask}
                disabled={loading || uploading || !title.trim() || !currentProjectId}
                className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Creating...' : uploading ? 'Uploading...' : 'Create Task'}
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AddTaskModal;