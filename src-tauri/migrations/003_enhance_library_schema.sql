-- Create new history tracking table
CREATE TABLE IF NOT EXISTS watch_history (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    episode_number INTEGER NOT NULL,
    timestamp TEXT NOT NULL, -- ISO8601 timestamp
    duration INTEGER NOT NULL, -- duration in seconds
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced_at TEXT,
    FOREIGN KEY (entry_id) REFERENCES library_entries(id) ON DELETE CASCADE
);

-- Add new columns to collections
ALTER TABLE collections ADD COLUMN description TEXT;
ALTER TABLE collections ADD COLUMN visibility TEXT DEFAULT 'private';

-- Create new tables with constraints
CREATE TABLE IF NOT EXISTS user_preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS library_statistics (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('watch_time', 'completion_rate', 'rating_distribution', 'activity')),
    value TEXT NOT NULL,
    calculated_at TEXT NOT NULL
);

-- Add new columns to library_entries
ALTER TABLE library_entries ADD COLUMN created_at TEXT;

-- Add new indices
CREATE INDEX IF NOT EXISTS idx_history_entry_id ON watch_history(entry_id);
CREATE INDEX IF NOT EXISTS idx_history_timestamp ON watch_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_entries_rating ON library_entries(rating);
CREATE INDEX IF NOT EXISTS idx_entries_progress ON library_entries(progress);
CREATE INDEX IF NOT EXISTS idx_entries_title ON library_entries(title);
CREATE INDEX IF NOT EXISTS idx_entries_created ON library_entries(created_at);

-- Create a trigger to enforce valid progress values
CREATE TRIGGER IF NOT EXISTS check_valid_progress
BEFORE UPDATE ON library_entries
BEGIN
    SELECT CASE
        WHEN NEW.progress < 0 THEN
            RAISE(ABORT, 'Progress cannot be negative')
        WHEN NEW.total_episodes > 0 AND NEW.progress > NEW.total_episodes THEN
            RAISE(ABORT, 'Progress cannot exceed total episodes')
        ELSE NULL
    END;
END;

-- Create a trigger to enforce valid status values
CREATE TRIGGER IF NOT EXISTS check_valid_status
BEFORE INSERT ON library_entries
WHEN NEW.status NOT IN ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch')
BEGIN
    SELECT RAISE(ABORT, 'Invalid status value');
END;

-- Create a trigger to enforce valid rating values
CREATE TRIGGER IF NOT EXISTS check_valid_rating
BEFORE UPDATE OF rating ON library_entries
WHEN NEW.rating IS NOT NULL AND (NEW.rating < 0 OR NEW.rating > 10)
BEGIN
    SELECT RAISE(ABORT, 'Rating must be between 0 and 10');
END;

-- Create a trigger to enforce valid collection visibility
CREATE TRIGGER IF NOT EXISTS check_valid_visibility
BEFORE UPDATE OF visibility ON collections
WHEN NEW.visibility NOT IN ('private', 'public')
BEGIN
    SELECT RAISE(ABORT, 'Visibility must be either private or public');
END;