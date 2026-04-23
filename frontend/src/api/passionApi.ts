import apiClient from '../lib/apiClient';
import { supabase } from '../lib/supabase';

// ── Shared types ──────────────────────────────────────────────────────────────

export type JoinType = 'open' | 'request';
export type MembershipStatus = 'not_member' | 'member' | 'pending';

export interface PassionListItem {
  id: string;
  name: string;
  cover_url: string | null;
  member_count: number;
  category: string | null;
  my_role: 'member' | 'moderator' | 'admin' | 'organizer';
  is_favorite: boolean;
}

export interface PassionCreate {
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  join_type: JoinType;
  cover_url?: string | null;
}

export interface PassionResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  join_type: JoinType;
  cover_url: string | null;
  member_count: number;
  created_at: string;
  my_role: 'member' | 'moderator' | 'admin' | 'organizer';
  is_favorite: boolean;
  membership_status: MembershipStatus;
}

export interface PassionDiscoverItem {
  id: string;
  name: string;
  description: string;
  category: string | null;
  cover_url: string | null;
  member_count: number;
  visibility: 'public' | 'private';
  join_type: JoinType;
  membership_status: MembershipStatus;
  is_favorite: boolean;
}

export type PassionEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
};

// Passion shape used by Discover/Detail screens (direct Supabase reads)
export type Passion = {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  joinType: JoinType;
  coverUrl: string | null;
  coverColor: string;
  createdAt: string;
  memberCount: number;
  membershipStatus: MembershipStatus;
  upcomingEvents: PassionEvent[];
};

export interface SubchannelListItem {
  id: string;
  name: string;
  description: string | null;
  passion_id: string;
}

export interface PassionResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  join_type: JoinType;
  cover_url: string | null;
  member_count: number;
  created_at: string;
  my_role: 'member' | 'moderator' | 'admin' | 'organizer';
  is_favorite: boolean;
  membership_status: MembershipStatus;
}

export type DiscoverUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

type PassionRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  join_type: JoinType;
  cover_url: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
};

const COVER_COLORS = [
  '#8C6AD9', '#5B8DEF', '#E26D6D', '#48A6A7',
  '#E59D5C', '#6D9F71', '#D4848A', '#7B8FA1',
];

const getCoverColor = (id: string) => {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return COVER_COLORS[n % COVER_COLORS.length];
};

const formatEventDate = (dateString: string) =>
  new Date(dateString).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

const getCurrentUserId = async (): Promise<string | null> => {
  // getSession() reads from local keychain storage — no network call, always reliable
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
};

const getMemberCounts = async (ids: string[]): Promise<Record<string, number>> => {
  if (!ids.length) return {};
  const { data } = await supabase
    .from('passion_members')
    .select('passion_id')
    .in('passion_id', ids);
  const counts: Record<string, number> = {};
  for (const id of ids) counts[id] = 0;
  for (const row of data ?? []) counts[row.passion_id] = (counts[row.passion_id] ?? 0) + 1;
  return counts;
};

const getMembershipStatuses = async (
  ids: string[],
  userId: string | null,
): Promise<Record<string, MembershipStatus>> => {
  if (!userId || !ids.length) return {};
  const [{ data: members }, { data: requests }, { data: owned }] = await Promise.all([
    supabase.from('passion_members').select('passion_id').eq('user_id', userId).in('passion_id', ids),
    supabase.from('passion_join_requests').select('passion_id, status').eq('requester_id', userId).in('passion_id', ids),
    supabase.from('passions').select('id').eq('owner_id', userId).in('id', ids),
  ]);
  const result: Record<string, MembershipStatus> = {};
  for (const row of owned ?? []) result[row.id] = 'member';
  for (const row of members ?? []) result[row.passion_id] = 'member';
  for (const row of requests ?? []) {
    if (!result[row.passion_id]) {
      result[row.passion_id] = row.status === 'pending' ? 'pending' : 'not_member';
    }
  }
  return result;
};

