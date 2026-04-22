import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken, clearToken } from '../lib/secureStorage';
import * as authApi from '../api/authApi';
import { getMe } from '../api/userApi';
import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  userId: string | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-logout on any 401 — covers expired tokens the backend now returns correctly
  useEffect(() => {
    const id = apiClient.interceptors.response.use(
      res => res,
      async err => {
        if (err.response?.status === 401) {
          await clearToken();
          setAccessToken(null);
          setUserId(null);
        }
        return Promise.reject(err);
      },
    );
    return () => apiClient.interceptors.response.eject(id);
  }, []); // setAccessToken / setUserId are stable setState references

  useEffect(() => {
    if (accessToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
      delete apiClient.defaults.headers.common.Authorization;
    }
  }, [accessToken]);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = await getToken();
      if (!mounted) return;

      if (!token) {
        setAccessToken(null);
        setUserId(null);
        setIsLoading(false);
        return;
      }

      setAccessToken(token);

      try {
        const me = await getMe();
        if (!mounted) return;
        setUserId(me.id);
      } catch {
        await clearToken();
        if (!mounted) return;
        setAccessToken(null);
        setUserId(null);
      }

      setIsLoading(false);
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(identifier: string, password: string) {
    const response = await authApi.login(identifier, password);
    await setToken(response.access_token);
    setAccessToken(response.access_token);
    setUserId(response.user_id);
    await supabase.auth.setSession({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    });
  }

  async function signup(email: string, password: string, username: string, displayName: string) {
    const response = await authApi.signup({
      email,
      password,
      username,
      display_name: displayName,
    });
    await setToken(response.access_token);
    setAccessToken(response.access_token);
    setUserId(response.user_id);
    await supabase.auth.setSession({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    });
  }

  async function logout() {
    await clearToken();
    setAccessToken(null);
    setUserId(null);
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        accessToken,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
