import * as Keychain from 'react-native-keychain';

// Raw access token read by apiClient
const JWT_SERVICE = 'app-jwt';

// Full Supabase session JSON managed by the Supabase SDK
const SESSION_SERVICE = 'supabase-session';

export async function getToken(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: JWT_SERVICE });
  return result ? result.password : null;
}

export async function setToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('token', token, { service: JWT_SERVICE });
}

export async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: JWT_SERVICE });
  await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
}

// Used exclusively by the Supabase SDK storage adapter
export async function getSupabaseSession(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: SESSION_SERVICE });
  return result ? result.password : null;
}

export async function setSupabaseSession(value: string): Promise<void> {
  await Keychain.setGenericPassword('session', value, { service: SESSION_SERVICE });
}

export async function clearSupabaseSession(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
}
