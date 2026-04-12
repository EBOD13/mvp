import { useState, useEffect, useCallback, useRef } from 'react';
import { postApi } from '../api/postApi';
import { PostResponse } from '../types/feed';

const LIMIT = 20;

export const useFeed = (filter: 'phriends' | 'passions') => {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs avoid stale closures without adding extra deps to callbacks
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  // Initial load + reload when filter changes
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      offsetRef.current = 0;

      try {
        const res = await postApi.getFeed(filter, 0, LIMIT);
        if (!mounted) return;
        setPosts(res.data);
        setHasMore(res.data.length === LIMIT);
        offsetRef.current = res.data.length;
      } catch {
        if (mounted) setError('Failed to load posts.');
      } finally {
        loadingRef.current = false;
        if (mounted) setLoading(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [filter]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await postApi.getFeed(filter, offsetRef.current, LIMIT);
      setPosts(prev => [...prev, ...res.data]);
      setHasMore(res.data.length === LIMIT);
      offsetRef.current += res.data.length;
    } catch {
      // Silently fail — keep existing posts intact
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [filter, hasMore]);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    offsetRef.current = 0;

    try {
      const res = await postApi.getFeed(filter, 0, LIMIT);
      setPosts(res.data);
      setHasMore(res.data.length === LIMIT);
      offsetRef.current = res.data.length;
    } catch {
      setError('Failed to refresh.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [filter]);

  // ── Optimistic mutations ──────────────────────────────────────────────────

  const likePost = useCallback(async (postId: string) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p)
    );
    try {
      await postApi.likePost(postId);
    } catch {
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p)
      );
    }
  }, []);

  const unlikePost = useCallback(async (postId: string) => {
    setPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, like_count: p.like_count - 1, is_liked: false } : p)
    );
    try {
      await postApi.unlikePost(postId);
    } catch {
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1, is_liked: true } : p)
      );
    }
  }, []);

  const savePost = useCallback(async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p));
    try {
      await postApi.savePost(postId);
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: false } : p));
    }
  }, []);

  const unsavePost = useCallback(async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: false } : p));
    try {
      await postApi.unsavePost(postId);
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_saved: true } : p));
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    // Capture before optimistic removal so we can restore on failure
    let removed: PostResponse | undefined;
    setPosts(prev => {
      removed = prev.find(p => p.id === postId);
      return prev.filter(p => p.id !== postId);
    });
    try {
      await postApi.deletePost(postId);
    } catch {
      if (removed) {
        const backup = removed;
        setPosts(prev =>
          prev.some(p => p.id === backup.id) ? prev : [backup, ...prev]
        );
      }
    }
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    likePost,
    unlikePost,
    savePost,
    unsavePost,
    deletePost,
  };
};
