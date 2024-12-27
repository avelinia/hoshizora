// src/services/api.ts
import axios from 'axios';
import { HomePageResponse, SearchResponse, GenreResponse, ScheduleResponse, AnimeInfoResponse, MixAnimeResponse, EpisodeResponse, ServerResponse, ServerLinkResponse } from '../types/api';

const BASE_URL = 'https://aniwatch-api-v1-0.onrender.com/api';

export const api = {
    // Fetch homepage data (slides, trending, upcoming)
    getHomePage: async (): Promise<HomePageResponse> => {
        const response = await axios.get<HomePageResponse>(`${BASE_URL}/parse`);
        return response.data;
    },

    // Search anime with pagination
    searchAnime: async (query: string, page: number = 1, signal?: AbortSignal): Promise<SearchResponse> => {
        const encodedQuery = encodeURIComponent(query);
        const response = await axios.get<SearchResponse>(`${BASE_URL}/search/${encodedQuery}/${page}`, { signal });
        return response.data;
    },

    // Get anime by genre with pagination
    getAnimeByGenre: async (genre: string, page: number = 1): Promise<GenreResponse> => {
        const response = await axios.get<GenreResponse>(`${BASE_URL}/genre/${genre}/${page}`);
        return response.data;
    },

    // Get anime schedule for a specific date
    getSchedule: async (date: string): Promise<ScheduleResponse> => {
        const response = await axios.get<ScheduleResponse>(`${BASE_URL}/shedule/${date}`);
        return response.data;
    },

    // Get detailed anime information
    getAnimeInfo: async (id: string): Promise<AnimeInfoResponse> => {
        const response = await axios.get<AnimeInfoResponse>(`${BASE_URL}/related/${id}`);
        return response.data;
    },

    // Get mixed anime list (movies, OVA, TV series etc.)
    getMixedAnime: async (type: 'movie' | 'ova' | 'ona' | 'subbed-anime' | 'dubbed-anime' | 'special' | 'tv' | 'popular', page: number = 1): Promise<MixAnimeResponse> => {
        const response = await axios.get<MixAnimeResponse>(`${BASE_URL}/mix/${type}/${page}`);
        return response.data;
    },

    // Get episodes for an anime
    getAnimeEpisodes: async (id: string): Promise<EpisodeResponse> => {
        const response = await axios.get<EpisodeResponse>(`${BASE_URL}/episode/${id}`);
        return response.data;
    },

    // Get servers for an episode
    getEpisodeServers: async (epId: string): Promise<ServerResponse> => {
        const response = await axios.get<ServerResponse>(`${BASE_URL}/server/${epId}`);
        return response.data;
    },

    // Get server streaming links
    getServerLinks: async (srcId: string): Promise<ServerLinkResponse> => {
        const response = await axios.get<ServerLinkResponse>(`${BASE_URL}/src-server/${srcId}`);
        return response.data;
    }
};