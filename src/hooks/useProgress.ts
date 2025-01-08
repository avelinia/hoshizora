// src/hooks/useProgress.ts
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNotifications } from '../contexts/NotificationContext';
import type {
    ProgressUpdate,
    BatchProgressUpdate,
    LibraryEntryView
} from '../types/library';
import Database from '@tauri-apps/plugin-sql';

interface ProgressContext {
    previousEntry?: LibraryEntryView;
}

interface BatchProgressContext {
    previousEntries?: Map<string, LibraryEntryView>;
}

let db: Database | null = null;

async function ensureConnection(): Promise<Database> {
    if (!db) {
        db = await Database.load('sqlite:library.db');
    }
    return db;
}

async function updateSingleProgress(
    id: string,
    newProgress: number,
    autoUpdateStatus: boolean,
    updateLastWatched: boolean
): Promise<void> {
    const database = await ensureConnection();
    const now = new Date().toISOString();

    try {
        await database.execute('BEGIN TRANSACTION');

        // Build update query
        const updates = ['progress = ?'];
        const values: any[] = [newProgress];

        if (updateLastWatched) {
            updates.push('last_watched = ?');
            values.push(now);
        }

        updates.push('updated_at = ?');
        values.push(now);
        values.push(id); // for WHERE clause

        // Update progress
        await database.execute(
            `UPDATE library_entries 
             SET ${updates.join(', ')}
             WHERE id = ?`,
            values
        );

        // If auto-updating status, check if we should mark as completed
        if (autoUpdateStatus) {
            const [entry] = (await database.select(
                `SELECT total_episodes FROM library_entries WHERE id = ?`,
                [id]
            )) as { total_episodes: number }[];

            if (entry && entry.total_episodes > 0 && newProgress >= entry.total_episodes) {
                await database.execute(
                    `UPDATE library_entries 
                     SET status = 'completed', 
                         completed_date = ?,
                         updated_at = ?
                     WHERE id = ?`,
                    [now, now, id]
                );

                // Update collections
                await database.execute(
                    `UPDATE entry_collections 
                     SET collection_id = 'completed', 
                         updated_at = ?
                     WHERE entry_id = ?`,
                    [now, id]
                );
            }
        }

        await database.execute('COMMIT');
    } catch (error) {
        await database.execute('ROLLBACK');
        throw error;
    }
}


export function useUpdateProgress() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation<void, Error, ProgressUpdate, ProgressContext>({
        mutationFn: async ({ id, newProgress, autoUpdateStatus = true, updateLastWatched = true }) => {
            await updateSingleProgress(id, newProgress, autoUpdateStatus, updateLastWatched);
        },
        onMutate: async ({ id, newProgress, updateLastWatched }) => {
            await queryClient.cancelQueries({ queryKey: ['libraryEntry', id] });
            const previousEntry = queryClient.getQueryData<LibraryEntryView>(['libraryEntry', id]);

            queryClient.setQueryData<LibraryEntryView | undefined>(
                ['libraryEntry', id],
                old => old ? {
                    ...old,
                    progress: newProgress,
                    last_watched: updateLastWatched ? new Date().toISOString() : old.last_watched
                } : undefined
            );

            return { previousEntry };
        },
        onError: (_, variables, context) => {
            if (context?.previousEntry) {
                queryClient.setQueryData(['libraryEntry', variables.id], context.previousEntry);
            }
            addNotification({
                type: 'error',
                title: 'Failed to Update',
                message: 'Could not update progress'
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            addNotification({
                type: 'success',
                title: 'Progress Updated',
                message: `Progress updated to episode ${variables.newProgress}`
            });
        }
    });
}

export function useBatchUpdateProgress() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation<void, Error, BatchProgressUpdate[], BatchProgressContext>({
        mutationFn: async (updates) => {
            const database = await ensureConnection();

            try {
                await database.execute('BEGIN TRANSACTION');

                for (const update of updates) {
                    await updateSingleProgress(
                        update.id,
                        update.progress,
                        true,  // autoUpdateStatus
                        true   // updateLastWatched
                    );
                }

                await database.execute('COMMIT');
            } catch (error) {
                await database.execute('ROLLBACK');
                throw error;
            }
        },
        onMutate: async (updates) => {
            const previousEntries = new Map<string, LibraryEntryView>();

            for (const update of updates) {
                await queryClient.cancelQueries({ queryKey: ['libraryEntry', update.id] });
                const entry = queryClient.getQueryData<LibraryEntryView>(['libraryEntry', update.id]);
                if (entry) previousEntries.set(update.id, entry);

                queryClient.setQueryData<LibraryEntryView | undefined>(
                    ['libraryEntry', update.id],
                    old => old ? {
                        ...old,
                        progress: update.progress,
                        last_watched: new Date().toISOString()
                    } : undefined
                );
            }

            return { previousEntries };
        },
        onError: (_, __, context) => {
            // Revert all optimistic updates
            context?.previousEntries?.forEach((entry, id) => {
                queryClient.setQueryData(['libraryEntry', id], entry);
            });

            addNotification({
                type: 'error',
                title: 'Failed to Update',
                message: 'Could not update progress'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            addNotification({
                type: 'success',
                title: 'Progress Updated',
                message: 'Updated progress for all episodes'
            });
        }
    });
}

export function useUpdateTotalEpisodes() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotifications();

    return useMutation<void, Error, { id: string; totalEpisodes: number }>({
        mutationFn: async ({ id, totalEpisodes }) => {
            const database = await ensureConnection();
            const now = new Date().toISOString();

            try {
                await database.execute('BEGIN TRANSACTION');

                // Update total episodes
                await database.execute(
                    `UPDATE library_entries 
                     SET total_episodes = ?,
                         updated_at = ?
                     WHERE id = ?`,
                    [totalEpisodes, now, id]
                );

                // Get current progress to check if we should update status
                const [entry] = await database.select<[{ progress: number }]>(
                    'SELECT progress FROM library_entries WHERE id = ?',
                    [id]
                );

                // If progress matches or exceeds new total, mark as completed
                if (entry && entry.progress >= totalEpisodes) {
                    await database.execute(
                        `UPDATE library_entries 
                         SET status = 'completed',
                             completed_date = ?,
                             updated_at = ?
                         WHERE id = ?`,
                        [now, now, id]
                    );

                    // Update collections
                    await database.execute(
                        `UPDATE entry_collections 
                         SET collection_id = 'completed',
                             updated_at = ?
                         WHERE entry_id = ?`,
                        [now, id]
                    );
                }

                await database.execute('COMMIT');
            } catch (error) {
                await database.execute('ROLLBACK');
                throw error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['library'] });
            queryClient.invalidateQueries({ queryKey: ['libraryEntry', variables.id] });

            addNotification({
                type: 'success',
                title: 'Episodes Updated',
                message: `Total episodes updated to ${variables.totalEpisodes}`
            });
        },
        onError: (error) => {
            console.error('Failed to update total episodes:', error);
            addNotification({
                type: 'error',
                title: 'Update Failed',
                message: 'Could not update total episodes'
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