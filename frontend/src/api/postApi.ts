import apiClient from '../lib/apiClient';
import { PostResponse, PostCreate, PostUpdate } from '../types/feed';

export const postApi = {
  createPost: (data: PostCreate) =>
    apiClient.post<PostResponse>('/posts/', data),

  getFeed: (filter: 'phriends' | 'passions', offset = 0, limit = 20) =>
    apiClient.get<PostResponse[]>(
      `/posts/feed?filter=${filter}&offset=${offset}&limit=${limit}`,
    ),

  getPost: (postId: string) =>
    apiClient.get<PostResponse>(`/posts/${postId}`),

  updatePost: (postId: string, data: PostUpdate) =>
    apiClient.patch<PostResponse>(`/posts/${postId}`, data),

  deletePost: (postId: string) =>
    apiClient.delete(`/posts/${postId}`),

  likePost: (postId: string) =>
    apiClient.post(`/posts/${postId}/like`, {}),

  unlikePost: (postId: string) =>
    apiClient.delete(`/posts/${postId}/like`),

  savePost: (postId: string) =>
    apiClient.post(`/posts/${postId}/save`, {}),

  unsavePost: (postId: string) =>
    apiClient.delete(`/posts/${postId}/save`),
};
