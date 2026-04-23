import apiClient from '../lib/apiClient';

export interface PhriendItem {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  pronouns: string | null;
  profile_photo_url: string | null;
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
};
