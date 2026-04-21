import apiClient from '../lib/apiClient';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  username: string;
  display_name: string;
}

export async function login(identifier: string, password: string) {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    identifier,
    password,
  });
  return response.data;
}

export async function signup(payload: SignUpPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/signup', payload);
  return response.data;
}

export async function refreshToken(refresh_token: string) {
  const response = await apiClient.post<AuthResponse>('/auth/refresh', {
    refresh_token,
  });
  return response.data;
}
