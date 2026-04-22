import { supabase } from '../lib/supabase';
import apiClient from '../lib/apiClient';
import { PostResponse, PostCreate, PostUpdate } from '../types/feed';

export async function uploadPostImage(base64: string, ext: string, userId: string): Promise<string> {
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const path = `${userId}/${Date.now()}.${ext}`;

  // Decode base64 → ArrayBuffer via a data URI — works reliably in React Native
  const dataUri = `data:${mimeType};base64,${base64}`;
  const arrayBuffer = await fetch(dataUri).then(r => r.arrayBuffer());

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from('post-media').getPublicUrl(path);
  return data.publicUrl;
}

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
