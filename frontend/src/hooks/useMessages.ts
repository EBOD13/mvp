import { useState, useCallback, useRef } from 'react';
import { messageApi, MessageResponse, ConversationSummary } from '../api/messageApi';

export const useMessages = () => {
  const [dmList, setDmList] = useState<ConversationSummary[]>([]);
  const [conversation, setConversation] = useState<MessageResponse[]>([]);
  const [channelMessages, setChannelMessages] = useState<MessageResponse[]>([]);
  const [dmListLoading, setDmListLoading] = useState(false);
  const [convLoading, setConvLoading] = useState(false);
  const [channelLoading, setChannelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate refs so concurrent calls to different fetch functions don't block each other
  const dmListRef = useRef(false);
  const convRef = useRef(false);
  const channelRef = useRef(false);

  const fetchDmList = useCallback(async () => {
    if (dmListRef.current) return;
    dmListRef.current = true;
    setDmListLoading(true);
    setError(null);
    try {
      const res = await messageApi.getDmList();
      setDmList(res.data);
    } catch {
      setError('Failed to load conversations.');
    } finally {
      dmListRef.current = false;
      setDmListLoading(false);
    }
  }, []);

  const fetchConversation = useCallback(async (otherUserId: string) => {
    if (convRef.current) return;
    convRef.current = true;
    setConvLoading(true);
    setError(null);
    try {
      const res = await messageApi.getConversation(otherUserId);
      setConversation(res.data);
    } catch {
      setError('Failed to load messages.');
    } finally {
      convRef.current = false;
      setConvLoading(false);
    }
  }, []);

  const fetchChannelMessages = useCallback(async (subchannelId: string) => {
    if (channelRef.current) return;
    channelRef.current = true;
    setChannelLoading(true);
    setError(null);
    try {
      const res = await messageApi.getChannelMessages(subchannelId);
      setChannelMessages(res.data);
    } catch {
      setError('Failed to load channel messages.');
    } finally {
      channelRef.current = false;
      setChannelLoading(false);
    }
  }, []);

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
      setConversation(prev => prev.map(msg => msg.id === optimisticMsg.id ? res.data : msg));
    } catch {
      setConversation(prev => prev.filter(msg => msg.id !== optimisticMsg.id));
      setError('Failed to send message.');
    }
  }, []);

  const sendChannelMessage = useCallback(async (subchannelId: string, content: string) => {
    const optimisticMsg: MessageResponse = {
      id: `temp-${Date.now()}`,
      sender_id: 'me',
      recipient_id: null,
      subchannel_id: subchannelId,
      content,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setChannelMessages(prev => [...prev, optimisticMsg]);
    try {
      const res = await messageApi.sendChannelMessage(subchannelId, content);
      setChannelMessages(prev => prev.map(msg => msg.id === optimisticMsg.id ? res.data : msg));
    } catch {
      setChannelMessages(prev => prev.filter(msg => msg.id !== optimisticMsg.id));
      setError('Failed to send message.');
    }
  }, []);

  return {
    dmList,
    conversation,
    channelMessages,
    dmListLoading,
    convLoading,
    channelLoading,
    // keep a unified `loading` alias so existing call sites don't break
    loading: dmListLoading || convLoading || channelLoading,
    error,
    fetchDmList,
    fetchConversation,
    fetchChannelMessages,
    sendDm,
    sendChannelMessage,
  };
};
