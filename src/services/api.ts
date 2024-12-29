import { fetch } from '@tauri-apps/plugin-http';
import type {
    ApiResponse,
    HomePageData,
    SearchData,
    EpisodeData,
    ServerData,
    StreamingData,
    SpotlightAnime,
    SearchAnime,
    Server
} from '../types/api';

const BASE_URL = 'https://hoshizora-two.vercel.app/api/v2/hianime';

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

const api = {
    // Fetch homepage data (slides, trending, upcoming)
    getHomePage: async (): Promise<LegacyHomePageResponse> => {
        const response = await fetch(`${BASE_URL}/home`);
        const json = await response.json() as ApiResponse<HomePageData>;

        return {
            slides: json.data.spotlightAnimes.map((anime: SpotlightAnime) => ({
                name: anime.name,
                jname: anime.jname,
                spotlight: 'spotlight',
                imageAnime: anime.poster,
                format: anime.otherInfo[0] || '',
                duration: anime.otherInfo[1] || '',
                release: anime.otherInfo[2] || '',
                quality: anime.otherInfo[3] || '',
                animeId: anime.id,
                anidesc: anime.description
            })),
            trend: json.data.trendingAnimes.map((anime) => ({
                name: anime.name,
                ranking: anime.rank.toString(),
                imgAni: anime.poster,
                jname: '',
                iD: anime.id
            })),
            UpcomingAnime: json.data.topUpcomingAnimes.map((anime) => ({
                name: anime.name,
                format: anime.type,
                release: anime.duration,
                idani: anime.id,
                imgAnime: anime.poster
            }))
        };
    },

    // Search anime with pagination
    searchAnime: async (query: string, page: number = 1): Promise<LegacySearchResponse> => {
        const response = await fetch(
            `${BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`
        );
        const json = await response.json() as ApiResponse<SearchData>;

        return {
            nextpageavailable: json.data.hasNextPage,
            searchYour: json.data.animes.map((anime: SearchAnime) => ({
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
    },

    // Get detailed anime information
    // Get detailed anime information
    getAnimeInfo: async (id: string): Promise<LegacyAnimeInfoResponse> => {
        try {
            const response = await fetch(`${BASE_URL}/anime/${id}`);
            const json = await response.json();
            console.log('Raw API Response:', JSON.stringify(json, null, 2));

            if (!json.success || !json.data || !json.data.anime) {
                throw new Error('Invalid API response structure');
            }

            const animeData = json.data.anime;

            return {
                infoX: [
                    {
                        name: animeData.info.name || '',
                        jname: '',
                        pganime: animeData.info.stats.rating || '',
                        quality: animeData.info.stats.quality || '',
                        epsub: animeData.info.stats.episodes?.sub?.toString() || '0',
                        epdub: animeData.info.stats.episodes?.dub?.toString() || '0',
                        totalep: ((animeData.info.stats.episodes?.sub || 0) +
                            (animeData.info.stats.episodes?.dub || 0)).toString(),
                        format: animeData.info.stats.type || '',
                        duration: animeData.info.stats.duration || '',
                        desc: animeData.info.description || '',
                        id: animeData.info.id || '',
                        image: animeData.info.poster || ''
                    },
                    {
                        japanese: '',
                        aired: json.data.anime.moreInfo?.aired || '',
                        premired: json.data.anime.moreInfo?.aired || '',
                        statusAnime: json.data.anime.moreInfo?.status || '',
                        malscore: '',
                        genre: json.data.anime.moreInfo?.genres || [],
                        studio: json.data.anime.moreInfo?.studios || '',
                        producer: []
                    },
                    {
                        animechar: animeData.info.charactersVoiceActors?.map((char: {
                            character?: {
                                name?: string;
                                poster?: string;
                                cast?: string
                            };
                            voiceActor?: {
                                name?: string;
                                poster?: string;
                                cast?: string
                            }
                        }) => ({
                            name: char.character?.name || '',
                            voice: char.voiceActor?.name || '',
                            animeImg: char.character?.poster || '',
                            animedesignation: char.character?.cast || '',
                            voicelang: char.voiceActor?.cast || '',
                            voiceImageX: char.voiceActor?.poster || ''
                        })) || [],
                        season: json.data.seasons?.map((season: {
                            id?: string;
                            title?: string;
                        }) => ({
                            id: season.id || '',
                            Seasonname: season.title || ''
                        })) || undefined
                    }
                ],
                mal_id: animeData.info.malId?.toString() || '',
                aniid: animeData.info.id || '',
                recommendation: (json.data.recommendedAnimes || []).map((rec: {
                    name?: string;
                    episodes?: { sub?: number; dub?: number };
                    id?: string;
                    poster?: string;
                    type?: string;
                    duration?: string;
                }) => ({
                    name: rec.name || '',
                    jname: '',
                    sub: (rec.episodes?.sub && rec.episodes.sub > 0) ? "1" : "0",
                    dub: rec.episodes?.dub || 0,
                    total: (rec.episodes?.sub || 0) + (rec.episodes?.dub || 0),
                    xid: rec.id || '',
                    image: rec.poster || '',
                    format: rec.type || '',
                    duration: rec.duration || ''
                }))
            };
        } catch (error) {
            console.error('Error in getAnimeInfo:', error);
            console.log('Failed request URL:', `${BASE_URL}/anime/${id}`);
            throw error;
        }
    },

    // Get episodes for an anime
    getAnimeEpisodes: async (id: string) => {
        const response = await fetch(`${BASE_URL}/anime/${id}/episodes`);
        const json = await response.json() as ApiResponse<EpisodeData>;

        return {
            episodetown: json.data.episodes.map((ep) => ({
                order: ep.number.toString(),
                name: ep.title,
                epId: ep.episodeId
            }))
        };
    },

    // Get servers for an episode
    getEpisodeServers: async (epId: string) => {
        const response = await fetch(`${BASE_URL}/episode/servers?animeEpisodeId=${epId}`);
        const json = await response.json() as ApiResponse<ServerData>;

        return {
            sub: json.data.sub.map((server: Server) => ({
                server: server.serverName,
                id: server.serverId.toString(),
                srcId: `${epId}?server=${server.serverName}&category=sub`
            })),
            dub: json.data.dub.map((server: Server) => ({
                server: server.serverName,
                id: server.serverId.toString(),
                srcId: `${epId}?server=${server.serverName}&category=dub`
            }))
        };
    },

    // Get server streaming links
    getServerLinks: async (srcId: string) => {
        const response = await fetch(`${BASE_URL}/episode/sources?animeEpisodeId=${srcId}`);
        const json = await response.json() as ApiResponse<StreamingData>;

        return {
            serverSrc: [{
                text: 'HLS',
                serverlinkAni: json.data.sources[0]?.url || '',
                rest: json.data.sources.map((source) => ({
                    file: source.url,
                    type: source.isM3U8 ? 'm3u8' : 'mp4'
                }))
            }]
        };
    }
};

export { api };