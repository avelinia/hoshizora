// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, ThemeKey, Theme } from '../themes';

type ThemeContextType = {
    currentTheme: Theme;
    setTheme: (key: ThemeKey) => void;
    availableThemes: typeof themes;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<Theme>(themes.starryNight);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeKey;
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(themes[savedTheme]);
        }
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty(
            '--scrollbar-thumb',
            `${currentTheme.colors.accent.primary}40`
        );
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [currentTheme]);

    const setTheme = (key: ThemeKey) => {
        setCurrentTheme(themes[key]);
        localStorage.setItem('theme', key);
    };

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                availableThemes: themes,
            }}
        >
            <div
                className="h-screen overflow-hidden"
                style={{
                    backgroundColor: currentTheme.colors.background.main,
                    color: currentTheme.colors.text.primary
                }}
            >
                <div className="h-full overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}