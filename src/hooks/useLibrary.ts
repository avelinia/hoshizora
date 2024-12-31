// src/hooks/useLibrary.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    initializeDatabase,
    addToLibrary,
    updateLibraryEntry,
    removeFromLibrary,
    getCollectionEntries,
    getLibraryStatistics,
    type LibraryEntry,
    type LibraryStatistics,
    type GetCollectionOptions,
    type CollectionResult,
} from '../database/library';

// Initialize database when the app starts
initializeDatabase().catch(console.error);

export function useLibraryCollection(collectionId: string, options?: GetCollectionOptions) {
    return useQuery<CollectionResult>({
        queryKey: ['library', 'collection', collectionId, options],
        queryFn: () => getCollectionEntries(collectionId, options)
    });
}

export function useLibraryStatistics() {
    return useQuery<LibraryStatistics>({
        queryKey: ['library', 'statistics'],
        queryFn: getLibraryStatistics
    });
}

export function useAddToLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addToLibrary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        }
    });
}

export function useUpdateLibraryEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { id: string; updates: Partial<LibraryEntry> }) =>
            updateLibraryEntry(params.id, params.updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        }
    });
}

export function useRemoveFromLibrary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeFromLibrary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
        }
    });
}