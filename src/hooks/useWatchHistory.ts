// src/hooks/useWatchHistory.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WatchHistoryEntry, CreateWatchHistoryEntry, UpdateWatchHistoryEntry } from '../types/library';
import {
    addWatchHistoryEntry,
    getWatchHistory,
    updateWatchHistoryEntry,
    getLibraryEntry
} from '../database/library';
import { useNotifications } from '../contexts/NotificationContext';

export function useWatchHistory(entryId: string) {
    return useQuery<WatchHistoryEntry[]>({
        queryKey: ['watchHistory', entryId],
        queryFn: () => getWatchHistory(entryId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useAddWatchHistoryEntry() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation({
        mutationFn: async (entry: CreateWatchHistoryEntry) => {
            const id = await addWatchHistoryEntry(entry);
            // Also update the library entry's progress
            const libraryEntry = await getLibraryEntry(entry.entry_id);
            if (libraryEntry && entry.episode_number > libraryEntry.progress) {
                await queryClient.invalidateQueries({
                    queryKey: ['libraryEntry', entry.entry_id]
                });
            }
            return { id, entry_id: entry.entry_id };
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({
                queryKey: ['watchHistory', result.entry_id]
            });
            addNotification({
                type: 'success',
                title: 'Progress Saved',
                message: 'Your watch progress has been saved'
            });
        },
        onError: (error) => {
            console.error('Failed to save watch history:', error);
            addNotification({
                type: 'error',
                title: 'Save Failed',
                message: 'Failed to save watch progress'
            });
        }
    });
}

export function useUpdateWatchHistoryEntry() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: UpdateWatchHistoryEntry }) => {
            await updateWatchHistoryEntry(id, updates);
            return { id };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
            addNotification({
                type: 'success',
                title: 'Progress Updated',
                message: 'Watch progress has been updated'
            });
        },
        onError: (error) => {
            console.error('Failed to update watch history:', error);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update watch progress'
            });
        }
    });
}