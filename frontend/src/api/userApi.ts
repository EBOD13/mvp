import apiClient from '../lib/apiClient';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export async function getMe() {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
}
