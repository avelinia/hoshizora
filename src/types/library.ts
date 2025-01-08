// src/types/library.ts

// Core types
export type WatchStatus = 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';

interface BaseLibraryEntry {
    anime_id: string;
    title: string;
    image: string;
    status: WatchStatus;
    progress: number;
    total_episodes: number;
    rating: number | null;
    notes: string;
    created_at: string;
}

// Full library entry type
export interface LibraryEntry extends BaseLibraryEntry {
    id: string;
    last_watched: string | null;
    start_date: string | null;
    completed_date: string | null;
    updated_at: string;
}

export interface LibraryEntryView extends LibraryEntry {
    collection_id: WatchStatus;
}

export interface LibraryEntryUpdate {
    status?: WatchStatus;
    progress?: number;
    rating?: number | null;
    notes?: string;
}

export interface AddLibraryEntry extends BaseLibraryEntry {
    last_watched?: string | null;
    start_date?: string | null;
    completed_date?: string | null;
}

// Progress types
export interface ProgressUpdate {
    id: string;
    newProgress: number;
    autoUpdateStatus?: boolean;
    updateLastWatched?: boolean;
}

export interface BatchProgressUpdate {
    id: string;
    progress: number;
}

export interface TotalEpisodesUpdate {
    id: string;
    totalEpisodes: number;
}

// Watch history types
export interface WatchHistoryEntry {
    id: string;
    entry_id: string;
    episode_number: number;
    timestamp: string;
    duration: number;
    created_at: string;
    updated_at: string;
}

export interface UpdateWatchHistoryEntry {
    duration?: number;
    timestamp?: string;
}

export interface CreateWatchHistoryEntry {
    entry_id: string;
    episode_number: number;
    duration: number;
    timestamp?: string;
}

export interface CollectionResult {
    entries: LibraryEntryView[];
    total: number;
    hasNextPage: boolean;
}

export interface GetCollectionOptions {
    sortBy?: 'title' | 'updated_at' | 'progress' | 'rating';
    sortOrder?: 'asc' | 'desc';
}

// Statistics types
export interface LibraryStatistics {
    total: number;
    watching: number;
    completed: number;
    onHold: number;
    dropped: number;
    planToWatch: number;
}