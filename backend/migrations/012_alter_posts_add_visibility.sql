ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(10) NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'private')),
    ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN posts.visibility IS 'public = visible to all; private = author only';
COMMENT ON COLUMN posts.comments_enabled IS 'false disables commenting; auto-false on private posts';