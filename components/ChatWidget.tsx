import React, { useState } from 'react';
import { MessageCircle, ChevronDown, Bell, MoreHorizontal, Smile, Send, Paperclip } from 'lucide-react';
import { CHAT_MESSAGES } from '../constants';

const ChatWidget = () => {
  const [message, setMessage] = useState('');

  return (
    <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-50 dark:bg-white/10 rounded-full">
             <MessageCircle size={18} className="text-gray-900 dark:text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">Design Team Chat</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full"><Bell size={18} /></button>
          <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        {CHAT_MESSAGES.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            {!msg.isMe && (
               <div className="flex items-center gap-2 mb-1">
                 <span className="text-xs font-bold text-pink-400">{msg.sender}</span>
               </div>
            )}
            
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed relative ${
              msg.isMe 
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-br-sm' 
                : 'bg-gray-50 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
             <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message Here..."
          className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 placeholder-gray-400 dark:placeholder-gray-600 font-medium text-gray-900 dark:text-white"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full">
            <Smile size={18} />
          </button>
          <button className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-md">
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;