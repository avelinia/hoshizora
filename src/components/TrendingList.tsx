import { useState } from 'react';
import { TrendingAnime } from '../types/api';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronDown, Clock, Star, Trophy, TrendingUp, Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrendingListProps {
    trending: TrendingAnime[];
}

export function TrendingList({ trending }: TrendingListProps) {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const displayedAnime = isExpanded ? trending.slice(0, 10) : trending.slice(0, 5);

    const getRankingColor = (ranking: string): string => {
        const rank = parseInt(ranking, 10);
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return currentTheme.colors.accent.primary;
    };

    const getRankingIcon = (ranking: string) => {
        const rank = parseInt(ranking, 10);
        if (rank <= 3) return Trophy;
        return TrendingUp;
    };

    return (
        <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {displayedAnime.map((anime) => {
                    const RankIcon = getRankingIcon(anime.ranking);

                    return (
                        <div
                            key={anime.iD}
                            className="relative group rounded-xl overflow-hidden flex flex-col h-full cursor-pointer select-none"
                            style={{
                                backgroundColor: currentTheme.colors.background.card,
                                border: `1px solid ${currentTheme.colors.background.hover}`,
                            }}
                            onClick={() => navigate(`/anime/${anime.iD}`)}
                        >
                            <div className="relative aspect-[2/3] overflow-hidden">
                                <img
                                    src={anime.imgAni}
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
                                    className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold"
                                    style={{
                                        backgroundColor: getRankingColor(anime.ranking),
                                        color: currentTheme.colors.background.main,
                                    }}
                                >
                                    <RankIcon size={14} />
                                    <span>#{anime.ranking}</span>
                                </div>
                            </div>

                            <div className="p-3 flex-grow flex flex-col">
                                <div className="flex-grow">
                                    <h3
                                        className="text-base font-bold line-clamp-2 mb-1"
                                        style={{ color: currentTheme.colors.text.primary }}
                                    >
                                        {anime.name}
                                    </h3>
                                    <p
                                        className="text-xs mb-2 line-clamp-1 italic"
                                        style={{ color: currentTheme.colors.text.secondary }}
                                    >
                                        {anime.jname}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div
                                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                            style={{
                                                backgroundColor: currentTheme.colors.background.hover,
                                                color: currentTheme.colors.text.secondary
                                            }}
                                        >
                                            <Clock size={12} />
                                            <span>24 EP</span>
                                        </div>
                                        <div
                                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                                            style={{
                                                backgroundColor: `${getRankingColor(anime.ranking)}33`,
                                                color: getRankingColor(anime.ranking)
                                            }}
                                        >
                                            <Star size={12} />
                                            <span>Top {anime.ranking}</span>
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
                    );
                })}
            </div>

            {trending.length > 5 && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: currentTheme.colors.background.hover,
                            color: currentTheme.colors.text.primary
                        }}
                    >
                        {isExpanded ? 'Show Less' : 'Show More Top Anime'}
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