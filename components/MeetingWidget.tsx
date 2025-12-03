import React from 'react';
import { Bell, ChevronDown, MoreHorizontal, Video, Mic, LayoutGrid, Clock } from 'lucide-react';

const MeetingWidget = () => {
  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-50 dark:bg-white/10 rounded-full">
             <Video size={18} className="text-gray-900 dark:text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Meet Schedule</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full"><Bell size={18} /></button>
          <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full"><ChevronDown size={18} /></button>
        </div>
      </div>

      <div className="relative flex-1 rounded-3xl overflow-hidden mb-4 group cursor-pointer">
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Meeting Preview" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
          Preview
        </div>
        <div className="absolute top-4 right-4 text-white hover:text-gray-200 cursor-pointer">
          <MoreHorizontal size={20} />
        </div>
        
        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button className="w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-600 transition-colors">
              <Mic size={14} />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20">
              <Video size={14} />
            </button>
             <button className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors border border-white/20">
              <LayoutGrid size={14} />
            </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h4 className="font-bold text-gray-900 dark:text-white">Daily Scrum</h4>
             <span className="text-xl">👋</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
             <Clock size={12} />
             <span>Sep 12</span>
             <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
             <span>10:00 - 10:15</span>
          </div>
        </div>
        <button className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/20 transition-colors flex items-center gap-2 shadow-sm">
          Join Meet
          <Video size={14} />
        </button>
      </div>
    </div>
  );
};

export default MeetingWidget;