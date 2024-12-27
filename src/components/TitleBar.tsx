import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Minus, X, Maximize, Minimize } from 'lucide-react';
import { Search } from './Search';
import { useLocation } from 'react-router-dom';

export function TitleBar() {
    const { currentTheme } = useTheme();
    const [isMaximized, setIsMaximized] = React.useState(false);
    const location = useLocation();
    const setupComplete = localStorage.getItem('setupComplete') === 'true';
    const showSearch = setupComplete && !location.pathname.includes('/setup');

    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 h-12"
            style={{ backgroundColor: currentTheme.colors.background.card }}
        >
            {/* Drag region that covers the entire titlebar */}
            <div
                data-tauri-drag-region
                className="absolute inset-0"
            />

            {/* Content container with pointer-events-auto to allow interaction */}
            <div className="relative flex h-full pointer-events-auto">
                {/* Logo Section */}
                <div
                    className="w-64 flex items-center px-6 border-r select-none"
                    style={{ borderColor: currentTheme.colors.background.hover }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg font-bold"
                            style={{
                                backgroundColor: currentTheme.colors.accent.primary,
                                color: currentTheme.colors.background.main
                            }}
                        >
                            星
                        </div>
                        <span
                            className="font-bold text-lg"
                            style={{ color: currentTheme.colors.text.primary }}
                        >
                            Hoshizora
                        </span>
                    </div>
                </div>

                {/* Search Container - Centered in the remaining space */}
                <div data-tauri-drag-region className="flex-1 flex items-center justify-center">
                    {showSearch && (
                        <div className="w-[42rem] max-w-[calc(100%-2rem)]">
                            <Search />
                        </div>
                    )}
                </div>

                {/* Window Controls */}
                <div className="flex items-center">
                    <button
                        className="h-12 w-12 flex items-center justify-center transition-colors duration-200 hover:bg-gray-500/10"
                        style={{ color: currentTheme.colors.text.secondary }}
                    >
                        <Minus size={16} />
                    </button>

                    <button
                        className="h-12 w-12 flex items-center justify-center transition-colors duration-200 hover:bg-gray-500/10"
                        style={{ color: currentTheme.colors.text.secondary }}
                        onClick={() => setIsMaximized(!isMaximized)}
                    >
                        {isMaximized ? (
                            <Minimize size={16} />
                        ) : (
                            <Maximize size={16} />
                        )}
                    </button>

                    <button
                        className="h-12 w-12 flex items-center justify-center transition-colors duration-200 hover:bg-red-500/20 hover:text-red-500"
                        style={{ color: currentTheme.colors.text.secondary }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}