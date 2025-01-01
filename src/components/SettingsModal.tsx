// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ProfilePicture } from './ProfilePicture';
import {
    Palette,
    ChevronRight,
    Laptop,
    User,
    HelpCircle,
    Database,
    ArrowRight,
    Check
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'appearance' | 'profile' | 'help' | 'backup';
type ThemeMode = 'dark' | 'light';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { currentTheme, setTheme, availableThemes } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('appearance');
    const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
    const [username, setUsername] = useState(localStorage.getItem('username') || '');

    // Add this function to handle saving profile changes
    const handleSaveProfile = () => {
        localStorage.setItem('username', username);
    };

    const darkThemes = Object.entries(availableThemes)
        .filter(([, theme]) => theme.mode === 'dark');

    const lightThemes = Object.entries(availableThemes)
        .filter(([, theme]) => theme.mode === 'light');

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const tabs: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
        {
            id: 'appearance',
            label: 'Appearance',
            icon: <Laptop size={20} />,
            description: 'Customize the look and feel of your interface'
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: <User size={20} />,
            description: 'Manage your profile information'
        },
        {
            id: 'help',
            label: 'Help',
            icon: <HelpCircle size={20} />,
            description: 'Get help and learn about features'
        },
        {
            id: 'backup',
            label: 'Backup',
            icon: <Database size={20} />,
            description: 'Manage your data and preferences'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 backdrop-blur-sm"
                        style={{ backgroundColor: `${currentTheme.colors.background.main}90` }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-4xl h-[70vh] overflow-hidden rounded-xl shadow-lg"
                        style={{
                            backgroundColor: currentTheme.colors.background.card,
                            border: `1px solid ${currentTheme.colors.background.hover}`
                        }}
                    >
                        <div className="flex h-full">
                            {/* Sidebar */}
                            <div
                                className="w-72 border-r p-6 flex flex-col"
                                style={{ borderColor: currentTheme.colors.background.hover }}
                            >
                                <h2
                                    className="text-2xl font-bold mb-6"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    Settings
                                </h2>

                                <div className="flex-1 space-y-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                        w-full px-4 py-3 rounded-xl text-left transition-all duration-200
                        hover:bg-gray-200/10 group
                      `}
                                            style={{
                                                backgroundColor: activeTab === tab.id
                                                    ? currentTheme.colors.background.hover
                                                    : 'transparent',
                                                color: currentTheme.colors.text.primary,
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`transition-colors duration-200`}
                                                    style={{
                                                        color: activeTab === tab.id
                                                            ? currentTheme.colors.accent.primary
                                                            : currentTheme.colors.text.secondary
                                                    }}
                                                >
                                                    {tab.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{tab.label}</div>
                                                    <div
                                                        className="text-xs mt-0.5"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        {tab.description}
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    size={16}
                                                    className={`
                            transition-transform duration-200
                            ${activeTab === tab.id ? 'rotate-180' : 'rotate-0'}
                          `}
                                                    style={{ color: currentTheme.colors.text.secondary }}
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={onClose}
                                    className="mt-4 w-full px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-200/10"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    Close Settings
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 relative">
                                <AnimatePresence>
                                    {activeTab === 'appearance' && (
                                        <motion.div
                                            key="appearance"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 p-6 overflow-y-auto"
                                        >
                                            {/* Theme Mode Switcher */}
                                            <div className="flex-column justify-center mb-6">
                                                <h3
                                                    className="text-xl font-medium mb-2"
                                                    style={{ color: currentTheme.colors.text.accent }}
                                                >
                                                    Theme
                                                </h3>
                                                <p
                                                    className="text-sm mb-6"
                                                    style={{ color: currentTheme.colors.text.secondary }}
                                                >
                                                    Choose a theme that matches your style
                                                </p>
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
                                                            }}
                                                        >
                                                            {mode === 'light' ? 'Light Themes' : 'Dark Themes'}
                                                        </button>
                                                    ))}
                                                    <motion.div
                                                        layoutId="theme-mode-pill"
                                                        className="absolute inset-1 rounded-full -z-10"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.accent.primary,
                                                        }}
                                                        initial={false}
                                                    />
                                                </div>
                                            </div>

                                            {/* Theme Grid */}
                                            <div className="relative">
                                                <AnimatePresence mode="popLayout">
                                                    <motion.div
                                                        key={themeMode}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className="absolute inset-0 grid grid-cols-2 gap-4"
                                                    >
                                                        {(themeMode === 'light' ? lightThemes : darkThemes).map(([key, theme]) => (
                                                            <button
                                                                key={key}
                                                                className={`
                                                                    p-4 rounded-xl border-2 transition-all duration-200
                                                                    hover:scale-[1.02] relative group
                                                                `}
                                                                style={{
                                                                    backgroundColor: theme.colors.background.card,
                                                                    borderColor: theme.name === currentTheme.name
                                                                        ? theme.colors.accent.primary
                                                                        : theme.colors.background.hover,
                                                                }}
                                                                onClick={() => setTheme(key as any)}
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

                                                                    {/* Selected Indicator */}
                                                                    {theme.name === currentTheme.name && (
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
                                        </motion.div>
                                    )}

                                    {activeTab === 'profile' && (
                                        <motion.div
                                            key="profile"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 p-6 overflow-y-auto space-y-6"
                                        >
                                            <div>
                                                <h3
                                                    className="text-xl font-medium mb-2"
                                                    style={{ color: currentTheme.colors.text.accent }}
                                                >
                                                    Profile Settings
                                                </h3>
                                                <p
                                                    className="text-sm mb-6"
                                                    style={{ color: currentTheme.colors.text.secondary }}
                                                >
                                                    Customize your profile information
                                                </p>

                                                {/* Profile Picture Section */}
                                                <div
                                                    className="p-6 rounded-xl mb-8"
                                                    style={{ backgroundColor: currentTheme.colors.background.hover }}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <ProfilePicture size="lg" editable />
                                                        <div>
                                                            <h4
                                                                className="font-medium mb-2"
                                                                style={{ color: currentTheme.colors.text.primary }}
                                                            >
                                                                Profile Picture
                                                            </h4>
                                                            <p
                                                                className="text-sm"
                                                                style={{ color: currentTheme.colors.text.secondary }}
                                                            >
                                                                Upload a picture to personalize your profile. <br />
                                                                Maximum size: 20MB. Supported formats: JPEG, PNG, WebP
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label
                                                            className="block text-sm font-medium mb-2"
                                                            style={{ color: currentTheme.colors.text.primary }}
                                                        >
                                                            Display Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={username}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value.slice(0, 25);
                                                                setUsername(newValue);
                                                            }}
                                                            className="w-full px-4 py-2 rounded-lg transition-colors duration-200"
                                                            style={{
                                                                backgroundColor: currentTheme.colors.background.card,
                                                                color: currentTheme.colors.text.primary,
                                                                border: `1px solid ${currentTheme.colors.background.hover}`
                                                            }}
                                                            placeholder="Enter your display name"
                                                            maxLength={25}
                                                        />
                                                        <div
                                                            className="text-xs flex justify-end"
                                                            style={{ color: currentTheme.colors.text.secondary }}
                                                        >
                                                            {username.length}/25 characters
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="pt-4">
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        className="w-full py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.accent.primary,
                                                            color: currentTheme.colors.background.main
                                                        }}
                                                    >
                                                        Save Changes
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'help' && (
                                        <motion.div
                                            key="help"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 p-6 overflow-y-auto"
                                        >
                                            <h3
                                                className="text-xl font-medium mb-2"
                                                style={{ color: currentTheme.colors.text.accent }}
                                            >
                                                Help & Resources
                                            </h3>
                                            <p
                                                className="text-sm mb-6"
                                                style={{ color: currentTheme.colors.text.secondary }}
                                            >
                                                Get help with your Hoshizora experience
                                            </p>
                                            <div className="space-y-4">
                                                {[
                                                    'Getting Started Guide',
                                                    'Keyboard Shortcuts',
                                                    'FAQ',
                                                    'Contact Support'
                                                ].map((item) => (
                                                    <button
                                                        key={item}
                                                        className="w-full p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-between group"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.background.hover,
                                                            color: currentTheme.colors.text.primary
                                                        }}
                                                    >
                                                        <span>{item}</span>
                                                        <ArrowRight
                                                            size={16}
                                                            className="transform transition-transform duration-200 group-hover:translate-x-1"
                                                            style={{ color: currentTheme.colors.accent.primary }}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'backup' && (
                                        <motion.div
                                            key="backup"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 p-6 overflow-y-auto"
                                        >
                                            <h3
                                                className="text-xl font-medium mb-2"
                                                style={{ color: currentTheme.colors.text.accent }}
                                            >
                                                Backup & Data
                                            </h3>
                                            <p
                                                className="text-sm mb-6"
                                                style={{ color: currentTheme.colors.text.secondary }}
                                            >
                                                Manage your data and preferences
                                            </p>
                                            <div className="space-y-6">
                                                <div
                                                    className="p-4 rounded-lg"
                                                    style={{ backgroundColor: currentTheme.colors.background.hover }}
                                                >
                                                    <h4
                                                        className="font-medium mb-2"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        Export Data
                                                    </h4>
                                                    <p
                                                        className="text-sm mb-4"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        Download all your preferences and watch history
                                                    </p>
                                                    <button
                                                        className="px-4 py-2 rounded-lg transition-colors duration-200"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.accent.primary,
                                                            color: currentTheme.colors.background.main
                                                        }}
                                                    >
                                                        Export Data
                                                    </button>
                                                </div>

                                                <div
                                                    className="p-4 rounded-lg"
                                                    style={{ backgroundColor: currentTheme.colors.background.hover }}
                                                >
                                                    <h4
                                                        className="font-medium mb-2"
                                                        style={{ color: currentTheme.colors.text.primary }}
                                                    >
                                                        Import Data
                                                    </h4>
                                                    <p
                                                        className="text-sm mb-4"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        Restore your data from a backup file
                                                    </p>
                                                    <button
                                                        className="px-4 py-2 rounded-lg transition-colors duration-200"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.accent.primary,
                                                            color: currentTheme.colors.background.main
                                                        }}
                                                    >
                                                        Import Data
                                                    </button>
                                                </div>

                                                <div
                                                    className="p-4 rounded-lg border-2 border-red-500/20"
                                                    style={{ backgroundColor: currentTheme.colors.background.hover }}
                                                >
                                                    <h4
                                                        className="font-medium mb-2 text-red-400"
                                                    >
                                                        Reset All Data
                                                    </h4>
                                                    <p
                                                        className="text-sm mb-4"
                                                        style={{ color: currentTheme.colors.text.secondary }}
                                                    >
                                                        This will permanently delete all your data
                                                    </p>
                                                    <button
                                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 transition-colors duration-200 hover:bg-red-500/20"
                                                    >
                                                        Reset All Data
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}