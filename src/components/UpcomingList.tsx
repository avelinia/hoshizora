import { useState } from 'react';
import { UpcomingAnime } from '../types/api';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDown, Calendar, Clock, Play, Info } from 'lucide-react';
import { groupBy } from 'lodash';
import type { Dictionary } from 'lodash';
import { useNavigate } from 'react-router-dom';

interface UpcomingListProps {
    upcoming: UpcomingAnime[];
}

export function UpcomingList({ upcoming }: UpcomingListProps) {
    const { currentTheme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);

    const navigate = useNavigate();

    // Group anime by release month
    const groupedAnime: Dictionary<UpcomingAnime[]> = groupBy(upcoming, (anime: UpcomingAnime) => {
        const date = new Date(anime.release);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(groupedAnime).sort();
    const displayedMonths = isExpanded ? sortedMonths : sortedMonths.slice(0, 2);

    return (
        <div className="flex flex-col space-y-8">
            {displayedMonths.map((month) => {
                const date = new Date(month);
                const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

                return (
                    <div
                        key={month}
                        className="relative"
                        style={{ backgroundColor: currentTheme.colors.background.main }}
                    >
                        <div className="flex items-center mb-4 sticky top-0 z-10 py-2"
                            style={{ backgroundColor: currentTheme.colors.background.main }}>
                            <div
                                className="text-xl font-bold px-4 py-2 rounded-lg"
                                style={{
                                    backgroundColor: currentTheme.colors.accent.primary,
                                    color: currentTheme.colors.background.main
                                }}
                            >
                                {monthName}
                            </div>
                            <div className="h-0.5 flex-grow ml-4"
                                style={{ backgroundColor: currentTheme.colors.accent.primary }} />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 cursor-pointer select-none">
                            {groupedAnime[month].map((anime: UpcomingAnime) => (
                                <div
                                    key={anime.idani}
                                    className="relative group rounded-xl overflow-hidden flex flex-col h-full"
                                    style={{
                                        backgroundColor: currentTheme.colors.background.card,
                                    }}
                                    onClick={() => navigate(`/anime/${anime.idani}`)}
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden">
                                        <img
                                            src={anime.imgAnime}
                                            alt={anime.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: `linear-gradient(to bottom, transparent 50%, ${currentTheme.colors.background.card} 100%)`,
                                            }}
                                        />
                                        <div
                                            className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold"
                                            style={{
                                                backgroundColor: currentTheme.colors.accent.primary,
                                                color: currentTheme.colors.background.main,
                                            }}
                                        >
                                            <Calendar size={12} />
                                            <span>{anime.release}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 flex-grow flex flex-col">
                                        <div className="flex-grow">
                                            <h3
                                                className="text-base font-bold line-clamp-2 mb-2"
                                                style={{ color: currentTheme.colors.text.primary }}
                                            >
                                                {anime.name}
                                            </h3>
                                            <div className="flex gap-2">
                                                <div
                                                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: currentTheme.colors.background.hover,
                                                        color: currentTheme.colors.text.secondary
                                                    }}
                                                >
                                                    <Clock size={12} />
                                                    <span>{anime.format}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <button
                                                className="flex items-center justify-center gap-1 flex-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                                style={{
                                                    backgroundColor: currentTheme.colors.accent.primary,
                                                    color: currentTheme.colors.background.main
                                                }}
                                            >
                                                <Play size={12} />
                                                Watch Now
                                            </button>
                                            <button
                                                className="flex items-center justify-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                                style={{
                                                    backgroundColor: currentTheme.colors.background.hover,
                                                    color: currentTheme.colors.text.primary
                                                }}
                                            >
                                                <Info size={12} />
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {sortedMonths.length > 2 && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: currentTheme.colors.background.hover,
                            color: currentTheme.colors.text.primary
                        }}
                    >
                        {isExpanded ? 'Show Less' : 'Show More Months'}
                        <ChevronDown
                            size={16}
                            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            )}
        </div>
    );
}