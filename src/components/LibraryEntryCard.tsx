// src/components/LibraryEntryCard.tsx
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUpdateProgress } from '../hooks/useProgress';
import {
    Play, Star, Clock, Edit, Trash, Pause, Check, X,
    Plus, Minus
} from 'lucide-react';
import type { LibraryEntry } from '../database/library';
import { motion } from 'framer-motion';
import { LibraryEntryModal } from './LibraryEntryModal';

interface LibraryEntryCardProps {
    entry: LibraryEntry;
    view: 'grid' | 'list';
    onDelete?: () => void;
    onSelect?: () => void;
}

const statusConfig = {
    watching: { icon: Play, color: '#22c55e', label: 'Watching' },
    completed: { icon: Check, color: '#3b82f6', label: 'Completed' },
    on_hold: { icon: Pause, color: '#eab308', label: 'On Hold' },
    plan_to_watch: { icon: Clock, color: '#a855f7', label: 'Plan to Watch' },
    dropped: { icon: X, color: '#ef4444', label: 'Dropped' }
} as const;

export function LibraryEntryCard({
    entry,
    view,
    onDelete,
    onSelect
}: LibraryEntryCardProps) {
    const { currentTheme } = useTheme();
    const updateProgress = useUpdateProgress();
    const isDark = currentTheme.mode === 'dark';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showQuickProgress, setShowQuickProgress] = useState(false);
    const StatusIcon = statusConfig[entry.status].icon;
    const statusColor = statusConfig[entry.status].color;

    const rating = entry.rating === null ? undefined : entry.rating;

    const handleProgressUpdate = (newProgress: number) => {
        if (newProgress < 0 || (entry.total_episodes > 0 && newProgress > entry.total_episodes)) {
            return;
        }

        updateProgress.mutate({
            id: entry.id,
            newProgress,
            autoUpdateStatus: true,
            updateLastWatched: true
        });
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    // Quick Progress Controls Component
    const QuickProgressControls = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 p-2 rounded-lg shadow-lg z-50"
            style={{ backgroundColor: currentTheme.colors.background.card }}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleProgressUpdate(entry.progress - 1)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                        backgroundColor: currentTheme.colors.background.hover,
                        color: currentTheme.colors.text.primary
                    }}
                    disabled={entry.progress <= 0}
                >
                    <Minus size={14} />
                </button>

                <div className="flex items-center gap-1 px-2">
                    <input
                        type="number"
                        value={entry.progress}
                        onChange={(e) => handleProgressUpdate(parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 rounded text-center"
                        style={{
                            backgroundColor: currentTheme.colors.background.hover,
                            color: currentTheme.colors.text.primary,
                            border: `1px solid ${currentTheme.colors.background.hover}`
                        }}
                    />
                    <span style={{ color: currentTheme.colors.text.secondary }}>
                        / {entry.total_episodes || '?'}
                    </span>
                </div>

                <button
                    onClick={() => handleProgressUpdate(entry.progress + 1)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                        backgroundColor: currentTheme.colors.background.hover,
                        color: currentTheme.colors.text.primary
                    }}
                    disabled={entry.total_episodes > 0 && entry.progress >= entry.total_episodes}
                >
                    <Plus size={14} />
                </button>
            </div>
        </motion.div>
    );

    if (view === 'list') {
        return (
            <div
                className="group relative flex items-center gap-4 p-6 hover:bg-black/5 transition-colors duration-200"
                style={{
                    backgroundColor: currentTheme.colors.background.card
                }}
            >
                {/* Title with Image */}
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="relative w-16 h-20 group-hover:scale-105 transition-transform duration-200"
                        onClick={onSelect}
                    >
                        <img
                            src={entry.image}
                            alt={entry.title}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <div
                            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 
                                     transition-opacity duration-200 flex items-center justify-center"
                            style={{ backgroundColor: `${currentTheme.colors.background.main}90` }}
                        >
                            <Play className="w-6 h-6 transform -translate-y-2 group-hover:translate-y-0 
                                          transition-transform duration-200"
                                style={{ color: currentTheme.colors.text.primary }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            className="font-medium line-clamp-1 text-base group-hover:opacity-70 
                                     transition-opacity duration-200"
                            style={{ color: currentTheme.colors.text.primary }}
                        >
                            {entry.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            {/* Status Badge */}
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm"
                                style={{
                                    backgroundColor: `${statusColor}15`,
                                    color: statusColor
                                }}
                            >
                                <StatusIcon size={14} />
                                <span>{statusConfig[entry.status].label}</span>
                            </div>

                            {/* Progress */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowQuickProgress(!showQuickProgress)}
                                    className="flex items-center gap-2 px-3 py-1 rounded-lg 
                                             transition-colors duration-200"
                                    style={{
                                        backgroundColor: currentTheme.colors.background.hover,
                                        color: currentTheme.colors.text.secondary
                                    }}
                                >
                                    <Clock size={14} />
                                    <span className="text-sm">
                                        {entry.progress} / {entry.total_episodes || '?'} EP
                                    </span>
                                </button>

                                {showQuickProgress && <QuickProgressControls />}
                            </div>

                            {/* Rating */}
                            {entry.rating && (
                                <div
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.accent.primary}15`
                                    }}
                                >
                                    <Star
                                        size={14}
                                        fill={currentTheme.colors.accent.primary}
                                        style={{ color: currentTheme.colors.accent.primary }}
                                    />
                                    <span className="text-sm font-medium"
                                        style={{ color: currentTheme.colors.accent.primary }}
                                    >
                                        {entry.rating}/10
                                    </span>
                                </div>
                            )}

                            {/* Last Watched */}
                            {entry.last_watched && (
                                <span
                                    className="text-sm"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    Last watched: {new Date(entry.last_watched).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-48">
                    <div className="flex flex-col gap-2">
                        <div
                            className="h-2 rounded-full overflow-hidden"
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
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={onSelect}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                            backgroundColor: currentTheme.colors.accent.primary,
                            color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary
                        }}
                        title="Watch Now"
                    >
                        <Play size={16} />
                    </button>
                    <button
                        onClick={handleEditClick}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                            backgroundColor: currentTheme.colors.background.hover,
                            color: currentTheme.colors.text.primary
                        }}
                        title="Edit Entry"
                    >
                        <Edit size={16} />
                    </button>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110 
                                     hover:bg-red-500/10 hover:text-red-500"
                            style={{
                                backgroundColor: currentTheme.colors.background.hover,
                                color: currentTheme.colors.text.primary
                            }}
                            title="Remove from Library"
                        >
                            <Trash size={16} />
                        </button>
                    )}
                </div>
                <>
                    {/* Existing view JSX */}
                    <LibraryEntryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        animeId={entry.anime_id}
                        initialData={{
                            id: entry.id,
                            title: entry.title,
                            image: entry.image,
                            totalEpisodes: entry.total_episodes,
                            status: entry.status,
                            progress: entry.progress,
                            rating: rating, // Using the fixed rating
                            notes: entry.notes
                        }}
                    />
                </>
            </div>
        );
    }
    if (view === 'grid') {
        return (
            <div
                className="relative group rounded-xl overflow-hidden flex flex-col cursor-pointer"
                style={{ backgroundColor: currentTheme.colors.background.card }}
                onClick={onSelect}
            >
                {/* Image Section */}
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

                {/* Content Section */}
                <div className="p-3 flex-grow flex flex-col">
                    <div className="flex-grow">
                        <h3
                            className="text-base font-bold line-clamp-2 mb-2"
                            style={{ color: currentTheme.colors.text.primary }}
                        >
                            {entry.title}
                        </h3>

                        {/* Progress and Status */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            <div
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                style={{
                                    backgroundColor: `${statusColor}15`,
                                    color: statusColor
                                }}
                            >
                                <StatusIcon size={12} />
                                <span>{statusConfig[entry.status].label}</span>
                            </div>
                            <div
                                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                style={{
                                    backgroundColor: currentTheme.colors.background.hover,
                                    color: currentTheme.colors.text.secondary
                                }}
                            >
                                <Clock size={12} />
                                <span>
                                    {entry.progress}/{entry.total_episodes || '?'} EP
                                </span>
                            </div>
                        </div>

                        {/* Rating */}
                        {rating && (
                            <div className="flex items-center gap-1 mb-2">
                                <Star
                                    size={14}
                                    fill={currentTheme.colors.accent.primary}
                                    style={{ color: currentTheme.colors.accent.primary }}
                                />
                                <span
                                    className="text-sm"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    {rating}/10
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2">
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
                        </div>
                    </div>

                    {/* Actions - Shown on Hover */}
                    <div
                        className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-end gap-2 
                                 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 
                                 transition-all duration-200"
                        style={{
                            background: `linear-gradient(to top, ${currentTheme.colors.background.card}, transparent)`,
                        }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect?.();
                            }}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{
                                backgroundColor: currentTheme.colors.accent.primary,
                                color: isDark ? currentTheme.colors.background.main :
                                    currentTheme.colors.text.primary
                            }}
                        >
                            <Play size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Show edit modal
                            }}
                            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                            style={{
                                backgroundColor: currentTheme.colors.background.hover,
                                color: currentTheme.colors.text.primary
                            }}
                        >
                            <Edit size={16} />
                        </button>
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 
                                         hover:bg-red-500/10 hover:text-red-500"
                                style={{
                                    backgroundColor: currentTheme.colors.background.hover,
                                    color: currentTheme.colors.text.primary
                                }}
                            >
                                <Trash size={16} />
                            </button>
                        )}
                    </div>
                </div>
                <>
                    {/* Existing view JSX */}
                    <LibraryEntryModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        animeId={entry.anime_id}
                        initialData={{
                            id: entry.id,
                            title: entry.title,
                            image: entry.image,
                            totalEpisodes: entry.total_episodes,
                            status: entry.status,
                            progress: entry.progress,
                            rating,  // Using the converted rating
                            notes: entry.notes
                        }}
                    />
                </>
            </div>
        );
    }
}