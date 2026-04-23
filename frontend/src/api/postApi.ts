import { supabase } from '../lib/supabase';
import apiClient from '../lib/apiClient';
import { PostResponse, PostCreate, PostUpdate } from '../types/feed';

export type MediaAsset = {
  uri: string;          // local file:// or ph:// URI for display
  base64?: string;      // present for images from picker
  mimeType: string;     // e.g. 'image/jpeg', 'video/mp4'
  ext: string;          // 'jpg', 'mp4', etc.
};

export async function uploadMediaAsset(asset: MediaAsset, userId: string): Promise<string> {
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${asset.ext}`;

  let arrayBuffer: ArrayBuffer;
  if (asset.base64) {
    // Images: decode base64 via data URI (fast, no second fetch)
    arrayBuffer = await fetch(`data:${asset.mimeType};base64,${asset.base64}`).then(r => r.arrayBuffer());
  } else {
    // Videos: fetch the local URI directly
    arrayBuffer = await fetch(asset.uri).then(r => r.arrayBuffer());
  }

  const { error } = await supabase.storage
    .from('post-media')
    .upload(path, arrayBuffer, { contentType: asset.mimeType, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;
}

export async function uploadMediaAssets(assets: MediaAsset[], userId: string): Promise<string[]> {
  return Promise.all(assets.map(a => uploadMediaAsset(a, userId)));
}

export const postApi = {
  createPost: (data: PostCreate) =>
    apiClient.post<PostResponse>('/posts/', data),

  getFeed: (filter: 'phriends' | 'passions', offset = 0, limit = 20) =>
    apiClient.get<PostResponse[]>(
      `/posts/feed?filter=${filter}&offset=${offset}&limit=${limit}`,
    ),

  getMyPosts: (offset = 0, limit = 20) =>
    apiClient.get<PostResponse[]>(`/posts/me?offset=${offset}&limit=${limit}`),

  getUserPosts: (userId: string, offset = 0, limit = 20) =>
    apiClient.get<PostResponse[]>(`/posts/user/${userId}?offset=${offset}&limit=${limit}`),

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
