import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Play, Calendar, Clock, Star, Tv, Users, ExternalLink, BookmarkPlus } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface AnimeCharacter {
    name: string;
    voice: string;
    animeImg: string;
    animedesignation: string;
    voicelang: string;
    voiceImageX: string;
}

interface AnimeSeason {
    id: string;
    Seasonname: string;
}

interface AnimeCharacters {
    animechar?: AnimeCharacter[];
    season?: AnimeSeason[];
}

interface AnimeInfo {
    name: string;
    jname: string;
    pganime: string;
    quality: string;
    epsub: string;
    epdub: string;
    totalep: string;
    format: string;
    duration: string;
    desc: string;
    id: string;
    image: string;
}

interface AnimeDetails {
    japanese: string;
    aired: string;
    premired: string;
    statusAnime: string;
    malscore: string;
    genre: string[];
    studio: string;
    producer: string[];
}

interface AnimeInfoResponse {
    infoX: [AnimeInfo, AnimeDetails, AnimeCharacters];
    mal_id: string;
    aniid: string;
    recommendation: AnimeRecommendation[];
}

export function AnimePage() {
    const { id } = useParams<{ id: string }>();
    const { currentTheme } = useTheme();

    const { data: animeInfo, isLoading } = useQuery<AnimeInfoResponse>({
        queryKey: ['anime', id],
        queryFn: () => api.getAnimeInfo(id!),
        enabled: !!id
    });

    if (isLoading || !animeInfo) {
        return (
            <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 pl-64">
                    <LoadingSpinner />
                </main>
            </div>
        );
    }

    const mainInfo = animeInfo.infoX[0];
    const additionalInfo = animeInfo.infoX[1];
    const extraInfo = animeInfo.infoX[2];

    const hasCharacters = !!extraInfo.animechar?.length;
    const hasSeasons = !!extraInfo.season?.length;
    const hasRecommendations = !!animeInfo.recommendation?.length;

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 pl-64 min-h-screen pt-12" style={{ backgroundColor: currentTheme.colors.background.main }}>
                {/* Hero Section */}
                <div className="relative h-[500px] overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${mainInfo.image})`,
                            filter: 'blur(16px) brightness(0.4)',
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
                                    {additionalInfo.malscore !== "?" && (
                                        <InfoBadge
                                            icon={<Star />}
                                            text={`MAL Score: ${additionalInfo.malscore}`}
                                        />
                                    )}
                                    <InfoBadge
                                        icon={<Calendar />}
                                        text={additionalInfo.aired}
                                    />
                                    <InfoBadge
                                        icon={<Clock />}
                                        text={mainInfo.duration}
                                    />
                                    <InfoBadge
                                        icon={<Tv />}
                                        text={mainInfo.format}
                                    />
                                    <InfoBadge
                                        icon={<Users />}
                                        text={mainInfo.quality}
                                    />
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {additionalInfo.genre.map((genre) => (
                                        <span
                                            key={genre}
                                            className="px-3 py-1 rounded-full text-sm"
                                            style={{
                                                backgroundColor: currentTheme.colors.accent.primary,
                                                color: currentTheme.colors.background.main
                                            }}
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    {hasSeasons ? (
                                        <div className="relative group">
                                            <button
                                                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-transform duration-200 hover:scale-105"
                                                style={{
                                                    backgroundColor: currentTheme.colors.accent.primary,
                                                    color: currentTheme.colors.background.main
                                                }}
                                            >
                                                <Play className="w-5 h-5" />
                                                <span className="font-bold">
                                                    Watch Season {extraInfo.season!.findIndex(s => s.id === id) + 1}
                                                </span>
                                            </button>
                                            <div
                                                className="absolute left-0 right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-xl overflow-hidden shadow-lg z-20"
                                                style={{ backgroundColor: currentTheme.colors.background.card }}
                                            >
                                                {extraInfo.season!.map((season, index) => (
                                                    <Link
                                                        key={season.id}
                                                        to={`/anime/${season.id}`}
                                                        className="flex items-center gap-2 px-4 py-3 transition-colors duration-200 hover:bg-black/10"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span>Season {index + 1}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl transition-transform duration-200 hover:scale-105"
                                            style={{
                                                backgroundColor: currentTheme.colors.accent.primary,
                                                color: currentTheme.colors.background.main
                                            }}
                                        >
                                            <Play className="w-5 h-5" />
                                            <span className="font-bold">Start Watching</span>
                                        </button>
                                    )}

                                    <button
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                                        style={{
                                            backgroundColor: currentTheme.colors.background.card,
                                            color: currentTheme.colors.text.primary,
                                            border: `1px solid ${currentTheme.colors.background.hover}`
                                        }}
                                    >
                                        <BookmarkPlus className="w-5 h-5" />
                                        <span className="font-bold">Add to Library</span>
                                    </button>
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
                            {/* If this is not season 1 and we can find season 1 in the list */}
                            {extraInfo.season &&
                                !extraInfo.season[0].Seasonname.toLowerCase().includes('season 1') &&
                                extraInfo.season.find(s => s.Seasonname.toLowerCase().includes('season 1'))
                                ? `This is ${mainInfo.name}. ${mainInfo.desc}`
                                : mainInfo.desc
                            }
                        </p>
                    </section>

                    {/* Characters Section - Only show if characters exist */}
                    {hasCharacters && (
                        <section className="mb-12">
                            <h3
                                className="text-2xl font-bold mb-6"
                                style={{ color: currentTheme.colors.text.accent }}
                            >
                                Characters & Voice Actors
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {extraInfo.animechar!.map((char) => (
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
                                {animeInfo.recommendation.slice(0, 12).map((rec) => (
                                    <Link
                                        key={rec.xid}
                                        to={`/anime/${rec.xid}`}
                                        className="group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
                                        style={{ backgroundColor: currentTheme.colors.background.card }}
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
                            <InfoItem label="Status" value={additionalInfo.statusAnime} />
                            <InfoItem label="Aired" value={additionalInfo.aired} />
                            <InfoItem label="Premiered" value={additionalInfo.premired} />
                            <InfoItem label="Studio" value={additionalInfo.studio} />
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

function InfoBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${currentTheme.colors.background.card}95` }}
        >
            {icon}
            <span style={{ color: currentTheme.colors.text.primary }}>{text}</span>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
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
                {value}
            </span>
        </div>
    );
}