// src/types/watch.ts

// Component types for display
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

// API response types
export interface ServerResponse {
    server: string;
    srcId: string;
    id: string;
}

export interface ServerData {
    sub: ServerResponse[];
    dub: ServerResponse[];
}

export interface StreamSource {
    text: string;
    serverlinkAni: string;
    rest: Array<{
        file: string;
        type: string;
    }>;
}

export interface StreamData {
    serverSrc?: StreamSource[];
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
