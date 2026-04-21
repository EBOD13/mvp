-- Creates events and event_rsvps tables for handling event creation and user RSVPs

-- Table for event details created by users
CREATE TABLE IF NOT EXISTS events (
    -- Event id
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- User who created event
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- optional link to a specific passion channel
    passion_id UUID REFERENCES passions(id) ON DELETE SET NULL,
    -- Event information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    -- RSVP tracking
    attendee_count INT DEFAULT 0,
    max_attendees INT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table to track which users RSVP to which events
CREATE TABLE IF NOT EXISTS event_rsvps (
    -- User ID
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Event ID
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT now(),
    -- Prevent duplicate RSVPs
    PRIMARY KEY (user_id, event_id)
);

-- Indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_passion ON events(passion_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at ASC);