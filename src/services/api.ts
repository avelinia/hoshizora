// src/services/api.ts

import { fetch } from '@tauri-apps/plugin-http';
import type {
    AnimeResponse,
    ServerData,
    StreamData,
    TrendingAnime,
    SpotlightAnime,
    UpcomingAnime,
    ApiResponse,
    TransformedHomePageData,
    ApiHomePageData,
    ApiSearchData,
    EpisodeInfo,
    CharacterVoiceActor,
    RelatedAnime
} from '../types/api';

const BASE_URL = 'https://hoshizora-api.vercel.app/api/v2/hianime';

export interface LegacyHomePageResponse {
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

export interface LegacySearchResponse {
    nextpageavailable: boolean;
    searchYour: Array<{
        name: string;
        jname: string;
        format: string;
        duration: string;
        idanime: string;
        sub: string;
        dubani: string;
        totalep: number | boolean;
        img: string;
        pg: string;
    }>;
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

class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }
    const data = await response.json();

    // Type guard to check if the response matches our ApiResponse interface
    if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        'data' in data
    ) {
        const apiResponse = data as ApiResponse<T>;
        if (!apiResponse.success) {
            throw new ApiError('API returned unsuccessful response');
        }
        return apiResponse.data;
    }

    throw new ApiError('Invalid API response format');
}

function transformSpotlightToSlides(spotlight: SpotlightAnime[]) {
    return spotlight.map(anime => ({
        name: anime.name,
        jname: anime.jname || '',
        spotlight: 'spotlight',
        imageAnime: anime.poster,
        format: anime.otherInfo?.[0] || '',
        duration: anime.otherInfo?.[1] || '',
        release: anime.otherInfo?.[2] || '',
        quality: anime.otherInfo?.[3] || '',
        animeId: anime.id,
        anidesc: anime.description
    }));
}

function transformTrendingAnime(trending: TrendingAnime[]) {
    return trending.map(anime => ({
        name: anime.name,
        ranking: (anime.rank || 0).toString(),
        imgAni: anime.poster,
        jname: '',
        iD: anime.id
    }));
}

function transformUpcomingAnime(upcoming: UpcomingAnime[]) {
    return upcoming.map(anime => ({
        name: anime.name,
        format: anime.type || '',
        release: anime.duration || '',
        idani: anime.id,
        imgAnime: anime.poster
    }));
}

