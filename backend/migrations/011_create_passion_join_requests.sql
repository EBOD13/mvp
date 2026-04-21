CREATE TABLE IF NOT EXISTS passion_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passion_id UUID NOT NULL REFERENCES passions(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (passion_id, requester_id)
);

CREATE INDEX IF NOT EXISTS idx_join_requests_passion ON passion_join_requests(passion_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_requester ON passion_join_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON passion_join_requests(status);