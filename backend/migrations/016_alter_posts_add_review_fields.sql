-- 016_alter_posts_add_review_fields.sql
-- Adds review mode to posts: a post can optionally be marked as a review,
-- in which case it carries a 1-5 passion-fruit rating and optional media.

ALTER TABLE posts
    ADD COLUMN IF NOT EXISTS is_review   BOOLEAN  NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS rating      SMALLINT          DEFAULT NULL
        CHECK (rating >= 1 AND rating <= 5);

-- A rating can only exist on a review post
ALTER TABLE posts
    ADD CONSTRAINT posts_rating_requires_review
        CHECK (rating IS NULL OR is_review = true);

-- media_urls already exists from 005; expose it clearly in comments
COMMENT ON COLUMN posts.is_review IS 'true = this post is a passion review with an optional rating';
COMMENT ON COLUMN posts.rating    IS '1-5 passion-fruit rating; NULL unless is_review = true';
COMMENT ON COLUMN posts.media_urls IS 'Optional image URLs attached to the post (review or regular)';
