import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BookmarkPlus, Edit3 } from 'lucide-react';
import { LibraryEntryModal } from './LibraryEntryModal';

interface LibraryButtonProps {
    animeId: string;
    title: string;
    image: string;
    totalEpisodes: number;
    existingEntry?: {
        id: string;
        status: string;
        progress: number;
        rating: number;
        notes: string;
    };
    className?: string;
}

export function LibraryButton({
    animeId,
    title,
    image,
    totalEpisodes,
    existingEntry,
    className = ''
}: LibraryButtonProps) {
    const { currentTheme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const initialData = existingEntry ? {
        title,
        image,
        totalEpisodes,
        status: existingEntry.status,
        progress: existingEntry.progress,
        rating: existingEntry.rating,
        notes: existingEntry.notes,
        id: existingEntry.id
    } : {
        title,
        image,
        totalEpisodes
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${className}`}
                style={{
                    backgroundColor: existingEntry
                        ? currentTheme.colors.background.card
                        : currentTheme.colors.background.hover,
                    color: currentTheme.colors.text.primary,
                    border: existingEntry
                        ? `1px solid ${currentTheme.colors.background.hover}`
                        : 'none'
                }}
            >
                {existingEntry ? (
                    <Edit3 className="w-5 h-5" />
                ) : (
                    <BookmarkPlus className="w-5 h-5" />
                )}
                <span className="font-bold">
                    {existingEntry ? 'Edit in Library' : 'Add to Library'}
                </span>
            </button>

            <LibraryEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                animeId={animeId}
                initialData={initialData}
            />
        </>
    );
}