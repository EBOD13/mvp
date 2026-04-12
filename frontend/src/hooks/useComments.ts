import { useState, useCallback } from 'react';
import { commentApi } from '../api/commentApi';
import { CommentResponse } from '../types/feed';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await commentApi.getComments(postId);
      setComments(res.data);
    } catch {
      // Silently fail — CommentSheet shows empty state
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content: string) => {
    const res = await commentApi.createComment(postId, content);
    setComments(prev => [res.data, ...prev]);
  }, [postId]);

  const deleteComment = useCallback(async (commentId: string) => {
    // Optimistic removal
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await commentApi.deleteComment(postId, commentId);
    } catch {
      // Restore by re-fetching
      const res = await commentApi.getComments(postId);
      setComments(res.data);
    }
  }, [postId]);

  const likeComment = useCallback(async (commentId: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, like_count: c.like_count + 1, is_liked: true } : c
      )
    );
    try {
      await commentApi.likeComment(postId, commentId);
    } catch {
      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, like_count: c.like_count - 1, is_liked: false } : c
        )
      );
    }
  }, [postId]);

  return { comments, loading, fetchComments, addComment, deleteComment, likeComment };
};
