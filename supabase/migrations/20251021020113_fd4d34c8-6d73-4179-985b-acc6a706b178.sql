-- Fix event_type enum to use underscore
ALTER TABLE events ALTER COLUMN event_type DROP DEFAULT;
ALTER TYPE event_type RENAME TO event_type_old;
CREATE TYPE event_type AS ENUM ('top_20', 'shark_tank');
ALTER TABLE events ALTER COLUMN event_type TYPE event_type USING event_type::text::event_type;
DROP TYPE event_type_old;

-- Fix match_status enum to include 'in_progress'
ALTER TABLE matches ALTER COLUMN match_status DROP DEFAULT;
ALTER TYPE match_status RENAME TO match_status_old;
CREATE TYPE match_status AS ENUM ('upcoming', 'in_progress', 'finished');
ALTER TABLE matches ALTER COLUMN match_status TYPE match_status USING match_status::text::match_status;
ALTER TABLE matches ALTER COLUMN match_status SET DEFAULT 'upcoming'::match_status;
DROP TYPE match_status_old;