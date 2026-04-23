import apiClient from '../lib/apiClient';

export interface MessageResponse {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  subchannel_id: string | null;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  sender_username?: string | null;
}

export interface ConversationSummary {
  other_user_id: string;
  other_user_username: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export const messageApi = {
  // DMs
  sendDm: (recipientId: string, content: string) =>
    apiClient.post<MessageResponse>('/messages/dm', {
      recipient_id: recipientId,
      content,
    }),

  getDmList: () =>
    apiClient.get<ConversationSummary[]>('/messages/dm'),

  getConversation: (otherUserId: string, offset = 0, limit = 50) =>
    apiClient.get<MessageResponse[]>(`/messages/dm/${otherUserId}?offset=${offset}&limit=${limit}`),

  // Channel messages
  sendChannelMessage: (subchannelId: string, content: string) =>
    apiClient.post<MessageResponse>(`/messages/channels/${subchannelId}`, {
      content,
    }),

  getChannelMessages: (subchannelId: string, offset = 0, limit = 50) =>
    apiClient.get<MessageResponse[]>(`/messages/channels/${subchannelId}?offset=${offset}&limit=${limit}`),
};