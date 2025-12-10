import React, { useState, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { X, Calendar, AlignLeft, Flag, UploadCloud, FileText, Image, Trash2 } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { currentTeamId } = useStore();
  const updateTask = useMutation(api.tasks.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAttachment = useMutation(api.files.saveAttachment);
  const removeAttachment = useMutation(api.files.removeAttachment);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch team members for assignment
  const teamMembers = useQuery(api.teams.listMembers, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  const users = useQuery(api.users.list);
  
  // Fetch attachments
  const attachments = useQuery(
    api.files.listByTask,
    task?._id ? { taskId: task._id } : "skip"
  );

  // Map team members to user details
  const teamMembersWithDetails = useMemo(() => {
    if (!teamMembers || !users) return [];
    return teamMembers.map(member => {
      const user = users.find(u => u._id === member.userId);
      return user ? { ...user, role: member.role, status: 'Online' } : null;
    }).filter(Boolean);
  }, [teamMembers, users]);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Update state when task changes
  React.useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setPriority(task.priority || 'Medium');
    }
  }, [task]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Max size is 10MB.`);
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

        // Save attachment metadata
        await saveAttachment({
          taskId: task._id,
          storageId,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
      toast.success('Files uploaded successfully');
    } catch (err: any) {
      console.error('Error uploading files:', err);
      toast.error(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to remove this attachment?')) return;

    try {
      await removeAttachment({ attachmentId: attachmentId as any });
      toast.success('Attachment removed');
    } catch (err: any) {
      console.error('Error removing attachment:', err);
      toast.error(err.message || 'Failed to remove attachment');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);

    try {
      await updateTask({
        taskId: task._id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        priority: priority as any,
      });

      toast.success('Task updated successfully');
      onClose();
    } catch (err: any) {
      console.error('Error updating task:', err);
      const message = err.message ? err.message.replace('Uncaught Error: ', '') : 'Failed to update task';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

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
             <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Edit Task</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
               Update task details
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

           {/* File Upload Area */}
           <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                 <UploadCloud size={14} className="text-cyan-500" /> Attachments
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
                className="w-full h-24 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50/50 dark:bg-white/5 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                  <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm group-hover:scale-110 transition-transform text-gray-400 group-hover:text-purple-500">
                     {uploading ? (
                       <div className="animate-spin">
                         <UploadCloud size={18} />
                       </div>
                     ) : (
                       <UploadCloud size={18} />
                     )}
                  </div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {uploading ? 'Uploading...' : 'Click to upload files'}
                  </p>
              </div>

              {/* Attached Files List */}
              {attachments && attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Current Attachments</p>
                  {attachments.map((file: any) => (
                    <div 
                      key={file._id}
                      className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 group"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        {file.type?.includes('image') ? (
                          <Image size={16} className="text-purple-600 dark:text-purple-400" />
                        ) : (
                          <FileText size={16} className="text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAttachment(file._id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
           </div>



        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white/50 dark:bg-[#121212]/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-3 sticky bottom-0 z-20 backdrop-blur-xl">
           <button 
             onClick={onClose}
             disabled={loading || uploading}
             className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
           >
             Cancel
           </button>
           <button 
             onClick={handleUpdateTask}
             disabled={loading || uploading || !title.trim()}
             className="px-8 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
           >
             {loading ? 'Updating...' : uploading ? 'Uploading...' : 'Update Task'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default EditTaskModal;
