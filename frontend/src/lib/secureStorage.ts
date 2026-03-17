import * as Keychain from 'react-native-keychain';

const SERVICE = 'supabase-auth';

export async function getToken(): Promise<string | null> {
  const result = await Keychain.getGenericPassword({ service: SERVICE });
  return result ? result.password : null;
}

export async function setToken(token: string): Promise<void> {
  await Keychain.setGenericPassword('token', token, { service: SERVICE });
}

export async function clearToken(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE });
}
