export interface PostResponse {
  id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  passion_id: string | null;
  passion_name: string | null;
  content: string;
  media_urls: string[];
  visibility: 'public' | 'private';
  comments_enabled: boolean;
  is_review: boolean;
  rating: number | null;
  like_count: number;
  comment_count: number;
  save_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCreate {
  content: string;
  passion_id?: string | null;
  media_urls?: string[];
  visibility: 'public' | 'private';
  comments_enabled: boolean;
  is_review?: boolean;
  rating?: number | null;
}

export interface PostUpdate {
  content?: string;
  passion_id?: string | null;
  media_urls?: string[];
  visibility?: 'public' | 'private';
  comments_enabled?: boolean;
  is_review?: boolean;
  rating?: number | null;
}

export interface CommentResponse {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  content: string;
  like_count: number;
  is_liked: boolean;
  created_at: string;
}
