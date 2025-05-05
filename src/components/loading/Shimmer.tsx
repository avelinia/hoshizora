// src/components/loading/Shimmer.tsx
import { useTheme } from '../../contexts/ThemeContext';

interface ShimmerProps {
    className?: string;
}

export function Shimmer({ className = '' }: ShimmerProps) {
    return (
        <div className={`relative rounded-lg overflow-hidden ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent rounded-lg" />
        </div>
    );
}

export function HomePageSkeleton() {
    const { currentTheme } = useTheme();

    return (
        <div className="max-w-full w-[1400px] px-8">
            {/* Carousel Skeleton */}
            <div
                className="w-full h-[500px] rounded-lg mb-12"
                style={{ backgroundColor: currentTheme.colors.background.card }}
            >
                <Shimmer className="w-full h-full" />
            </div>

            {/* Trending Section */}
            <div className="mb-12">
                <div
                    className="h-8 w-48 rounded-lg mb-6"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                >
                    <Shimmer className="w-full h-full" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-2/3 rounded-xl"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <Shimmer className="w-full h-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Section */}
            <div>
                <div
                    className="h-8 w-48 rounded-lg mb-6"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                >
                    <Shimmer className="w-full h-full" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-2/3 rounded-xl"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <Shimmer className="w-full h-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AnimeSkeleton() {
    const { currentTheme } = useTheme();

    return (
        <div className="min-h-full">
            {/* Hero Section Skeleton */}
            <div className="relative h-[500px] overflow-hidden">
                {/* Background Shimmer */}
                <div
                    className="absolute inset-0 blur-xl"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                >
                    <Shimmer className="h-full" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 h-full flex items-end">
                    <div className="flex gap-8">
                        {/* Poster */}
                        <div
                            className="w-64 h-96 rounded-xl shrink-0"
                            style={{ backgroundColor: currentTheme.colors.background.card }}
                        >
                            <Shimmer className="h-full" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            {/* Title */}
                            <div
                                className="h-12 w-96 rounded-lg"
                                style={{ backgroundColor: currentTheme.colors.background.card }}
                            >
                                <Shimmer className="h-full" />
                            </div>

                            {/* Subtitle */}
                            <div
                                className="h-8 w-64 rounded-lg"
                                style={{ backgroundColor: currentTheme.colors.background.card }}
                            >
                                <Shimmer className="h-full" />
                            </div>

                            {/* Quick Info */}
                            <div className="flex flex-wrap gap-4 my-6">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-32 rounded-lg"
                                        style={{ backgroundColor: currentTheme.colors.background.card }}
                                    >
                                        <Shimmer className="h-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-6 w-24 rounded-full"
                                        style={{ backgroundColor: currentTheme.colors.background.card }}
                                    >
                                        <Shimmer className="h-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-6">
                                <div
                                    className="h-12 w-40 rounded-xl"
                                    style={{ backgroundColor: currentTheme.colors.background.card }}
                                >
                                    <Shimmer className="h-full" />
                                </div>
                                <div
                                    className="h-12 w-40 rounded-xl"
                                    style={{ backgroundColor: currentTheme.colors.background.card }}
                                >
                                    <Shimmer className="h-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Synopsis */}
                <section className="mb-12">
                    <div
                        className="h-8 w-48 rounded-lg mb-4"
                        style={{ backgroundColor: currentTheme.colors.background.card }}
                    >
                        <Shimmer className="h-full" />
                    </div>
                    <div
                        className="h-32 rounded-lg"
                        style={{ backgroundColor: currentTheme.colors.background.card }}
                    >
                        <Shimmer className="h-full" />
                    </div>
                </section>

                {/* Characters Section */}
                <section className="mb-12">
                    <div
                        className="h-8 w-64 rounded-lg mb-6"
                        style={{ backgroundColor: currentTheme.colors.background.card }}
                    >
                        <Shimmer className="h-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="flex gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: currentTheme.colors.background.card }}
                            >
                                <div className="flex gap-4 flex-1">
                                    <div className="w-16 h-16 rounded-lg shrink-0">
                                        <Shimmer className="h-full" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-6 w-32 rounded mb-2">
                                            <Shimmer className="h-full" />
                                        </div>
                                        <div className="h-4 w-24 rounded">
                                            <Shimmer className="h-full" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg shrink-0">
                                        <Shimmer className="h-full" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-6 w-32 rounded mb-2">
                                            <Shimmer className="h-full" />
                                        </div>
                                        <div className="h-4 w-24 rounded">
                                            <Shimmer className="h-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recommendations */}
                <section>
                    <div
                        className="h-8 w-56 rounded-lg mb-6"
                        style={{ backgroundColor: currentTheme.colors.background.card }}
                    >
                        <Shimmer className="h-full" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="aspect-2/3 rounded-xl"
                                style={{ backgroundColor: currentTheme.colors.background.card }}
                            >
                                <Shimmer className="h-full" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}