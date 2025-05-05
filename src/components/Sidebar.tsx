// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { ProfilePicture } from './ProfilePicture';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Home,
    Calendar,
    Library,
    Settings,
    X,
    ChevronRight,
    Download
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { LegacyAnimeInfoResponse } from '../services/api';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

interface DisplayAnime {
    id: string;
    name: string;
    image: string;
    type: string;
}

export function Sidebar() {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [lastOpenedAnime, setLastOpenedAnime] = useState<DisplayAnime | null>(null);
    const isDark = currentTheme.mode === 'dark'

    const navItems: NavItem[] = [
        { icon: <Home size={24} />, label: 'Home', path: '/' },
        { icon: <Library size={24} />, label: 'Library', path: '/library' },
        { icon: <Calendar size={24} />, label: 'Schedule', path: '/schedule' },
    ];

    // Get the current anime ID from the URL if on an anime page
    const animeId = location.pathname.split('/anime/')[1];

    // Function to extract display anime from legacy response
    const extractDisplayAnime = (data: LegacyAnimeInfoResponse | null | undefined): DisplayAnime | null => {
        if (!data || !data.infoX || data.infoX.length < 2) return null;

        return {
            id: data.infoX[0].id,
            name: data.infoX[0].name,
            image: data.infoX[0].image,
            type: data.infoX[1]?.statusAnime || 'Unknown'
        };
    };

    // Fetch current anime details
    const { data: currentAnimeInfo } = useQuery<LegacyAnimeInfoResponse | null>({
        queryKey: ['anime', animeId],
        queryFn: animeId
            ? () => api.getAnimeInfo(animeId)
            : () => Promise.resolve(null),
        enabled: !!animeId,
        staleTime: Infinity,
        gcTime: Infinity,
    });

    // Update last opened anime when current anime changes
    useEffect(() => {
        const extractedAnime = extractDisplayAnime(currentAnimeInfo);

        if (extractedAnime) {
            // Store last opened anime in local storage
            localStorage.setItem('lastOpenedAnime', JSON.stringify(extractedAnime));
            setLastOpenedAnime(extractedAnime);
        }
    }, [currentAnimeInfo]);

    // Load last opened anime from local storage on component mount
    useEffect(() => {
        const storedAnime = localStorage.getItem('lastOpenedAnime');
        if (storedAnime) {
            setLastOpenedAnime(JSON.parse(storedAnime));
        }
    }, []);

    // Determine which anime to display
    const displayAnime = extractDisplayAnime(currentAnimeInfo) || lastOpenedAnime;

    const handleRemoveLastOpened = () => {
        localStorage.removeItem('lastOpenedAnime');
        setLastOpenedAnime(null);
    };

    return (
        <>
            <aside
                className="w-64 flex flex-col transition-colors duration-200"
                style={{
                    backgroundColor: currentTheme.colors.background.card
                }}
            >
                {/* Navigation */}
                <nav className="flex-1 mt-12">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex w-[calc(100%-.5rem)] mx-1 mb-1 items-center gap-4 px-4 py-3 transition-all duration-200 relative group rounded-lg"
                            style={{
                                color: currentTheme.colors.text.primary,
                                backgroundColor: location.pathname === item.path
                                    ? `${currentTheme.colors.background.hover}`
                                    : 'transparent'
                            }}
                        >
                            <div className="relative z-10">{item.icon}</div>
                            <span className="relative z-10">{item.label}</span>

                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg duration-100"
                                style={{
                                    backgroundColor: `${currentTheme.colors.background.hover}80`,
                                    opacity: location.pathname === item.path ? 0 : undefined
                                }}
                            />
                        </Link>
                    ))}

                    {/* Last Opened Anime Section */}
                    <AnimatePresence>
                        {displayAnime && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{
                                    opacity: 1,
                                    height: 'auto',
                                    marginTop: 8,
                                    transition: {
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    height: 0,
                                    marginTop: 0,
                                    transition: {
                                        duration: 0.2,
                                        ease: "easeInOut"
                                    }
                                }}
                                className="overflow-hidden"
                            >
                                {/* Separator */}
                                <div
                                    className="h-px mb-2 mx-4"
                                    style={{ backgroundColor: currentTheme.colors.background.hover }}
                                />

                                {/* Current Anime Header */}
                                <div
                                    className="px-4 py-2 text-xs font-medium uppercase flex items-center justify-between"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    <span>Previously Viewed</span>
                                    <button
                                        onClick={handleRemoveLastOpened}
                                        className="opacity-50 hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Anime Item */}
                                <motion.button
                                    onClick={() => navigate(`/anime/${displayAnime.id}`)}
                                    className="flex w-[calc(100%-.5rem)] mx-1 items-center gap-4 px-4 py-3 transition-all duration-300 relative group rounded-lg"
                                    style={{
                                        backgroundColor: location.pathname === `/anime/${displayAnime.id}`
                                            ? currentTheme.colors.background.hover
                                            : 'transparent'
                                    }}
                                    whileHover={{
                                        backgroundColor: location.pathname === `/anime/${displayAnime.id}`
                                            ? currentTheme.colors.background.hover
                                            : `${currentTheme.colors.background.hover}60`
                                    }}
                                >
                                    <div className="relative group">
                                        <div
                                            className="absolute -inset-1.5 rounded-lg opacity-75 group-hover:opacity-100 transition-all duration-300"
                                        ></div>
                                        <img
                                            src={displayAnime.image}
                                            alt={displayAnime.name}
                                            className="w-12 h-16 object-cover rounded-lg shadow-md relative z-10 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 text-left max-w-24">
                                        <h3
                                            className="font-semibold text-sm line-clamp-1 transition-colors duration-300"
                                            style={{
                                                color: currentTheme.colors.text.primary
                                            }}
                                        >
                                            {displayAnime.name}
                                        </h3>
                                        <p
                                            className="text-xs line-clamp-1 transition-colors duration-300"
                                            style={{
                                                color: `${currentTheme.colors.text.secondary}80`
                                            }}
                                        >
                                            {displayAnime.type}
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        <ChevronRight
                                            size={16}
                                            style={{
                                                color: currentTheme.colors.text.secondary
                                            }}
                                        />
                                    </motion.div>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>

                {/* Downloads Section */}
                <div className="mb-2 rounded-lg transition-all duration-200 relative group"
                    style={{
                        backgroundColor: currentTheme.colors.background.card,
                    }}
                >
                    <Link
                        to="/downloads"
                        className="flex w-[calc(100%-.5rem)] mx-1 items-center gap-4 px-4 py-3 transition-all duration-200 relative group rounded-lg"
                        style={{
                            backgroundColor: location.pathname === '/downloads'
                                ? `${currentTheme.colors.background.hover}`
                                : 'transparent'
                        }}
                    >
                        <Download className='relative z-10' size={24} />
                        <span className="relative z-10">Downloads</span>
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg duration-100"
                            style={{
                                backgroundColor: `${currentTheme.colors.background.hover}80`,
                                opacity: location.pathname === '/downloads' ? 0 : undefined
                            }}
                        />
                    </Link>
                </div>

                {/* Profile */}
                <div onClick={() => setIsSettingsOpen(true)}
                    className="p-4 m-1 mt-auto relative group cursor-pointer"
                >
                    {/* Background with Avatar */}
                    <div className="absolute inset-0 rounded-md overflow-hidden">
                        <div
                            className="absolute inset-0 transition-transform duration-300 group-hover:scale-110"
                            style={{
                                backgroundImage: `linear-gradient(to bottom, transparent, ${currentTheme.colors.background.card})`,
                            }}
                        />
                        <div
                            className="w-full h-full blur-sm brightness-50 scale-110 transition-transform duration-300 group-hover:scale-125"
                            style={{
                                backgroundColor: currentTheme.colors.accent.primary,
                                maskImage: 'linear-gradient(to bottom, black, transparent)'
                            }}
                        />
                    </div>

                    {/* Content */}
                    <div className="relative">
                        {/* Avatar and Info */}
                        <div className="flex items-start gap-3">
                            <div className="shrink-0 group-hover:scale-110 duration-200">
                                <ProfilePicture size="sm" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <p
                                    className="font-semibold text-sm truncate"
                                    style={{ color: isDark ? currentTheme.colors.text.primary : 'white' }}
                                >
                                    {localStorage.getItem('username') || 'User Name'}
                                </p>
                                <p
                                    className="text-xs truncate mt-0.5 opacity-50"
                                    style={{ color: isDark ? currentTheme.colors.text.primary : 'white' }}
                                >
                                    Welcome back!
                                </p>
                            </div>
                        </div>

                        {/* Settings Button */}
                        <button
                            className="mt-4 w-full p-2 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
                            style={{
                                color: currentTheme.colors.text.primary
                            }}
                        >
                            <Settings size={16} />
                            <span className="text-sm">Settings</span>
                        </button>
                    </div>
                </div>
            </aside>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </>
    );
}