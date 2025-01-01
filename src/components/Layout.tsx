// src/components/Layout.tsx
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const setupComplete = localStorage.getItem('setupComplete') === 'true';
    const showSidebar = setupComplete && !location.pathname.includes('/setup');
    const { currentTheme } = useTheme();

    return (
        <div className="h-screen flex flex-col overflow-x-hidden"
            style={{ borderColor: currentTheme.colors.background.hover }}
        >
            {/* Spacer div to match TitleBar height */}
            <div className="h-12" />

            {/* Main content area */}
            <div className="flex-1 flex min-h-0" style={{ backgroundColor: currentTheme.colors.background.card }}>
                {/* Conditionally render sidebar */}
                {showSidebar && <Sidebar />}

                {/* Main content with automatic scrolling */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden m-1 mt-0 ml-0 rounded-lg"
                    style={{
                        scrollbarGutter: 'stable',
                        border: `1px solid ${currentTheme.colors.background.hover}`,
                        backgroundColor: currentTheme.colors.background.main
                    }}>
                    {children}
                </main>
            </div>
        </div>
    );
}