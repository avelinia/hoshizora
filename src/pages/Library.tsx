import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Library, Grid, List, Search, SortDesc, Plus, Star, Clock, Play, Edit, Trash, Pause, Check, X } from 'lucide-react';
import { useLibraryCollection, useLibraryStatistics } from '../hooks/useLibrary';
import { EmptyLibrary } from '../components/EmptyLibrary';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';

type ViewMode = 'grid' | 'list';
type SortField = 'title' | 'updated_at' | 'progress' | 'rating';
type SortOrder = 'asc' | 'desc';

export function AnimeLibrary() {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();

    // Local state
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedCollection, setSelectedCollection] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('updated_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Fetch data with sorting options
    const { data: libraryData, isLoading, error } = useLibraryCollection(selectedCollection, {
        sortBy: sortField,
        sortOrder: sortOrder
    });

    const { data: statistics, isLoading: statsLoading } = useLibraryStatistics();

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
        return (
            <div className="flex items-center justify-center h-full">
                <div style={{ color: currentTheme.colors.accent.primary }}>
                    Failed to load library data: {error.message}
                </div>
            </div>
        );
    }

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
                            <div className="flex items-center justify-center h-64">
                                <LoadingSpinner />
                            </div>
                        ) : !filteredEntries.length ? (
                            // Empty state
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
                        ) : viewMode === 'grid' ? (
                            // Grid View
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                {filteredEntries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="relative group rounded-xl overflow-hidden flex flex-col cursor-pointer"
                                        style={{ backgroundColor: currentTheme.colors.background.card }}
                                        onClick={() => navigate(`/anime/${entry.anime_id}`)}
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
                                                            {entry.progress}/{entry.total_episodes} EP
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
                            <div className="rounded-xl overflow-hidden"
                                style={{ backgroundColor: currentTheme.colors.background.card }}
                            >
                                {/* Headers */}
                                <div className="grid grid-cols-[3fr,1fr,1fr,1fr,100px] gap-4 p-4"
                                >
                                    {[
                                        { label: 'Title', key: 'title' },
                                        { label: 'Progress', key: 'progress' },
                                        { label: 'Status', key: 'status' },
                                        { label: 'Rating', key: 'rating' },
                                        { label: '', key: 'actions' } // Empty label for actions column
                                    ].map((column) => (
                                        column.key !== 'actions' ? (
                                            <button
                                                key={column.key}
                                                onClick={() => {
                                                    if (sortField === column.key) {
                                                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        setSortField(column.key as SortField);
                                                        setSortOrder('asc');
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity duration-200"
                                                style={{ color: currentTheme.colors.text.secondary }}
                                            >
                                                {column.label}
                                                {sortField === column.key && (
                                                    <SortDesc
                                                        size={14}
                                                        className={`transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                                                    />
                                                )}
                                            </button>
                                        ) : <div key={column.key} /> // Empty div for actions column
                                    ))}
                                </div>

                                {/* Entries */}
                                <div className="divide-y-0" style={{ borderColor: currentTheme.colors.background.main }}>
                                    {filteredEntries.map((entry, index) => (
                                        <div
                                            key={entry.id}
                                            className="grid grid-cols-[3fr,1fr,1fr,1fr,100px] gap-4 p-6 items-center hover:bg-black/5 transition-colors duration-200 group relative"
                                            style={{
                                                backgroundColor: index % 2 === 0
                                                    ? currentTheme.colors.background.hover
                                                    : currentTheme.colors.background.card,
                                            }}
                                        >
                                            {/* Title with Image */}
                                            <div className="flex items-center gap-4">
                                                <div className="relative group-hover:scale-105 transition-transform duration-200">
                                                    <img
                                                        src={entry.image}
                                                        alt={entry.title}
                                                        className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                    <div
                                                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                                                        style={{ backgroundColor: `${currentTheme.colors.background.main}90` }}
                                                    >
                                                        <Play
                                                            className="w-6 h-6 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
                                                            style={{ color: currentTheme.colors.text.primary }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <h3
                                                        className="font-medium line-clamp-1 text-base group-hover:opacity-70 transition-opacity duration-200"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        {entry.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span
                                                            className="text-sm"
                                                            style={{ color: currentTheme.colors.text.secondary }}
                                                        >
                                                            {entry.total_episodes} Episodes
                                                        </span>
                                                        {entry.last_watched && (
                                                            <span
                                                                className="text-sm flex items-center gap-1"
                                                                style={{ color: currentTheme.colors.text.secondary }}
                                                            >
                                                                <Clock size={12} />
                                                                {new Date(entry.last_watched).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2 flex-1 rounded-full overflow-hidden"
                                                            style={{ backgroundColor: currentTheme.colors.background.hover }}
                                                        >
                                                            <div
                                                                className="h-full rounded-full transition-all duration-200"
                                                                style={{
                                                                    backgroundColor: currentTheme.colors.accent.primary,
                                                                    width: `${entry.total_episodes ? (entry.progress / entry.total_episodes * 100) : 0}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span
                                                            style={{ color: currentTheme.colors.text.secondary }}
                                                            className="tabular-nums"
                                                        >
                                                            {entry.progress || 0}/{entry.total_episodes || '?'}
                                                        </span>
                                                        <span
                                                            style={{ color: entry.progress === entry.total_episodes && entry.total_episodes > 0 ? '#22c55e' : currentTheme.colors.text.secondary }}
                                                            className="text-xs font-medium"
                                                        >
                                                            {entry.progress === entry.total_episodes && entry.total_episodes > 0
                                                                ? 'COMPLETED'
                                                                : `${Math.round((entry.progress / entry.total_episodes) * 100) || 0}%`
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center justify-start">
                                                {(() => {
                                                    const statusConfig = {
                                                        watching: { icon: Play, color: '#22c55e', label: 'Watching' },
                                                        completed: { icon: Check, color: '#3b82f6', label: 'Completed' },
                                                        on_hold: { icon: Pause, color: '#eab308', label: 'On Hold' },
                                                        plan_to_watch: { icon: Clock, color: '#a855f7', label: 'Plan to Watch' },
                                                        dropped: { icon: X, color: '#ef4444', label: 'Dropped' }
                                                    }[entry.status];

                                                    const StatusIcon = statusConfig.icon;

                                                    return (
                                                        <div
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                                                            style={{
                                                                backgroundColor: `${statusConfig.color}15`,
                                                                color: statusConfig.color
                                                            }}
                                                        >
                                                            <StatusIcon size={14} />
                                                            <span>{statusConfig.label}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="flex items-center gap-1 px-3 py-2 rounded-lg"
                                                    style={{
                                                        backgroundColor: entry.rating
                                                            ? `${currentTheme.colors.accent.primary}15`
                                                            : currentTheme.colors.background.hover
                                                    }}
                                                >
                                                    <Star
                                                        size={14}
                                                        fill={entry.rating ? currentTheme.colors.accent.primary : 'none'}
                                                        style={{
                                                            color: entry.rating
                                                                ? currentTheme.colors.accent.primary
                                                                : currentTheme.colors.text.secondary
                                                        }}
                                                    />
                                                    <span
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: entry.rating
                                                                ? currentTheme.colors.accent.primary
                                                                : currentTheme.colors.text.secondary
                                                        }}
                                                    >
                                                        {entry.rating ? `${entry.rating}/10` : 'Not Rated'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => navigate(`/anime/${entry.anime_id}`)}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                                    style={{
                                                        backgroundColor: currentTheme.colors.accent.primary,
                                                        color: currentTheme.colors.background.main
                                                    }}
                                                    title="Watch Now"
                                                >
                                                    <Play size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {/* Edit entry */ }}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                                                    style={{
                                                        backgroundColor: currentTheme.colors.background.hover,
                                                        color: currentTheme.colors.text.primary
                                                    }}
                                                    title="Edit Entry"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {/* Delete entry */ }}
                                                    className="p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:bg-red-500/10 hover:text-red-500"
                                                    style={{
                                                        backgroundColor: currentTheme.colors.background.hover,
                                                        color: currentTheme.colors.text.primary
                                                    }}
                                                    title="Remove from Library"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default AnimeLibrary;