// src/hooks/useProgress.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    updateProgress,
    batchUpdateProgress,
    updateTotalEpisodes,
    type BatchProgressUpdate,
    type LibraryEntry
} from '../database/library';

interface UpdateTotalEpisodesVariables {
    id: string;
    totalEpisodes: number;
}

export function useUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateProgress,
        onMutate: async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: ['library', 'entry', variables.id]
            });

            // Snapshot the previous value
            const previousEntry = queryClient.getQueryData<LibraryEntry>(
                ['library', 'entry', variables.id]
            );

            // Optimistically update the cache
            queryClient.setQueryData<LibraryEntry | undefined>(
                ['library', 'entry', variables.id],
                (old) => old ? {
                    ...old,
                    progress: variables.newProgress,
                    last_watched: variables.updateLastWatched ? new Date().toISOString() : old.last_watched
                } : undefined
            );

            return { previousEntry };
        },
        onError: (_, variables, context) => {
            // Revert the optimistic update on error
            if (context?.previousEntry) {
                queryClient.setQueryData(
                    ['library', 'entry', variables.id],
                    context.previousEntry
                );
            }
        },
        onSettled: (_, __, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['library', 'entry', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['library', 'statistics'] });
            queryClient.invalidateQueries({ queryKey: ['library', 'collection'] });
        }
    });
}

export function useBatchUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: batchUpdateProgress,
        onMutate: async (updates: BatchProgressUpdate[]) => {
            // Cancel outgoing refetches for all affected entries
            await Promise.all(
                updates.map(update =>
                    queryClient.cancelQueries({
                        queryKey: ['library', 'entry', update.id]
                    })
                )
            );

            // Snapshot previous values
            const previousEntries = new Map<string, LibraryEntry>();
            updates.forEach(update => {
                const entry = queryClient.getQueryData<LibraryEntry>(
                    ['library', 'entry', update.id]
                );
                if (entry) previousEntries.set(update.id, entry);
            });

            // Optimistically update cache
            updates.forEach(update => {
                queryClient.setQueryData<LibraryEntry | undefined>(
                    ['library', 'entry', update.id],
                    (old) => old ? {
                        ...old,
                        progress: update.progress,
                        last_watched: new Date().toISOString()
                    } : undefined
                );
            });

            return { previousEntries };
        },
        onError: (_, __, context) => {
            // Revert optimistic updates on error
            if (context?.previousEntries) {
                context.previousEntries.forEach((entry, id) => {
                    queryClient.setQueryData(['library', 'entry', id], entry);
                });
            }
        },
        onSettled: () => {
            // Invalidate all affected queries
            queryClient.invalidateQueries({ queryKey: ['library'] });
        }
    });
}

export function useUpdateTotalEpisodes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, totalEpisodes }: UpdateTotalEpisodesVariables) =>
            updateTotalEpisodes(id, totalEpisodes),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({
                queryKey: ['library', 'entry', variables.id]
            });

            const previousEntry = queryClient.getQueryData<LibraryEntry>(
                ['library', 'entry', variables.id]
            );

            queryClient.setQueryData<LibraryEntry | undefined>(
                ['library', 'entry', variables.id],
                (old) => old ? {
                    ...old,
                    total_episodes: variables.totalEpisodes
                } : undefined
            );

            return { previousEntry };
        },
        onError: (_, variables, context) => {
            if (context?.previousEntry) {
                queryClient.setQueryData(
                    ['library', 'entry', variables.id],
                    context.previousEntry
                );
            }
        },
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['library', 'entry', variables.id]
            });
            queryClient.invalidateQueries({
                queryKey: ['library', 'statistics']
            });
        }
    });
}

// Utility hook to keep track of ongoing mutations
export function useProgressMutations() {
    const queryClient = useQueryClient();

    return {
        isPending: queryClient.isMutating({
            mutationKey: ['progress']
        }) > 0,
        pendingCount: queryClient.isMutating({
            mutationKey: ['progress']
        })
    };
}