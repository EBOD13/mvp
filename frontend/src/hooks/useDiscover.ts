import { useState, useEffect, useCallback, useRef } from 'react';
import { passionApi, Passion, DiscoverUser } from '../api/passionApi';

const LIMIT = 20;

export type DiscoverTab = 'passions' | 'people';

export const useDiscover = () => {
  const [passions, setPassions] = useState<Passion[]>([]);
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<DiscoverTab>('passions');
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const loadingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      offsetRef.current = 0;

      try {
        if (tab === 'passions') {
          const res = await passionApi.getPublicPassions(debouncedQuery, 0, LIMIT);
          if (!mounted) return;
          setPassions(res.data);
          setHasMore(res.data.length === LIMIT);
          offsetRef.current = res.data.length;
        } else {
          if (!debouncedQuery) {
            if (!mounted) return;
            setUsers([]);
            setHasMore(false);
            return;
          }

          const res = await passionApi.searchUsers(debouncedQuery, 0, LIMIT);
          if (!mounted) return;
          setUsers(res.data);
          setHasMore(res.data.length === LIMIT);
          offsetRef.current = res.data.length;
        }
      } catch {
        if (mounted) setError('Failed to load discover results.');
      } finally {
        loadingRef.current = false;
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [tab, debouncedQuery]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    if (tab === 'people' && !debouncedQuery) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      if (tab === 'passions') {
        const res = await passionApi.getPublicPassions(
          debouncedQuery,
          offsetRef.current,
          LIMIT
        );
        setPassions(prev => [...prev, ...res.data]);
        setHasMore(res.data.length === LIMIT);
        offsetRef.current += res.data.length;
      } else {
        const res = await passionApi.searchUsers(
          debouncedQuery,
          offsetRef.current,
          LIMIT
        );
        setUsers(prev => [...prev, ...res.data]);
        setHasMore(res.data.length === LIMIT);
        offsetRef.current += res.data.length;
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [tab, debouncedQuery, hasMore]);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    offsetRef.current = 0;

    try {
      if (tab === 'passions') {
        const res = await passionApi.getPublicPassions(debouncedQuery, 0, LIMIT);
        setPassions(res.data);
        setHasMore(res.data.length === LIMIT);
        offsetRef.current = res.data.length;
      } else {
        if (!debouncedQuery) {
          setUsers([]);
          setHasMore(false);
          return;
        }

        const res = await passionApi.searchUsers(debouncedQuery, 0, LIMIT);
        setUsers(res.data);
        setHasMore(res.data.length === LIMIT);
        offsetRef.current = res.data.length;
      }
    } catch {
      setError('Failed to refresh discover results.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [tab, debouncedQuery]);

  return {
    passions,
    users,
    loading,
    error,
    hasMore,
    query,
    setQuery,
    tab,
    setTab,
    loadMore,
    refresh,
  };
};