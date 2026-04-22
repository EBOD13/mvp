import apiClient from '../lib/apiClient';

export interface PassionListItem {
  id: string;
  name: string;
  cover_url: string | null;
  member_count: number;
  category: string | null;
  my_role: 'member' | 'moderator' | 'admin' | 'organizer';
  is_favorite: boolean;
}

import { supabase } from '../lib/supabase';

export type JoinType = 'open' | 'request';
export type MembershipStatus = 'not_member' | 'member' | 'pending';

export type PassionEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
};

export type Passion = {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  joinType: JoinType;
  coverImageUrl: string | null;
  coverColor: string;
  createdAt: string;
  memberCount: number;
  membershipStatus: MembershipStatus;
  upcomingEvents: PassionEvent[];
};

export type DiscoverUser = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

type PassionRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'private';
  join_type: JoinType;
  cover_image_url: string | null;
  created_at: string;
};

type PassionMemberRow = {
  passion_id: string;
  status: 'member' | 'pending';
};

type EventRow = {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
};

const DEFAULT_COVER_COLORS = [
  '#8C6AD9',
  '#5B8DEF',
  '#E26D6D',
  '#48A6A7',
  '#E59D5C',
  '#6D9F71',
];

const getCoverColor = (id: string) => {
  const total = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return DEFAULT_COVER_COLORS[total % DEFAULT_COVER_COLORS.length];
};

const getCurrentUserId = async (): Promise<string | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user?.id ?? null;
};

const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const mapMembershipStatus = (status?: string | null): MembershipStatus => {
  if (status === 'member') return 'member';
  if (status === 'pending') return 'pending';
  return 'not_member';
};

const getMemberCounts = async (
  passionIds: string[]
): Promise<Record<string, number>> => {
  if (passionIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('passion_members')
    .select('passion_id')
    .eq('status', 'member')
    .in('passion_id', passionIds);

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};

  for (const passionId of passionIds) {
    counts[passionId] = 0;
  }

  for (const row of data ?? []) {
    counts[row.passion_id] = (counts[row.passion_id] ?? 0) + 1;
  }

  return counts;
};

const getMembershipStatuses = async (
  passionIds: string[],
  userId: string | null
): Promise<Record<string, MembershipStatus>> => {
  if (!userId || passionIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('passion_members')
    .select('passion_id, status')
    .eq('user_id', userId)
    .in('passion_id', passionIds);

  if (error) {
    throw error;
  }

  const statuses: Record<string, MembershipStatus> = {};

  for (const row of (data ?? []) as PassionMemberRow[]) {
    statuses[row.passion_id] = mapMembershipStatus(row.status);
  }

  return statuses;
};

const mapPassion = (
  row: PassionRow,
  memberCount: number,
  membershipStatus: MembershipStatus,
  upcomingEvents: PassionEvent[] = []
): Passion => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  visibility: row.visibility,
  joinType: row.join_type,
  coverImageUrl: row.cover_image_url,
  coverColor: getCoverColor(row.id),
  createdAt: row.created_at,
  memberCount,
  membershipStatus,
  upcomingEvents,
});

export const passionApi = {
  getMyPassions: () => apiClient.get<PassionListItem[]>('/passions/me'),
  getUserPassions: (userId: string) => apiClient.get<PassionListItem[]>(`/passions/user/${userId}`),
  getPassionsByUsername: (username: string) =>
    apiClient.get<PassionListItem[]>(`/passions/by-username/${encodeURIComponent(username)}`),
  addFavorite: (passionId: string) => apiClient.post(`/passions/${passionId}/favorite`, {}),
  removeFavorite: (passionId: string) => apiClient.delete(`/passions/${passionId}/favorite`),

  async getPublicPassions(
    query = '',
    offset = 0,
    limit = 20
  ): Promise<{ data: Passion[] }> {
    const userId = await getCurrentUserId();

    let passionsQuery = supabase
      .from('passions')
      .select(
        'id, name, description, category, visibility, join_type, cover_image_url, created_at'
      )
      .eq('visibility', 'public')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (query.trim()) {
      passionsQuery = passionsQuery.ilike('name', `%${query.trim()}%`);
    }

    const { data, error } = await passionsQuery;

    if (error) {
      throw error;
    }

    const passionRows = (data ?? []) as PassionRow[];
    const passionIds = passionRows.map(row => row.id);

    const [memberCounts, membershipStatuses] = await Promise.all([
      getMemberCounts(passionIds),
      getMembershipStatuses(passionIds, userId),
    ]);

    return {
      data: passionRows.map(row =>
        mapPassion(
          row,
          memberCounts[row.id] ?? 0,
          membershipStatuses[row.id] ?? 'not_member'
        )
      ),
    };
  },

  async searchUsers(
    query: string,
    offset = 0,
    limit = 20
  ): Promise<{ data: DiscoverUser[] }> {
    const trimmed = query.trim();

    if (!trimmed) {
      return { data: [] };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`display_name.ilike.%${trimmed}%,username.ilike.%${trimmed}%`)
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      data: (data ?? []) as DiscoverUser[],
    };
  },

  async getPassionById(passionId: string): Promise<Passion | null> {
    const userId = await getCurrentUserId();

    const { data: passionRow, error } = await supabase
      .from('passions')
      .select(
        'id, name, description, category, visibility, join_type, cover_image_url, created_at'
      )
      .eq('id', passionId)
      .single();

    if (error) {
      throw error;
    }

    if (!passionRow) {
      return null;
    }

    const [
      { data: eventsData, error: eventsError },
      memberCounts,
      membershipStatuses,
    ] = await Promise.all([
      supabase
        .from('events')
        .select('id, title, location, starts_at')
        .eq('passion_id', passionId)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true }),
      getMemberCounts([passionId]),
      getMembershipStatuses([passionId], userId),
    ]);

    if (eventsError) {
      throw eventsError;
    }

    const upcomingEvents: PassionEvent[] = ((eventsData ?? []) as EventRow[]).map(
      event => ({
        id: event.id,
        title: event.title,
        date: formatEventDate(event.starts_at),
        location: event.location ?? 'TBA',
      })
    );

    return mapPassion(
      passionRow as PassionRow,
      memberCounts[passionId] ?? 0,
      membershipStatuses[passionId] ?? 'not_member',
      upcomingEvents
    );
  },

  async getPassion(passionId: string): Promise<{ data: Passion | null }> {
    const data = await this.getPassionById(passionId);
    return { data };
  },

  async joinPassion(passionId: string): Promise<Passion | null> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await supabase
      .from('passion_members')
      .upsert(
        {
          passion_id: passionId,
          user_id: userId,
          status: 'member',
        },
        {
          onConflict: 'passion_id,user_id',
        }
      );

    if (error) {
      throw error;
    }

    return this.getPassionById(passionId);
  },

  async requestJoin(passionId: string): Promise<Passion | null> {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('User is not authenticated.');
    }

    const { error } = await supabase
      .from('passion_members')
      .upsert(
        {
          passion_id: passionId,
          user_id: userId,
          status: 'pending',
        },
        {
          onConflict: 'passion_id,user_id',
        }
      );

    if (error) {
      throw error;
    }

    return this.getPassionById(passionId);
  },
};
