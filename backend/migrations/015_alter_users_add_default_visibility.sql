ALTER TABLE users
  ADD COLUMN IF NOT EXISTS default_post_visibility VARCHAR(10) NOT NULL DEFAULT 'public'
    CHECK (default_post_visibility IN ('public', 'private'));
