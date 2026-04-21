-- events.passion_id is currently NOT NULL but should be nullable
-- (a user may create an event not tied to any passion)
ALTER TABLE events
    ALTER COLUMN passion_id DROP NOT NULL;

-- Add index on starts_at for efficient upcoming event queries
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at ASC);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);