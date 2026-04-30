import apiClient from '../lib/apiClient';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  profile_song_url: string | null;
  is_verified: boolean;
  phriends_count: number;
  created_at: string;
}

export async function getMe() {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
}

export async function updateMe(data: {
  display_name?: string;
  bio?: string | null;
  avatar_url?: string;
  profile_song_url?: string | null;
}) {
  const response = await apiClient.patch<UserProfile>('/users/me', data);
  return response.data;
}

export async function getUserProfile(userId: string) {
  const response = await apiClient.get<UserProfile>(`/users/${userId}`);
  return response.data;
}
