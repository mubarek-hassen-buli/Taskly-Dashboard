import React, { ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { DashboardProvider } from '../context/DashboardContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatListener from '../components/ChatListener';
import { Toaster } from 'react-hot-toast';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { currentTeamId, theme, toggleTheme, currentView, setCurrentView, openFolderModal, openProjectModal } = useStore();

    // ==========================================
    // GLOBAL DATA FETCHING (Single Source of Truth)
    // ==========================================
    
    // 1. Current User
    const currentUser = useQuery(api.users.current);

    // 2. Workspace Data (Dependent on Team ID)
    const skip = currentTeamId ? undefined : "skip";
    
    const tasks = useQuery(api.tasks.listByTeam, currentTeamId ? { teamId: currentTeamId as any } : "skip");
    const projects = useQuery(api.projects.list, currentTeamId ? { teamId: currentTeamId as any } : "skip");
    const teamMembers = useQuery(api.teams.listMembers, currentTeamId ? { teamId: currentTeamId as any } : "skip");
    const users = useQuery(api.users.list);

    // Calculate Loading State
    // We consider it loading if we have a team ID but data is undefined
    const isLoading = currentTeamId ? (tasks === undefined || projects === undefined || teamMembers === undefined) : false;

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <DashboardProvider value={{
            tasks,
            projects,
            teamMembers,
            users,
            currentUser,
            isLoading
        }}>
            {/* Top Section */}
            <div className="relative z-10">
                <Header 
                    theme={theme} 
                    toggleTheme={toggleTheme} 
                    onNavigate={(view) => setCurrentView(view as any)}
                />
            </div>

            {/* Main Content Container */}
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
                        
                        {/* Page Content */}
                        <div className="flex-1 relative h-full overflow-hidden">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Listeners */}
            <ChatListener />
            <Toaster />
        </DashboardProvider>
    );
};

export default DashboardLayout;
