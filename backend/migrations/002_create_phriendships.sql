CREATE TABLE IF NOT EXISTS phriendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_phriendships_requester ON phriendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_phriendships_addressee ON phriendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_phriendships_status ON phriendships(status);