import { useTheme } from '../contexts/ThemeContext';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    size?: number;
}

export function LoadingSpinner({ fullScreen = false, size = 24 }: LoadingSpinnerProps) {
    const { currentTheme } = useTheme();

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2
                    className="animate-spin"
                    size={size}
                    style={{ color: currentTheme.colors.accent.primary }}
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <Loader2
                className="animate-spin"
                size={size}
                style={{ color: currentTheme.colors.accent.primary }}
            />
        </div>
    );
}