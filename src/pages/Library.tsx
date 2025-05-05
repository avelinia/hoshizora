// src/pages/Library.tsx
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import { Library, Grid, List, Search, SortDesc, Plus } from 'lucide-react';
import { useLibraryCollection, useLibraryStatistics, useRemoveFromLibrary } from '../hooks/useLibrary';
import { EmptyLibrary } from '../components/EmptyLibrary';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LibraryEntryCard } from '../components/LibraryEntryCard';
import { cleanup } from '../database/library';
import { useNotifications } from '../contexts/NotificationContext';

interface QueryOptions {
    sortBy: 'title' | 'updated_at' | 'progress' | 'rating';
    sortOrder: 'asc' | 'desc';
}

export function AnimeLibrary() {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Local state
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [selectedCollection, setSelectedCollection] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'title' | 'updated_at' | 'progress' | 'rating'>('updated_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const isDark = currentTheme.mode === "dark";
    const { addNotification } = useNotifications();

    // Fetch data with sorting options
    const { data: libraryData, isLoading, error } = useLibraryCollection(selectedCollection, {
        sortBy: sortField,
        sortOrder: sortOrder
    });

    const queryOptions: QueryOptions = {
        sortBy: sortField,
        sortOrder: sortOrder
    };

    useEffect(() => {
        return () => {
            cleanup().catch(console.error);
        };
    }, []);

    const { data: statistics, isLoading: statsLoading } = useLibraryStatistics();
    const { mutate: removeEntry } = useRemoveFromLibrary();

    const handleDeleteEntry = async (entryId: string) => {
        if (confirm('Are you sure you want to remove this entry from your library?')) {
            const entryToDelete = filteredEntries.find(entry => entry.id === entryId);

            if (!entryToDelete) return;

            // Optimistically update the UI
            const previousData = queryClient.getQueryData(['library', 'collection', selectedCollection, queryOptions]);

            queryClient.setQueryData(
                ['library', 'collection', selectedCollection, queryOptions],
                (old: any) => ({
                    ...old,
                    entries: old.entries.filter((entry: any) => entry.id !== entryId),
                    total: Math.max(0, (old.total || 0) - 1)
                })
            );

            try {
                await removeEntry(entryId);
                addNotification({
                    type: 'success',
                    title: 'Removed from Library',
                    message: `"${entryToDelete.title}" has been removed from your library`
                });
            } catch (error) {
                console.error('Failed to delete entry:', error);
                // Revert on failure
                queryClient.setQueryData(
                    ['library', 'collection', selectedCollection, queryOptions],
                    previousData
                );
                addNotification({
                    type: 'error',
                    title: 'Failed to Remove',
                    message: 'There was an error removing the entry. Please try again.'
                });
            }
        }
    };

    // Collections data
    const collections = [
        { id: 'all', name: 'All', count: statistics?.total ?? 0 },
        { id: 'watching', name: 'Currently Watching', count: statistics?.watching ?? 0 },
        { id: 'completed', name: 'Completed', count: statistics?.completed ?? 0 },
        { id: 'on_hold', name: 'On Hold', count: statistics?.onHold ?? 0 },
        { id: 'dropped', name: 'Dropped', count: statistics?.dropped ?? 0 },
        { id: 'plan_to_watch', name: 'Plan to Watch', count: statistics?.planToWatch ?? 0 }
    ];

    // Filter entries based on search query
    const filteredEntries = libraryData?.entries.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

    if (error) {
        console.log(error)
        return (
            <div className="flex items-center justify-center h-full">
                <div style={{ color: currentTheme.colors.accent.primary }}>
                    Failed to load library data: {error.message}
                </div>
            </div>
        );
    }

    const renderEntryCard = (entry: any) => (
        <LibraryEntryCard
            key={entry.id}
            entry={entry}
            view={viewMode}
            onSelect={() => navigate(`/anime/${entry.anime_id}`)}
            onDelete={() => handleDeleteEntry(entry.id)}
        />
    );

    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner />;
        }

        if (!filteredEntries.length) {
            return (
                <div
                    className="rounded-xl p-8 text-center"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                >
                    <EmptyLibrary />
                    <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: currentTheme.colors.text.primary }}
                    >
                        Your Library is Empty
                    </h3>
                    <p
                        className="text-sm mb-6"
                        style={{ color: currentTheme.colors.text.secondary }}
                    >
                        Start building your collection by adding some anime
                    </p>
                    <button
                        className="flex items-center gap-2 px-6 py-3 rounded-xl mx-auto transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: currentTheme.colors.accent.primary,
                            color: currentTheme.colors.background.main
                        }}
                        onClick={() => navigate('/')}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Browse Anime</span>
                    </button>
                </div>
            );
        }

        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {filteredEntries.map(renderEntryCard)}
                </div>
            );
        }

        return (
            <div className="space-y-1">
                {filteredEntries.map(renderEntryCard)}
            </div>
        );
    };

    return (
        <div className="min-h-full w-full p-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: currentTheme.colors.accent.primary }}
                        >
                            <Library className="w-6 h-6" style={{ color: currentTheme.colors.background.main }} />
                        </div>
                        <div>
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: currentTheme.colors.text.primary }}
                            >
                                Library
                            </h1>
                            <p
                                className="text-sm"
                                style={{ color: currentTheme.colors.text.secondary }}
                            >
                                {statsLoading ? 'Loading...' : `${statistics?.total ?? 0} titles in your collection`}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div
                            className="flex rounded-lg p-1"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <button
                                onClick={() => setViewMode('grid')}
                                className="p-2 rounded-lg transition-colors duration-200"
                                style={{
                                    backgroundColor: viewMode === 'grid'
                                        ? currentTheme.colors.background.hover
                                        : 'transparent',
                                    color: currentTheme.colors.text.primary
                                }}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className="p-2 rounded-lg transition-colors duration-200"
                                style={{
                                    backgroundColor: viewMode === 'list'
                                        ? currentTheme.colors.background.hover
                                        : 'transparent',
                                    color: currentTheme.colors.text.primary
                                }}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div
                            className="relative flex items-center rounded-lg px-3 py-2"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <Search className="w-4 h-4 mr-2" style={{ color: currentTheme.colors.text.secondary }} />
                            <input
                                type="text"
                                placeholder="Search library..."
                                className="bg-transparent border-none outline-none w-64"
                                style={{ color: currentTheme.colors.text.primary }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Sort Menu */}
                        <button
                            onClick={() => {
                                // Toggle sort order if clicking the same field
                                if (sortField === 'updated_at') {
                                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                } else {
                                    setSortField('updated_at');
                                    setSortOrder('desc');
                                }
                            }}
                            className="p-2 rounded-lg transition-colors duration-200"
                            style={{
                                backgroundColor: currentTheme.colors.background.card,
                                color: currentTheme.colors.text.primary
                            }}
                        >
                            <SortDesc className="w-4 h-4" />
                        </button>

                        {/* Add to Library */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: currentTheme.colors.accent.primary,
                                color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-medium">Add to Library</span>
                        </button>
                    </div>
                </div>

                {/* Collections and Content */}
                <div className="flex gap-8">
                    {/* Collections Sidebar */}
                    <div className="w-64 shrink-0">
                        <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <div className="space-y-1">
                                {collections.map((collection) => (
                                    <button
                                        key={collection.id}
                                        onClick={() => setSelectedCollection(collection.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200"
                                        style={{
                                            backgroundColor: selectedCollection === collection.id
                                                ? currentTheme.colors.background.hover
                                                : 'transparent',
                                            color: currentTheme.colors.text.primary
                                        }}
                                    >
                                        <span>{collection.name}</span>
                                        <span
                                            className="ml-auto text-sm"
                                            style={{ color: currentTheme.colors.text.secondary }}
                                        >
                                            {collection.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimeLibrary;