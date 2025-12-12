import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Search, X, FileText, Folder, User, Clock, Tag } from 'lucide-react';
import { useStore } from '../store/useStore';
import { createPortal } from 'react-dom';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const { currentTeamId, setCurrentProjectId, setCurrentView } = useStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch search results only when debounced query changes
  const results = useQuery(
    api.search.searchAll,
    currentTeamId && debouncedQuery.trim()
      ? { q: debouncedQuery, teamId: currentTeamId as any }
      : "skip"
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchInput('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  };

  const handleTaskClick = (task: any) => {
    setCurrentProjectId(task.projectId);
    setCurrentView('task-overview');
    setIsOpen(false);
    setSearchInput('');
  };

  const handleProjectClick = (project: any) => {
    setCurrentProjectId(project._id);
    setCurrentView('task-overview');
    setIsOpen(false);
    setSearchInput('');
  };

  const handleMemberClick = (member: any) => {
    setCurrentView('team-members');
    setIsOpen(false);
    setSearchInput('');
  };

  const hasResults = results && (results.tasks.length > 0 || results.projects.length > 0 || results.members.length > 0);
  const showDropdown = isOpen && debouncedQuery.trim() && (hasResults || results);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div ref={containerRef} className="relative group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search tasks, projects, members..."
          className="w-full pl-11 pr-10 py-2.5 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all"
        />
        {searchInput && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && createPortal(
        <div 
          className="fixed bg-white dark:bg-[#1A1D21] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-[500px] overflow-y-auto z-[9999] animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          {!hasResults && debouncedQuery && (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              <Search size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No results found for "{debouncedQuery}"</p>
            </div>
          )}

          {/* Tasks Section */}
          {results?.tasks && results.tasks.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <FileText size={14} />
                <span>Tasks ({results.tasks.length})</span>
              </div>
              <div className="space-y-1">
                {results.tasks.map((task: any) => (
                  <button
                    key={task._id}
                    onClick={() => handleTaskClick(task)}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={14} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{task.projectName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          task.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {results?.projects && results.projects.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Folder size={14} />
                <span>Projects ({results.projects.length})</span>
              </div>
              <div className="space-y-1">
                {results.projects.map((project: any) => (
                  <button
                    key={project._id}
                    onClick={() => handleProjectClick(project)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: project.color || '#8B5CF6' }}
                    >
                      <Folder size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {project.name}
                      </p>
                      {project.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{project.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {results?.members && results.members.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <User size={14} />
                <span>Team Members ({results.members.length})</span>
              </div>
              <div className="space-y-1">
                {results.members.map((member: any) => (
                  <button
                    key={member._id}
                    onClick={() => handleMemberClick(member)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                  >
                    <img
                      src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {member.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{member.email}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default SearchBar;
