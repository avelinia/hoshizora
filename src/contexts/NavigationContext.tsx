// src/contexts/NavigationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationState {
    positions: string[];
    index: number;
}

interface NavigationContextType {
    navigationState: NavigationState;
    canGoBack: boolean;
    canGoForward: boolean;
    direction: number;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const [navigationState, setNavigationState] = useState<NavigationState>(() => ({
        positions: [location.key],
        index: 0
    }));
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setNavigationState(prev => {
            const existingIndex = prev.positions.indexOf(location.key);

            if (existingIndex === -1) {
                // New location - going forward
                setDirection(1);
                return {
                    positions: [...prev.positions.slice(0, prev.index + 1), location.key],
                    index: prev.index + 1
                };
            } else {
                // Existing location (back/forward navigation)
                setDirection(existingIndex < prev.index ? -1 : 1);
                return {
                    ...prev,
                    index: existingIndex
                };
            }
        });
    }, [location.key]);

    const canGoBack = navigationState.index > 0;
    const canGoForward = navigationState.index < navigationState.positions.length - 1;

    return (
        <NavigationContext.Provider value={{
            navigationState,
            canGoBack,
            canGoForward,
            direction
        }}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}