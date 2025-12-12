import React, { useState } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Sparkles, Send, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface SmartTaskInputProps {
  onTasksCreated?: () => void;
  className?: string; // Allow custom styling
}

const SmartTaskInput: React.FC<SmartTaskInputProps> = ({ onTasksCreated, className = "" }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // To toggle the enhanced input mode
  
  const generateTasks = useAction(api.ai.generateTasks);
  const createBatch = useMutation(api.tasks.createBatch);
  const { currentTeamId, currentProjectId } = useStore();

  const handleGenerate = async () => {
    if (!input.trim()) return;
    if (!currentProjectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Thinking...");

    try {
      const currentDate = new Date().toDateString();
      const generatedTasks = await generateTasks({ 
        prompt: input, 
        currentDate 
      });

      if (!generatedTasks || generatedTasks.length === 0) {
        toast.error("Could not generate tasks. Please try being more specific.", { id: toastId });
        return;
      }

      await createBatch({
        projectId: currentProjectId as any,
        tasks: generatedTasks,
      });

      toast.success(`Successfully created ${generatedTasks.length} tasks!`, { id: toastId });
      setInput('');
      setIsOpen(false);
      if (onTasksCreated) onTasksCreated();

    } catch (error: any) {
      console.error("Smart Task Error:", error);
      toast.error(error.message || "Failed to create tasks", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Compact View (Just a button or small input)
  if (!isOpen) {
    return (
      <div className={`relative group ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-0.5 transition-all text-sm font-bold w-full md:w-auto"
        >
          <Sparkles size={16} className="text-purple-200" />
          <span>Smart Create</span>
        </button>
      </div>
    );
  }

  // Expanded View
  return (
    <div className={`relative animate-fade-in ${className}`}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-30 dark:opacity-50"></div>
        <div className="relative bg-white dark:bg-[#1A1D21] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={12} />
                    <span>AI Assistant</span>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Input Area */}
            <div className="p-3">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe tasks... e.g., 'Plan marketing launch for next week, review budget by Friday'"
                    className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none outline-none text-sm min-h-[80px]"
                    disabled={isGenerating}
                    autoFocus
                />
            </div>

            {/* Footer / Actions */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-white/5">
                <span className="text-[10px] text-gray-400 font-medium hidden md:block">
                    Press Enter to send
                </span>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                     <button
                        onClick={handleGenerate}
                        disabled={!input.trim() || isGenerating}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={12} className="animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <span>Generate Tasks</span>
                                <Send size={12} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SmartTaskInput;
