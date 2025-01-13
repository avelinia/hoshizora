import { useTheme } from '../contexts/ThemeContext';
import { Play, Check } from 'lucide-react';
import type { Episode } from '../types/watch';

interface EpisodeListProps {
    episodes: Episode[];
    onEpisodeSelect: (episode: Episode) => void;
}

export default function EpisodeList({ episodes, onEpisodeSelect }: EpisodeListProps) {
    const { currentTheme } = useTheme();

    return (
        <div className="flex flex-col">
            {episodes.map((episode) => (
                <button
                    key={episode.number}
                    onClick={() => onEpisodeSelect(episode)}
                    className="p-4 flex flex-col gap-2 transition-colors duration-200 group relative"
                    style={{
                        backgroundColor: episode.current
                            ? currentTheme.colors.background.hover
                            : 'transparent'
                    }}
                >
                    {/* Episode Header */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center relative"
                            style={{ backgroundColor: currentTheme.colors.background.main }}
                        >
                            {episode.watched ? (
                                <Check
                                    className="w-5 h-5"
                                    style={{ color: currentTheme.colors.accent.primary }}
                                />
                            ) : (
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    {episode.number}
                                </span>
                            )}
                            {/* Play icon overlay on hover */}
                            <div
                                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                                style={{ backgroundColor: `${currentTheme.colors.background.main}90` }}
                            >
                                <Play className="w-5 h-5" style={{ color: currentTheme.colors.accent.primary }} />
                            </div>
                        </div>

                        <div className="flex-1 text-left">
                            <h3
                                className="font-medium line-clamp-1"
                                style={{ color: currentTheme.colors.text.primary }}
                            >
                                Episode {episode.number}
                            </h3>
                            <p
                                className="text-sm line-clamp-1"
                                style={{ color: currentTheme.colors.text.secondary }}
                            >
                                {episode.title}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {typeof episode.progress === 'number' && episode.progress > 0 && (
                        <div
                            className="h-1 rounded-full overflow-hidden"
                            style={{ backgroundColor: currentTheme.colors.background.main }}
                        >
                            <div
                                className="h-full transition-all duration-200"
                                style={{
                                    backgroundColor: currentTheme.colors.accent.primary,
                                    width: `${(episode.progress / (episode.duration || 1)) * 100}%`
                                }}
                            />
                        </div>
                    )}

                    {/* Hover Background */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ backgroundColor: `${currentTheme.colors.background.hover}80` }}
                    />
                </button>
            ))}
        </div>
    );
}