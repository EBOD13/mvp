import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';
import { getSupabaseSession, setSupabaseSession, clearSupabaseSession } from './secureStorage';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (_key: string) => getSupabaseSession(),
      setItem: (_key: string, value: string) => setSupabaseSession(value),
      removeItem: (_key: string) => clearSupabaseSession(),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
