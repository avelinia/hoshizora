// src/types/api.ts

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface TopUpcomingAnime {
    id: string;
    name: string;
    poster: string;
    duration: string;
    type: string;
    rating: string;
    episodes: {
        sub: number;
        dub: number;
    };
}

export interface HomePageData {
    genres: string[];
    spotlightAnimes: SpotlightAnime[];
    trendingAnimes: TrendingAnime[];
    topUpcomingAnimes: TopUpcomingAnime[];
    topAiringAnimes: AnimeCard[];
    mostPopularAnimes: AnimeCard[];
}

// Search Types
export interface SearchAnime {
    id: string;
    name: string;
    poster: string;
    duration: string;
    type: string;
    rating: string;
    episodes: {
        sub: number;
        dub: number;
    };
}

export interface SearchData {
    animes: SearchAnime[];
    mostPopularAnimes: AnimeCard[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    searchQuery: string;
    searchFilters?: Record<string, string[]>;
}

export interface Character {
    name: string;
    poster: string;
    cast: string;
}

// Anime Info Types
export interface CharacterVoiceActor {
    character: {
        name: string;
        poster: string;
        cast: string;
    };
    voiceActor: {
        name: string;
        poster: string;
        cast: string;
    };
}

export interface AnimeStats {
    rating: string;
    quality: string;
    episodes: {
        sub: number;
        dub: number;
    };
    type: string;
    duration: string;
}

export interface AnimeInfo {
    id: string;
    name: string;
    poster: string;
    description: string;
    stats: AnimeStats;
    charactersVoiceActors: CharacterVoiceActor[];
}

export interface LegacyAnimeInfoResponse {
    infoX: [
        {
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
        },
        {
            japanese: string;
            aired: string;
            premired: string;
            statusAnime: string;
            malscore: string;
            genre: string[];
            studio: string;
            producer: string[];
        },
        {
            animechar?: Array<{
                name: string;
                voice: string;
                animeImg: string;
                animedesignation: string;
                voicelang: string;
                voiceImageX: string;
            }>;
            season?: Array<{
                id: string;
                Seasonname: string;
            }>;
        }
    ];
    mal_id: string;
    aniid: string;
    recommendation: Array<{
        name: string;
        jname: string;
        sub: string;
        dub: string | number;
        total: string | number | null;
        xid: string;
        image: string;
        format: string;
        duration: string;
    }>;
}

export interface AnimeInfoData {
    infoX: [
        {
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
        },
        {
            japanese: string;
            aired: string;
            premired: string;
            statusAnime: string;
            malscore: string;
            genre: string[];
            studio: string;
            producer: string[];
        },
        {
            animechar?: Array<{
                name: string;
                voice: string;
                animeImg: string;
                animedesignation: string;
                voicelang: string;
                voiceImageX: string;
            }>;
            season?: Array<{
                id: string;
                Seasonname: string;
            }>;
        }
    ];
    recommendation: Array<{
        name: string;
        jname: string;
        sub: string;
        dub: string | number;
        total: string | number | null;
        xid: string;
        image: string;
        format: string;
        duration: string;
    }>;
}

export interface AnimeResponse {
    success: boolean;
    data: {
        anime: {
            info: {
                id: string;
                name: string;
                poster: string;
                description: string;
                stats: {
                    rating: string;
                    quality: string;
                    episodes: {
                        sub: number;
                        dub: number;
                    };
                    type: string;
                    duration: string;
                };
                charactersVoiceActors: CharacterVoiceActor[];
            };
            moreInfo: {
                japanese: string;
                aired: string;
                premiered: string;
                status: string;
                malscore: string;
                genres: string[];
                studios: string;
                producers: string[];
            };
        };
        relatedAnimes: RelatedAnime[];
    };
}

export interface AnimeMoreInfo {
    japanese: string;
    aired: string;
    premiered: string;
    status: string;
    malscore: string;
    genres: string[];
    studios: string;
    producers: string[];
}

export interface SeasonInfo {
    id: string;
    name: string;
    title: string;
    poster: string;
    isCurrent: boolean;
}

// Episode Types
export interface Episode {
    number: number;
    title: string;
    episodeId: string;
    isFiller: boolean;
}

export interface EpisodeInfo {
    episodetown: Array<{
        epId: string;
        order: string;
        name: string;
    }>;
}

export interface EpisodeData {
    episodetown: Array<{
        epId: string;
        order: string;
        name: string;
    }>;
}

// Server Types
export interface Server {
    serverId: number;
    serverName: string;
}

export interface ServerData {
    episodeId: string;
    episodeNo: number;
    sub: Server[];
    dub: Server[];
    raw: Server[];
}

// Streaming Types
export interface StreamingSource {
    url: string;
    isM3U8: boolean;
    quality?: string;
}

export interface Subtitle {
    lang: string;
    url: string;
}

export interface StreamData {
    headers: {
        Referer: string;
        "User-Agent": string;
        [key: string]: string;
    };
    sources: StreamingSource[];
    subtitles: Subtitle[];
    anilistID: number | null;
    malID: number | null;
}

// Common Types
export interface AnimeCard {
    episodes: {
        sub: number;
        dub: number;
    };
    id: string;
    jname?: string;
    name: string;
    poster: string;
    type: string;
}

// Homepage Types
export interface SpotlightAnime {
    id: string;
    name: string;
    jname?: string;
    poster: string;
    description: string;
    otherInfo?: string[];
}

export interface TrendingAnime {
    id: string;
    name: string;
    poster: string;
    rank?: number;
}

export interface UpcomingAnime {
    id: string;
    name: string;
    poster: string;
    type?: string;
    duration?: string;
}

export interface ApiHomePageData {
    spotlightAnimes: SpotlightAnime[];
    trendingAnimes: TrendingAnime[];
    topUpcomingAnimes: UpcomingAnime[];
}

export interface ApiEpisodeData {
    episodes: Array<{
        episodeId: string;
        number: number;
        title: string;
    }>;
}

export interface ApiSearchData {
    hasNextPage: boolean;
    animes: Array<{
        name: string;
        type: string;
        duration: string;
        id: string;
        episodes: {
            sub: number;
            dub: number;
        };
        poster: string;
        rating: string;
    }>;
}

export interface RelatedAnime {
    id: string;
    name: string;
    jname?: string;
    poster: string;
    episodes: {
        sub: number;
        dub: number;
    };
    type: string;
    duration?: string;
}

// Transformed Types (matching component expectations)
export interface TransformedHomePageData {
    slides: Array<{
        name: string;
        jname: string;
        spotlight: string;
        imageAnime: string;
        format: string;
        duration: string;
        release: string;
        quality: string;
        animeId: string;
        anidesc: string;
    }>;
    trend: Array<{
        name: string;
        ranking: string;
        imgAni: string;
        jname: string;
        iD: string;
    }>;
    UpcomingAnime: Array<{
        name: string;
        format: string;
        release: string;
        idani: string;
        imgAnime: string;
    }>;
}
