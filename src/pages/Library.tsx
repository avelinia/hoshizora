import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Library, Grid, List, Filter, Search, SortDesc, Plus, Star, Clock } from 'lucide-react';
import { useLibraryCollection, useLibraryStatistics } from '../hooks/useLibrary';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyLibrary } from '../components/EmptyLibrary';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'updatedAt' | 'progress' | 'rating';
type SortOrder = 'asc' | 'desc';

export function AnimeLibrary() {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();

    // Local state
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedCollection, setSelectedCollection] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch data
    const { data: libraryData, isLoading } = useLibraryCollection(selectedCollection);

    const { data: statistics } = useLibraryStatistics();

    // Collections data
    const collections = [
        { id: 'all', name: 'All', count: statistics?.total ?? 0 },
        { id: 'watching', name: 'Currently Watching', count: statistics?.watching ?? 0 },
        { id: 'completed', name: 'Completed', count: statistics?.completed ?? 0 },
        { id: 'on_hold', name: 'On Hold', count: statistics?.onHold ?? 0 },
        { id: 'dropped', name: 'Dropped', count: statistics?.dropped ?? 0 },
        { id: 'plan_to_watch', name: 'Plan to Watch', count: statistics?.planToWatch ?? 0 }
    ];

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
                                {statistics?.total ?? 0} titles in your collection
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
                            onClick={() => { }} // TODO: Add sort menu
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
                            onClick={() => { }} // TODO: Add entry modal
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                            style={{
                                backgroundColor: currentTheme.colors.accent.primary,
                                color: currentTheme.colors.background.main
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
                    <div className="w-64 flex-shrink-0">
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
                        {isLoading ? (
                            // Loading state
                            <div>Loading...</div>
                        ) : !libraryData?.entries.length ? (
                            // Empty state
                            <div
                                className="rounded-xl p-8 text-center"
                                style={{ backgroundColor: currentTheme.colors.background.card }}
                            >
                                <EmptyLibrary /> {/* This is where our new animation goes */}
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
                        ) : viewMode === 'grid' ? (
                            // Grid View
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {libraryData.entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="relative group rounded-xl overflow-hidden flex flex-col cursor-pointer"
                                        style={{ backgroundColor: currentTheme.colors.background.card }}
                                        onClick={() => navigate(`/anime/${entry.animeId}`)}
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <img
                                                src={entry.image}
                                                alt={entry.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    background: `linear-gradient(to bottom, transparent 50%, ${currentTheme.colors.background.card} 100%)`,
                                                }}
                                            />
                                        </div>

                                        <div className="p-3 flex-grow flex flex-col">
                                            <div className="flex-grow">
                                                <h3
                                                    className="text-base font-bold line-clamp-2 mb-2"
                                                    style={{ color: currentTheme.colors.text.primary }}
                                                >
                                                    {entry.title}
                                                </h3>
                                                <div className="flex gap-2">
                                                    {entry.rating && (
                                                        <div
                                                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                                            style={{
                                                                backgroundColor: currentTheme.colors.background.hover,
                                                                color: currentTheme.colors.text.secondary
                                                            }}
                                                        >
                                                            <Star size={12} />
                                                            <span>{entry.rating}/10</span>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.background.hover,
                                                            color: currentTheme.colors.text.secondary
                                                        }}
                                                    >
                                                        <Clock size={12} />
                                                        <span>
                                                            {entry.progress}/{entry.totalEpisodes} EP
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // List View
                            // TODO: Implement list view
                            <div>List view coming soon...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Library;