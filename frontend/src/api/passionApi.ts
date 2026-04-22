import apiClient from '../lib/apiClient';

export interface PassionListItem {
  id: string;
  name: string;
  cover_url: string | null;
  member_count: number;
  category: string | null;
  my_role: 'member' | 'moderator' | 'admin' | 'organizer';
  is_favorite: boolean;
}

export const passionApi = {
  getMyPassions: () => apiClient.get<PassionListItem[]>('/passions/me'),
  getUserPassions: (userId: string) => apiClient.get<PassionListItem[]>(`/passions/user/${userId}`),
  getPassionsByUsername: (username: string) =>
    apiClient.get<PassionListItem[]>(`/passions/by-username/${encodeURIComponent(username)}`),
  addFavorite: (passionId: string) => apiClient.post(`/passions/${passionId}/favorite`, {}),
  removeFavorite: (passionId: string) => apiClient.delete(`/passions/${passionId}/favorite`),
};
