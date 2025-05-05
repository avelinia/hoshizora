import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings,
    SkipForward, SkipBack, RotateCcw, RotateCw, Subtitles
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface PlayerProps {
    src: string;
    title: string;
    episodeNumber: string;
    quality?: string;
    onNextEpisode?: () => void;
    onPreviousEpisode?: () => void;
    hasNextEpisode?: boolean;
    hasPreviousEpisode?: boolean;
    autoPlay?: boolean;
    startTime?: number;
}

export default function Player({
    src,
    title,
    episodeNumber,
    quality = "1080p",
    onNextEpisode,
    onPreviousEpisode,
    hasNextEpisode = false,
    hasPreviousEpisode = false,
    autoPlay = true,
    startTime = 0
}: PlayerProps) {
    const { currentTheme } = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    // Player state
    const [playing, setPlaying] = useState(autoPlay);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [qualities, setQualities] = useState<string[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1);
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // Initialize HLS
    useEffect(() => {
        if (!videoRef.current || !src) return;

        const initHls = () => {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    startLevel: -1,
                    capLevelToPlayerSize: true,
                    autoStartLoad: true,
                });

                hls.attachMedia(videoRef.current!);
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    hls.loadSource(src);
                });

                hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                    const availableQualities = data.levels.map(level => `${level.height}p`);
                    setQualities(['Auto', ...availableQualities]);
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                // Try to recover network error
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                // Cannot recover
                                destroyHls();
                                break;
                        }
                    }
                });

                hlsRef.current = hls;
            } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
                // Fallback for Safari
                videoRef.current.src = src;
            }
        };

        initHls();

        // Set initial time if provided
        if (startTime > 0 && videoRef.current) {
            videoRef.current.currentTime = startTime;
        }

        return destroyHls;
    }, [src, startTime]);

    const destroyHls = () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }
    };

    // Handle keyboard controls
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    seek(-10);
                    break;
                case 'ArrowRight':
                    seek(10);
                    break;
                case 'KeyF':
                    toggleFullscreen();
                    break;
                case 'KeyM':
                    toggleMute();
                    break;
                case 'ArrowUp':
                    adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    adjustVolume(-0.1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement !== null);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Control visibility timer
    useEffect(() => {
        if (!playing) return;

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
            if (playing && !showQualityMenu) {
                setControlsVisible(false);
            }
        }, 3000);

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [playing, controlsVisible, showQualityMenu]);

    // Player controls
    const togglePlay = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play().catch(console.error);
            setPlaying(true);
        } else {
            videoRef.current.pause();
            setPlaying(false);
        }
    };

    const seek = (seconds: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += seconds;
    };

    const handleProgress = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !videoRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setMuted(!muted);
    };

    const adjustVolume = (delta: number) => {
        if (!videoRef.current) return;
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setMuted(newVolume === 0);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
            } catch (error) {
                console.error('Failed to enter fullscreen:', error);
            }
        } else {
            try {
                await document.exitFullscreen();
            } catch (error) {
                console.error('Failed to exit fullscreen:', error);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleQualityChange = (index: number) => {
        if (!hlsRef.current) return;

        hlsRef.current.currentLevel = index - 1; // -1 is auto
        setCurrentQuality(index);
        setShowQualityMenu(false);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group"
            onMouseMove={() => {
                setControlsVisible(true);
                // Reset hide timer
                if (controlsTimeoutRef.current) {
                    clearTimeout(controlsTimeoutRef.current);
                }
                if (playing && !showQualityMenu) {
                    controlsTimeoutRef.current = setTimeout(() => {
                        setControlsVisible(false);
                    }, 3000);
                }
            }}
            onMouseLeave={() => {
                if (playing && !showQualityMenu) {
                    setControlsVisible(false);
                }
            }}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                onDurationChange={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => setBuffering(false)}
                onEnded={() => {
                    setPlaying(false);
                    if (hasNextEpisode && onNextEpisode) {
                        setTimeout(onNextEpisode, 5000);
                    }
                }}
            />

            {/* Buffering Indicator */}
            {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/80 via-transparent to-black/80 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ pointerEvents: controlsVisible ? 'auto' : 'none' }}
            >
                {/* Top Bar */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold">{title}</h2>
                        <p className="text-white/80 text-sm">Episode {episodeNumber} • {quality}</p>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white"
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {/* Quality Menu */}
                        {showQualityMenu && (
                            <div
                                className="absolute right-0 bottom-full mb-2 bg-black/90 rounded-lg overflow-hidden"
                                style={{ minWidth: '120px' }}
                            >
                                {qualities.map((q, i) => (
                                    <button
                                        key={q}
                                        className={`w-full px-4 py-2 text-left hover:bg-white/10 text-white ${i === currentQuality ? 'bg-white/20' : ''
                                            }`}
                                        onClick={() => handleQualityChange(i)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="p-4 space-y-2">
                    {/* Progress Bar */}
                    <div
                        ref={progressRef}
                        className="relative h-1 cursor-pointer group/progress"
                        onClick={handleProgress}
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                        <div
                            className="absolute h-full bg-primary transition-all"
                            style={{
                                width: `${(currentTime / duration) * 100}%`,
                                backgroundColor: currentTheme.colors.accent.primary
                            }}
                        />
                        <div
                            className="absolute h-3 w-3 rounded-full bg-white -top-1 -mt-px opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{
                                left: `${(currentTime / duration) * 100}%`,
                                transform: 'translateX(-50%)'
                            }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-2 rounded-lg hover:bg-white/10 text-white"
                        >
                            {playing ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5" />
                            )}
                        </button>

                        {/* Previous/Next Episode */}
                        <button
                            onClick={onPreviousEpisode}
                            disabled={!hasPreviousEpisode}
                            className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-50"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onNextEpisode}
                            disabled={!hasNextEpisode}
                            className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-50"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>

                        {/* Rewind/Forward */}
                        <button
                            onClick={() => seek(-10)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => seek(10)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white"
                        >
                            <RotateCw className="w-5 h-5" />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleMute}
                                className="p-2 rounded-lg hover:bg-white/10 text-white"
                            >
                                {muted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={volume}
                                onChange={(e) => {
                                    const newVolume = parseFloat(e.target.value);
                                    if (videoRef.current) {
                                        videoRef.current.volume = newVolume;
                                    }
                                    setVolume(newVolume);
                                    setMuted(newVolume === 0);
                                }}
                                className="w-24"
                                style={{
                                    background: `linear-gradient(to right, ${currentTheme.colors.accent.primary} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
                                }}
                            />
                        </div>

                        {/* Time Display */}
                        <div className="text-white text-sm ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        {/* Subtitle Toggle */}
                        <button
                            className="p-2 rounded-lg hover:bg-white/10 text-white ml-auto"
                        >
                            <Subtitles className="w-5 h-5" />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-lg hover:bg-white/10 text-white"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                            ) : (
                                <Maximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Click to Play/Pause */}
            <button
                className="absolute inset-0 w-full h-full cursor-default"
                onClick={(e) => {
                    // Don't trigger if clicking controls
                    if (e.target === e.currentTarget) {
                        togglePlay();
                    }
                }}
            />

            {/* Double Click for Fullscreen */}
            <button
                className="absolute inset-0 w-full h-full cursor-default"
                onDoubleClick={toggleFullscreen}
            />

            {/* Next Episode Overlay */}
            {!playing && hasNextEpisode && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                        <h3 className="text-white text-xl mb-4">Next Episode Starting Soon...</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = 0;
                                        videoRef.current.play().catch(console.error);
                                    }
                                }}
                                className="px-6 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30"
                            >
                                Replay
                            </button>
                            <button
                                onClick={onNextEpisode}
                                className="px-6 py-2 rounded-lg"
                                style={{
                                    backgroundColor: currentTheme.colors.accent.primary,
                                    color: currentTheme.colors.background.main
                                }}
                            >
                                Next Episode
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {duration === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}