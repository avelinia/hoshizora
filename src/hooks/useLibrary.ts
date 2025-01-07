// src/hooks/useLibrary.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    initializeDatabase,
    addToLibrary,
    updateLibraryEntry,
    removeFromLibrary,
    getCollectionEntries,
    getLibraryStatistics,
    getLibraryEntry,
    getLibraryEntryByAnimeId,
    type LibraryEntry,
    type LibraryEntryView,
    type LibraryStatistics,
    type GetCollectionOptions,
    type CollectionResult,
} from '../database/library';

const DB_INIT_KEY = ['database', 'initialized'];

// Helper function to invalidate all library-related queries
function invalidateLibraryQueries(queryClient: any, animeId?: string) {
    console.log('Invalidating library queries, animeId:', animeId);

    // Invalidate all library collections
    queryClient.invalidateQueries({ queryKey: ['library', 'collection'] });

    // Invalidate library statistics
    queryClient.invalidateQueries({ queryKey: ['library', 'statistics'] });

    // Invalidate specific anime entry if provided
    if (animeId) {
        queryClient.invalidateQueries({ queryKey: ['libraryEntry', animeId] });
    }

    // Force refetch of collections and statistics
    queryClient.refetchQueries({ queryKey: ['library', 'collection'] });
    queryClient.refetchQueries({ queryKey: ['library', 'statistics'] });
}

export function useInitializeDatabase() {
    return useQuery({
        queryKey: DB_INIT_KEY,
        queryFn: async () => {
            await initializeDatabase();
            return true;
        },
        staleTime: Infinity,
        gcTime: Infinity,
        retry: 2
    });
}

export function useLibraryCollection(collectionId: string, options: GetCollectionOptions = {}) {
    const { isSuccess: isDbInitialized } = useInitializeDatabase();

    return useQuery<CollectionResult>({
        queryKey: ['library', 'collection', collectionId, options],
        queryFn: async () => {
            try {
                const result = await getCollectionEntries(collectionId, options);
                console.log('Library entries:', result);
                return result;
            } catch (error) {
                console.error('Error fetching library collection:', error);
                throw error;
            }
        },
        enabled: isDbInitialized
    });
}

export function useLibraryStatistics() {
    const { isSuccess: isDbInitialized } = useInitializeDatabase();

    return useQuery<LibraryStatistics>({
        queryKey: ['library', 'statistics'],
        queryFn: getLibraryStatistics,
        enabled: isDbInitialized
    });
}

export function useLibraryEntry(animeId: string | undefined) {
    const { isSuccess: isDbInitialized } = useInitializeDatabase();

    return useQuery<LibraryEntryView | null>({
        queryKey: ['libraryEntry', animeId],
        queryFn: () => animeId ? getLibraryEntry(animeId) : null,
        enabled: isDbInitialized && !!animeId
    });
}

export function useLibraryEntryByAnimeId(animeId: string | undefined) {
    const { isSuccess: isDbInitialized } = useInitializeDatabase();

    return useQuery({
        queryKey: ['libraryEntry', animeId],
        queryFn: () => animeId ? getLibraryEntryByAnimeId(animeId) : null,
        enabled: isDbInitialized && !!animeId,
        staleTime: 0
    });
}

export function useAddToLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (entry: Parameters<typeof addToLibrary>[0]) => {
            const result = await addToLibrary(entry);
            return { id: result, animeId: entry.anime_id };
        },
        onSuccess: (result) => {
            invalidateLibraryQueries(queryClient, result.animeId);
        },
        onError: (error) => {
            console.error('Failed to add to library:', error);
        }
    });
}

export function useUpdateLibraryEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: { id: string; updates: Partial<LibraryEntry> }) => {
            await updateLibraryEntry(params.id, params.updates);
            return params;
        },
        onSuccess: (params) => {
            invalidateLibraryQueries(queryClient);
            // Invalidate the specific entry query
            queryClient.invalidateQueries({ queryKey: ['libraryEntry', params.id] });
        },
        onError: (error) => {
            console.error('Failed to update library entry:', error);
        }
    });
}

export function useRemoveFromLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            // First get the entry to have access to the anime_id
            const entry = await getLibraryEntryByAnimeId(id);
            await removeFromLibrary(id);
            return { id, animeId: entry?.anime_id };
        },
        onSuccess: (result) => {
            // Forcefully invalidate all library-related queries
            queryClient.invalidateQueries({ queryKey: ['library'] });
            if (result.animeId) {
                // Additionally invalidate the specific anime entry
                queryClient.invalidateQueries({ queryKey: ['libraryEntry', result.animeId] });
            }

            // Force refetch of the collection queries
            queryClient.refetchQueries({ queryKey: ['library', 'collection'] });
            queryClient.refetchQueries({ queryKey: ['library', 'statistics'] });
        },
        onError: (error) => {
            console.error('Failed to remove from library:', error);
        }
    });
}