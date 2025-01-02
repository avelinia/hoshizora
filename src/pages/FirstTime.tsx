import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { ProfilePicture } from '../components/ProfilePicture';
import { useNavigate } from 'react-router-dom';
import { Palette, User, Check, ArrowRight, Subtitles, Headphones } from 'lucide-react';

type ThemeMode = 'dark' | 'light';

export function FirstTimeSetup() {
    const { currentTheme, setTheme, availableThemes } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
    const [preferences, setPreferences] = useState({
        username: '',
        preferDub: false,
        selectedTheme: Object.keys(availableThemes)[0],
    });

    const steps = [
        {
            title: 'Welcome to Hoshizora',
            description: 'Let\'s personalize your experience in a few simple steps',
            icon: null,
        },
        {
            title: 'Choose Your Theme',
            description: 'Select a theme that suits your style',
            icon: <Palette className="w-6 h-6" />,
        },
        {
            title: 'Create Your Profile',
            description: 'Tell us what to call you',
            icon: <User className="w-6 h-6" />,
        },
        {
            title: 'Language Preference',
            description: 'Choose your preferred audio language',
            icon: <Headphones className="w-6 h-6" />,
        }
    ];

    const darkThemes = Object.entries(availableThemes)
        .filter(([, theme]) => theme.mode === 'dark');

    const lightThemes = Object.entries(availableThemes)
        .filter(([, theme]) => theme.mode === 'light');

    const handleComplete = () => {
        localStorage.setItem('username', preferences.username);
        localStorage.setItem('preferDub', preferences.preferDub.toString());
        localStorage.setItem('setupComplete', 'true');
        navigate('/');
    };

    return (
        <div
            className="h-full flex items-center justify-center p-4"
            style={{ backgroundColor: currentTheme.colors.background.main }}
        >
            <div
                className="w-full max-w-4xl rounded-2xl p-8 relative overflow-hidden"
                style={{ backgroundColor: currentTheme.colors.background.card }}
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 flex">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className="flex-1 transition-all duration-500"
                            style={{
                                backgroundColor: index <= step
                                    ? currentTheme.colors.accent.primary
                                    : currentTheme.colors.background.hover,
                                transform: `scaleX(${index === step ? 1 : 0.92})`
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="mt-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-[28rem]"
                        >
                            {/* Step Content */}
                            <div className="flex items-center gap-3 mb-2">
                                {steps[step].icon && (
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{ backgroundColor: currentTheme.colors.accent.primary }}
                                    >
                                        {React.cloneElement(steps[step].icon as React.ReactElement, {
                                            color: currentTheme.colors.background.main
                                        })}
                                    </div>
                                )}
                                <div>
                                    <h2
                                        className="text-2xl font-bold"
                                        style={{ color: currentTheme.colors.text.primary }}
                                    >
                                        {steps[step].title}
                                    </h2>
                                    <p
                                        className="text-sm mt-1"
                                        style={{ color: currentTheme.colors.text.secondary }}
                                    >
                                        {steps[step].description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                {step === 0 && (
                                    <div className="text-center py-12">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div
                                                className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                                                style={{ backgroundColor: currentTheme.colors.accent.primary }}
                                            >
                                                <span className="text-4xl" style={{ color: currentTheme.colors.background.main }}>
                                                    星
                                                </span>
                                            </div>
                                            <p
                                                className="text-lg max-w-md mx-auto"
                                                style={{ color: currentTheme.colors.text.secondary }}
                                            >
                                                Welcome to your personalized anime streaming experience. Let's get started by setting up your preferences.
                                            </p>
                                        </motion.div>
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="space-y-6">
                                        {/* Theme Mode Switcher */}
                                        <div
                                            className="inline-flex rounded-xl p-1 relative w-full justify-between"
                                            style={{
                                                backgroundColor: currentTheme.colors.background.hover,
                                            }}
                                        >
                                            {(['dark', 'light'] as ThemeMode[]).map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setThemeMode(mode)}
                                                    className="relative z-10 px-6 py-2 rounded-lg w-full"
                                                    style={{
                                                        backgroundColor: themeMode === mode
                                                            ? `${currentTheme.colors.background.main}90`
                                                            : 'transparent',
                                                        color: currentTheme.colors.text.primary
                                                    }}
                                                >
                                                    {mode === 'light' ? 'Light Themes' : 'Dark Themes'}
                                                </button>
                                            ))}
                                            <motion.div
                                                layoutId="theme-mode-pill"
                                                className="absolute inset-1 rounded-lg -z-10"
                                                style={{
                                                    backgroundColor: currentTheme.colors.accent.primary,
                                                }}
                                                initial={false}
                                            />
                                        </div>

                                        {/* Theme Grid */}
                                        <div className="relative h-[20rem] overflow-y-auto pr-2 custom-scrollbar">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={themeMode}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="grid grid-cols-2 gap-4"
                                                >
                                                    {(themeMode === 'light' ? lightThemes : darkThemes).map(([key, theme]) => (
                                                        <button
                                                            key={key}
                                                            className="p-4 rounded-xl border-2 transition-all duration-200 relative group"
                                                            style={{
                                                                backgroundColor: theme.colors.background.card,
                                                                borderColor: preferences.selectedTheme === key
                                                                    ? theme.colors.accent.primary
                                                                    : theme.colors.background.hover,
                                                            }}
                                                            onClick={() => {
                                                                setPreferences(prev => ({ ...prev, selectedTheme: key }));
                                                                setTheme(key as any);
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-1">
                                                                    <Palette
                                                                        size={24}
                                                                        style={{ color: theme.colors.accent.primary }}
                                                                    />
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <div style={{ color: theme.colors.text.primary }}>
                                                                        {theme.name}
                                                                    </div>
                                                                    <div
                                                                        className="text-sm mt-1"
                                                                        style={{ color: theme.colors.text.secondary }}
                                                                    >
                                                                        A {theme.name.toLowerCase()} inspired theme
                                                                    </div>

                                                                    {/* Theme Preview */}
                                                                    <div className="mt-4 grid grid-cols-5 gap-2">
                                                                        {Object.entries(theme.colors.accent).map(([key, color]) => (
                                                                            <div
                                                                                key={key}
                                                                                className="h-2 rounded-full"
                                                                                style={{ backgroundColor: color }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {preferences.selectedTheme === key && (
                                                                    <div
                                                                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                                                                        style={{ backgroundColor: theme.colors.accent.primary }}
                                                                    >
                                                                        <Check size={12} color={theme.colors.background.main} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Rest of the steps remain the same */}
                                {step === 2 && (
                                    <div className="max-w-md mx-auto">
                                        <div className="flex flex-col items-center mb-6">
                                            <ProfilePicture size="lg" editable />
                                            <p
                                                className="mt-3 text-sm"
                                                style={{ color: currentTheme.colors.text.secondary }}
                                            >
                                                Click to upload a profile picture
                                            </p>
                                        </div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: currentTheme.colors.text.secondary }}
                                        >
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={preferences.username}
                                            onChange={(e) => {
                                                const newValue = e.target.value.slice(0, 25);
                                                setPreferences(prev => ({ ...prev, username: newValue }));
                                            }}
                                            className="w-full px-4 py-3 rounded-lg transition-colors duration-200"
                                            style={{
                                                backgroundColor: currentTheme.colors.background.hover,
                                                color: currentTheme.colors.text.primary,
                                                border: `1px solid ${currentTheme.colors.background.hover}`
                                            }}
                                            placeholder="Enter your username"
                                            maxLength={25}
                                        />
                                        <div
                                            className="text-xs flex justify-end"
                                            style={{ color: currentTheme.colors.text.secondary }}
                                        >
                                            {preferences.username.length}/25 characters
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="max-w-md mx-auto">
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, preferDub: false }))}
                                                className="w-full p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center gap-4"
                                                style={{
                                                    backgroundColor: currentTheme.colors.background.hover,
                                                    border: `2px solid ${!preferences.preferDub ? currentTheme.colors.accent.primary : 'transparent'}`
                                                }}
                                            >
                                                <div
                                                    className="p-3 rounded-lg"
                                                    style={{ backgroundColor: currentTheme.colors.accent.primary }}
                                                >
                                                    <Subtitles
                                                        size={24}
                                                        style={{ color: currentTheme.colors.background.main }}
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <h3
                                                        className="font-medium"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        Japanese with Subtitles
                                                    </h3>
                                                    <p
                                                        className="text-sm mt-1"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        Watch with original Japanese audio and subtitles
                                                    </p>
                                                </div>
                                                {!preferences.preferDub && (
                                                    <div
                                                        className="ml-auto p-1 rounded-full"
                                                        style={{ backgroundColor: currentTheme.colors.accent.primary }}
                                                    >
                                                        <Check size={16} color={currentTheme.colors.background.main} />
                                                    </div>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => setPreferences(prev => ({ ...prev, preferDub: true }))}
                                                className="w-full p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center gap-4"
                                                style={{
                                                    backgroundColor: currentTheme.colors.background.hover,
                                                    border: `2px solid ${preferences.preferDub ? currentTheme.colors.accent.primary : 'transparent'}`
                                                }}
                                            >
                                                <div
                                                    className="p-3 rounded-lg"
                                                    style={{ backgroundColor: currentTheme.colors.accent.primary }}
                                                >
                                                    <Headphones
                                                        size={24}
                                                        style={{ color: currentTheme.colors.background.main }}
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <h3
                                                        className="font-medium"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        English Dubbed
                                                    </h3>
                                                    <p
                                                        className="text-sm mt-1"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        Watch with English voice acting
                                                    </p>
                                                </div>
                                                {preferences.preferDub && (
                                                    <div
                                                        className="ml-auto p-1 rounded-full"
                                                        style={{ backgroundColor: currentTheme.colors.accent.primary }}
                                                    >
                                                        <Check size={16} color={currentTheme.colors.background.main} />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="mt-12 flex justify-between">
                    <button
                        onClick={() => setStep(prev => prev - 1)}
                        className="px-6 py-2 rounded-lg transition-colors duration-200"
                        style={{
                            backgroundColor: currentTheme.colors.background.hover,
                            color: currentTheme.colors.text.primary,
                            opacity: step === 0 ? 0 : 1,
                            pointerEvents: step === 0 ? 'none' : 'auto'
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => {
                            if (step === steps.length - 1) {
                                handleComplete();
                            } else {
                                setStep(prev => prev + 1);
                            }
                        }}
                        className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: currentTheme.colors.accent.primary,
                            color: currentTheme.colors.background.main
                        }}
                    >
                        <span>{step === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}