-- Create messages table
-- Supports both DMs (recipient_id set, subchannel_id null) and channel messages (subchannel_id set, recipient_id null)

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- For DMs only
    subchannel_id UUID REFERENCES subchannels(id) ON DELETE CASCADE,  -- For channel messages only
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce that a message is EITHER a DM or a channel message, not both
ALTER TABLE messages
ADD CONSTRAINT message_type_check
CHECK ((recipient_id IS NOT NULL AND subchannel_id IS NULL) OR (recipient_id IS NULL AND subchannel_id IS NOT NULL));

-- Index for DM lookups (get conversations between two users)
CREATE INDEX IF NOT EXISTS idx_messages_dm_conversation
ON messages(sender_id, recipient_id, created_at);

-- Index for channel messages (get messages in a subchannel)
CREATE INDEX IF NOT EXISTS idx_messages_channel
ON messages(subchannel_id, created_at);

-- Index for DM list (get most recent conversation per user)
CREATE INDEX IF NOT EXISTS idx_messages_dm_latest
ON messages(sender_id, recipient_id, created_at DESC);