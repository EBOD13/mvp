-- 005_create_posts.sql
-- Creates the posts table and supporting junction tables for likes and saves.
-- Run this in the Supabase SQL editor before moving to the Python layers.

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passion_id UUID REFERENCES,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    save_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS post_saves (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

-- Indexes speed up the most common queries:
-- 1. "Show me all posts by this user" (profile page)
-- 2. "Show me all posts in this passion" (passion feed)
-- 3. "Show me the newest posts first" (home feed)
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_passion ON posts(passion_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
