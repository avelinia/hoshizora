import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useTheme } from '../contexts/ThemeContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    title: string;
    episodeNumber: string;
    quality?: string;
    onNextEpisode?: () => void;
    onPreviousEpisode?: () => void;
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
}

export function VideoPlayer({
    src,
    title,
    episodeNumber,
    quality = "1080p",
    onNextEpisode,
    onPreviousEpisode,
    hasNextEpisode = false,
    hasPreviousEpisode = false
}: VideoPlayerProps) {
    const { currentTheme } = useTheme();
    const playerRef = useRef<ReactPlayer>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement !== null);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleProgress = (state: { played: number }) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.seekTo(parseFloat((e.target as HTMLInputElement).value));
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const toggleMute = () => {
        setMuted(!muted);
    };

    const handleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };

    const handleMouseMove = () => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) {
                setControlsVisible(false);
            }
        }, 3000);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playing && setControlsVisible(false)}
        >
            <ReactPlayer
                ref={playerRef}
                url={src}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                onProgress={handleProgress}
                progressInterval={100}
                className="pointer-events-none"
            />

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)'
                }}
            >
                {/* Top Bar */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold">{title}</h2>
                        <p className="text-white/80 text-sm">Episode {episodeNumber} • {quality}</p>
                    </div>
                    <button
                        onClick={() => { }}
                        className="p-2 rounded-lg hover:bg-white/10"
                    >
                        <Settings className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className="p-4 space-y-2">
                    {/* Progress Bar */}
                    <input
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={played}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                        className="w-full"
                        style={{
                            background: `linear-gradient(to right, ${currentTheme.colors.accent.primary} ${played * 100
                                }%, white/20 ${played * 100}%)`
                        }}
                    />

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Play/Pause */}
                            <button
                                onClick={handlePlayPause}
                                className="p-2 rounded-lg hover:bg-white/10"
                            >
                                {playing ? (
                                    <Pause className="w-5 h-5 text-white" />
                                ) : (
                                    <Play className="w-5 h-5 text-white" />
                                )}
                            </button>

                            {/* Previous/Next Episode */}
                            <button
                                onClick={onPreviousEpisode}
                                disabled={!hasPreviousEpisode}
                                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50"
                            >
                                <SkipBack className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={onNextEpisode}
                                disabled={!hasNextEpisode}
                                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50"
                            >
                                <SkipForward className="w-5 h-5 text-white" />
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 rounded-lg hover:bg-white/10"
                                >
                                    {muted || volume === 0 ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-24"
                                    style={{
                                        background: `linear-gradient(to right, white ${volume * 100
                                            }%, white/20 ${volume * 100}%)`
                                    }}
                                />
                            </div>

                            {/* Time Display */}
                            <div className="text-white text-sm">
                                {playerRef.current
                                    ? `${formatTime(
                                        played * playerRef.current.getDuration()
                                    )} / ${formatTime(playerRef.current.getDuration())}`
                                    : '0:00 / 0:00'}
                            </div>
                        </div>

                        {/* Right Controls */}
                        <button
                            onClick={handleFullscreen}
                            className="p-2 rounded-lg hover:bg-white/10"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5 text-white" />
                            ) : (
                                <Maximize className="w-5 h-5 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}