import { SUPABASE_URL as _SUPABASE_URL, SUPABASE_ANON_KEY as _SUPABASE_ANON_KEY, API_BASE_URL as _API_BASE_URL } from '@env';

export const SUPABASE_URL: string = _SUPABASE_URL;
export const SUPABASE_ANON_KEY: string = _SUPABASE_ANON_KEY;
export const API_BASE_URL: string = _API_BASE_URL ?? 'http://localhost:8000/';