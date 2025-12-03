import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Paperclip, CalendarClock, X, FileText, Image, Download, Edit, Trash2, Share2, CheckCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const isUrgent = task.priority === 'Urgent';
  
  const [showAttachments, setShowAttachments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Coordinates for fixed positioning
  const [menuPos, setMenuPos] = useState<{top: number, right: number} | null>(null);
  const [attachPos, setAttachPos] = useState<{top: number, right: number} | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const attachButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);

  // Mock Attachments Data
  const attachments = [
    { name: 'Wireframe_v2.fig', size: '2.4 MB', type: 'file' },
    { name: 'Design_System.pdf', size: '1.8 MB', type: 'file' },
    { name: 'Preview_Shot.png', size: '4.2 MB', type: 'image' }
  ];

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
              // Position it above the button by default (transform -100% Y in css)
              top: rect.top - 8,
              right: window.innerWidth - rect.right
          });
          setShowAttachments(true);
          setShowMenu(false);
      }
  };

  // Handle click outside and scroll to close popovers
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
       if (menuRef.current && !menuRef.current.contains(event.target as Node) && !menuButtonRef.current?.contains(event.target as Node)) {
           setShowMenu(false);
       }
       if (attachmentRef.current && !attachmentRef.current.contains(event.target as Node) && !attachButtonRef.current?.contains(event.target as Node)) {
           setShowAttachments(false);
       }
    };
    
    // Close on scroll to prevent floating detached popovers
    const handleScroll = () => {
        if(showMenu) setShowMenu(false);
        if(showAttachments) setShowAttachments(false);
    };

    if (showMenu || showAttachments) {
        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('scroll', handleScroll, true); 
    }
    
    return () => {
        document.removeEventListener('mousedown', handleGlobalClick);
        window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showMenu, showAttachments]);

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
                Due {task.dueDate}
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
            {task.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-4">
          {/* Avatars */}
          <div className="flex -space-x-2">
            {task.assignees.map((user, i) => (
              <img 
                key={user.id} 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                style={{ zIndex: task.assignees.length - i }}
              />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300" style={{ zIndex: 0 }}>
              +2
            </div>
          </div>

          {/* Stats & Attachment Trigger */}
          <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-sm font-medium">
            <button 
              ref={attachButtonRef}
              onClick={toggleAttachments}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer p-2 -mr-2 rounded-lg ${showAttachments ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Paperclip size={16} />
              <span>{task.attachmentsCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 
        FIXED POSITION POPOVERS via PORTAL
        Rendered into document.body to avoid overflow clipping in Kanban columns 
      */}
      
      {/* Menu Popover */}
      {showMenu && menuPos && createPortal(
        <div 
          ref={menuRef}
          className="fixed w-48 bg-white/90 dark:bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl z-[9999] overflow-hidden animate-fade-in origin-top-right"
          style={{ top: menuPos.top, right: menuPos.right }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5 space-y-0.5">
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <Edit size={14} className="text-gray-400" />
                  Edit Task
              </button>
                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <CheckCircle size={14} className="text-gray-400" />
                  Mark Complete
              </button>
                <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <Share2 size={14} className="text-gray-400" />
                  Share
              </button>
          </div>
          <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-0.5"></div>
          <div className="p-1.5">
              <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                  <Trash2 size={14} />
                  Delete
              </button>
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
            transform: 'translateY(-100%)' // Move it up so it sits above the button
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-gray-900 dark:text-white">Attachments ({task.attachmentsCount})</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowAttachments(false); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="space-y-2">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {file.type === 'image' ? <Image size={14} /> : <FileText size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400">{file.size}</p>
                </div>
                <button className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 text-center">
            <button className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
              View All Files
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TaskCard;