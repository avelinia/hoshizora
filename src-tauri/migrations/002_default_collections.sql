-- src-tauri/migrations/002_default_collections.sql
INSERT OR IGNORE INTO collections (id, name, icon, is_default, ordinal, updated_at) 
VALUES 
    ('all', 'All', 'library', 1, 0, datetime('now')),
    ('watching', 'Currently Watching', 'play', 1, 1, datetime('now')),
    ('completed', 'Completed', 'check', 1, 2, datetime('now')),
    ('on_hold', 'On Hold', 'pause', 1, 3, datetime('now')),
    ('dropped', 'Dropped', 'x', 1, 4, datetime('now')),
    ('plan_to_watch', 'Plan to Watch', 'clock', 1, 5, datetime('now'));