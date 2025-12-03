import { create } from 'zustand';

type ViewState = 'onboarding' | 'login' | 'signup' | 'dashboard' | 'task-overview' | 'calendar' | 'team-members' | 'settings' | 'notifications';

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Navigation
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  
  // Selection
  currentTeamId: string | null;
  setCurrentTeamId: (id: string | null) => void;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // Modals
  isTaskModalOpen: boolean;
  openTaskModal: () => void;
  closeTaskModal: () => void;

  isMemberModalOpen: boolean;
  openMemberModal: () => void;
  closeMemberModal: () => void;

  isFolderModalOpen: boolean;
  openFolderModal: () => void;
  closeFolderModal: () => void;

  isProjectModalOpen: boolean;
  openProjectModal: () => void;
  closeProjectModal: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Theme
  theme: (typeof window !== 'undefined' ? localStorage.getItem('theme') as 'light' | 'dark' : 'light') || 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  setTheme: (theme) => set(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme };
  }),

  // Navigation
  currentView: 'onboarding', // Default start
  setCurrentView: (view) => set({ currentView: view }),

  // Selection
  currentTeamId: null,
  setCurrentTeamId: (id) => set({ currentTeamId: id }),
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),

  // Modals
  isTaskModalOpen: false,
  openTaskModal: () => set({ isTaskModalOpen: true }),
  closeTaskModal: () => set({ isTaskModalOpen: false }),

  isMemberModalOpen: false,
  openMemberModal: () => set({ isMemberModalOpen: true }),
  closeMemberModal: () => set({ isMemberModalOpen: false }),

  isFolderModalOpen: false,
  openFolderModal: () => set({ isFolderModalOpen: true }),
  closeFolderModal: () => set({ isFolderModalOpen: false }),

  isProjectModalOpen: false,
  openProjectModal: () => set({ isProjectModalOpen: true }),
  closeProjectModal: () => set({ isProjectModalOpen: false }),
}));
