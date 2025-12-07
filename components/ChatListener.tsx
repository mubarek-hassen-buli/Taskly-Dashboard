import { useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

const ChatListener = () => {
    const { currentTeamId, currentView, addUnreadMessage } = useStore();
    // Assuming we fetch the last 10 messages to check for new ones
    // We ideally should have a 'since' timestamp or cursor, but polling list is okay for small scale
    const messages = useQuery(api.messages.list, currentTeamId ? { teamId: currentTeamId as any, limit: 1 } : "skip");
    const currentUser = useQuery(api.users.current);

    const lastMessageIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (messages && messages.length > 0) {
            const newestMessage = messages[0];
            
            // Initial load or same message
            if (lastMessageIdRef.current === newestMessage._id) return;

            // Update ref
            const isFirstLoad = lastMessageIdRef.current === null;
            lastMessageIdRef.current = newestMessage._id;

            if (isFirstLoad) return; // Don't notify on initial page load

            // Notification Logic
            if (newestMessage.userId !== currentUser?._id) {
                // If we are NOT in the dashboard (where chat lives) or specifically NOT looking at chat
                // For simplicity, 'dashboard' view contains chat. 
                // A better check would be "isChatVisible". 
                // But user wanted "even when navigating between other pages".
                // So if view != 'dashboard', we notify.
                
                if (currentView !== 'dashboard') {
                    // Play notification sound
                    try {
                        const audio = new Audio('/notification.mp3'); // We need to add this file or use a CDN
                        audio.play().catch(e => console.log('Audio play failed', e)); // validation for strict interaction policies
                    } catch (e) {}

                    // Show Toast
                    toast.success(`New message from ${newestMessage.sender?.name || 'Teammate'}`, {
                        duration: 4000,
                        position: 'top-right',
                        style: {
                            background: '#333',
                            color: '#fff',
                            borderRadius: '12px',
                        },
                        icon: '💬',
                    });
                    
                    // Update global store count
                    addUnreadMessage();
                }
            }
        }
    }, [messages, currentUser, currentView, addUnreadMessage]);

    return null; // Headless component
};

export default ChatListener;
