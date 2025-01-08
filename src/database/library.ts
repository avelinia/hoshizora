// src/database/library.ts

import Database from '@tauri-apps/plugin-sql';
import { v4 as uuidv4 } from 'uuid';
import type {
    LibraryEntry,
    LibraryEntryView,
    WatchStatus,
    AddLibraryEntry,
    CollectionResult,
    GetCollectionOptions,
    LibraryStatistics,
    WatchHistoryEntry,
    CreateWatchHistoryEntry,
    UpdateWatchHistoryEntry,
    ProgressUpdate,
    BatchProgressUpdate,
    TotalEpisodesUpdate
} from '../types/library';

// Database connection
let db: Database | null = null;

// Initialize database
export async function initializeDatabase(): Promise<void> {
    if (db) return;

    try {
        db = await Database.load('sqlite:library.db');
        await db.execute(`
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            
            CREATE TABLE IF NOT EXISTS library_entries (
                id TEXT PRIMARY KEY,
                anime_id TEXT NOT NULL,
                title TEXT NOT NULL,
                image TEXT NOT NULL,
                status TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                total_episodes INTEGER DEFAULT 0,
                last_watched TEXT,
                start_date TEXT,
                completed_date TEXT,
                rating INTEGER,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS entry_collections (
                entry_id TEXT NOT NULL,
                collection_id TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (entry_id, collection_id),
                FOREIGN KEY (entry_id) REFERENCES library_entries(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS watch_history (
                id TEXT PRIMARY KEY,
                entry_id TEXT NOT NULL,
                episode_number INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                duration INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (entry_id) REFERENCES library_entries(id) ON DELETE CASCADE
            );
        `);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        db = null;
        throw error;
    }
}

export async function removeFromLibrary(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute('DELETE FROM library_entries WHERE id = ?', [id]);
}

export async function updateTotalEpisodes({ id, totalEpisodes }: TotalEpisodesUpdate): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    const now = new Date().toISOString();
    await db.execute(
        'UPDATE library_entries SET total_episodes = ?, updated_at = ? WHERE id = ?',
        [totalEpisodes, now, id]
    );
}

// Library entries
export async function addToLibrary(entry: Omit<AddLibraryEntry, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.execute(
        `INSERT INTO library_entries (
            id, anime_id, title, image, status, progress, total_episodes,
            rating, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, entry.anime_id, entry.title, entry.image, entry.status,
            entry.progress, entry.total_episodes, entry.rating || null,
            entry.notes || '', now, now
        ]
    );

    await db.execute(
        `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
         VALUES (?, ?, ?)`,
        [id, entry.status, now]
    );

    return id;
}

export async function updateLibraryEntry(id: string, updates: Partial<LibraryEntry>): Promise<void> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const setClauses: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
            setClauses.push(`${key} = ?`);
            values.push(value);
        }
    });

    setClauses.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (setClauses.length > 0) {
        await db.execute(
            `UPDATE library_entries 
             SET ${setClauses.join(', ')}
             WHERE id = ?`,
            values
        );
    }

    if (updates.status) {
        await db.execute(
            `UPDATE entry_collections 
             SET collection_id = ?, updated_at = ?
             WHERE entry_id = ?`,
            [updates.status, now, id]
        );
    }
}

export async function getLibraryEntry(id: string): Promise<LibraryEntryView | null> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const results = await db.select<LibraryEntryView[]>(
        `SELECT e.*, c.collection_id
         FROM library_entries e
         LEFT JOIN entry_collections c ON e.id = c.entry_id
         WHERE e.id = ?`,
        [id]
    );

    return results[0] || null;
}

export async function getLibraryEntryByAnimeId(animeId: string): Promise<LibraryEntryView | null> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const results = await db.select<LibraryEntryView[]>(
        `SELECT e.*, c.collection_id
         FROM library_entries e
         LEFT JOIN entry_collections c ON e.id = c.entry_id
         WHERE e.anime_id = ?`,
        [animeId]
    );

    return results[0] || null;
}

export async function updateProgress({ id, newProgress, autoUpdateStatus, updateLastWatched }: ProgressUpdate): Promise<void> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const updates: string[] = ['progress = ?', 'updated_at = ?'];
    const values: any[] = [newProgress, now];

    if (updateLastWatched) {
        updates.push('last_watched = ?');
        values.push(now);
    }

    values.push(id);

    await db.execute(
        `UPDATE library_entries 
         SET ${updates.join(', ')}
         WHERE id = ?`,
        values
    );

    if (autoUpdateStatus) {
        const entry = await getLibraryEntry(id);
        if (entry && entry.total_episodes > 0 && newProgress >= entry.total_episodes) {
            await updateLibraryEntry(id, { status: 'completed' });
        }
    }
}

export async function batchUpdateProgress(updates: BatchProgressUpdate[]): Promise<void> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    for (const update of updates) {
        await updateProgress({
            id: update.id,
            newProgress: update.progress,
            autoUpdateStatus: true,
            updateLastWatched: true
        });
    }
}

// Watch history
export async function addWatchHistoryEntry(entry: CreateWatchHistoryEntry): Promise<string> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.execute(
        `INSERT INTO watch_history (
            id, entry_id, episode_number, timestamp, duration,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            entry.entry_id,
            entry.episode_number,
            entry.timestamp || now,
            entry.duration,
            now,
            now
        ]
    );

    return id;
}

