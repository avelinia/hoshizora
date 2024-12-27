// src/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query';
import { Carousel } from '../components/Carousel';
import { TrendingList } from '../components/TrendingList';
import { UpcomingList } from '../components/UpcomingList';
import { Sidebar } from '../components/Sidebar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { api } from '../services/api';
import { HomePageResponse } from '../types/api';
import { useTheme } from '../contexts/ThemeContext';

export function HomePage() {
    const { currentTheme } = useTheme();
    const { data, isLoading, error } = useQuery<HomePageResponse>({
        queryKey: ['homepage'],
        queryFn: api.getHomePage
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 pl-64 pt-10">
                    <LoadingSpinner />
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 pl-64 pt-10 flex items-center justify-center">
                    <div style={{ color: currentTheme.colors.accent.primary }}>
                        Failed to load data
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main
                className="flex-1 transition-all duration-300 pl-64 flex flex-col overflow-x-hidden"
                style={{ backgroundColor: currentTheme.colors.background.main }}
            >
                {/* Content with top padding for header */}
                <div className="flex-1 flex justify-center pt-16">
                    <div className="w-full max-w-[1400px] p-8 pb-24">
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
            </main>
        </div>
    );
}