// src/components/SeasonSelect.tsx
import { useTheme } from '../contexts/ThemeContext';
import { ExternalLink } from 'lucide-react';

interface Season {
    id: string;
    Seasonname: string;
    // We'll need to add thumbnail to the API response
    thumbnail?: string;
}

interface SeasonSelectProps {
    seasons: Season[];
    currentSeasonNumber: number;
    onSelect: (season: Season) => Promise<void>;
}

export function SeasonSelect({ seasons, currentSeasonNumber, onSelect }: SeasonSelectProps) {
    const { currentTheme } = useTheme();
    const isDark = currentTheme.mode === 'dark';

    return (
        <div
            className="absolute left-0 right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-xl overflow-hidden shadow-lg z-20"
            style={{ backgroundColor: currentTheme.colors.background.card }}
        >
            <div className="grid grid-cols-2 gap-2 p-2 max-h-96 overflow-y-auto custom-scrollbar">
                {seasons.map((season, index) => (
                    <button
                        key={season.id}
                        onClick={() => onSelect(season)}
                        className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 hover:scale-[1.02]"
                        style={{
                            backgroundColor: currentTheme.colors.background.hover,
                            border: `1px solid ${currentSeasonNumber === index + 1 ? currentTheme.colors.accent.primary : 'transparent'}`
                        }}
                    >
                        {/* Season Thumbnail */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={season.thumbnail || '/placeholder-poster.png'} // Fallback to placeholder
                                alt={`Season ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {currentSeasonNumber === index + 1 && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ backgroundColor: `${currentTheme.colors.accent.primary}80` }}
                                >
                                    <span className="text-xs font-medium" style={{ color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary }}>
                                        Current
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Season Info */}
                        <div className="flex-1 text-left">
                            <div
                                className="font-medium mb-1"
                                style={{ color: currentTheme.colors.text.primary }}
                            >
                                Season {index + 1}
                            </div>
                            <div
                                className="text-sm line-clamp-2"
                                style={{ color: currentTheme.colors.text.secondary }}
                            >
                                {season.Seasonname}
                            </div>
                        </div>

                        <ExternalLink
                            className="flex-shrink-0"
                            size={16}
                            style={{ color: currentTheme.colors.text.secondary }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
