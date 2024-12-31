-- src-tauri/migrations/001_initial_schema.sql
CREATE TABLE IF NOT EXISTS library_entries (
    id TEXT PRIMARY KEY,
    anime_id TEXT NOT NULL,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    total_episodes INTEGER NOT NULL DEFAULT 0,
    last_watched TEXT,
    start_date TEXT,
    completed_date TEXT,
    rating INTEGER,
    notes TEXT,
    updated_at TEXT NOT NULL,
    synced_at TEXT,
    UNIQUE(anime_id)
);

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    ordinal INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    synced_at TEXT,
    UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    updated_at TEXT NOT NULL,
    synced_at TEXT,
    UNIQUE(name, category)
);

CREATE TABLE IF NOT EXISTS entry_collections (
    entry_id TEXT NOT NULL,
    collection_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced_at TEXT,
    PRIMARY KEY (entry_id, collection_id),
    FOREIGN KEY (entry_id) REFERENCES library_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entry_tags (
    entry_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced_at TEXT,
    PRIMARY KEY (entry_id, tag_id),
    FOREIGN KEY (entry_id) REFERENCES library_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_entries_status ON library_entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_updated ON library_entries(updated_at);
CREATE INDEX IF NOT EXISTS idx_entries_synced ON library_entries(synced_at);