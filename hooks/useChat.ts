import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useStore } from '../store/useStore';
import { z } from 'zod';

// Zod schema for message validation
const messageSchema = z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long");

export const useChat = () => {
  const { currentTeamId } = useStore();
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages with real-time updates
  // Assuming 'general' or null for team-wide chat for now
  const messages = useQuery(api.messages.list, currentTeamId ? { teamId: currentTeamId as any } : "skip");
  const currentUser = useQuery(api.users.current);
  
  const sendMessageMutation = useMutation(api.messages.send);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentTeamId) return;

    // Validate input
    const validation = messageSchema.safeParse(messageInput);
    if (!validation.success) {
      // Only show error if it's not just empty (e.g., too long), otherwise just don't send
      if (messageInput.length > 0) {
         setError(validation.error.issues[0].message);
      }
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      await sendMessageMutation({
        teamId: currentTeamId as any,
        content: messageInput.trim(),
        // channelId: undefined // default to general
      });
      setMessageInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const activeMessages = useMemo(() => messages || [], [messages]);

  return {
    messages: activeMessages,
    currentUser,
    messageInput,
    setMessageInput,
    handleSendMessage,
    isSending,
    error,
    scrollRef,
    currentTeamId
  };
};
