import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Paperclip, CalendarClock, X, FileText, Image, Download, Edit, Trash2, CheckCircle, ChevronDown } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: any;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const isUrgent = task.priority === 'Urgent';
  const updateStatus = useMutation(api.tasks.updateStatus);
  const deleteTask = useMutation(api.tasks.remove);
  
  const [showAttachments, setShowAttachments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Fetch real attachments
  const attachments = useQuery(
    api.files.listByTask,
    task?._id ? { taskId: task._id } : "skip"
  );
  
  // Coordinates for fixed positioning
  const [menuPos, setMenuPos] = useState<{top: number, right: number} | null>(null);
  const [statusMenuPos, setStatusMenuPos] = useState<{top: number, right: number} | null>(null);
  const [attachPos, setAttachPos] = useState<{top: number, right: number} | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);

  const statuses = ['To Do', 'In Progress', 'Under Review', 'Completed'];

  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showMenu) {
          setShowMenu(false);
          return;
      }
      
      if (menuButtonRef.current) {
          const rect = menuButtonRef.current.getBoundingClientRect();
          setMenuPos({
              top: rect.bottom + 8,
              right: window.innerWidth - rect.right
          });
          setShowMenu(true);
          setShowAttachments(false);
          setShowStatusMenu(false);
      }
  };

  const toggleStatusMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showStatusMenu) {
          setShowStatusMenu(false);
          return;
      }
      
      if (statusButtonRef.current) {
          const rect = statusButtonRef.current.getBoundingClientRect();
          setStatusMenuPos({
              top: rect.bottom + 8,
              right: window.innerWidth - rect.right
          });
          setShowStatusMenu(true);
          setShowMenu(false);
      }
  };

  const toggleAttachments = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showAttachments) {
          setShowAttachments(false);
          return;
      }

      if (attachButtonRef.current) {
          const rect = attachButtonRef.current.getBoundingClientRect();
          setAttachPos({
              top: rect.top - 8,
              right: window.innerWidth - rect.right
          });
          setShowAttachments(true);
          setShowMenu(false);
          setShowStatusMenu(false);
      }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({
        taskId: task._id,
        status: newStatus as any,
      });
      setShowStatusMenu(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ taskId: task._id });
        setShowMenu(false);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleDownload = (file: any) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle click outside and scroll to close popovers
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
       if (menuRef.current && !menuRef.current.contains(event.target as Node) && !menuButtonRef.current?.contains(event.target as Node)) {
           setShowMenu(false);
       }
       if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node) && !statusButtonRef.current?.contains(event.target as Node)) {
           setShowStatusMenu(false);
       }
       if (attachmentRef.current && !attachmentRef.current.contains(event.target as Node) && !attachButtonRef.current?.contains(event.target as Node)) {
           setShowAttachments(false);
       }
    };
    
    const handleScroll = () => {
        if(showMenu) setShowMenu(false);
        if(showStatusMenu) setShowStatusMenu(false);
        if(showAttachments) setShowAttachments(false);
    };

    if (showMenu || showStatusMenu || showAttachments) {
        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('scroll', handleScroll, true); 
    }
    
    return () => {
        document.removeEventListener('mousedown', handleGlobalClick);
        window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showMenu, showStatusMenu, showAttachments]);

  // Format due date
  const formatDueDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'No due date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all border border-gray-50 dark:border-white/5 flex flex-col h-full justify-between relative group/card">
        <div>
          {/* Header Tags */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${isUrgent ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-300' : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
                {task.priority}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-300 text-xs font-bold flex items-center gap-1.5">
                <CalendarClock size={12} />
                Due {formatDueDate(task.dueDate)}
              </span>
            </div>
            
            {/* Menu Button */}
            <button 
                ref={menuButtonRef}
                onClick={toggleMenu}
                className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 rounded-xl ${showMenu ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : ''}`}
            >
                <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{task.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
            {task.description || 'No description'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-4">
          {/* Avatars */}
          <div className="flex -space-x-2">
            {task.assignees && task.assignees.slice(0, 3).map((user: any, i: number) => (
              <img 
                key={user._id || i} 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                alt={user.name} 
                title={user.name}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                style={{ zIndex: (task.assignees?.length || 0) - i }}
              />
            ))}
            {task.assignees && task.assignees.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300" style={{ zIndex: 0 }}>
                +{task.assignees.length - 3}
              </div>
            )}
          </div>

          {/* Stats & Attachment Trigger */}
          <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-sm font-medium">
            <button 
              ref={attachButtonRef}
              onClick={toggleAttachments}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer p-2 -mr-2 rounded-lg ${showAttachments ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Paperclip size={16} />
              <span>{task.attachmentsCount || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Popover */}
      {showMenu && menuPos && createPortal(
        <div 
          ref={menuRef}
          className="fixed w-48 bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl z-[9999] overflow-hidden animate-fade-in origin-top-right"
          style={{ top: menuPos.top, right: menuPos.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 space-y-0.5">
              <button 
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                  <Edit size={14} className="text-gray-400" />
                  Edit Task
              </button>
              <button 
                ref={statusButtonRef}
                onClick={toggleStatusMenu}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-gray-400" />
                  Change Status
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
          </div>
          <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-0.5"></div>
          <div className="p-1.5">
              <button 
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                  <Trash2 size={14} />
                  Delete
              </button>
          </div>
        </div>,
        document.body
      )}

      {/* Status Change Submenu */}
      {showStatusMenu && statusMenuPos && createPortal(
        <div 
          ref={statusMenuRef}
          className="fixed w-48 bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl z-[10000] overflow-hidden animate-fade-in origin-top-right"
          style={{ top: statusMenuPos.top, right: statusMenuPos.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 space-y-0.5">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl transition-colors ${
                  task.status === status
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {task.status === status && <CheckCircle size={14} className="text-purple-600 dark:text-purple-300" />}
                <span className={task.status === status ? '' : 'ml-6'}>{status}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {/* Attachments Popover */}
      {showAttachments && attachPos && createPortal(
        <div 
          ref={attachmentRef}
          className="fixed w-64 bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl z-[9999] p-3 animate-fade-in origin-bottom-right"
          style={{ 
            top: attachPos.top, 
            right: attachPos.right,
            transform: 'translateY(-100%)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-gray-900 dark:text-white">Attachments ({task.attachmentsCount || 0})</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAttachments(false); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="space-y-2">
            {attachments && attachments.length > 0 ? (
              attachments.map((file: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {file.type?.includes('image') ? <Image size={14} /> : <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                  <button 
                    onClick={() => handleDownload(file)}
                    className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-gray-400">
                No attachments
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
      />
    </>
  );
};

export default TaskCard;