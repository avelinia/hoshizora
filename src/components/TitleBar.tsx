import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { VscChromeRestore, VscChromeMaximize, VscChromeClose, VscChromeMinimize } from "react-icons/vsc";
import { Search } from './Search';
import { useLocation } from 'react-router-dom';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
    const { currentTheme } = useTheme();
    const [isMaximized, setIsMaximized] = React.useState(false);
    const location = useLocation();
    const setupComplete = localStorage.getItem('setupComplete') === 'true';
    const showSearch = setupComplete && !location.pathname.includes('/setup');

    const appWindow = getCurrentWindow();

    useEffect(() => {
        // Check initial window state
        const checkMaximized = async () => {
            try {
                const maximized = await appWindow.isMaximized();
                setIsMaximized(maximized);
            } catch (error) {
                console.error('Failed to check window state:', error);
            }
        };
        checkMaximized();

        // Set up resize listener
        const unlisten = appWindow.onResized(async () => {
            try {
                const maximized = await appWindow.isMaximized();
                setIsMaximized(maximized);
            } catch (error) {
                console.error('Failed to update window state:', error);
            }
        });

        // Cleanup listener on unmount
        return () => {
            unlisten.then(unlistenFn => unlistenFn());
        };
    }, []);

    const handleMinimize = async () => {
        try {
            await appWindow.minimize();
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    };

    const handleMaximize = async () => {
        try {
            await appWindow.toggleMaximize();
            const maximized = await appWindow.isMaximized();
            setIsMaximized(maximized);
        } catch (error) {
            console.error('Failed to toggle maximize:', error);
        }
    };

    appWindow.onResized

    const handleClose = async () => {
        try {
            await appWindow.close();
        } catch (error) {
            console.error('Failed to close window:', error);
        }
    };

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
                        onClick={handleMinimize}
                        className="h-12 w-12 flex items-center justify-center transition-colors duration-200 hover:bg-gray-500/10"
                        style={{ color: currentTheme.colors.text.secondary }}
                    >
                        <VscChromeMinimize size={16} />
                    </button>

                    <button
                        onClick={handleMaximize}
                        className="h-12 w-12 flex items-center justify-center transition-colors duration-200 hover:bg-gray-500/10"
                        style={{ color: currentTheme.colors.text.secondary }}
                    >
                        {isMaximized ? (
                            <VscChromeRestore size={16} />
                        ) : (
                            <VscChromeMaximize size={16} />
                        )}
                    </button>

                    <button
                        onClick={handleClose}
                        className="h-12 w-12 flex items-center justify-center transition-colors duration-200 hover:bg-red-500/20 hover:text-red-500"
                        style={{ color: currentTheme.colors.text.secondary }}
                    >
                        <VscChromeClose size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}