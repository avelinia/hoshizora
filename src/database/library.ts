// src/database/library.ts
import Database from '@tauri-apps/plugin-sql';
import { v4 as uuidv4 } from 'uuid';

let db: Database | null = null;
let isInitializing = false;
let connectionPromise: Promise<void> | null = null;

async function ensureConnection(): Promise<Database> {
    if (db) return db;

    if (connectionPromise) {
        await connectionPromise;
        if (db) return db;
    }

    if (isInitializing) {
        throw new DatabaseError('Database initialization already in progress');
    }

    isInitializing = true;
    connectionPromise = initializeDatabase();

    try {
        await connectionPromise;
        if (!db) throw new DatabaseError('Failed to initialize database');
        return db;
    } finally {
        isInitializing = false;
        connectionPromise = null;
    }
}

async function withTransaction<T>(
    operation: (database: Database) => Promise<T>
): Promise<T> {
    const database = await ensureConnection();
    let isInTransaction = false;

    try {
        await database.execute('BEGIN TRANSACTION');
        isInTransaction = true;

        const result = await operation(database);

        await database.execute('COMMIT');
        return result;
    } catch (error) {
        if (isInTransaction) {
            try {
                await database.execute('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }
        throw error;
    }
}

export async function cleanup(): Promise<void> {
    if (db) {
        try {
            await db.execute('ROLLBACK');
        } catch (e) {
            // Ignore rollback errors during cleanup
        }
        try {
            await db.close();
        } catch (e) {
            console.error('Error closing database:', e);
        }
        db = null;
    }
}

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
    created_at: string;          // ISO string
    updated_at: string;          // ISO string
    synced_at: string | null;    // ISO string
}

export interface WatchHistoryEntry {
    id: string;
    entry_id: string;
    episode_number: number;
    timestamp: string;           // ISO string
    duration: number;            // seconds
    created_at: string;          // ISO string
    updated_at: string;          // ISO string
    synced_at: string | null;    // ISO string
}

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    visibility: 'private' | 'public';
    is_default: boolean;
    ordinal: number;
    updated_at: string;         // ISO string
    synced_at: string | null;   // ISO string
}

export interface LibraryStatistics {
    total: number;
    watching: number;
    completed: number;
    onHold: number;
    dropped: number;
    planToWatch: number;
    watchTime: number;          // total seconds
    completionRate: number;     // percentage
    averageRating: number;
    totalEpisodes: number;
}

export interface LibraryStatistic {
    id: string;
    type: 'watch_time' | 'completion_rate' | 'rating_distribution' | 'activity';
    value: string;              // JSON string containing the actual data
    calculated_at: string;      // ISO string
}

export interface LibraryEntryView {
    id: string;
    status: string;
    progress: number;
    rating: number;
    notes: string;
}

export class DatabaseError extends Error {
    constructor(message: string, public cause?: unknown) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export async function initializeDatabase(): Promise<void> {
    let retries = 3;
    while (retries > 0) {
        try {
            // Clean up any existing connection
            await cleanup();

            // Open new connection
            db = await Database.load('sqlite:library.db?mode=rwc');

            // Initialize with conservative settings
            await db.execute(`
                PRAGMA journal_mode = WAL;
                PRAGMA busy_timeout = 5000;
                PRAGMA synchronous = NORMAL;
            `);

            // Verify connection is working
            await db.execute('SELECT 1');

            console.log('Database initialized successfully');
            return;
        } catch (error) {
            console.error(`Database initialization attempt failed (${retries} retries left):`, error);
            retries--;
            if (retries === 0) {
                throw new DatabaseError('Database initialization failed after multiple attempts', error);
            }
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

export async function getLibraryStatistics(): Promise<LibraryStatistics> {
    if (!db) throw new Error('Database not initialized');

    // Updated query to properly count entries by status through collections
    const result = await db.select<Array<{ status: WatchStatus; count: number }>>(
        `SELECT c.id as status, COUNT(DISTINCT ec.entry_id) as count 
         FROM collections c
         LEFT JOIN entry_collections ec ON c.id = ec.collection_id
         WHERE c.is_default = 1
         GROUP BY c.id`
    );

    // Get watch time stats with proper joins
    const [watchTimeStats] = await db.select<Array<{
        total_duration: number;
        total_episodes: number;
        avg_rating: number;
    }>>(
        `SELECT 
            COALESCE(SUM(wh.duration), 0) as total_duration,
            COUNT(DISTINCT le.id) as total_episodes,
            AVG(le.rating) as avg_rating
         FROM library_entries le
         LEFT JOIN watch_history wh ON le.id = wh.entry_id
         INNER JOIN entry_collections ec ON le.id = ec.entry_id`
    );

    const stats: LibraryStatistics = {
        total: 0,
        watching: 0,
        completed: 0,
        onHold: 0,
        dropped: 0,
        planToWatch: 0,
        watchTime: watchTimeStats.total_duration,
        totalEpisodes: watchTimeStats.total_episodes,
        completionRate: 0,
        averageRating: watchTimeStats.avg_rating || 0
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

    stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    return stats;
}

export async function getLibraryEntry(animeId: string): Promise<LibraryEntryView | null> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    const entries = await db.select<LibraryEntry[]>(
        `SELECT id, status, progress, rating, notes 
         FROM library_entries WHERE anime_id = ? LIMIT 1`,
        [animeId]
    );

    if (!entries.length) return null;

    // Return only the fields we need
    const entry = entries[0];
    return {
        id: entry.id,
        status: entry.status,
        progress: entry.progress,
        rating: entry.rating || 0, // Convert null to 0
        notes: entry.notes || ''   // Convert null to empty string
    };
}

export async function getLibraryEntryByAnimeId(animeId: string): Promise<LibraryEntry | null> {
    if (!db) await initializeDatabase();
    if (!db) throw new Error('Database not initialized');

    try {
        const results = await db.select<LibraryEntry[]>(
            `SELECT * FROM library_entries WHERE anime_id = ?`,
            [animeId]
        );
        return results[0] || null;
    } catch (error) {
        console.error('Failed to get library entry:', error);
        return null;
    }
}

export async function addToLibrary(entry: Omit<LibraryEntry, "id" | "updated_at" | "synced_at">): Promise<string> {
    if (!db) {
        await initializeDatabase();
    }
    if (!db) {
        throw new Error('Database not initialized');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    let isInTransaction = false;

    try {
        // Start transaction and set flag
        await db.execute('BEGIN TRANSACTION');
        isInTransaction = true;

        // Insert main entry
        await db.execute(
            `INSERT INTO library_entries (
                id, anime_id, title, image, status, progress, total_episodes,
                last_watched, start_date, completed_date, rating, notes, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, entry.anime_id, entry.title, entry.image, entry.status,
                entry.progress, entry.total_episodes, entry.last_watched,
                entry.start_date, entry.completed_date, entry.rating,
                entry.notes, now, now
            ]
        );

        // Add to status collection
        await db.execute(
            `INSERT INTO entry_collections (entry_id, collection_id, updated_at)
             VALUES (?, ?, ?)`,
            [id, entry.status, now]
        );

        // Only commit if we successfully started a transaction
        if (isInTransaction) {
            await db.execute('COMMIT');
        }
        return id;

    } catch (error) {
        // Only rollback if we're in a transaction
        if (isInTransaction) {
            try {
                await db.execute('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }
        throw new DatabaseError('Failed to add library entry', error);
    }
}

export async function updateLibraryEntry(id: string, updates: Partial<LibraryEntry>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (!Object.keys(updates).length) return;

    try {
        await db.execute('BEGIN TRANSACTION');

        const now = new Date().toISOString();
        const setClauses: string[] = [];
        const values: any[] = [];

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== 'id' && key !== 'updated_at' && key !== 'synced_at') {
                setClauses.push(`${key} = ?`);
                values.push(value);
            }
        });

        setClauses.push('updated_at = ?');
        values.push(now);
        values.push(id);

        // Update main entry
        await db.execute(
            `UPDATE library_entries 
             SET ${setClauses.join(', ')}
             WHERE id = ?`,
            values
        );

        // Update collections if status changed
        if (updates.status) {
            // Remove from all status collections
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

        await db.execute('COMMIT');
    } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
    }
}

export interface GetCollectionOptions {
    sortBy?: 'title' | 'updated_at' | 'progress' | 'rating' | 'created_at';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    status?: WatchStatus[];
    search?: string;
}

export interface CollectionResult {
    entries: LibraryEntry[];
    total: number;
    hasNextPage: boolean;
}

export interface CreateWatchHistoryEntry {
    entry_id: string;
    episode_number: number;
    duration: number;
    timestamp?: string;  // Optional, will default to now
}

export interface UpdateWatchHistoryEntry {
    duration?: number;
    timestamp?: string;
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
        limit = 20,
        search
    } = options;

    const offset = (page - 1) * limit;
    const params: any[] = [];

    let searchWhere = '';
    if (search) {
        searchWhere = 'WHERE le.title LIKE ?';
        params.push(`%${search}%`);
    }

    let query;
    if (collectionId === 'all') {
        // For 'all', just query library_entries directly
        query = `FROM library_entries le ${searchWhere}`;
    } else {
        // For specific collections, join with entry_collections
        query = `FROM library_entries le
                INNER JOIN entry_collections ec ON le.id = ec.entry_id
                WHERE ec.collection_id = ? ${searchWhere ? 'AND ' + searchWhere.substring(6) : ''}`;
        params.unshift(collectionId); // Add collection ID at start of params
    }

    // Log the query for debugging
    console.log('Collection query:', query, 'Params:', params);

    // Get total count
    const [{ total }] = await db.select<[{ total: number }]>(
        `SELECT COUNT(*) as total ${query}`,
        params
    );

    // Get entries
    params.push(limit, offset);
    const entries = await db.select<LibraryEntry[]>(
        `SELECT le.* ${query}
         ORDER BY le.${sortBy} ${sortOrder}
         LIMIT ? OFFSET ?`,
        params
    );

    return {
        entries,
        total,
        hasNextPage: total > offset + limit
    };
}

export async function removeFromLibrary(id: string): Promise<void> {
    return withTransaction(async (database) => {
        // First, delete all watch history entries
        await database.execute(
            'DELETE FROM watch_history WHERE entry_id = ?',
            [id]
        );

        // Delete from entry_collections
        await database.execute(
            'DELETE FROM entry_collections WHERE entry_id = ?',
            [id]
        );

        // Finally, delete the main library entry
        await database.execute(
            'DELETE FROM library_entries WHERE id = ?',
            [id]
        );
    });
}

export async function addWatchHistoryEntry(entry: CreateWatchHistoryEntry): Promise<string> {
    if (!db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const id = uuidv4();

    try {
        await db.execute('BEGIN TRANSACTION');

        // Add history entry
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

        // Update library entry's last_watched and progress
        await db.execute(
            `UPDATE library_entries 
             SET last_watched = ?,
                 progress = MAX(progress, ?),
                 updated_at = ?
             WHERE id = ?`,
            [now, entry.episode_number, now, entry.entry_id]
        );

        await db.execute('COMMIT');
        return id;
    } catch (error) {
        await db.execute('ROLLBACK');
        console.error('Failed to add watch history:', error);
        throw error;
    }
}

export async function getWatchHistory(
    entry_id: string,
    options: { limit?: number; offset?: number } = {}
): Promise<WatchHistoryEntry[]> {
    if (!db) throw new Error('Database not initialized');

    const { limit = 50, offset = 0 } = options;

    try {
        return await db.select<WatchHistoryEntry[]>(
            `SELECT * FROM watch_history 
             WHERE entry_id = ? 
             ORDER BY timestamp DESC
             LIMIT ? OFFSET ?`,
            [entry_id, limit, offset]
        );
    } catch (error) {
        console.error('Failed to get watch history:', error);
        throw error;
    }
}

export async function updateWatchHistoryEntry(
    id: string,
    updates: UpdateWatchHistoryEntry
): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (!Object.keys(updates).length) return;

    const now = new Date().toISOString();
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

    setClauses.push('updated_at = ?');
    values.push(now);

    values.push(id);

    try {
        await db.execute(
            `UPDATE watch_history 
             SET ${setClauses.join(', ')}
             WHERE id = ?`,
            values
        );
    } catch (error) {
        console.error('Failed to update watch history:', error);
        throw error;
    }
}

export async function deleteWatchHistoryEntry(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    try {
        await db.execute('DELETE FROM watch_history WHERE id = ?', [id]);
    } catch (error) {
        console.error('Failed to delete watch history:', error);
        throw error;
    }
}

export async function getWatchHistoryStats(entry_id: string): Promise<{
    totalEpisodes: number;
    totalDuration: number;
    lastWatched: string | null;
    firstWatched: string | null;
}> {
    if (!db) throw new Error('Database not initialized');

    try {
        const [stats] = await db.select<Array<{
            total_episodes: number;
            total_duration: number;
            last_watched: string | null;
            first_watched: string | null;
        }>>(
            `SELECT 
                COUNT(DISTINCT episode_number) as total_episodes,
                SUM(duration) as total_duration,
                MAX(timestamp) as last_watched,
                MIN(timestamp) as first_watched
             FROM watch_history
             WHERE entry_id = ?`,
            [entry_id]
        );

        return {
            totalEpisodes: stats.total_episodes,
            totalDuration: stats.total_duration,
            lastWatched: stats.last_watched,
            firstWatched: stats.first_watched
        };
    } catch (error) {
        console.error('Failed to get watch history stats:', error);
        throw error;
    }
}

export async function pruneWatchHistory(
    entry_id: string,
    options: {
        keepLastN?: number;
        olderThan?: string; // ISO date string
    } = {}
): Promise<number> {
    if (!db) throw new Error('Database not initialized');

    const { keepLastN, olderThan } = options;
    if (!keepLastN && !olderThan) return 0;

    try {
        if (keepLastN) {
            // Get the timestamp of the Nth most recent entry
            const [cutoff] = await db.select<Array<{ timestamp: string }>>(
                `SELECT timestamp
                 FROM watch_history
                 WHERE entry_id = ?
                 ORDER BY timestamp DESC
                 LIMIT 1 OFFSET ?`,
                [entry_id, keepLastN - 1]
            );

            if (cutoff) {
                const result = await db.execute(
                    `DELETE FROM watch_history
                     WHERE entry_id = ?
                     AND timestamp < ?`,
                    [entry_id, cutoff.timestamp]
                );
                return result.rowsAffected;
            }
        } else if (olderThan) {
            const result = await db.execute(
                `DELETE FROM watch_history
                 WHERE entry_id = ?
                 AND timestamp < ?`,
                [entry_id, olderThan]
            );
            return result.rowsAffected;
        }

        return 0;
    } catch (error) {
        console.error('Failed to prune watch history:', error);
        throw error;
    }
}

// src/database/library.ts

interface UpdateProgressOptions {
    id: string;
    newProgress: number;
    autoUpdateStatus?: boolean;
    updateLastWatched?: boolean;
}

export interface BatchProgressUpdate {
    id: string;
    progress: number;
}

export async function updateProgress({
    id,
    newProgress,
    autoUpdateStatus = true,
    updateLastWatched = true
}: UpdateProgressOptions): Promise<void> {
    if (!db) throw new Error('Database not initialized');

    try {
        await db.execute('BEGIN TRANSACTION');

        const [entry] = await db.select<[LibraryEntry]>(
            'SELECT * FROM library_entries WHERE id = ?',
            [id]
        );

        if (!entry) {
            throw new Error('Entry not found');
        }

        // Validate progress
        if (newProgress < 0 || (entry.total_episodes > 0 && newProgress > entry.total_episodes)) {
            throw new Error('Invalid progress value');
        }

        const updates: string[] = ['progress = ?'];
        const values: any[] = [newProgress];

        const now = new Date().toISOString();

        if (updateLastWatched) {
            updates.push('last_watched = ?');
            values.push(now);
        }

        // Auto update status based on progress
        if (autoUpdateStatus) {
            const newStatus = determineStatus(newProgress, entry);
            if (newStatus !== entry.status) {
                updates.push('status = ?');
                values.push(newStatus);

                // Update dates based on status
                if (newStatus === 'watching' && !entry.start_date) {
                    updates.push('start_date = ?');
                    values.push(now);
                } else if (newStatus === 'completed' && !entry.completed_date) {
                    updates.push('completed_date = ?');
                    values.push(now);
                }
            }
        }

        updates.push('updated_at = ?');
        values.push(now);

        // Add the WHERE clause value
        values.push(id);

        await db.execute(
            `UPDATE library_entries 
             SET ${updates.join(', ')}
             WHERE id = ?`,
            values
        );

        await db.execute('COMMIT');
    } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
    }
}

export async function batchUpdateProgress(updates: BatchProgressUpdate[]): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (!updates.length) return;

    try {
        await db.execute('BEGIN TRANSACTION');

        const now = new Date().toISOString();

        for (const update of updates) {
            const [entry] = await db.select<[LibraryEntry]>(
                'SELECT * FROM library_entries WHERE id = ?',
                [update.id]
            );

            if (!entry) continue;

            // Validate progress
            if (update.progress < 0 ||
                (entry.total_episodes > 0 && update.progress > entry.total_episodes)) {
                continue;
            }

            const newStatus = determineStatus(update.progress, entry);

            await db.execute(
                `UPDATE library_entries 
                 SET progress = ?,
                     status = ?,
                     last_watched = ?,
                     updated_at = ?,
                     start_date = CASE 
                         WHEN start_date IS NULL AND ? = 'watching' 
                         THEN ? ELSE start_date END,
                     completed_date = CASE 
                         WHEN completed_date IS NULL AND ? = 'completed' 
                         THEN ? ELSE completed_date END
                 WHERE id = ?`,
                [
                    update.progress,
                    newStatus,
                    now,
                    now,
                    newStatus,
                    now,
                    newStatus,
                    now,
                    update.id
                ]
            );
        }

        await db.execute('COMMIT');
    } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
    }
}

function determineStatus(
    progress: number,
    entry: LibraryEntry
): WatchStatus {
    // If it's already completed, don't change
    if (entry.status === 'completed') {
        return 'completed';
    }

    // If dropped, keep as dropped unless explicitly changed
    if (entry.status === 'dropped') {
        return 'dropped';
    }

    // If entry has total episodes and progress matches, mark as completed
    if (entry.total_episodes > 0 && progress >= entry.total_episodes) {
        return 'completed';
    }

    // If there's any progress, mark as watching
    if (progress > 0) {
        return 'watching';
    }

    // Otherwise, keep current status
    return entry.status;
}

export async function updateTotalEpisodes(
    id: string,
    totalEpisodes: number
): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (totalEpisodes < 0) throw new Error('Total episodes cannot be negative');

    try {
        await db.execute(
            `UPDATE library_entries 
             SET total_episodes = ?,
                 updated_at = ?
             WHERE id = ?`,
            [totalEpisodes, new Date().toISOString(), id]
        );

        // Check if completion status needs to be updated
        const [entry] = await db.select<[LibraryEntry]>(
            'SELECT * FROM library_entries WHERE id = ?',
            [id]
        );

        if (entry && entry.progress >= totalEpisodes) {
            await updateProgress({
                id,
                newProgress: entry.progress,
                autoUpdateStatus: true,
                updateLastWatched: false
            });
        }
    } catch (error) {
        console.error('Failed to update total episodes:', error);
        throw error;
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        cleanup().catch(console.error);
    });
}