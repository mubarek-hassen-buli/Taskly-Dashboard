import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TaskOverview from './components/TaskOverview';
import CalendarPage from './components/CalendarPage';
import TeamMembers from './components/TeamMembers';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import Signup from './components/Signup';
import AddTaskModal from './components/AddTaskModal';
import AddMemberModal from './components/AddMemberModal';
import AddFolderModal from './components/AddFolderModal';
import AddProjectModal from './components/AddProjectModal';
import SettingsPage from './components/SettingsPage';
import NotificationsPage from './components/NotificationsPage';
import { useConvexAuth, useQuery } from 'convex/react';
import { api } from './convex/_generated/api';

type ViewState = 'onboarding' | 'login' | 'signup' | 'dashboard' | 'task-overview' | 'calendar' | 'team-members' | 'settings' | 'notifications';



const App = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  const { 
    theme, 
    toggleTheme, 
    currentView, 
    setCurrentView,
    isTaskModalOpen, openTaskModal, closeTaskModal,
    isMemberModalOpen, openMemberModal, closeMemberModal,
    isFolderModalOpen, openFolderModal, closeFolderModal,
    isProjectModalOpen, openProjectModal, closeProjectModal
  } = useStore();

  // Sync theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const user = useQuery(api.users.current);
  const [waitingForUser, setWaitingForUser] = useState(false);

  // Redirect based on auth status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Wait for user data to be loaded
        if (user !== undefined) {
          
          // If user is null, it means the user is being created, wait
          if (user === null) {
            if (!waitingForUser) {
              setWaitingForUser(true);
              // Retry after a short delay
              setTimeout(() => {
                setWaitingForUser(false);
              }, 1000);
            }
            return;
          }
          
          setWaitingForUser(false);
          
          if (!user.role) {
             // If user is logged in but hasn't completed profile (no role), send to signup flow (step 2)
             if (currentView !== 'signup') {
               setCurrentView('signup');
             }
          } else if (['login', 'signup', 'onboarding'].includes(currentView)) {
            setCurrentView('dashboard');
          }
        }
      } else {
        if (!['login', 'signup', 'onboarding'].includes(currentView)) {
          setCurrentView('login');
        }
      }
    }
  }, [isAuthenticated, isLoading, currentView, setCurrentView, user, waitingForUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F2F4F8] dark:bg-[#0F1115]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    // Show signup for profile completion even if authenticated
    if (currentView === 'signup') {
      return <Signup onNavigate={(view) => setCurrentView(view as any)} />;
    }
    
    if (!isAuthenticated) {
      switch (currentView) {
        case 'onboarding':
           return <Onboarding onNavigate={(view) => setCurrentView(view as any)} />;
        default:
          return <Login onNavigate={(view) => setCurrentView(view as any)} />;
      }
    }

    // Authenticated Views
    return (
      <>
        {/* Top Section (Mother Content) */}
        <div className="relative z-10">
          <Header 
            theme={theme} 
            toggleTheme={toggleTheme} 
            onNavigate={(view) => setCurrentView(view as any)}
          />
        </div>

        {/* Son Container: Floating Liquid Glass Effect - Added pt-6 for spacing */}
        <div className="flex-1 px-6 pb-6 pt-6 min-h-0 relative z-10 animate-fade-in">
          <div className="flex h-full w-full rounded-[2.5rem] overflow-hidden relative shadow-2xl ring-1 ring-white/60 dark:ring-white/10">
            
            {/* Glass Material Layer */}
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-3xl saturate-150 z-0 transition-colors duration-500"></div>
            
            {/* Content Wrapper */}
            <div className="relative z-10 flex h-full w-full">
              <Sidebar 
                currentView={currentView} 
                onNavigate={(view) => setCurrentView(view as any)} 
                onAddProject={openFolderModal}
                onCreateProject={openProjectModal}
              />
              
              {/* Relative Container for Pages + Modal Overlay */}
              <div className="flex-1 relative h-full overflow-hidden">
                  {currentView === 'dashboard' && <Dashboard onAddTask={openTaskModal} onAddMember={openMemberModal} />}
                  {currentView === 'task-overview' && <TaskOverview onAddTask={openTaskModal} onAddMember={openMemberModal} />}
                  {currentView === 'calendar' && <CalendarPage onAddTask={openTaskModal} />}
                  {currentView === 'team-members' && <TeamMembers onAddMember={openMemberModal} />}
                  {currentView === 'settings' && <SettingsPage />}
                  {currentView === 'notifications' && <NotificationsPage />}
                  
                  <AddTaskModal isOpen={isTaskModalOpen} onClose={closeTaskModal} />
                  <AddMemberModal isOpen={isMemberModalOpen} onClose={closeMemberModal} />
                  <AddFolderModal isOpen={isFolderModalOpen} onClose={closeFolderModal} />
                  <AddProjectModal 
                    isOpen={isProjectModalOpen} 
                    onClose={closeProjectModal} 
                    folderId={useStore.getState().selectedFolderId as any}
                  />
              </div>
            </div>

          </div>
        </div>
      </>
    );
  };

  return (
    // Mother Container with Ambient Background
    <div className="flex flex-col h-screen w-full relative overflow-hidden bg-[#F2F4F8] dark:bg-[#0F1115] transition-colors duration-500">
      
      {/* Ambient Light/Liquid Background Layer */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000">
        {/* Top Left Purple Blob */}
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] animate-blob transition-colors duration-500" />
        {/* Top Right Blue Blob */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-[100px] animate-blob animation-delay-2000 transition-colors duration-500" />
        {/* Bottom Left Pink Blob */}
        <div className="absolute bottom-[-10%] left-[10%] w-[50vw] h-[50vw] bg-pink-300/30 dark:bg-pink-900/20 rounded-full blur-[120px] animate-blob animation-delay-4000 transition-colors duration-500" />
      </div>

      {renderContent()}

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;