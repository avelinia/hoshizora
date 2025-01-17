import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import WatchPageLayout from '../components/WatchPageLayout';
import { useTheme } from '../contexts/ThemeContext';
import type { ServerData, StreamData } from '../types/api';  // Use original ServerData and StreamData
import type { Episode, Server, EpisodeData } from '../types/watch';

interface URLParams {
    animeId: string;
    episodeId: string;
}

export function WatchPage() {
    const { animeId, episodeId } = useParams<keyof URLParams>() as URLParams;
    const navigate = useNavigate();
    const { currentTheme } = useTheme();
    const [selectedServer, setSelectedServer] = useState<string>();
    const [videoUrl, setVideoUrl] = useState<string>();

    // Get episodes list
    const { data: episodeData } = useQuery<EpisodeData>({
        queryKey: ['episodes', animeId],
        queryFn: () => api.getAnimeEpisodes(animeId),
        enabled: !!animeId
    });

    // Get servers for current episode
    const { data: serverData, isLoading: serversLoading } = useQuery<ServerData>({
        queryKey: ['servers', episodeId],
        queryFn: () => api.getEpisodeServers(episodeId),
        enabled: !!episodeId
    });

    // Get video URL when server is selected
    const { isLoading: streamLoading } = useQuery<StreamData>({
        queryKey: ['stream', selectedServer],
        queryFn: () => api.getServerLinks(selectedServer!),
        enabled: !!selectedServer,
        select: (data) => {
            if (data.sources?.[0]?.url) {
                setVideoUrl(data.sources[0].url);
            }
            return data;
        }
    });

    // Format episodes array and find current episode index
    const episodes = episodeData?.episodetown || [];
    const currentEpisodeIndex = episodes.findIndex(ep => ep.epId === episodeId);

    // Format episodes for the list
    const formattedEpisodes: Episode[] = episodes.map(ep => ({
        number: parseInt(ep.order),
        title: ep.name,
        current: ep.epId === episodeId
    }));

    // Format servers list
    const availableServers: Server[] = [
        ...(serverData?.sub || []).map(server => ({
            id: server.serverId.toString(),
            name: server.serverName,
            type: 'sub' as const,
            quality: 'HD'
        })),
        ...(serverData?.dub || []).map(server => ({
            id: server.serverId.toString(),
            name: server.serverName,
            type: 'dub' as const,
            quality: 'HD'
        }))
    ];

    const handleNextEpisode = () => {
        if (currentEpisodeIndex < episodes.length - 1) {
            const nextEpisode = episodes[currentEpisodeIndex + 1];
            navigate(`/watch/${animeId}/episode/${nextEpisode.epId}`);
        }
    };

    const handlePreviousEpisode = () => {
        if (currentEpisodeIndex > 0) {
            const prevEpisode = episodes[currentEpisodeIndex - 1];
            navigate(`/watch/${animeId}/episode/${prevEpisode.epId}`);
        }
    };

    const handleEpisodeSelect = (episode: Episode) => {
        const selectedEp = episodes.find(ep => parseInt(ep.order) === episode.number);
        if (selectedEp) {
            navigate(`/watch/${animeId}/episode/${selectedEp.epId}`);
        }
    };

    const handleServerSelect = (server: Server) => {
        setSelectedServer(server.id);
    };

    // Get current episode details
    const currentEpisode = episodes[currentEpisodeIndex];

    if (!animeId || !episodeId || !currentEpisode) {
        return (
            <div
                className="h-full flex items-center justify-center"
                style={{ backgroundColor: currentTheme.colors.background.main }}
            >
                <div style={{ color: currentTheme.colors.text.primary }}>
                    Invalid episode or anime ID
                </div>
            </div>
        );
    }

    return (
        <WatchPageLayout
            src={videoUrl}
            title={currentEpisode.name}
            episodeNumber={currentEpisode.order}
            quality="1080p"
            onNextEpisode={currentEpisodeIndex < episodes.length - 1 ? handleNextEpisode : undefined}
            onPreviousEpisode={currentEpisodeIndex > 0 ? handlePreviousEpisode : undefined}
            hasNextEpisode={currentEpisodeIndex < episodes.length - 1}
            hasPreviousEpisode={currentEpisodeIndex > 0}
            episodes={formattedEpisodes}
            servers={availableServers}
            currentServer={selectedServer}
            onServerSelect={handleServerSelect}
            onEpisodeSelect={handleEpisodeSelect}
            isLoading={serversLoading || streamLoading}
        />
    );
}