export const api = {
    getHomePage: async (): Promise<TransformedHomePageData> => {
        try {
            const response = await fetch(`${BASE_URL}/home`);
            const apiData: ApiHomePageData = await handleResponse<ApiHomePageData>(response);

            return {
                slides: transformSpotlightToSlides(apiData.spotlightAnimes || []),
                trend: transformTrendingAnime(apiData.trendingAnimes || []),
                UpcomingAnime: transformUpcomingAnime(apiData.topUpcomingAnimes || [])
            };
        } catch (error) {
            console.error('Failed to fetch home page:', error);
            return {
                slides: [],
                trend: [],
                UpcomingAnime: []
            };
        }
    },

    // Search anime
    searchAnime: async (query: string, page = 1) => {
        if (!query) throw new ApiError('Search query is required');
        try {
            const response = await fetch(
                `${BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`
            );
            const apiData: ApiSearchData = await handleResponse<ApiSearchData>(response);
            return {
                nextpageavailable: apiData.hasNextPage,
                searchYour: apiData.animes.map(anime => ({
                    name: anime.name,
                    jname: '',
                    format: anime.type,
                    duration: anime.duration,
                    idanime: anime.id,
                    sub: anime.episodes.sub > 0 ? "1" : "0",
                    dubani: anime.episodes.dub > 0 ? "1" : "0",
                    totalep: anime.episodes.sub + anime.episodes.dub,
                    img: anime.poster,
                    pg: anime.rating
                }))
            };
        } catch (error) {
            console.error('Search failed:', error);
            return { nextpageavailable: false, searchYour: [] };
        }
    },

    // Get anime info
    getAnimeInfo: async (id: string): Promise<LegacyAnimeInfoResponse> => {
        if (!id) throw new Error('Anime ID is required');
        try {
            const response = await fetch(`${BASE_URL}/anime/${id}`);
            const responseData = await response.json() as AnimeResponse;

            const { anime, relatedAnimes = [] } = responseData.data;
            if (!anime) throw new Error('No anime data found');

            return {
                infoX: [
                    {
                        name: anime.info.name,
                        jname: anime.moreInfo.japanese,
                        pganime: anime.info.stats.rating,
                        quality: anime.info.stats.quality,
                        epsub: String(anime.info.stats.episodes.sub),
                        epdub: String(anime.info.stats.episodes.dub),
                        totalep: String(anime.info.stats.episodes.sub + anime.info.stats.episodes.dub),
                        format: anime.info.stats.type,
                        duration: anime.info.stats.duration,
                        desc: anime.info.description,
                        id: anime.info.id,
                        image: anime.info.poster
                    },
                    {
                        japanese: anime.moreInfo.japanese,
                        aired: anime.moreInfo.aired,
                        premired: anime.moreInfo.premiered,
                        statusAnime: anime.moreInfo.status,
                        malscore: anime.moreInfo.malscore,
                        genre: anime.moreInfo.genres,
                        studio: anime.moreInfo.studios,
                        producer: anime.moreInfo.producers
                    },
                    {
                        animechar: (anime.info.charactersVoiceActors || []).map((char: CharacterVoiceActor) => ({
                            name: char.character.name,
                            voice: char.voiceActor.name,
                            animeImg: char.character.poster,
                            animedesignation: char.character.cast,
                            voicelang: char.voiceActor.cast,
                            voiceImageX: char.voiceActor.poster
                        })),
                        season: anime.info.id.includes('season') ? [
                            // If this is a season, add previous seasons
                            {
                                id: anime.info.id.replace(/season-\d+/, 'season-1'),
                                Seasonname: 'Season 1'
                            },
                            {
                                id: anime.info.id,
                                Seasonname: `Season ${anime.info.id.match(/season-(\d+)/)?.[1] || '2'}`
                            }
                        ] : []
                    }
                ],
                mal_id: responseData.data.anime?.info?.id || '',  // Add these lines
                aniid: responseData.data.anime?.info?.id || '',   // Add these lines
                recommendation: relatedAnimes.map((anime: RelatedAnime) => ({
                    name: anime.name,
                    jname: anime.jname || '',
                    sub: anime.episodes.sub > 0 ? '1' : '0',
                    dub: anime.episodes.dub,
                    total: anime.episodes.sub + anime.episodes.dub,
                    xid: anime.id,
                    image: anime.poster,
                    format: anime.type,
                    duration: anime.duration || ''
                }))
            };
        } catch (error) {
            console.error('Failed to fetch anime info:', error);
            throw error;
        }
    },

    // Get episodes
    getAnimeEpisodes: async (animeId: string): Promise<EpisodeInfo> => {
        if (!animeId) throw new Error('Anime ID is required');
        try {
            const response = await fetch(`${BASE_URL}/anime/${animeId}/episodes`);
            const data = await handleResponse<EpisodeInfo>(response);
            return data;
        } catch (error) {
            console.error('Failed to fetch episodes:', error);
            return { episodetown: [] };
        }
    },

    // Get episode servers
    getEpisodeServers: async (episodeId: string): Promise<ServerData> => {
        if (!episodeId) throw new ApiError('Episode ID is required');
        try {
            const response = await fetch(
                `${BASE_URL}/episode/servers?animeEpisodeId=${episodeId}`
            );
            return handleResponse<ServerData>(response);
        } catch (error) {
            console.error('Failed to fetch servers:', error);
            throw error;
        }
    },

    // Get server streaming links
    getServerLinks: async (sourceId: string): Promise<StreamData> => {
        if (!sourceId) throw new ApiError('Source ID is required');
        try {
            const response = await fetch(
                `${BASE_URL}/episode/sources?animeEpisodeId=${sourceId}`
            );
            return handleResponse<StreamData>(response);
        } catch (error) {
            console.error('Failed to fetch streaming links:', error);
            throw error;
        }
    }
};

