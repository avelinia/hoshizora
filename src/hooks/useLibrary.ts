// src/hooks/useLibrary.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../contexts/NotificationContext';
import type {
    AddLibraryEntry,
    LibraryEntryView,
    GetCollectionOptions,
    CollectionResult,
    LibraryStatistics,
    LibraryEntryUpdate
} from '../types/library';
import {
    initializeDatabase,
    addToLibrary,
    updateLibraryEntry,
    removeFromLibrary,
    getLibraryEntryByAnimeId,
    getCollectionEntries,
    getLibraryStatistics
} from '../database/library';


// Initialize database on app start
initializeDatabase().catch(console.error);

export function useLibraryEntry(animeId: string | undefined) {
    return useQuery<LibraryEntryView | null>({
        queryKey: ['libraryEntry', animeId],
        queryFn: () => animeId ? getLibraryEntryByAnimeId(animeId) : null,
        enabled: !!animeId,
        staleTime: 0 // Always fetch fresh data
    });
}

const getAllLibraryQueryKeys = () => [
    ['library'],
    ['libraryEntry'],
    ['library', 'collection'],
    ['library', 'statistics']
];

export function useAddToLibrary() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation<string, Error, AddLibraryEntry>({
        mutationFn: addToLibrary,
        onSuccess: () => {
            // Invalidate all library-related queries
            getAllLibraryQueryKeys().forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
        onError: (error) => {
            console.error('Failed to add to library:', error);
            addNotification({
                type: 'error',
                title: 'Failed to Add',
                message: 'There was an error adding to your library'
            });
        }
    });
}

export function useUpdateLibraryEntry() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: LibraryEntryUpdate }) => {
            await updateLibraryEntry(id, updates);
            return { id, updates };
        },
        onSuccess: () => {
            // Invalidate all library-related queries
            getAllLibraryQueryKeys().forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
        onError: (error) => {
            console.error('Failed to update entry:', error);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: 'There was an error updating the entry'
            });
        }
    });
}

export function useRemoveFromLibrary() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation({
        mutationFn: removeFromLibrary,
        onSuccess: () => {
            getAllLibraryQueryKeys().forEach(key => {
                queryClient.invalidateQueries({ queryKey: key });
            });
        },
        onError: (error) => {
            console.error('Failed to remove entry:', error);
            addNotification({
                type: 'error',
                title: 'Remove Failed',
                message: 'There was an error removing the entry'
            });
        }
    });
}

export function useLibraryCollection(collectionId: string, options: GetCollectionOptions = {}) {
    return useQuery<CollectionResult>({
        queryKey: ['library', 'collection', collectionId, options],
        queryFn: async () => {
            // For "all" collection, get entries from all collections
            if (collectionId === 'all') {
                const collections = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'];
                const results = await Promise.all(
                    collections.map(id => getCollectionEntries(id, options))
                );

                // Combine all entries and remove duplicates
                const allEntries = results.flatMap(result => result.entries);
                const uniqueEntries = [...new Map(allEntries.map(entry => [entry.id, entry])).values()];

                // Sort combined entries if needed
                if (options.sortBy) {
                    uniqueEntries.sort((a, b) => {
                        const aValue = a[options.sortBy!];
                        const bValue = b[options.sortBy!];

                        // Handle null values in sorting
                        if (aValue === null && bValue === null) return 0;
                        if (aValue === null) return 1;  // Null values go last
                        if (bValue === null) return -1;

                        // Convert to strings for comparison if values are different types
                        const aString = aValue.toString();
                        const bString = bValue.toString();

                        const comparison = aString < bString ? -1 : aString > bString ? 1 : 0;
                        return options.sortOrder === 'desc' ? -comparison : comparison;
                    });
                }

                return {
                    entries: uniqueEntries,
                    total: uniqueEntries.length,
                    hasNextPage: false
                };
            }

            return getCollectionEntries(collectionId, options);
        },
        staleTime: 0 // Always fetch fresh data
    });
}

export function useLibraryStatistics() {
    return useQuery<LibraryStatistics>({
        queryKey: ['library', 'statistics'],
        queryFn: getLibraryStatistics,
        staleTime: 0
    });
}


export {
    useUpdateProgress,
    useBatchUpdateProgress
} from './useProgress';