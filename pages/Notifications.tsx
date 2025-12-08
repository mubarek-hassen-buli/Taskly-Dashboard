import React, { useMemo } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  MessageCircle, 
  UserPlus, 
  AlertCircle, 
  FileText, // For generic task icon
  CheckSquare, // For task completed
  Clock // For deadlines
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

const NotificationsPage = () => {
    const { notifications, currentUser } = useDashboard();
    const markAsRead = useMutation(api.notifications.markAsRead);
    const clearAll = useMutation(api.notifications.clearAll);
    const removeNotification = useMutation(api.notifications.remove);
    const { setCurrentView } = useStore(); // To navigate if needed

    // Filter notifications for current user (handled by backend, but safe)
    // AND we can sort locally if needed, but backend sorts desc.
    
    const handleMarkRead = async (id: any) => {
        try {
            await markAsRead({ notificationId: id });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await clearAll();
            toast.success("Notifications cleared");
        } catch (error) {
            toast.error("Failed to clear notifications");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: any) => {
        e.stopPropagation(); // Prevent triggering "mark as read"
        try {
            await removeNotification({ notificationId: id });
            toast.success("Notification removed");
        } catch (error) {
            toast.error("Failed to remove notification");
        }
    };

    const handleNotificationClick = (notification: any) => {
        handleMarkRead(notification._id);
        
        // Navigation Logic
        if (notification.type === 'message') {
            setCurrentView('dashboard'); // Chat is on dashboard
        } else if (notification.type === 'invite' || notification.type === 'member_added') {
            setCurrentView('team-members');
        } else if (notification.type.startsWith('task_')) {
            setCurrentView('task-overview'); // Or generic tasks page
            // Ideally we'd open the modal, but that requires more store state "selectedTaskId"
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageCircle size={20} className="text-blue-500" />;
            case 'invite':
            case 'member_added': return <UserPlus size={20} className="text-green-500" />;
            case 'role_updated': return <AlertCircle size={20} className="text-yellow-500" />;
            case 'task_created': return <FileText size={20} className="text-purple-500" />;
            case 'task_completed': return <CheckSquare size={20} className="text-green-600" />;
            case 'task_deleted': return <Trash2 size={20} className="text-red-500" />;
            case 'task_status_change': return <Clock size={20} className="text-orange-500" />;
            case 'deadline': return <AlertCircle size={20} className="text-red-600" />;
            default: return <Bell size={20} className="text-gray-500" />;
        }
    };

    if (notifications === undefined) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 p-8 h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Notifications</h1>
                   <p className="text-gray-500 dark:text-gray-400 mt-1">Updates on tasks, team, and messages.</p>
                </div>
                {notifications.length > 0 && (
                   <button 
                     onClick={handleClearAll}
                     className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                   >
                     <Trash2 size={16} />
                     Clear All
                   </button>
                )}
            </div>

            {/* List */}
            <div className="space-y-4 max-w-4xl mx-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Bell size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">No notifications yet</p>
                        <p className="text-sm">We'll notify you when something happens.</p>
                    </div>
                ) : (
                    notifications.map((notification: any) => (
                        <div 
                           key={notification._id}
                           onClick={() => handleNotificationClick(notification)}
                           className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                               notification.isRead 
                                 ? 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5' 
                                 : 'bg-white dark:bg-white/10 border-gray-100 dark:border-white/5 shadow-sm hover:translate-x-1'
                           }`}
                        >
                           {/* Icon Bubble */}
                           <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                               notification.isRead ? 'bg-gray-100 dark:bg-white/5 grayscale opacity-70' : 'bg-white dark:bg-white/10 shadow-sm'
                           }`}>
                               {getIcon(notification.type)}
                           </div>
                           
                           {/* Content */}
                           <div className="flex-1 min-w-0 pt-1">
                               <div className="flex items-start justify-between gap-4">
                                  <h3 className={`font-bold text-base truncate ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                      {notification.title}
                                  </h3>
                                  <span className="text-xs text-gray-400 shrink-0">
                                      {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                               </div>
                               <p className={`text-sm mt-1 leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                   {notification.content}
                               </p>
                           </div>

                           {/* Status Indicator / Delete Action */}
                           <div className="flex flex-col gap-2 items-center justify-center pl-2">
                               {!notification.isRead && (
                                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                               )}
                               <button 
                                 onClick={(e) => handleDelete(e, notification._id)}
                                 className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                                 title="Delete notification"
                               >
                                   <Trash2 size={16} />
                               </button>
                           </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
};

export default NotificationsPage;