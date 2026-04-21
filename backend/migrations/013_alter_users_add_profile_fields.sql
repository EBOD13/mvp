ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pronouns VARCHAR(50),
    ADD COLUMN IF NOT EXISTS about_me TEXT,
    ADD COLUMN IF NOT EXISTS fab_position VARCHAR(5) NOT NULL DEFAULT 'right'
        CHECK (fab_position IN ('left', 'right')),
    ADD COLUMN IF NOT EXISTS default_post_visibility VARCHAR(10) NOT NULL DEFAULT 'public'
        CHECK (default_post_visibility IN ('public', 'private'));

COMMENT ON COLUMN users.first_name IS 'Separate from display_name which already exists';
COMMENT ON COLUMN users.fab_position IS 'User preference for floating action button — left or right side';
COMMENT ON COLUMN users.default_post_visibility IS 'Pre-fills visibility toggle on CreatePostScreen';