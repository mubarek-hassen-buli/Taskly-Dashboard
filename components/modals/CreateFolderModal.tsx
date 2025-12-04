import React, { useState, useEffect } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useStore } from '../../store/useStore';
import { z } from 'zod';

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(50, 'Folder name is too long'),
  color: z.string().optional(),
});

const COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const CreateFolderModal = () => {
  const { isFolderModalOpen, closeFolderModal, currentTeamId } = useStore();
  const createFolder = useMutation(api.folders.create);
  
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[3]); // Default Blue
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug: Log when modal opens
  useEffect(() => {
    if (isFolderModalOpen) {
      console.log('=== CreateFolderModal OPENED ===');
      console.log('currentTeamId:', currentTeamId);
      console.log('isFolderModalOpen:', isFolderModalOpen);
    }
  }, [isFolderModalOpen, currentTeamId]);

  if (!isFolderModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('CreateFolderModal - handleSubmit called');
    console.log('CreateFolderModal - currentTeamId:', currentTeamId);
    console.log('CreateFolderModal - name:', name);
    console.log('CreateFolderModal - color:', color);

    try {
      // Validate
      createFolderSchema.parse({ name, color });

      if (!currentTeamId) {
        console.error('CreateFolderModal - No team selected!');
        throw new Error('No team selected. Please refresh the page.');
      }

      console.log('CreateFolderModal - Calling createFolder mutation...');
      const result = await createFolder({
        teamId: currentTeamId as any,
        name,
        color,
      });
      console.log('CreateFolderModal - Folder created successfully:', result);

      closeFolderModal();
      setName('');
      setColor(COLORS[3]);
    } catch (err: any) {
      console.error('CreateFolderModal - Error:', err);
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err.message || 'Failed to create folder');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1A1D21] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <FolderPlus size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Folder</h3>
          </div>
          <button 
            onClick={closeFolderModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Folder Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing, Development"
              className="w-full bg-gray-50 dark:bg-[#0F1115] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Color Tag
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={closeFolderModal}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              onClick={(e) => {
                console.log('Submit button clicked!');
                console.log('Button type:', e.currentTarget.type);
              }}
              className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
