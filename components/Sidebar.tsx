import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  CalendarDays, 
  Users, 
  Settings, 
  ChevronDown, 
  FolderOpen,
  ChevronsUpDown,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  Plus
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onAddProject?: () => void;
  onCreateProject?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onAddProject, onCreateProject }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const { currentTeamId, setCurrentTeamId, openFolderModal, openProjectModal } = useStore();

  // Fetch user's teams
  const teams = useQuery(api.teams.getByUser);

  // Set current team on mount
  useEffect(() => {
    if (teams && teams.length > 0 && !currentTeamId) {
      setCurrentTeamId(teams[0]._id);
    }
  }, [teams, currentTeamId, setCurrentTeamId]);

  // Get current team
  const currentTeam = teams?.find(t => t._id === currentTeamId);
  const teamName = currentTeam?.name || 'Taskly';

  return (
    // Updated container with dynamic width and smooth transitions
    <aside 
      className={`
        flex flex-col border-r border-white/40 dark:border-white/5 overflow-y-auto overflow-x-hidden py-6 shrink-0 h-full relative z-20
        transition-all duration-500 ease-in-out
        ${isCollapsed ? 'w-[88px] px-4' : 'w-72 px-6'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          z-30 p-1.5 rounded-full shadow-sm transition-all duration-500
          text-gray-400 hover:text-purple-600 dark:hover:text-purple-400
          bg-transparent hover:bg-white dark:hover:bg-white/10
          border border-transparent hover:border-gray-100 dark:hover:border-white/10
          ${isCollapsed 
            ? 'relative left-1/2 -translate-x-1/2 mb-6' 
            : 'absolute top-6 right-6 bg-white/50 dark:bg-white/5 backdrop-blur-sm'}
        `}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
         {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>

      {/* Team Selector */}
      <div className={`mb-8 transition-all duration-500 ${isCollapsed ? 'mt-0' : 'mt-8'}`}>
        <div className={`
          bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm border border-white/50 dark:border-white/5 overflow-hidden
          ${isCollapsed ? 'p-2 justify-center aspect-square' : 'p-4 justify-between'}
        `}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 shrink-0 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-md transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
            </div>
            
            <div className={`transition-opacity duration-300 ${isCollapsed ? 'hidden opacity-0 w-0' : 'opacity-100'}`}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{teamName}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Lock size={10} />
                <span>Private</span>
              </div>
            </div>
          </div>
          
          {!isCollapsed && <ChevronsUpDown size={16} className="text-gray-400 shrink-0" />}
        </div>
      </div>

      {/* Menu */}
      <div className="mb-6 flex-1">
        {!isCollapsed && (
          <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 tracking-wider uppercase opacity-70 animate-fade-in">Menu</h4>
        )}
        <nav className="flex flex-col gap-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<ListTodo size={20} />} 
            label="Task Overview" 
            badge="6" 
            active={currentView === 'task-overview'}
            onClick={() => onNavigate('task-overview')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<CalendarDays size={20} />} 
            label="Calendar" 
            badge="2" 
            active={currentView === 'calendar'}
            onClick={() => onNavigate('calendar')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Team Members" 
            active={currentView === 'team-members'}
            onClick={() => onNavigate('team-members')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={currentView === 'settings'}
            onClick={() => onNavigate('settings')}
            collapsed={isCollapsed} 
          />
        </nav>
      </div>

      {/* Workspace */}
      <div className="pb-6">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase opacity-70">Workspace</h4>
            <button 
              onClick={openFolderModal}
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/50 dark:bg-white/10 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-gray-400 dark:text-gray-500 shadow-sm"
              title="Add New Folder"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        )}
        
        {isCollapsed && <div className="h-px w-full bg-gray-200 dark:bg-white/10 mb-4"></div>}
        
        <FolderList 
          currentTeamId={currentTeamId} 
          isCollapsed={isCollapsed} 
          openProjectModal={openProjectModal}
        />
      </div>
    </aside>
  );
};

interface FolderListProps {
  currentTeamId: string | null;
  isCollapsed: boolean;
  openProjectModal: () => void;
}

const FolderList: React.FC<FolderListProps> = ({ currentTeamId, isCollapsed, openProjectModal }) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const { currentProjectId, setCurrentProjectId } = useStore();
  
  // Fetch folders and projects
  const folders = useQuery(api.folders.list, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  const projects = useQuery(api.projects.list, currentTeamId ? { teamId: currentTeamId as any } : "skip");

  // Toggle folder open/close
  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  if (!folders || folders.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-400 dark:text-gray-500">
        {!isCollapsed && <p>No folders yet. Create one!</p>}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-2">
      {folders.map((folder) => {
        const folderProjects = projects?.filter(p => p.folderId === folder._id) || [];
        const isOpen = openFolders[folder._id] ?? true;

        return (
          <div key={folder._id} className="group">
            <div 
              onClick={() => !isCollapsed && toggleFolder(folder._id)}
              className={`
                flex items-center p-3 rounded-2xl cursor-pointer shadow-lg shadow-gray-400/20 dark:shadow-none transition-all overflow-hidden group/folder
                ${isCollapsed 
                  ? 'justify-center bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black' 
                  : 'justify-between bg-gray-900 dark:bg-white text-white dark:text-black'}
              `}
              style={{ borderLeft: !isCollapsed && folder.color ? `3px solid ${folder.color}` : undefined }}
              title={folder.name}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {!isCollapsed && <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />}
                <FolderOpen size={18} className="shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap truncate">{folder.name}</span>}
              </div>
              
              {!isCollapsed && (
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open project modal with this folder's ID
                        useStore.setState({ selectedFolderId: folder._id });
                        openProjectModal();
                      }}
                      className="w-6 h-6 rounded-lg bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 flex items-center justify-center transition-colors"
                      title="New Project"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                    <span className="bg-gray-700 dark:bg-gray-200 dark:text-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-full">{folderProjects.length}</span>
                 </div>
              )}
            </div>
            
            {/* Nested projects */}
            {!isCollapsed && isOpen && folderProjects.length > 0 && (
              <div className="pl-4 mt-2 flex flex-col gap-1 relative animate-fade-in-down">
                <div className="absolute left-7 top-0 bottom-0 w-px bg-gray-300/50 dark:bg-white/10"></div>
                
                {folderProjects.map((project) => (
                  <div 
                    key={project._id}
                    onClick={() => setCurrentProjectId(project._id)}
                    className={`pl-6 py-2 text-sm cursor-pointer transition-all truncate rounded-lg ${
                      currentProjectId === project._id
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold ml-1'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                    style={{ borderLeft: project.color ? `3px solid ${project.color}` : undefined }}
                  >
                    {project.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
  collapsed?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, badge, onClick, collapsed }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center p-3 rounded-2xl cursor-pointer transition-all group relative
      ${active 
        ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-gray-400/20 dark:shadow-none' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 hover:shadow-sm hover:text-gray-900 dark:hover:text-white'}
      ${collapsed ? 'justify-center aspect-square' : 'justify-between'}
    `}
    title={collapsed ? label : undefined}
  >
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      {icon}
      {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
    </div>
    
    {/* Badge Logic */}
    {badge && (
      collapsed ? (
        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full border border-white dark:border-gray-800"></div>
      ) : (
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-800' : 'bg-purple-100/80 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300'}`}>
          {badge}
        </span>
      )
    )}
  </div>
);

export default Sidebar;