const mapPassion = (
  row: PassionRow,
  memberCount: number,
  membershipStatus: MembershipStatus,
  upcomingEvents: PassionEvent[] = [],
): Passion => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  visibility: row.visibility,
  joinType: row.join_type,
  coverUrl: row.cover_url,
  coverColor: getCoverColor(row.id),
  createdAt: row.created_at,
  memberCount,
  membershipStatus,
  upcomingEvents,
});

// ── API ───────────────────────────────────────────────────────────────────────

export const passionApi = {
  // Backend REST endpoints
  createPassion: (data: PassionCreate) =>
    apiClient.post<PassionResponse>('/passions/', data),

  getMyPassions: () =>
    apiClient.get<PassionListItem[]>('/passions/me'),

  getUserPassions: (userId: string) =>
    apiClient.get<PassionListItem[]>(`/passions/user/${userId}`),

  getPassionsByUsername: (username: string) =>
    apiClient.get<PassionListItem[]>(`/passions/by-username/${encodeURIComponent(username)}`),

  joinPassion: (passionId: string) =>
    apiClient.post<PassionResponse>(`/passions/${passionId}/join`, {}),

  requestJoin: (passionId: string) =>
    apiClient.post<PassionResponse>(`/passions/${passionId}/request-join`, {}),

  addFavorite: (passionId: string) =>
    apiClient.post(`/passions/${passionId}/favorite`, {}),

  removeFavorite: (passionId: string) =>
    apiClient.delete(`/passions/${passionId}/favorite`),

  getSubchannels: (passionId: string) =>
    apiClient.get<SubchannelListItem[]>(`/passions/${passionId}/subchannels`),

  createSubchannel: (passionId: string, name: string, description?: string) =>
    apiClient.post<SubchannelListItem>(`/passions/${passionId}/subchannels`, { name, description }),

  // Fetches the backend PassionResponse which includes my_role
  getPassionDetail: (passionId: string) =>
    apiClient.get<PassionResponse>(`/passions/${passionId}`),

  // Backend-routed discover (bypasses RLS — shows all public + user's private passions)
  async getPublicPassions(query = '', offset = 0, limit = 20): Promise<{ data: Passion[] }> {
    const params: Record<string, string | number> = { offset, limit };
    if (query.trim()) params.query = query.trim();

    const resp = await apiClient.get<PassionDiscoverItem[]>('/passions/discover', { params });
    const items = Array.isArray(resp.data) ? resp.data : [];

    return {
      data: items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category ?? 'General',
        visibility: item.visibility,
        joinType: item.join_type,
        coverUrl: item.cover_url,
        coverColor: getCoverColor(item.id),
        createdAt: '',
        memberCount: item.member_count,
        membershipStatus: item.membership_status,
        upcomingEvents: [],
      })),
    };
  },

  async getPassionById(passionId: string): Promise<Passion | null> {
    const userId = await getCurrentUserId();

    const { data: row, error } = await supabase
      .from('passions')
      .select('id, name, description, category, visibility, join_type, cover_url, created_at')
      .eq('id', passionId)
      .maybeSingle();

    if (error) throw error;
    if (!row) return null;

    const [{ data: eventsData }, memberCounts, statuses] = await Promise.all([
      supabase.from('events').select('id, title, location, starts_at')
        .eq('passion_id', passionId)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true }),
      getMemberCounts([passionId]),
      getMembershipStatuses([passionId], userId),
    ]);

    const upcomingEvents: PassionEvent[] = ((eventsData ?? []) as EventRow[]).map(e => ({
      id: e.id,
      title: e.title,
      date: formatEventDate(e.starts_at),
      location: e.location ?? 'TBA',
    }));

    return mapPassion(row as PassionRow, memberCounts[passionId] ?? 0, statuses[passionId] ?? 'not_member', upcomingEvents);
  },

  async getPassion(passionId: string): Promise<{ data: Passion | null }> {
    return { data: await this.getPassionById(passionId) };
  },

  async searchUsers(query: string, offset = 0, limit = 20): Promise<{ data: DiscoverUser[] }> {
    if (!query.trim()) return { data: [] };
    const resp = await apiClient.get<DiscoverUser[]>('/users/search', {
      params: { q: query.trim(), offset, limit },
    });
    return { data: Array.isArray(resp.data) ? resp.data : [] };
  },
};
