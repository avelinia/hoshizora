import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, BookOpen, CircleOff, Clock, X, Play, Pause, Check } from 'lucide-react';
import { useAddToLibrary, useUpdateLibraryEntry } from '../hooks/useLibrary';
import type { WatchStatus } from '../database/library';
import { useNotifications } from '../contexts/NotificationContext';

interface LibraryEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    animeId?: string;
    initialData?: {
        id?: string;
        title: string;
        image: string;
        totalEpisodes: number;
        status?: string;
        progress?: number;
        rating?: number;
        notes?: string;
    };
}

export function LibraryEntryModal({ isOpen, onClose, animeId, initialData }: LibraryEntryModalProps) {
    const { currentTheme } = useTheme();
    const addToLibrary = useAddToLibrary();
    const updateLibrary = useUpdateLibraryEntry();
    const isEditing = !!initialData?.id;
    const [isSaving, setIsSaving] = useState(false);
    const { addNotification } = useNotifications();

    const notifyAction = async (type: string) => {
        if (type === 'success') {
            addNotification({
                type: 'success',
                title: 'Updated the Library',
                message: `${initialData?.title} was updated in the Library`
            });
        } else if (type === 'error') {
            addNotification({
                type: 'error',
                title: 'Unable to update Library',
                message: `Something went wrong! ${initialData?.title} was not updated.`
            });
        }
    }

    type Status = 'watching' | 'completed' | 'on_hold' | 'plan_to_watch' | 'dropped';

    const [formData, setFormData] = useState<{
        status: WatchStatus;
        progress: number;
        rating: number;
        notes: string;
    }>({
        status: 'watching',
        progress: 0,
        rating: 0,
        notes: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                status: (initialData.status as any) || 'watching',
                progress: initialData.progress || 0,
                rating: initialData.rating || 0,
                notes: initialData.notes || '',
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);

        try {
            if (isEditing && initialData?.id) {
                await updateLibrary.mutateAsync({
                    id: initialData.id,
                    updates: formData
                });
            } else if (initialData && animeId) {
                console.log('Starting library entry creation...');
                const now = new Date().toISOString();

                await addToLibrary.mutateAsync({
                    anime_id: animeId,
                    title: initialData.title,
                    image: initialData.image,
                    total_episodes: initialData.totalEpisodes,
                    created_at: now,
                    status: formData.status,
                    progress: formData.progress,
                    rating: formData.rating || null,
                    notes: formData.notes,
                    last_watched: null,
                    start_date: formData.status === 'watching' ? now : null,
                    completed_date: formData.status === 'completed' ? now : null
                });

                notifyAction('success')
                console.log('Library entry created successfully');
            }
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const statusOptions = [
        { id: 'watching' as Status, label: 'Watching', icon: Play, color: '#22c55e' },
        { id: 'completed' as Status, label: 'Completed', icon: Check, color: '#3b82f6' },
        { id: 'on_hold' as Status, label: 'On Hold', icon: Pause, color: '#eab308' },
        { id: 'plan_to_watch' as Status, label: 'Plan to Watch', icon: Clock, color: '#a855f7' },
        { id: 'dropped' as Status, label: 'Dropped', icon: CircleOff, color: '#ef4444' },
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
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-lg"
                        style={{ backgroundColor: currentTheme.colors.background.card }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 rounded-lg transition-colors duration-200"
                            style={{ color: currentTheme.colors.text.secondary }}
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="p-6 pb-0">
                            <h2
                                className="text-2xl font-bold mb-1"
                                style={{ color: currentTheme.colors.text.primary }}
                            >
                                {isEditing ? 'Edit Library Entry' : 'Add to Library'}
                            </h2>
                            <p
                                className="text-sm"
                                style={{ color: currentTheme.colors.text.secondary }}
                            >
                                {initialData?.title}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Status Selection */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    Status
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setFormData(prev => ({ ...prev, status: option.id as any }))}
                                            className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200"
                                            style={{
                                                backgroundColor: formData.status === option.id
                                                    ? `${option.color}20`
                                                    : currentTheme.colors.background.hover,
                                                color: formData.status === option.id
                                                    ? option.color
                                                    : currentTheme.colors.text.primary,
                                                border: `1px solid ${formData.status === option.id ? option.color : 'transparent'}`
                                            }}
                                        >
                                            <option.icon size={16} />
                                            <span className="text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Progress */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    Progress
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="flex-1 h-2 rounded-full"
                                        style={{ backgroundColor: currentTheme.colors.background.hover }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-200"
                                            style={{
                                                backgroundColor: currentTheme.colors.accent.primary,
                                                width: `${(formData.progress / (initialData?.totalEpisodes || 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.progress}
                                            onChange={(e) => {
                                                const value = Math.min(
                                                    Math.max(0, parseInt(e.target.value) || 0),
                                                    initialData?.totalEpisodes || 0
                                                );
                                                setFormData(prev => ({ ...prev, progress: value }));
                                            }}
                                            className="w-16 px-2 py-1 rounded text-center"
                                            style={{
                                                backgroundColor: currentTheme.colors.background.hover,
                                                color: currentTheme.colors.text.primary,
                                                border: `1px solid ${currentTheme.colors.background.hover}`
                                            }}
                                        />
                                        <span style={{ color: currentTheme.colors.text.secondary }}>
                                            / {initialData?.totalEpisodes || '?'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    Rating
                                </label>
                                <div className="flex items-center gap-2">
                                    {[...Array(10)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                                            className="p-1 transition-colors duration-200"
                                        >
                                            <Star
                                                size={20}
                                                fill={i < formData.rating ? currentTheme.colors.accent.primary : 'none'}
                                                style={{
                                                    color: i < formData.rating
                                                        ? currentTheme.colors.accent.primary
                                                        : currentTheme.colors.text.secondary
                                                }}
                                            />
                                        </button>
                                    ))}
                                    <span
                                        className="ml-2 text-sm"
                                        style={{ color: currentTheme.colors.text.secondary }}
                                    >
                                        {formData.rating}/10
                                    </span>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full h-24 px-3 py-2 rounded-lg resize-none"
                                    style={{
                                        backgroundColor: currentTheme.colors.background.hover,
                                        color: currentTheme.colors.text.primary,
                                        border: `1px solid ${currentTheme.colors.background.hover}`
                                    }}
                                    placeholder="Add any notes or thoughts..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg transition-colors duration-200"
                                style={{
                                    backgroundColor: currentTheme.colors.background.hover,
                                    color: currentTheme.colors.text.primary
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                                style={{
                                    backgroundColor: currentTheme.colors.accent.primary,
                                    color: currentTheme.colors.background.main
                                }}
                            >
                                <BookOpen size={16} />
                                <span>{isEditing ? 'Save Changes' : 'Add to Library'}</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}