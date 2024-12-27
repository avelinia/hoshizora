import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

interface SetupGuardProps {
    children: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSetup = () => {
            const setupComplete = localStorage.getItem('setupComplete') === 'true';

            if (!setupComplete && location.pathname !== '/setup') {
                navigate('/setup');
            }

            setIsLoading(false);
        };

        checkSetup();
    }, [navigate, location]);

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    return children;
}