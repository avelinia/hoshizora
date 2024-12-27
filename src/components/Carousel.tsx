// src/components/Carousel.tsx
import { useState, useEffect, useCallback } from 'react';
import { Slide } from '../types/api';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CarouselProps {
    slides: Slide[];
}

export function Carousel({ slides }: CarouselProps) {
    const { currentTheme } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const nextSlide = useCallback(() => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setCurrentSlide((prev) => (prev + 1) % slides.length);
            setProgress(0);
        }
    }, [isTransitioning, slides.length]);

    const prevSlide = useCallback(() => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
            setProgress(0);
        }
    }, [isTransitioning, slides.length]);

    // Auto-advance timer
    useEffect(() => {
        if (isPaused) return;

        const intervalTime = 50; // Update progress every 50ms
        const totalTime = 8000; // Total time for each slide (8 seconds)
        const progressIncrement = (intervalTime / totalTime) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + progressIncrement;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [isPaused, nextSlide]);

    // Preload images
    useEffect(() => {
        slides.forEach((slide) => {
            const img = new Image();
            img.src = slide.imageAnime;
        });
    }, [slides]);

    const slide = slides[currentSlide];
    const nextSlideIndex = (currentSlide + 1) % slides.length;

    return (
        <div className="relative w-full h-96 overflow-hidden rounded-lg group">
            {/* Current Slide */}
            <div className="absolute inset-0 transition-transform duration-700 ease-in-out">
                <img
                    src={slide.imageAnime}
                    alt={slide.name}
                    className="w-full h-full object-cover"
                    onLoad={() => setIsTransitioning(false)}
                />
            </div>

            {/* Next Slide (preloaded) */}
            <div className="absolute inset-0 opacity-0">
                <img
                    src={slides[nextSlideIndex].imageAnime}
                    alt={slides[nextSlideIndex].name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Gradient Overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to top, ${currentTheme.colors.background.main}, transparent)`,
                    opacity: 0.9
                }}
            />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500">
                <h2
                    className="text-3xl font-bold mb-2"
                    style={{ color: currentTheme.colors.text.primary }}
                >
                    {slide.name}
                </h2>
                <p
                    className="text-lg mb-2 opacity-90"
                    style={{ color: currentTheme.colors.text.secondary }}
                >
                    {slide.jname}
                </p>
                <p
                    className="text-sm mb-4 line-clamp-2 max-w-2xl"
                    style={{ color: currentTheme.colors.text.secondary }}
                >
                    {slide.anidesc}
                </p>

                <div className="flex gap-4">
                    {[slide.format, slide.duration, slide.quality].map((tag, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm"
                            style={{
                                backgroundColor: currentTheme.colors.background.card,
                                color: currentTheme.colors.text.accent,
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                <div
                    className="h-full transition-all duration-100 ease-linear"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: currentTheme.colors.accent.primary
                    }}
                />
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 right-6 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: currentTheme.colors.text.primary,
                            opacity: index === currentSlide ? 1 : 0.3,
                            transform: `scale(${index === currentSlide ? 1.5 : 1})`
                        }}
                        onClick={() => {
                            setCurrentSlide(index);
                            setProgress(0);
                        }}
                    />
                ))}
            </div>

            {/* Controls */}
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={prevSlide}
                    className="p-2 rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                    style={{
                        backgroundColor: `${currentTheme.colors.background.card}90`,
                        color: currentTheme.colors.text.primary
                    }}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={nextSlide}
                    className="p-2 rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                    style={{
                        backgroundColor: `${currentTheme.colors.background.card}90`,
                        color: currentTheme.colors.text.primary
                    }}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Play/Pause Button */}
            <button
                onClick={() => setIsPaused(!isPaused)}
                className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                style={{
                    backgroundColor: `${currentTheme.colors.background.card}90`,
                    color: currentTheme.colors.text.primary
                }}
            >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
        </div>
    );
}