import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { getToken, setToken } from './secureStorage';
import { supabase } from './supabase';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
apiClient.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, attempt token refresh then retry once
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && data.session) {
        await setToken(data.session.access_token);
        original.headers.Authorization = `Bearer ${data.session.access_token}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
