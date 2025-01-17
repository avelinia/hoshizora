// src/components/SeasonModal.tsx
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useQueries } from '@tanstack/react-query';
import { api } from '../services/api';

interface Season {
    id: string;
    Seasonname: string;
    number?: number;
    thumbnail?: string;
    info?: {
        name: string;
        image: string;
        desc: string;
        totalep: string;
    }
}

interface SeasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    seasons: Season[];
    currentSeasonNumber: number;
    onSelect: (season: Season) => Promise<void>;
}

function LoadingSeasonCard() {
    const { currentTheme } = useTheme();

    return (
        <div
            className="flex flex-col rounded-xl overflow-hidden"
            style={{ backgroundColor: currentTheme.colors.background.hover }}
        >
            <div className="aspect-video w-full animate-pulse"
                style={{ backgroundColor: currentTheme.colors.background.card }}
            />
            <div className="p-4 space-y-2">
                <div
                    className="h-5 w-1/2 rounded animate-pulse"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                />
                <div
                    className="h-4 w-3/4 rounded animate-pulse"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                />
            </div>
        </div>
    );
}

function ErrorSeasonCard({ season }: { season: Season }) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="flex flex-col rounded-xl overflow-hidden p-4 items-center justify-center text-center"
            style={{ backgroundColor: currentTheme.colors.background.hover }}
        >
            <h3
                className="text-lg font-medium mb-2"
                style={{ color: currentTheme.colors.text.primary }}
            >
                Season {season.number}
            </h3>
            <p
                className="text-sm"
                style={{ color: currentTheme.colors.text.secondary }}
            >
                Failed to load season info
            </p>
        </div>
    );
}

export function SeasonModal({ isOpen, onClose, seasons, currentSeasonNumber, onSelect }: SeasonModalProps) {
    const { currentTheme } = useTheme();
    const isDark = currentTheme.mode === 'dark';

    const seasonQueries = useQueries({
        queries: seasons.map((season) => ({
            queryKey: ['anime', season.id],
            queryFn: () => api.getAnimeInfo(season.id),
            enabled: isOpen && !!season.id, // Only run when modal is open
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        }))
    });

    const isLoading = seasonQueries.some(query => query.isLoading || query.isFetching);

    const seasonsWithInfo = seasons.map((season, index) => {
        const queryResult = seasonQueries[index];
        return {
            ...season,
            info: queryResult.data?.infoX?.[0],
            isError: queryResult.isError,
            number: index + 1 // Ensure each season has a unique number
        };
    });

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-xl"
                        style={{ backgroundColor: currentTheme.colors.background.card }}
                    >
                        {/* Header */}
                        <div
                            className="sticky top-0 flex items-center justify-between p-6 border-b z-10"
                            style={{
                                borderColor: currentTheme.colors.background.hover,
                                backgroundColor: currentTheme.colors.background.card
                            }}
                        >
                            <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                                Available Seasons
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg transition-colors duration-200 hover:bg-black/10"
                            >
                                <X size={20} style={{ color: currentTheme.colors.text.primary }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto">
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {seasonsWithInfo.map((season) => {
                                        if (isLoading) {
                                            return <LoadingSeasonCard key={season.id} />;
                                        }

                                        if (season.isError) {
                                            return <ErrorSeasonCard key={season.id} season={season} />;
                                        }

                                        return (
                                            <button
                                                key={`${season.id}-${season.number}`}
                                                onClick={() => {
                                                    onSelect(season);
                                                    onClose();
                                                }}
                                                className="flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] group"
                                                style={{
                                                    backgroundColor: currentTheme.colors.background.hover,
                                                    border: `2px solid ${currentSeasonNumber === season.number ? currentTheme.colors.accent.primary : 'transparent'}`
                                                }}
                                            >
                                                <div className="relative aspect-video w-full overflow-hidden">
                                                    <img
                                                        src={season.info?.image || '/placeholder-poster.png'}
                                                        alt={`Season ${season.number}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                    {currentSeasonNumber === season.number && (
                                                        <div
                                                            className="absolute inset-0 flex items-center justify-center"
                                                            style={{ backgroundColor: `${currentTheme.colors.accent.primary}80` }}
                                                        >
                                                            <span className="font-medium px-3 py-1 rounded-full text-sm bg-black/20"
                                                                style={{ color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary }}>
                                                                Current Season
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4">
                                                    <h3
                                                        className="text-lg font-medium mb-1"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        Season {season.number}
                                                    </h3>
                                                    <p className="text-sm mb-2"
                                                        style={{ color: currentTheme.colors.text.secondary }}>
                                                        {season.info?.totalep} Episodes
                                                    </p>
                                                    <p
                                                        className="text-sm line-clamp-2"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        {season.info?.desc || season.Seasonname}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}