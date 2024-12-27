import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { ProfilePicture } from '../components/ProfilePicture';
import { useNavigate } from 'react-router-dom';
import { Palette, User, Bell, Check, ArrowRight } from 'lucide-react';

export function FirstTimeSetup() {
    const { currentTheme, setTheme, availableThemes } = useTheme();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [preferences, setPreferences] = useState({
        username: '',
        notifications: true,
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
            title: 'Notifications',
            description: 'Stay updated with your favorite anime',
            icon: <Bell className="w-6 h-6" />,
        }
    ];

    const handleComplete = () => {
        // Save preferences to localStorage
        localStorage.setItem('username', preferences.username);
        localStorage.setItem('notifications', preferences.notifications.toString());
        localStorage.setItem('setupComplete', 'true');

        // Navigate to home page
        navigate('/');
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
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
                                                    アニ
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
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(availableThemes).map(([key, theme]) => (
                                            <button
                                                key={key}
                                                className="p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] relative group"
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
                                    </div>
                                )}

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
                                        <button
                                            onClick={() => setPreferences(prev => ({ ...prev, notifications: !prev.notifications }))}
                                            className="w-full p-4 rounded-lg flex items-center justify-between transition-colors duration-200"
                                            style={{
                                                backgroundColor: currentTheme.colors.background.hover,
                                                color: currentTheme.colors.text.primary
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Bell size={20} />
                                                <div className="text-left">
                                                    <div className="font-medium">Enable Notifications</div>
                                                    <div
                                                        className="text-sm mt-1"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        Get updates about new episodes and releases
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="w-12 h-6 rounded-full relative transition-colors duration-200"
                                                style={{
                                                    backgroundColor: preferences.notifications
                                                        ? currentTheme.colors.accent.primary
                                                        : currentTheme.colors.background.main
                                                }}
                                            >
                                                <div
                                                    className="absolute w-5 h-5 rounded-full top-0.5 transition-all duration-200"
                                                    style={{
                                                        backgroundColor: preferences.notifications
                                                            ? currentTheme.colors.background.main
                                                            : currentTheme.colors.text.secondary,
                                                        left: preferences.notifications ? '26px' : '2px'
                                                    }}
                                                />
                                            </div>
                                        </button>
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