CREATE TABLE IF NOT EXISTS passion_favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passion_id UUID NOT NULL REFERENCES passions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, passion_id)
);

CREATE INDEX IF NOT EXISTS idx_passion_favorites_user ON passion_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_passion_favorites_passion ON passion_favorites(passion_id);
