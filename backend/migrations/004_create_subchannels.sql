CREATE TABLE IF NOT EXISTS subchannels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passion_id UUID NOT NULL REFERENCES passions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subchannels_passion ON subchannels(passion_id);