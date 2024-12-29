export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Homepage Types
export interface SpotlightAnime {
    id: string;
    name: string;
    jname: string;
    poster: string;
    description: string;
    rank: number;
    otherInfo: string[];
    episodes: {
        sub: number;
        dub: number;
    };
}

export interface TrendingAnime {
    id: string;
    name: string;
    poster: string;
    rank: number;
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

export interface HomePageResponse extends ApiResponse<HomePageData> { }

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

export interface SearchResponse extends ApiResponse<SearchData> { }

// Anime Info Types
export interface CharacterVoiceActor {
    character: {
        id: string;
        poster: string;
        name: string;
        cast: string;
    };
    voiceActor: {
        id: string;
        poster: string;
        name: string;
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
    promotionalVideos?: {
        title?: string;
        source?: string;
        thumbnail?: string;
    }[];
    characterVoiceActor?: CharacterVoiceActor[];
}

export interface AnimeMoreInfo {
    aired: string;
    genres: string[];
    status: string;
    studios: string;
    duration: string;
}

export interface SeasonInfo {
    id: string;
    name: string;
    title: string;
    poster: string;
    isCurrent: boolean;
}

export interface AnimeInfoData {
    anime: [{
        info: AnimeInfo;
        moreInfo: AnimeMoreInfo;
    }];
    mostPopularAnimes: AnimeCard[];
    recommendedAnimes: SearchAnime[];
    relatedAnimes: SearchAnime[];
    seasons?: SeasonInfo[];
}

export interface Slide {
    animeId: string;
    imageAnime: string;
    name: string;
    jname?: string;
    anidesc?: string;
    format?: string;
    duration?: string;
    quality?: string;
}


export interface AnimeInfoResponse extends ApiResponse<AnimeInfoData> { }

// Episode Types
export interface Episode {
    number: number;
    title: string;
    episodeId: string;
    isFiller: boolean;
}

export interface EpisodeData {
    totalEpisodes: number;
    episodes: Episode[];
}

export interface EpisodeResponse extends ApiResponse<EpisodeData> { }

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

export interface ServerResponse extends ApiResponse<ServerData> { }

// Streaming Source Types
export interface StreamingSource {
    url: string;
    isM3U8: boolean;
    quality?: string;
}

export interface Subtitle {
    lang: string;
    url: string;
}

export interface StreamingData {
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

export interface ServerLinkResponse extends ApiResponse<StreamingData> { }

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