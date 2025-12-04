import React from 'react';
import { Search, Bell, Sun, Moon, SlidersHorizontal, LogOut } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { useAuthActions } from "@convex-dev/auth/react";

interface HeaderProps {
  theme?: string;
  toggleTheme?: () => void;
  onNavigate?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onNavigate }) => {
  const isDark = theme === 'dark';
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    // Updated background to semi-transparent white/black with backdrop blur (Glass effect)
    <header className="flex items-center justify-between px-8 py-5 shrink-0 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/5 transition-colors duration-500">
      
      {/* Logo Section */}
      <div className="flex items-center gap-2 w-72">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-xl shadow-lg transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 20l10-10"/>
            <path d="M17 20l-10-10"/>
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Taskly</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <input 
            type="text" 
            placeholder="Search here..." 
            className="w-full pl-11 pr-24 py-3 bg-white/80 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 focus:bg-white dark:focus:bg-black/50 transition-all shadow-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 bg-gray-100/50 dark:bg-white/10 rounded-md border border-gray-200/50 dark:border-white/5">⌘ S</span>
            <button className="p-2 hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
               <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-end gap-4 w-72">
        <div className="flex items-center bg-white/80 dark:bg-white/5 rounded-full p-1 border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-sm transition-colors">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${!isDark ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Sun size={18} />
          </button>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Moon size={18} />
          </button>
        </div>

        <button 
          onClick={() => onNavigate?.('notifications')}
          className="relative p-3 bg-white/80 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 shadow-sm backdrop-blur-sm transition-all group"
        >
          <Bell size={20} className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
        </button>

        <button 
          onClick={handleSignOut}
          className="p-3 bg-white/80 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 shadow-sm backdrop-blur-sm transition-all group"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
        
        <div className="h-8 w-px bg-gray-300/50 dark:bg-white/10 mx-2"></div>

        <div className="flex items-center gap-3 pl-2 pr-1 py-1 bg-white/80 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-full cursor-pointer hover:bg-white dark:hover:bg-white/10 shadow-sm backdrop-blur-sm transition-all">
          <img src={CURRENT_USER.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2">{CURRENT_USER.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;