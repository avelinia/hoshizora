// src/components/Carousel.tsx
import { useState, useEffect, useCallback } from 'react';
import { TransformedHomePageData } from '../types/api';
import { ChevronLeft, ChevronRight, Play, Pause, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';


interface CarouselProps {
    slides: TransformedHomePageData['slides'];
}

export function Carousel({ slides }: CarouselProps) {
    const { currentTheme } = useTheme();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [previousSlide, setPreviousSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const isDark = currentTheme.mode === "dark"

    const getBackgroundStyles = (index: number) => {
        const baseStyles = {
            opacity: 0,
            transform: 'scale(1.05)',
            transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'blur(0px)',
        };

        if (index === currentSlide) {
            return {
                ...baseStyles,
                opacity: 1,
                transform: `scale(1.05) translateX(${direction === 'right' ? '0%' : '0%'})`,
            };
        }

        if (index === previousSlide) {
            return {
                ...baseStyles,
                transform: `scale(1.05) translateX(${direction === 'right' ? '-5%' : '5%'})`,
            };
        }

        return {
            ...baseStyles,
            transform: `scale(1.05) translateX(${direction === 'right' ? '5%' : '-5%'})`,
        };
    };

    const getContentStyles = (index: number): React.CSSProperties => {
        if (index === currentSlide) {
            return {
                opacity: 1,
                transform: 'scale(1)',
                transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'auto',
            };
        }

        if (index === previousSlide) {
            return {
                opacity: 0,
                transform: 'scale(0.97)',
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
            };
        }

        return {
            opacity: 0,
            transform: 'scale(0.97)',
            pointerEvents: 'none',
        };
    };

    const handleSlideChange = useCallback((newIndex: number) => {
        if (!isTransitioning && newIndex !== currentSlide) {
            setIsTransitioning(true);
            setPreviousSlide(currentSlide);
            setDirection(newIndex > currentSlide ? 'right' : 'left');
            setCurrentSlide(newIndex);
            setProgress(0);
            setTimeout(() => setIsTransitioning(false), 500);
        }
    }, [currentSlide, isTransitioning]);

    const nextSlide = useCallback(() => {
        handleSlideChange((currentSlide + 1) % slides.length);
    }, [currentSlide, slides.length, handleSlideChange]);

    const prevSlide = useCallback(() => {
        handleSlideChange((currentSlide - 1 + slides.length) % slides.length);
    }, [currentSlide, slides.length, handleSlideChange]);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + (50 / 8000 * 100);
            });
        }, 50);
        return () => clearInterval(timer);
    }, [isPaused, nextSlide]);

    return (
        <div className="relative w-full h-[500px] overflow-hidden rounded-2xl select-none">
            {/* Background Layer */}
            {slides.map((slide, index) => (
                <div
                    key={`bg-${slide.animeId}-${index}`}
                    className="absolute inset-0 overflow-hidden"
                    style={getBackgroundStyles(index)}
                >
                    <img
                        src={slide.imageAnime}
                        alt={slide.name}
                        className={`w-full h-full object-cover transition-all duration-300 ${isDark ? 'brightness-50' : 'opacity-50'}`}
                    />
                    <div
                        className="absolute inset-0 transition-all duration-300"
                        style={{
                            backgroundImage: `linear-gradient(90deg, 
                                ${currentTheme.colors.background.main}dd 0%, 
                                ${currentTheme.colors.background.main}90 30%,
                                transparent 60%),
                                linear-gradient(0deg, 
                                ${currentTheme.colors.background.main}dd 0%, 
                                transparent 50%)`
                        }}
                    />
                </div>
            ))}

            {/* Content Layer */}
            {slides.map((slide, index) => (
                <div
                    key={`content-${slide.animeId}-${index}`}
                    className="absolute inset-0 group"
                    style={getContentStyles(index)}
                >
                    {/* Fixed position button container */}
                    <div className="absolute bottom-12 right-12 flex gap-4 z-10">
                        <button
                            onClick={() => navigate(`/anime/${slide.animeId}/watch`)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium 
                            transition-all duration-300 ease-out hover:scale-105 hover:gap-3
                            shadow-lg hover:shadow-xl"
                            style={{
                                backgroundColor: currentTheme.colors.accent.primary,
                                color: isDark ? currentTheme.colors.background.main : currentTheme.colors.text.primary
                            }}
                        >
                            <Play className="w-5 h-5" />
                            <span>Start Watching</span>
                        </button>

                        <button
                            onClick={() => navigate(`/anime/${slide.animeId}`)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium 
                            transition-all duration-300 ease-out hover:scale-105 hover:gap-3
                            shadow-lg hover:shadow-xl"
                            style={{
                                backgroundColor: `${currentTheme.colors.background.card}`,
                                color: currentTheme.colors.text.primary,
                                border: `1px solid ${currentTheme.colors.background.hover}`
                            }}
                        >
                            <Info className="w-5 h-5" />
                            <span>More Details</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full mx-auto px-8">
                        <div className="max-w-2xl relative">
                            <div className="transition-all duration-300 transform scale-90 
                            origin-left">
                                <h1
                                    className="text-5xl font-bold mb-2 leading-tight"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    {slide.name}
                                </h1>

                                <h2
                                    className="text-xl mb-3"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    {slide.jname}
                                </h2>

                                <p
                                    className="text-base mb-4"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    {slide.anidesc}
                                </p>

                                <div className="flex gap-2">
                                    {[slide.format, slide.duration, slide.quality].map((tag, i) => (
                                        <span
                                            key={`${slide.animeId}-tag-${i}`}
                                            className="px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm 
                                            transition-all duration-300 ease-out hover:scale-105"
                                            style={{
                                                backgroundColor: `${currentTheme.colors.background.card}95`,
                                                color: currentTheme.colors.text.accent
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-3">
                <div className="flex gap-2 mr-4">
                    {slides.map((_, index) => (
                        <button
                            key={`indicator-${index}`}
                            onClick={() => handleSlideChange(index)}
                            className="group relative h-1 rounded-full overflow-hidden
                            transition-all duration-300 ease-out"
                            style={{
                                width: index === currentSlide ? '2rem' : '0.5rem',
                                backgroundColor: `${currentTheme.colors.background.card}95`,
                            }}
                        >
                            {index === currentSlide && (
                                <div
                                    className="absolute inset-0 transition-all duration-300 ease-out"
                                    style={{
                                        backgroundColor: currentTheme.colors.accent.primary,
                                        width: `${progress}%`
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {[
                    { icon: isPaused ? Play : Pause, onClick: () => setIsPaused(!isPaused) },
                    { icon: ChevronLeft, onClick: prevSlide },
                    { icon: ChevronRight, onClick: nextSlide }
                ].map((control, index) => (
                    <button
                        key={index}
                        onClick={control.onClick}
                        className="p-2 rounded-lg backdrop-blur-sm transition-all duration-300 
                        ease-out hover:scale-110 hover:bg-white/10"
                        style={{
                            backgroundColor: `${currentTheme.colors.background.card}95`,
                            color: currentTheme.colors.text.primary
                        }}
                    >
                        <control.icon className="w-4 h-4" />
                    </button>
                ))}
            </div>
        </div>
    );
}