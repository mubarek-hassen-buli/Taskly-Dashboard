import React, { useMemo } from 'react';
import { PieChart as PieChartIcon, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full shadow-sm" 
            style={{ backgroundColor: data.payload.color }}
          ></div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{data.name}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {data.value} {data.value === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const TaskGraphWidget = () => {
  const { currentProjectId } = useStore();
  
  // Fetch tasks for the current project
  const tasks = useQuery(
    api.tasks.list,
    currentProjectId ? { projectId: currentProjectId as any } : "skip"
  );

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        counts: {
          'To Do': 0,
          'In Progress': 0,
          'Under Review': 0,
          'Completed': 0,
        },
        percentages: {
          'To Do': 0,
          'In Progress': 0,
          'Under Review': 0,
          'Completed': 0,
        },
      };
    }

    const total = tasks.length;
    const counts = {
      'To Do': tasks.filter(t => t.status === 'To Do').length,
      'In Progress': tasks.filter(t => t.status === 'In Progress').length,
      'Under Review': tasks.filter(t => t.status === 'Under Review').length,
      'Completed': tasks.filter(t => t.status === 'Completed').length,
    };

    const percentages = {
      'To Do': total ? (counts['To Do'] / total) * 100 : 0,
      'In Progress': total ? (counts['In Progress'] / total) * 100 : 0,
      'Under Review': total ? (counts['Under Review'] / total) * 100 : 0,
      'Completed': total ? (counts['Completed'] / total) * 100 : 0,
    };

    return { total, counts, percentages };
  }, [tasks]);

  // Prepare data for Recharts
  const chartData = useMemo(() => [
    { name: 'Completed', value: stats.counts['Completed'], color: '#22c55e' },
    { name: 'Under Review', value: stats.counts['Under Review'], color: '#a855f7' },
    { name: 'In Progress', value: stats.counts['In Progress'], color: '#3b82f6' },
    { name: 'To Do', value: stats.counts['To Do'], color: '#eab308' },
  ].filter(item => item.value > 0), [stats]); // Only show non-zero values

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

  // Show message if no project selected
  if (!currentProjectId) {
    return (
      <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gray-100 dark:bg-white/10 rounded-2xl inline-block mb-4">
            <PieChartIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No Project Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select a project from the sidebar to view task progress</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (tasks === undefined) {
    return (
      <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin p-4 bg-gray-100 dark:bg-white/10 rounded-2xl inline-block mb-4">
            <PieChartIcon size={32} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading task data...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (stats.total === 0) {
    return (
      <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gray-100 dark:bg-white/10 rounded-2xl inline-block mb-4">
            <PieChartIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">No Tasks Yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first task to see progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-50 dark:bg-white/10 rounded-xl text-gray-900 dark:text-white">
             <PieChartIcon size={20} />
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
        {/* Chart using Recharts */}
        <div className="relative w-48 h-48 flex-shrink-0">
          {/* Recharts Pie Chart */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tasks</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-4">
          <LegendItem 
            color="bg-green-500" 
            label="Completed" 
            count={stats.counts['Completed']} 
            percent={stats.percentages['Completed']} 
          />
          <LegendItem 
            color="bg-purple-500" 
            label="Under Review" 
            count={stats.counts['Under Review']} 
            percent={stats.percentages['Under Review']} 
          />
          <LegendItem 
            color="bg-blue-500" 
            label="In Progress" 
            count={stats.counts['In Progress']} 
            percent={stats.percentages['In Progress']} 
          />
          <LegendItem 
            color="bg-yellow-500" 
            label="To Do" 
            count={stats.counts['To Do']} 
            percent={stats.percentages['To Do']} 
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
