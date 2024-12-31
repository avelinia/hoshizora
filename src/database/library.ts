// src/database/library.ts
import Database from '@tauri-apps/plugin-sql';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = 'sqlite:library.db';
let db: Database | null = null;

export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

export interface LibraryEntry {
    id: string;
    animeId: string;
    title: string;
    image: string;
    status: WatchStatus;
    progress: number;
    totalEpisodes: number;
    lastWatched: string | null;  // ISO string
    startDate: string | null;    // ISO string
    completedDate: string | null;// ISO string
    rating: number | null;
    notes: string;
    updatedAt: string;          // ISO string
    syncedAt: string | null;    // ISO string
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

export async function addToLibrary(entry: Omit<LibraryEntry, 'id' | 'updatedAt' | 'syncedAt'>): Promise<string> {
    if (!db) throw new Error('Database not initialized');

    const id = uuidv4();
    const now = new Date().toISOString();

    // Use a transaction to ensure all operations succeed or fail together
    await db.execute('BEGIN TRANSACTION');

    try {
        await db.execute(
            `INSERT INTO library_entries (
        id, anime_id, title, image, status, progress, total_episodes,
        last_watched, start_date, completed_date, rating, notes, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                id, entry.animeId, entry.title, entry.image, entry.status,
                entry.progress, entry.totalEpisodes, entry.lastWatched,
                entry.startDate, entry.completedDate, entry.rating,
                entry.notes, now
            ]
        );

        // Add to appropriate status collection
        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
       VALUES ($1, $2, $3)`,
            [id, entry.status, now]
        );

        // Add to 'all' collection
        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
       VALUES ($1, 'all', $2)`,
            [id, now]
        );

        await db.execute('COMMIT');
        return id;
    } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
    }
}

export interface GetCollectionOptions {
    sortBy?: 'title' | 'updatedAt' | 'progress' | 'rating';
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
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
    } = options;

    const offset = (page - 1) * limit;

    const orderByClause = {
        title: 'e.title',
        updatedAt: 'e.updated_at',
        progress: 'e.progress',
        rating: 'e.rating'
    }[sortBy];

    const [entries, totals] = await Promise.all([
        db.select<LibraryEntry[]>(
            `SELECT e.* FROM library_entries e
       INNER JOIN entry_collections ec ON e.id = ec.entry_id
       WHERE ec.collection_id = $1
       ORDER BY ${orderByClause} ${sortOrder}
       LIMIT $2 OFFSET $3`,
            [collectionId, limit, offset]
        ),
        db.select<[{ total: number }]>(
            `SELECT COUNT(*) as total 
       FROM library_entries e
       INNER JOIN entry_collections ec ON e.id = ec.entry_id
       WHERE ec.collection_id = $1`,
            [collectionId]
        )
    ]);

    return {
        entries,
        total: totals[0].total
    };
}

export async function updateLibraryEntry(id: string, updates: Partial<LibraryEntry>): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const entries = Object.entries(updates).filter(([key]) =>
        key !== 'id' && key !== 'updatedAt' && key !== 'syncedAt'
    );

    if (entries.length === 0) return;

    const setClauses = entries.map((_, index) =>
        `${snakeCase(_[0])} = $${index + 1}`
    );
    const values = entries.map(([, value]) => value);

    await db.execute(
        `UPDATE library_entries 
     SET ${setClauses.join(', ')}, updated_at = $${values.length + 1}
     WHERE id = $${values.length + 2}`,
        [...values, now, id]
    );

    // Update collection if status changed
    if (updates.status) {
        await db.execute(
            `DELETE FROM entry_collections 
       WHERE entry_id = $1 
       AND collection_id IN ('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch')`,
            [id]
        );

        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
       VALUES ($1, $2, $3)`,
            [id, updates.status, now]
        );
    }
}

export async function removeFromLibrary(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    await db.execute('DELETE FROM library_entries WHERE id = $1', [id]);
}

// Helper function to convert camelCase to snake_case
function snakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}