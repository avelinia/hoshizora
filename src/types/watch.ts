// src/types/watch.ts

export interface Episode {
    number: number;
    title: string;
    current?: boolean;
    watched?: boolean;
    progress?: number;
    duration?: number;
}

export interface Server {
    id: string;
    name: string;
    type: 'sub' | 'dub';
    quality: string;
}

export interface EpisodeData {
    episodetown?: Array<{
        epId: string;
        order: string;
        name: string;
    }>;
}

export interface ServerData {
    sub: Array<{
        server: string;
        srcId: string;
        id: string;
    }>;
    dub: Array<{
        server: string;
        srcId: string;
        id: string;
    }>;
}

export interface StreamData {
    serverSrc?: Array<{
        text: string;
        serverlinkAni: string;
        rest: Array<{
            file: string;
            type: string;
        }>;
    }>;
}