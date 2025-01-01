// src/database/library.ts
import Database from '@tauri-apps/plugin-sql';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = 'sqlite:library.db';
let db: Database | null = null;

export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

export interface LibraryEntry {
    id: string;
    anime_id: string;
    title: string;
    image: string;
    status: WatchStatus;
    progress: number;
    total_episodes: number;
    last_watched: string | null;  // ISO string
    start_date: string | null;    // ISO string
    completed_date: string | null;// ISO string
    rating: number | null;
    notes: string;
    updated_at: string;          // ISO string
    synced_at: string | null;    // ISO string
}

export interface Collection {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    isDefault: boolean;
    ordinal: number;
    updatedAt: string;         // ISO string
    syncedAt: string | null;   // ISO string
}

export interface LibraryStatistics {
    total: number;
    watching: number;
    completed: number;
    onHold: number;
    dropped: number;
    planToWatch: number;
}

export async function initializeDatabase(): Promise<void> {
    if (db) return;

    try {
        // This will automatically run the migrations
        db = await Database.load(DB_PATH);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw new Error('Database initialization failed');
    }
}

export async function getLibraryStatistics(): Promise<LibraryStatistics> {
    if (!db) throw new Error('Database not initialized');

    const result = await db.select<Array<{ status: WatchStatus; count: number }>>(
        `SELECT status, COUNT(*) as count 
     FROM library_entries 
     GROUP BY status`
    );

    const stats: LibraryStatistics = {
        total: 0,
        watching: 0,
        completed: 0,
        onHold: 0,
        dropped: 0,
        planToWatch: 0
    };

    result.forEach(({ status, count }) => {
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

export async function addToLibrary(entry: Omit<LibraryEntry, 'id' | 'updated_at' | 'synced_at'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();

    try {
        await db.execute('BEGIN TRANSACTION');

        // Insert the entry
        await db.execute(
            `INSERT INTO library_entries (
                id, anime_id, title, image, status, progress, total_episodes,
                last_watched, start_date, completed_date, rating, notes, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, entry.anime_id, entry.title, entry.image, entry.status,
                entry.progress, entry.total_episodes, entry.last_watched,
                entry.start_date, entry.completed_date, entry.rating,
                entry.notes, now
            ]
        );

        // Add to status collection
        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
             VALUES (?, ?, ?)`,
            [id, entry.status, now]
        );

        // Always add to 'all' collection
        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
             VALUES (?, 'all', ?)
             ON CONFLICT(entry_id, collection_id) DO UPDATE SET updated_at = ?`,
            [id, now, now]
        );

        await db.execute('COMMIT');
        return id;
    } catch (error) {
        try {
            await db.execute('ROLLBACK');
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
        }
        throw error;
    }
}

export async function updateLibraryEntry(id: string, updates: Partial<LibraryEntry>): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const entries = Object.entries(updates).filter(([key]) =>
        key !== 'id' && key !== 'updated_at' && key !== 'synced_at'
    );

    if (entries.length === 0) return;

    try {
        await db.execute('BEGIN TRANSACTION');

        const setClauses = entries.map(([key]) => `${key} = ?`);
        const values = entries.map(([, value]) => value);

        await db.execute(
            `UPDATE library_entries 
             SET ${setClauses.join(', ')}, updated_at = ?
             WHERE id = ?`,
            [...values, now, id]
        );

        // Update collection if status changed
        if (updates.status) {
            await db.execute(
                `DELETE FROM entry_collections 
                 WHERE entry_id = ? 
                 AND collection_id IN ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch')`,
                [id]
            );

            // Add to new status collection
            await db.execute(
                `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
                 VALUES (?, ?, ?)`,
                [id, updates.status, now]
            );
        }

        // Ensure entry is in 'all' collection
        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
             VALUES (?, 'all', ?)
             ON CONFLICT(entry_id, collection_id) DO UPDATE SET updated_at = ?`,
            [id, now, now]
        );

        await db.execute('COMMIT');
    } catch (error) {
        try {
            await db.execute('ROLLBACK');
        } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError);
        }
        throw error;
    }
}
export interface GetCollectionOptions {
    sortBy?: 'title' | 'updated_at' | 'progress' | 'rating';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface CollectionResult {
    entries: LibraryEntry[];
    total: number;
}

export async function getCollectionEntries(
    collectionId: string,
    options: GetCollectionOptions = {}
): Promise<CollectionResult> {
    if (!db) throw new Error('Database not initialized');

    const {
        sortBy = 'updated_at',
        sortOrder = 'desc',
        page = 1,
        limit = 20
    } = options;

    const offset = (page - 1) * limit;

    const orderByClause = {
        title: 'e.title',
        updated_at: 'e.updated_at',
        progress: 'e.progress',
        rating: 'e.rating'
    }[sortBy];

    const [entries, totals] = await Promise.all([
        db.select<LibraryEntry[]>(
            `SELECT e.* FROM library_entries e
             INNER JOIN entry_collections ec ON e.id = ec.entry_id
             WHERE ec.collection_id = ?
             ORDER BY ${orderByClause} ${sortOrder}
             LIMIT ? OFFSET ?`,
            [collectionId, limit, offset]
        ),
        db.select<[{ total: number }]>(
            `SELECT COUNT(*) as total 
             FROM library_entries e
             INNER JOIN entry_collections ec ON e.id = ec.entry_id
             WHERE ec.collection_id = ?`,
            [collectionId]
        )
    ]);

    return {
        entries,
        total: totals[0].total
    };
}

export async function removeFromLibrary(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute('DELETE FROM library_entries WHERE id = $1', [id]);
}
