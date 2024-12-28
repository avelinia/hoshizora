// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ProfilePicture } from './ProfilePicture';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    Calendar,
    Library,
    Settings
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: string;
}

export function Sidebar() {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const navItems: NavItem[] = [
        { icon: <Home size={24} />, label: 'Home', path: '/' },
        { icon: <Library size={24} />, label: 'Library', path: '/library' },
        { icon: <Calendar size={24} />, label: 'Schedule', path: '/schedule' },
    ];

    return (
        <>
            <aside
                className="w-64 flex flex-col border-r transition-colors duration-200"
                style={{
                    backgroundColor: currentTheme.colors.background.card,
                    borderColor: currentTheme.colors.background.hover
                }}
            >
                {/* Navigation */}
                <nav className="flex-1">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="flex w-[calc(100%-1rem)] mx-2 mt-2 items-center gap-4 px-4 py-3 transition-all duration-200 relative group rounded-lg"
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
                        </button>
                    ))}
                </nav>

                {/* Profile */}
                <div onClick={() => setIsSettingsOpen(true)}
                    className="p-4 m-2 mt-auto relative group cursor-pointer"
                >
                    {/* Background with Avatar */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden">
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
                            <div className="flex-shrink-0 group-hover:scale-110 duration-200">
                                <ProfilePicture size="sm" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <p
                                    className="font-semibold text-sm truncate"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    {localStorage.getItem('username') || 'User Name'}
                                </p>
                                <p
                                    className="text-xs truncate mt-0.5"
                                    style={{ color: currentTheme.colors.text.secondary }}
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