export async function getWatchHistory(entryId: string): Promise<WatchHistoryEntry[]> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    return db.select<WatchHistoryEntry[]>(
        `SELECT * FROM watch_history
         WHERE entry_id = ?
         ORDER BY timestamp DESC`,
        [entryId]
    );
}

export async function updateWatchHistoryEntry(
    id: string,
    updates: UpdateWatchHistoryEntry
): Promise<void> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.duration !== undefined) {
        setClauses.push('duration = ?');
        values.push(updates.duration);
    }
    if (updates.timestamp !== undefined) {
        setClauses.push('timestamp = ?');
        values.push(updates.timestamp);
    }

    if (setClauses.length === 0) return;

    setClauses.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    await db.execute(
        `UPDATE watch_history
         SET ${setClauses.join(', ')}
         WHERE id = ?`,
        values
    );
}

// Collections
export async function getCollectionEntries(
    collectionId: string,
    options: GetCollectionOptions = {}
): Promise<CollectionResult> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const { sortBy = 'updated_at', sortOrder = 'desc' } = options;

    const results = await db.select<LibraryEntryView[]>(
        `SELECT e.*, c.collection_id
         FROM library_entries e
         JOIN entry_collections c ON e.id = c.entry_id
         WHERE c.collection_id = ?
         ORDER BY e.${sortBy} ${sortOrder}`,
        [collectionId]
    );

    return {
        entries: results,
        total: results.length,
        hasNextPage: false
    };
}

// Statistics
export async function getLibraryStatistics(): Promise<LibraryStatistics> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const results = await db.select<Array<{ status: WatchStatus; count: number }>>(
        `SELECT collection_id as status, COUNT(*) as count
         FROM entry_collections
         GROUP BY collection_id`
    );

    const stats: LibraryStatistics = {
        total: 0,
        watching: 0,
        completed: 0,
        onHold: 0,
        dropped: 0,
        planToWatch: 0
    };

    results.forEach(({ status, count }) => {
        stats.total += count;
        switch (status) {
            case 'watching': stats.watching = count; break;
            case 'completed': stats.completed = count; break;
            case 'on_hold': stats.onHold = count; break;
            case 'dropped': stats.dropped = count; break;
            case 'plan_to_watch': stats.planToWatch = count; break;
        }
    });

    return stats;
}

export async function cleanup(): Promise<void> {
    if (db) {
        try {
            await db.close();
        } catch (e) {
            console.error('Error closing database:', e);
        }
        db = null;
    }
}