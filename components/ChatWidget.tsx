import React from 'react';
import { MessageCircle, ChevronDown, Bell, MoreHorizontal, Smile, Send } from 'lucide-react';
import { useChat } from '../hooks/useChat';

const ChatWidget = () => {
  const { 
    messages, 
    currentUser, 
    messageInput, 
    setMessageInput, 
    handleSendMessage, 
    isSending, 
    scrollRef,
    currentTeamId
  } = useChat();

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentTeamId) {
    return (
        <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col items-center justify-center text-gray-400">
            <p>Select a team to view chat</p>
        </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-50 dark:bg-white/10 rounded-full">
             <MessageCircle size={18} className="text-gray-900 dark:text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Team Chat</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full"><Bell size={18} /></button>
          <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar"
        ref={scrollRef}
      >
        {messages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
              <MessageCircle size={48} className="mb-2" />
              <p className="text-sm">No messages yet. Say hello!</p>
           </div>
        ) : (
            messages.map((msg: any) => {
                const isMe = currentUser?._id === msg.userId;
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && (
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-bold text-pink-400">{msg.sender?.name || 'Unknown'}</span>
                       </div>
                    )}
                    
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed relative ${
                      isMe 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-br-sm' 
                        : 'bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                     <span className="text-[10px] text-gray-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
                );
            })
        )}
      </div>

      <div className="relative shrink-0">
        <input 
          type="text" 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Here..."
          disabled={isSending}
          className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 placeholder-gray-400 dark:placeholder-gray-600 font-medium text-gray-900 dark:text-white disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full">
            <Smile size={18} />
          </button>
          <button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isSending}
            className={`p-2 rounded-full transition-colors shadow-md flex items-center justify-center
                ${!messageInput.trim() || isSending 
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                }`}
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;