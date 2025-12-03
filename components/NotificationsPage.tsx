import React, { useState } from 'react';
import { 
  Bell, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  AlertCircle, 
  Check, 
  Clock, 
  MoreHorizontal, 
  Trash2, 
  Mail 
} from 'lucide-react';
import { TEAM_MEMBERS } from '../constants';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'mentions' | 'alerts'>('all');

  // Mock Notification Data
  const notifications = [
    {
      id: 1,
      type: 'mention',
      user: TEAM_MEMBERS[0],
      content: 'mentioned you in',
      target: 'Revamp Sidebar Task',
      time: '10 min ago',
      read: false,
      date: 'Today'
    },
    {
      id: 2,
      type: 'invite',
      user: TEAM_MEMBERS[1],
      content: 'invited you to join',
      target: 'Neura Mobile Project',
      time: '1 hour ago',
      read: false,
      date: 'Today'
    },
    {
      id: 3,
      type: 'alert',
      icon: <AlertCircle size={20} className="text-orange-500" />,
      content: 'Deadline approaching for',
      target: 'API Integration',
      time: '3 hours ago',
      read: true,
      date: 'Today'
    },
    {
      id: 4,
      type: 'like',
      user: TEAM_MEMBERS[2],
      content: 'liked your comment on',
      target: 'Design System',
      time: 'Yesterday',
      read: true,
      date: 'Yesterday'
    },
    {
      id: 5,
      type: 'message',
      user: TEAM_MEMBERS[3],
      content: 'sent you a message',
      target: '"Can we meet?"',
      time: 'Yesterday',
      read: true,
      date: 'Yesterday'
    }
  ];

  const getIcon = (n: any) => {
    switch(n.type) {
      case 'mention': return <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-1.5 rounded-full"><MessageSquare size={14} /></div>;
      case 'invite': return <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-1.5 rounded-full"><UserPlus size={14} /></div>;
      case 'like': return <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 p-1.5 rounded-full"><Heart size={14} /></div>;
      case 'message': return <div className="bg-green-100 dark:bg-green-900/30 text-green-600 p-1.5 rounded-full"><Mail size={14} /></div>;
      default: return <div className="bg-gray-100 dark:bg-white/10 text-gray-600 p-1.5 rounded-full"><Bell size={14} /></div>;
    }
  };

  return (
    <main className="flex-1 p-8 h-full flex flex-col min-h-0 custom-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8 shrink-0">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-gray-800 dark:text-gray-200 font-bold">Notifications</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Stay updated with your team activity.</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-colors shadow-sm">
             <Check size={14} />
             Mark all as read
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pb-8 h-full min-h-0">
        
        {/* Main List */}
        <div className="flex-1 flex flex-col min-h-0">
           
           {/* Filters */}
           <div className="flex items-center gap-2 mb-6 shrink-0">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'bg-white/40 dark:bg-white/5 text-gray-500 hover:bg-white/60 dark:hover:bg-white/10'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('mentions')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'mentions' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'bg-white/40 dark:bg-white/5 text-gray-500 hover:bg-white/60 dark:hover:bg-white/10'}`}
              >
                Mentions
              </button>
              <button 
                onClick={() => setFilter('alerts')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'alerts' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'bg-white/40 dark:bg-white/5 text-gray-500 hover:bg-white/60 dark:hover:bg-white/10'}`}
              >
                Alerts
              </button>
           </div>

           {/* Scrollable List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              
              {/* Today Group */}
              <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Today</h3>
                 <div className="space-y-3">
                    {notifications.filter(n => n.date === 'Today').map(n => (
                       <div key={n.id} className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${n.read ? 'bg-white/30 dark:bg-white/5 border-transparent' : 'bg-white/60 dark:bg-white/10 border-purple-200 dark:border-purple-900/30 shadow-sm'}`}>
                          <div className="relative shrink-0">
                             {n.user ? (
                               <img src={n.user.avatar} className="w-10 h-10 rounded-full border border-white dark:border-gray-700" alt={n.user.name} />
                             ) : (
                               <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border border-white dark:border-gray-700">
                                  {n.icon}
                               </div>
                             )}
                             <div className="absolute -bottom-1 -right-1 shadow-sm">
                                {getIcon(n)}
                             </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 pt-0.5">
                             <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                   <span className="font-bold text-gray-900 dark:text-white">{n.user?.name}</span> {n.content} <span className="font-bold text-gray-800 dark:text-gray-200">{n.target}</span>
                                </p>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2 flex items-center gap-1">
                                   <Clock size={10} /> {n.time}
                                </span>
                             </div>
                             <div className="flex items-center justify-between mt-2">
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">Reply</button>
                                   <button className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">Mark as read</button>
                                </div>
                                {!n.read && <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></div>}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Yesterday Group */}
              <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Yesterday</h3>
                 <div className="space-y-3">
                    {notifications.filter(n => n.date === 'Yesterday').map(n => (
                       <div key={n.id} className="group flex items-start gap-4 p-4 rounded-2xl border border-transparent bg-white/30 dark:bg-white/5 hover:bg-white/50 dark:hover:bg-white/10 transition-all">
                          <div className="relative shrink-0">
                             {n.user ? (
                               <img src={n.user.avatar} className="w-10 h-10 rounded-full border border-white dark:border-gray-700 opacity-70" alt={n.user.name} />
                             ) : (
                               <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center border border-white dark:border-gray-700">
                                  {n.icon}
                               </div>
                             )}
                             <div className="absolute -bottom-1 -right-1 shadow-sm opacity-70">
                                {getIcon(n)}
                             </div>
                          </div>
                          
                          <div className="flex-1 min-w-0 pt-0.5">
                             <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                   <span className="font-bold text-gray-700 dark:text-gray-300">{n.user?.name}</span> {n.content} <span className="font-bold text-gray-600 dark:text-gray-400">{n.target}</span>
                                </p>
                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-2 flex items-center gap-1">
                                   {n.time}
                                </span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

           </div>
        </div>

        {/* Right Sidebar (Quick Stats) */}
        <div className="w-full lg:w-72 hidden xl:flex flex-col gap-6">
           <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4">
                     <Bell size={20} />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">3 New</h3>
                  <p className="text-purple-100 text-sm font-medium">Notifications today</p>
                  <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center text-xs font-bold">
                     <span>Unread</span>
                     <span className="bg-white/20 px-2 py-1 rounded-lg">2 Priority</span>
                  </div>
               </div>
           </div>

           <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[2rem] p-6">
               <h3 className="font-bold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Alerts</span>
                     <div className="w-8 h-4 bg-purple-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Push Notifications</span>
                     <div className="w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer"><div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Team Mentions</span>
                     <div className="w-8 h-4 bg-purple-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
                  </div>
               </div>
               <button className="w-full mt-6 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 transition-colors">
                  Manage Preferences
               </button>
           </div>
        </div>

      </div>
    </main>
  );
};

export default NotificationsPage;