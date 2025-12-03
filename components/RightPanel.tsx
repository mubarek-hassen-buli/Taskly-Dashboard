import React from 'react';
import { Calendar as CalendarIcon, MoreHorizontal, ChevronDown } from 'lucide-react';
import { CALENDAR_DAYS } from '../constants';

const RightPanel = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Calendar Widget */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-gray-900 dark:text-white" />
            <span className="font-bold text-gray-900 dark:text-white text-lg">Calendar</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/10 px-2 py-1 rounded-lg">
              Sep <ChevronDown size={12} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
               <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-bold text-gray-400 py-1">{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1 gap-x-1 justify-items-center">
          {/* Empty slots for start of month */}
          <div className="w-8 h-8"></div>
          <div className="w-8 h-8"></div>
          <div className="w-8 h-8"></div>
          
          {CALENDAR_DAYS.map(day => {
            // Mock active states based on image
            const isToday = day === 12;
            const isRange = day >= 12 && day <= 16;
            const isPink = [1, 3].includes(day);
            const isStart = day === 12;
            const isEnd = day === 16;
            const isYellow = day === 25 || day === 27;

            let bgClass = "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10";
            if (isPink) bgClass = "bg-pink-200 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 shadow-sm shadow-pink-100 dark:shadow-none";
            if (isRange) bgClass = "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
            if (isStart) bgClass = "bg-purple-200 dark:bg-purple-600 text-purple-800 dark:text-white rounded-l-full shadow-sm";
            if (isEnd) bgClass = "bg-purple-200 dark:bg-purple-600 text-purple-800 dark:text-white rounded-r-full shadow-sm";
            // Override strictly for circle shape if isolated or ends
            const shapeClass = (isPink || isStart || isEnd || isYellow) ? "rounded-full" : "rounded-none";
            
            if (isYellow) bgClass = "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50";

            return (
              <div 
                key={day} 
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${bgClass} ${shapeClass}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;