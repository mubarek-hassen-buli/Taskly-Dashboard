import React, { useState } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Sparkles, Send, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface SmartTaskInputProps {
  onTasksCreated?: () => void;
  className?: string;
}

const SmartTaskInput: React.FC<SmartTaskInputProps> = ({ onTasksCreated, className = "" }) => {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
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
    const toastId = toast.loading("AI is thinking...");

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

  // Compact trigger button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-0.5 transition-all text-sm font-bold ${className}`}
      >
        <Sparkles size={16} className="text-purple-200" />
        <span>Smart Create</span>
      </button>
    );
  }

  // Expanded inline view with modern dark design
  return (
    <div className={`relative animate-fade-in ${className}`}>
      <div className="w-full max-w-2xl bg-[#1E1E2E] rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">AI Assistant</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe tasks... e.g., 'Plan marketing launch for next week, review budget by Friday'"
            className="w-full bg-[#2A2A3C] text-white placeholder-gray-500 rounded-2xl px-5 py-4 resize-none outline-none text-base min-h-[180px] border border-white/5 focus:border-purple-500/50 transition-colors"
            disabled={isGenerating}
            autoFocus
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#1A1A28] border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-white/5 rounded-md font-mono text-xs">Enter</span>
            <span>to send</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate Tasks</span>
                <Send size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartTaskInput;
