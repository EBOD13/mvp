import { useState, useCallback, useRef } from 'react';
import { messageApi, MessageResponse, ConversationSummary } from '../api/messageApi';

export const useMessages = () => {
  const [dmList, setDmList] = useState<ConversationSummary[]>([]);
  const [conversation, setConversation] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef(false);

  // Fetch the DM conversation list
  const fetchDmList = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await messageApi.getDmList();
      setDmList(res.data);
    } catch {
      setError('Failed to load conversations.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Fetch messages in a specific DM conversation
  const fetchConversation = useCallback(async (otherUserId: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await messageApi.getConversation(otherUserId);
      setConversation(res.data);
    } catch {
      setError('Failed to load messages.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Send a DM — optimistically append before API call
  const sendDm = useCallback(async (recipientId: string, content: string) => {
    const optimisticMsg: MessageResponse = {
      id: `temp-${Date.now()}`,
      sender_id: 'me',
      recipient_id: recipientId,
      subchannel_id: null,
      content,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setConversation(prev => [...prev, optimisticMsg]);

    try {
      const res = await messageApi.sendDm(recipientId, content);
      // Replace the optimistic message with the real one
      setConversation(prev =>
        prev.map(msg => msg.id === optimisticMsg.id ? res.data : msg)
      );
    } catch {
      // Remove optimistic message on failure
      setConversation(prev => prev.filter(msg => msg.id !== optimisticMsg.id));
      setError('Failed to send message.');
    }
  }, []);

  // Send a channel message
  const sendChannelMessage = useCallback(async (subchannelId: string, content: string) => {
    try {
      await messageApi.sendChannelMessage(subchannelId, content);
    } catch {
      setError('Failed to send message.');
    }
  }, []);

  return {
    dmList,
    conversation,
    loading,
    error,
    fetchDmList,
    fetchConversation,
    sendDm,
    sendChannelMessage,
  };
};