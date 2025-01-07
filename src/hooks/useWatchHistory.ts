// src/hooks/useWatchHistory.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addWatchHistoryEntry,
    getWatchHistory,
    updateWatchHistoryEntry,
    deleteWatchHistoryEntry,
    getWatchHistoryStats,
    type UpdateWatchHistoryEntry,
    type WatchHistoryEntry
} from '../database/library';

export function useWatchHistory(entryId: string, options?: { limit?: number; offset?: number }) {
    return useQuery({
        queryKey: ['watchHistory', entryId, options],
        queryFn: () => getWatchHistory(entryId, options),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useWatchHistoryStats(entryId: string) {
    return useQuery({
        queryKey: ['watchHistoryStats', entryId],
        queryFn: () => getWatchHistoryStats(entryId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useAddWatchHistoryEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addWatchHistoryEntry,
        onSuccess: (_, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: ['watchHistory', variables.entry_id]
            });
            queryClient.invalidateQueries({
                queryKey: ['watchHistoryStats', variables.entry_id]
            });
            queryClient.invalidateQueries({
                queryKey: ['library', 'entry', variables.entry_id]
            });
        },
        onError: (error) => {
            console.error('Failed to add watch history entry:', error);
            // You might want to add toast notification here
        }
    });
}

export function useUpdateWatchHistoryEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: {
            id: string;
            updates: UpdateWatchHistoryEntry
        }) => {
            return updateWatchHistoryEntry(id, updates);
        },
        onSuccess: (_, variables) => {
            // Get the entry_id from the cache to invalidate related queries
            const entry = queryClient.getQueryData<WatchHistoryEntry>(
                ['watchHistoryEntry', variables.id]
            );

            if (entry) {
                queryClient.invalidateQueries({
                    queryKey: ['watchHistory', entry.entry_id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['watchHistoryStats', entry.entry_id]
                });
            }
        }
    });
}

export function useDeleteWatchHistoryEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWatchHistoryEntry,
        onSuccess: (_, id) => {
            // Get the entry_id from the cache to invalidate related queries
            const entry = queryClient.getQueryData<WatchHistoryEntry>(
                ['watchHistoryEntry', id]
            );

            if (entry) {
                queryClient.invalidateQueries({
                    queryKey: ['watchHistory', entry.entry_id]
                });
                queryClient.invalidateQueries({
                    queryKey: ['watchHistoryStats', entry.entry_id]
                });
            }
        }
    });
}