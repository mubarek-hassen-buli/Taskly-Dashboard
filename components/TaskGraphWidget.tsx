
import React, { useMemo } from 'react';
import { PieChart, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { TASKS, getTaskStatus } from '../constants';
import { TabStatus } from '../types';

const TaskGraphWidget = () => {
  // Calculate stats
  const stats = useMemo(() => {
    const total = TASKS.length;
    const counts = {
      [TabStatus.ToDo]: TASKS.filter(t => getTaskStatus(t.id) === TabStatus.ToDo).length,
      [TabStatus.InProgress]: TASKS.filter(t => getTaskStatus(t.id) === TabStatus.InProgress).length,
      [TabStatus.UnderReview]: TASKS.filter(t => getTaskStatus(t.id) === TabStatus.UnderReview).length,
      [TabStatus.Completed]: TASKS.filter(t => getTaskStatus(t.id) === TabStatus.Completed).length,
    };

    const percentages = {
      [TabStatus.ToDo]: total ? (counts[TabStatus.ToDo] / total) * 100 : 0,
      [TabStatus.InProgress]: total ? (counts[TabStatus.InProgress] / total) * 100 : 0,
      [TabStatus.UnderReview]: total ? (counts[TabStatus.UnderReview] / total) * 100 : 0,
      [TabStatus.Completed]: total ? (counts[TabStatus.Completed] / total) * 100 : 0,
    };

    return { total, counts, percentages };
  }, []);

  // Construct conic gradient string
  // Order: Completed (Green) -> Under Review (Purple) -> In Progress (Blue) -> To Do (Yellow)
  const gradient = useMemo(() => {
    let currentPos = 0;
    const p1 = stats.percentages[TabStatus.Completed];
    const p2 = stats.percentages[TabStatus.UnderReview];
    const p3 = stats.percentages[TabStatus.InProgress];
    const p4 = stats.percentages[TabStatus.ToDo];

    return `conic-gradient(
      #22c55e 0% ${p1}%, 
      #a855f7 ${p1}% ${p1 + p2}%, 
      #3b82f6 ${p1 + p2}% ${p1 + p2 + p3}%, 
      #eab308 ${p1 + p2 + p3}% 100%
    )`;
  }, [stats]);

  const LegendItem = ({ color, label, count, percent }: { color: string, label: string, count: number, percent: number }) => (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-400">{percent.toFixed(0)}%</span>
        <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md min-w-[24px] text-center">{count}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 dark:bg-white/10 rounded-xl text-gray-900 dark:text-white">
             <PieChart size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">Task Progress</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Overview status</p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full transition-colors">
           <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
        {/* Chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-xl"></div>
          
          {/* Conic Chart */}
          <div 
            className="w-full h-full rounded-full relative z-10 transition-all duration-1000 ease-out"
            style={{ background: gradient }}
          >
             {/* Inner Cutout (Donut) */}
             <div className="absolute inset-4 bg-white dark:bg-[#151515] rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tasks</span>
             </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-4">
          <LegendItem 
            color="bg-green-500" 
            label="Completed" 
            count={stats.counts[TabStatus.Completed]} 
            percent={stats.percentages[TabStatus.Completed]} 
          />
          <LegendItem 
            color="bg-purple-500" 
            label="Under Review" 
            count={stats.counts[TabStatus.UnderReview]} 
            percent={stats.percentages[TabStatus.UnderReview]} 
          />
          <LegendItem 
            color="bg-blue-500" 
            label="In Progress" 
            count={stats.counts[TabStatus.InProgress]} 
            percent={stats.percentages[TabStatus.InProgress]} 
          />
          <LegendItem 
            color="bg-yellow-500" 
            label="To Do" 
            count={stats.counts[TabStatus.ToDo]} 
            percent={stats.percentages[TabStatus.ToDo]} 
          />
        </div>
      </div>
      
      {/* Footer / Action */}
      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
         <span className="text-xs font-medium text-gray-400">Last updated just now</span>
         <button className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
            View Analytics <ArrowUpRight size={12} />
         </button>
      </div>
    </div>
  );
};

export default TaskGraphWidget;
