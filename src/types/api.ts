// src/types/api.ts

export interface Slide {
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
}

export interface TrendingAnime {
    name: string;
    ranking: string;
    imgAni: string;
    jname: string;
    iD: string;
}

export interface UpcomingAnime {
    name: string;
    format: string;
    release: string;
    idani: string;
    imgAnime: string;
}

export interface HomePageResponse {
    slides: Slide[];
    trend: TrendingAnime[];
    UpcomingAnime: UpcomingAnime[];
}

export interface SearchResult {
    name: string;
    jname: string;
    format: string;
    duration: string;
    idanime: string;
    sub: string;
    dubani: string;
    totalep: boolean | number;
    img: string;
    pg: boolean;
}

export interface SearchResponse {
    nextpageavailable: boolean;
    searchYour: SearchResult[];
}

export interface GenreAnime {
    name: string;
    jname: string;
    format: string;
    duration: string;
    sub: string;
    dubXanime: string;
    totalepX: string;
    descX: string;
    imageX: string;
    idX: string;
}

export interface GenreResponse {
    genrey: string;
    nextpageavai: boolean;
    genreX: GenreAnime[];
}

export interface ScheduleAnime {
    name: string;
    jname: string;
    time: string;
    epshedule: string;
}

export interface ScheduleResponse {
    Sheduletoday: ScheduleAnime[];
}

export interface AnimeInfo {
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

export interface AnimeDetails {
    japanese: string;
    aired: string;
    premired: string;
    statusAnime: string;
    malscore: string;
    genre: string[];
    studio: string;
    producer: string[];
}

export interface AnimeCharacter {
    name: string;
    voice: string;
    animeImg: string;
    animedesignation: string;
    voicelang: string;
    voiceImageX: string;
}

export interface AnimeInfoResponse {
    infoX: [AnimeInfo, AnimeDetails, { animechar: AnimeCharacter[] }];
    mal_id: string;
}

export interface MixAnime {
    name: string;
    jname: string;
    format: string;
    duration: string;
    idanime: string;
    sub: string;
    dubani: boolean;
    totalep: boolean;
    img: string;
    pg: string;
}

export interface MixAnimeResponse {
    nextpageavai: boolean;
    mixAni: MixAnime[];
}

export interface Episode {
    order: string;
    name: string;
    epId: string;
}

export interface EpisodeResponse {
    episodetown: Episode[];
}

export interface Server {
    server: string;
    id: string;
    srcId: string;
}

export interface ServerResponse {
    sub: Server[];
    dub: Server[];
}

export interface ServerLink {
    file: string;
    type: string;
}

export interface ServerSource {
    text: string;
    serverlinkAni: string;
    rest: ServerLink[];
}

export interface ServerLinkResponse {
    serverSrc: ServerSource[];
}