import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Calendar, Clock, MapPin, Award } from 'lucide-react';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ isOpen, onClose, member }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`
        relative w-full max-w-md bg-white/80 dark:bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl rounded-[2rem] overflow-hidden transform transition-all duration-300
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
             <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-gray-700 dark:text-white transition-colors backdrop-blur-sm z-10"
            >
                <X size={18} />
            </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 -mt-16 flex flex-col items-center relative">
            <div className="relative mb-4">
                <img 
                    src={member?.avatar || `https://ui-avatars.com/api/?name=${member?.name}&background=random`} 
                    alt={member?.name} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[#1A1A1A] shadow-xl"
                />
                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white dark:border-[#1A1A1A] ${
                    member?.status === 'Online' ? 'bg-green-500' :
                    member?.status === 'Busy' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">{member?.name}</h2>
            <div className="flex items-center gap-2 mb-6">
                 <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-full">
                    {member?.role}
                 </span>
            </div>

            <div className="w-full space-y-4">
                <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/5 space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                             <Mail size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email Address</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{member?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                             <Calendar size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Joined On</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {member?.createdAt ? new Date(member.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default MemberProfileModal;
