import apiClient from '../lib/apiClient';
import { CommentResponse } from '../types/feed';

export const commentApi = {
  getComments: (postId: string) =>
    apiClient.get<CommentResponse[]>(`/posts/${postId}/comments`),

  createComment: (postId: string, content: string) =>
    apiClient.post<CommentResponse>(`/posts/${postId}/comments`, { content }),

  deleteComment: (postId: string, commentId: string) =>
    apiClient.delete(`/posts/${postId}/comments/${commentId}`),

  likeComment: (postId: string, commentId: string) =>
    apiClient.post(`/posts/${postId}/comments/${commentId}/like`, {}),
};
