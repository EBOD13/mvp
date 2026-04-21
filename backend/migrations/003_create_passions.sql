CREATE TABLE IF NOT EXISTS passions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    cover_url VARCHAR(500),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visibility VARCHAR(10) NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'private')),
    join_type VARCHAR(10) NOT NULL DEFAULT 'open'
        CHECK (join_type IN ('open', 'request')),
    member_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS passion_members (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    passion_id UUID NOT NULL REFERENCES passions(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL DEFAULT 'member'
        CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, passion_id)
);

CREATE INDEX IF NOT EXISTS idx_passions_owner ON passions(owner_id);
CREATE INDEX IF NOT EXISTS idx_passions_visibility ON passions(visibility);
CREATE INDEX IF NOT EXISTS idx_passions_category ON passions(category);
CREATE INDEX IF NOT EXISTS idx_passion_members_user ON passion_members(user_id);
CREATE INDEX IF NOT EXISTS idx_passion_members_passion ON passion_members(passion_id);