import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import { Play, Calendar, Clock, Star, Tv, Users } from 'lucide-react';
import { AnimeSkeleton } from '../components/loading/Shimmer';
import { api } from '../services/api';
import { SeasonSelect } from '../components/SeasonSelect';
import { type LegacyAnimeInfoResponse, type EpisodeInfo } from '../types/api';
import { LibraryButton } from '../components/LibraryButton';
import { useLibraryEntry } from '../hooks/useLibrary';
import { useNavigate, Link, useParams } from 'react-router-dom';

export function AnimePage() {
    const { id } = useParams() as { id: string };
    const { currentTheme } = useTheme();
    const isDark = currentTheme.mode === "dark"
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: animeInfo, isLoading, error } = useQuery<LegacyAnimeInfoResponse, Error>({
        queryKey: ['anime', id],
        queryFn: () => {
            if (!id) throw new Error('No anime ID provided');
            return api.getAnimeInfo(id);
        },
        enabled: !!id
    });

    // Query for library entry
    const { data: libraryEntry } = useLibraryEntry(id);

    if (isLoading) {
        return (
            <div className="min-h-full w-full p-8" style={{ backgroundColor: currentTheme.colors.background.main }}>
                <div className="max-w-[1400px] mx-auto">
                    <AnimeSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        console.error('Error loading anime:', error);
        return (
            <div className="flex items-center justify-center h-full">
                <div style={{ color: currentTheme.colors.accent.primary }}>
                    Failed to load anime data: {(error as Error).message}
                </div>
            </div>
        );
    }

    if (!animeInfo || !animeInfo.infoX || animeInfo.infoX.length < 3) {
        console.log('No anime info available');
        return (
            <div className="flex items-center justify-center h-full">
                <div style={{ color: currentTheme.colors.accent.primary }}>
                    No data available
                </div>
            </div>
        );
    }

    const mainInfo = animeInfo.infoX[0];
    const additionalInfo = animeInfo.infoX[1];
    const extraInfo = animeInfo.infoX[2];

    const hasCharacters = extraInfo?.animechar && Array.isArray(extraInfo.animechar) && extraInfo.animechar.length > 0;
    const hasSeasons = extraInfo?.season && Array.isArray(extraInfo.season) && extraInfo.season.length > 0;
    const hasRecommendations = Array.isArray(animeInfo.recommendation) && animeInfo.recommendation.length > 0;

    const currentSeasonNumber = hasSeasons && extraInfo.season ?
        extraInfo.season.findIndex(s => s.id === id) + 1 : 1;

    const totalEpisodes = parseInt(mainInfo.totalep) || 0;

    const handleSeasonSelect = async (season: { id: string; Seasonname: string }) => {
        // First, we need to get the episodes for this season
        try {
            const episodes = await api.getAnimeEpisodes(season.id);
            // If we have episodes, navigate to the first episode of the selected season
            if (episodes.episodetown?.[0]) {
                navigate(`/watch/${season.id}/episode/${episodes.episodetown[0].epId}`);
            } else {
                // If no episodes are found, fall back to the anime page
                navigate(`/anime/${season.id}`);
            }
        } catch (error) {
            console.error('Failed to fetch episodes for season:', error);
            // On error, fall back to the anime page
            navigate(`/anime/${season.id}`);
        }
    };

    const handleStartWatching = async () => {
        if (!id) return;

        // If we have episodes data in cache, use it
        const episodes = queryClient.getQueryData<EpisodeInfo>(['episodes', id]);
        if (episodes?.episodetown?.[0]) {
            navigate(`/watch/${id}/episode/${episodes.episodetown[0].epId}`);
            return;
        }

        // Otherwise fetch episodes
        try {
            const newEpisodes = await api.getAnimeEpisodes(id);
            if (newEpisodes.episodetown?.[0]) {
                navigate(`/watch/${id}/episode/${newEpisodes.episodetown[0].epId}`);
            }
        } catch (error) {
            console.error('Failed to fetch episodes:', error);
        }
    };

    console.log('Raw extraInfo:', extraInfo);
    console.log('Raw animeInfo:', animeInfo);

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 min-h-screen" style={{ backgroundColor: currentTheme.colors.background.main }}>
                {/* Hero Section */}
                <div className="relative h-[500px] overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${mainInfo.image})`,
                            filter: `blur(16px) ${isDark ? 'brightness(0.4)' : 'opacity(50%)'}`,
                            transform: 'scale(1.1)',
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to top, ${currentTheme.colors.background.main}, transparent 50%, ${currentTheme.colors.background.main}40)`
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 h-full flex items-center">
                        <div className="flex gap-8">
                            {/* Poster */}
                            <div className="flex-shrink-0">
                                <img
                                    src={mainInfo.image}
                                    alt={mainInfo.name}
                                    className="w-64 rounded-xl shadow-lg"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-center">
                                <h1
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    {mainInfo.name}
                                </h1>
                                <h2
                                    className="text-xl mb-6"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    {mainInfo.jname}
                                </h2>

                                {/* Quick Info */}
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {additionalInfo.malscore && additionalInfo.malscore !== "?" && (
                                        <InfoBadge
                                            icon={<Star />}
                                            text={`MAL Score: ${additionalInfo.malscore}`}
                                        />
                                    )}
                                    <InfoBadge
                                        icon={<Calendar />}
                                        text={additionalInfo.aired || 'Unknown'}
                                    />
                                    <InfoBadge
                                        icon={<Clock />}
                                        text={mainInfo.duration || 'Unknown'}
                                    />
                                    <InfoBadge
                                        icon={<Tv />}
                                        text={mainInfo.format || 'Unknown'}
                                    />
                                    <InfoBadge
                                        icon={<Users />}
                                        text={mainInfo.quality || 'Unknown'}
                                    />
                                </div>

                                {/* Genres */}
                                {additionalInfo.genre && additionalInfo.genre.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {additionalInfo.genre.map((genre: string) => (
                                            <span
                                                key={genre}
                                                className="px-3 py-1 rounded-full text-sm"
                                                style={{
                                                    backgroundColor: currentTheme.colors.accent.primary,
                                                    color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary
                                                }}
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    {extraInfo.season && extraInfo.season.length > 0 ? (
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleStartWatching()}
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl duration-200 hover:gap-3 hover:scale-105"
                                                style={{
                                                    backgroundColor: currentTheme.colors.accent.primary,
                                                    color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary
                                                }}
                                            >
                                                <Play className="w-5 h-5" />
                                                <span className="font-bold">
                                                    {extraInfo.season.length > 1 ? `Watch Season ${currentSeasonNumber}` : 'Start Watching'}
                                                </span>
                                            </button>
                                            {extraInfo.season.length > 1 && (
                                                <SeasonSelect
                                                    seasons={extraInfo.season}
                                                    currentSeasonNumber={currentSeasonNumber}
                                                    onSelect={handleSeasonSelect}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleStartWatching}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:gap-3 hover:scale-105"
                                            style={{
                                                backgroundColor: currentTheme.colors.accent.primary,
                                                color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary
                                            }}
                                        >
                                            <Play className="w-5 h-5" />
                                            <span className="font-bold">Start Watching</span>
                                        </button>
                                    )}

                                    <LibraryButton
                                        className='shadow-lg hover:shadow-xl hover:gap-3'
                                        animeId={mainInfo?.id || ''}
                                        title={mainInfo?.name || ''}
                                        image={mainInfo?.image || ''}
                                        totalEpisodes={totalEpisodes}
                                        existingEntry={libraryEntry ? {
                                            id: libraryEntry.id,
                                            status: libraryEntry.status,
                                            progress: libraryEntry.progress,
                                            rating: libraryEntry.rating || 0,
                                            notes: libraryEntry.notes || ''
                                        } : undefined}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Synopsis */}
                    <section className="mb-12">
                        <h3
                            className="text-2xl font-bold mb-4"
                            style={{ color: currentTheme.colors.text.accent }}
                        >
                            Synopsis
                        </h3>
                        <p
                            className="text-lg leading-relaxed whitespace-pre-line"
                            style={{ color: currentTheme.colors.text.secondary }}
                        >
                            {mainInfo.desc}
                        </p>
                    </section>

                    {/* Characters Section - Only show if characters exist */}
                    {hasCharacters && extraInfo.animechar && (
                        <section className="mb-12">
                            <h3
                                className="text-2xl font-bold mb-6"
                                style={{ color: currentTheme.colors.text.accent }}
                            >
                                Characters & Voice Actors
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {extraInfo.animechar && extraInfo.animechar.map((char: {
                                    name: string;
                                    voice: string;
                                    animeImg: string;
                                    animedesignation: string;
                                    voicelang: string;
                                    voiceImageX: string;
                                }) => (
                                    <div
                                        key={char.name}
                                        className="flex gap-4 p-4 rounded-xl transition-colors duration-200"
                                        style={{ backgroundColor: currentTheme.colors.background.card }}
                                    >
                                        <div className="flex gap-4 flex-1">
                                            <img
                                                src={char.animeImg}
                                                alt={char.name}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <h4
                                                    className="font-medium"
                                                    style={{ color: currentTheme.colors.text.primary }}
                                                >
                                                    {char.name}
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: currentTheme.colors.text.secondary }}
                                                >
                                                    {char.animedesignation}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <img
                                                src={char.voiceImageX}
                                                alt={char.voice}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div>
                                                <h4
                                                    className="font-medium"
                                                    style={{ color: currentTheme.colors.text.primary }}
                                                >
                                                    {char.voice}
                                                </h4>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: currentTheme.colors.text.secondary }}
                                                >
                                                    {char.voicelang}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recommendations Section */}
                    {hasRecommendations && (
                        <section className="mb-12">
                            <h3
                                className="text-2xl font-bold mb-6"
                                style={{ color: currentTheme.colors.text.accent }}
                            >
                                You Might Also Like
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {animeInfo.recommendation.slice(0, 12).map((rec: {
                                    name: string;
                                    xid: string;
                                    image: string;
                                    format: string;
                                }) => (
                                    <Link
                                        key={rec.xid}
                                        to={`/anime/${rec.xid}`}
                                        className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200"
                                        style={{
                                            backgroundColor: currentTheme.colors.background.card,
                                            border: `1px solid ${currentTheme.colors.background.hover}`
                                        }}
                                    >
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <img
                                                src={rec.image}
                                                alt={rec.name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                            <div
                                                className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                                                style={{
                                                    background: `linear-gradient(to top, ${currentTheme.colors.background.card}, transparent)`,
                                                }}
                                            />
                                        </div>
                                        <div className="p-2">
                                            <h4
                                                className="font-medium text-sm line-clamp-2"
                                                style={{ color: currentTheme.colors.text.primary }}
                                            >
                                                {rec.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        backgroundColor: currentTheme.colors.background.hover,
                                                        color: currentTheme.colors.text.secondary
                                                    }}
                                                >
                                                    {rec.format}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Additional Info */}
                    <section>
                        <h3
                            className="text-2xl font-bold mb-6"
                            style={{ color: currentTheme.colors.text.accent }}
                        >
                            Information
                        </h3>
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-xl"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <InfoItem label="Type" value={mainInfo.format} />
                            <InfoItem label="Episodes" value={mainInfo.totalep} />
                            <InfoItem label="Status" value={additionalInfo.statusAnime || 'Unknown'} />
                            <InfoItem label="Aired" value={additionalInfo.aired} />
                            <InfoItem label="Premiered" value={additionalInfo.premired} />
                            <InfoItem label="Studio" value={additionalInfo.studio || 'Unknown'} />
                            <InfoItem label="Duration" value={mainInfo.duration} />
                            <InfoItem label="Quality" value={mainInfo.quality} />
                            <InfoItem label="Rating" value={mainInfo.pganime} />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function InfoBadge({ icon, text }: { icon: React.ReactNode; text?: string }) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${currentTheme.colors.background.card}95` }}
        >
            {icon}
            <span style={{ color: currentTheme.colors.text.primary }}>
                {text || 'Unknown'}
            </span>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
    const { currentTheme } = useTheme();

    return (
        <div>
            <span
                className="text-sm block mb-1"
                style={{ color: currentTheme.colors.text.secondary }}
            >
                {label}
            </span>
            <span
                className="font-medium"
                style={{ color: currentTheme.colors.text.primary }}
            >
                {value || 'Unknown'}
            </span>
        </div>
    );
}