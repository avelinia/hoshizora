// src/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query';
import { Carousel } from '../components/Carousel';
import { TrendingList } from '../components/TrendingList';
import { UpcomingList } from '../components/UpcomingList';
import { HomePageSkeleton } from '../components/loading/Shimmer';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import type { LegacyHomePageResponse } from '../services/api';  // We'll need to export this type

export function HomePage() {
    const { currentTheme } = useTheme();
    const { data, isLoading, error } = useQuery<LegacyHomePageResponse>({
        queryKey: ['homepage'],
        queryFn: api.getHomePage
    });

    if (isLoading) {
        return (
            <div
                className="min-h-full w-full p-8"
                style={{ backgroundColor: currentTheme.colors.background.main }}
            >
                <div className="max-w-[1400px] mx-auto">
                    <HomePageSkeleton />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-full">
                <div style={{ color: currentTheme.colors.accent.primary }}>
                    Failed to load data
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-full w-full"
            style={{ backgroundColor: currentTheme.colors.background.main }}
        >
            <div className="max-w-[1400px] mx-auto p-8">
                <Carousel slides={data.slides} />

                <section className="mt-12">
                    <h2
                        className="text-2xl font-bold mb-6"
                        style={{ color: currentTheme.colors.text.accent }}
                    >
                        Trending Now
                    </h2>
                    <TrendingList trending={data.trend} />
                </section>

                <section className="mt-12 mb-8">
                    <h2
                        className="text-2xl font-bold mb-6"
                        style={{ color: currentTheme.colors.text.accent }}
                    >
                        Upcoming Releases
                    </h2>
                    <UpcomingList upcoming={data.UpcomingAnime} />
                </section>
            </div>
        </div>
    );
}