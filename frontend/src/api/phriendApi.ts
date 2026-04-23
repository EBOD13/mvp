import apiClient from '../lib/apiClient';

export interface PhriendItem {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  pronouns: string | null;
  profile_photo_url: string | null;
}

export interface PhriendRequestItem {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type PhriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export interface PhriendshipStatusResult {
  status: PhriendshipStatus;
  request_id: string | null;
}

export const phriendApi = {
  getPhriends: () => apiClient.get<PhriendItem[]>('/phriends/'),

  removePhriend: (otherUserId: string) =>
    apiClient.delete(`/phriends/${otherUserId}`),

  getBestPhriends: () => apiClient.get<PhriendItem[]>('/phriends/best'),

  getBestPhriendIds: () => apiClient.get<string[]>('/phriends/best/ids'),

  addBestPhriend: (otherUserId: string) =>
    apiClient.post(`/phriends/${otherUserId}/best`, {}),

  removeBestPhriend: (otherUserId: string) =>
    apiClient.delete(`/phriends/${otherUserId}/best`),

  sendRequest: (addresseeId: string) =>
    apiClient.post<PhriendRequestItem>('/phriends/request', { addressee_id: addresseeId }),

  cancelRequest: (otherUserId: string) =>
    apiClient.delete(`/phriends/request/to/${otherUserId}`),

  acceptRequest: (requestId: string) =>
    apiClient.patch<PhriendRequestItem>(`/phriends/${requestId}/accept`, {}),

  declineRequest: (requestId: string) =>
    apiClient.patch(`/phriends/${requestId}/decline`, {}),

  getStatus: (otherUserId: string) =>
    apiClient.get<PhriendshipStatusResult>(`/phriends/status/${otherUserId}`),

  getPendingRequests: () =>
    apiClient.get<PhriendRequestItem[]>('/phriends/requests/pending'),
};
