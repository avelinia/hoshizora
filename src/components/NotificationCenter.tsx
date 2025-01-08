import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Bell, BellOff, Trash2, Check, X, CheckCircle2, Info, AlertCircle, XCircle } from 'lucide-react';
import { useNotifications, type NotificationType } from '../contexts/NotificationContext';

interface NotificationCenterButtonProps {
    onClick: () => void;
    unreadCount: number;
    isOpen: boolean;
}

const iconsByType: Record<NotificationType, React.ReactNode> = {
    info: <Info />,
    success: <CheckCircle2 />,
    warning: <AlertCircle />,
    error: <XCircle />
};

const colorsByType: Record<NotificationType, string> = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444'
};

export function NotificationCenterButton({ onClick, unreadCount, isOpen }: NotificationCenterButtonProps) {
    const { currentTheme } = useTheme();

    return (
        <button
            onClick={onClick}
            className="h-12 w-12 flex items-center justify-center relative group"
            id="notification-button"
        >
            <div
                className="absolute inset-0 transition-colors duration-100 group-hover:bg-gray-500/10"
                style={{
                    backgroundColor: isOpen ? currentTheme.colors.background.hover : '',
                }}
            />
            <div className="relative">
                <Bell
                    size={16}
                    style={{ color: currentTheme.colors.text.secondary }}
                />
                {unreadCount > 0 && (
                    <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentTheme.colors.accent.primary }}
                    />
                )}
            </div>
        </button>
    );
}

export function NotificationCenter() {
    const { currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        removeNotification,
        clearAll
    } = useNotifications();

    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={buttonRef}>
            <NotificationCenterButton
                onClick={() => setIsOpen(!isOpen)}
                unreadCount={unreadCount}
                isOpen={isOpen}
            />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-14 right-0 w-96 max-h-[80vh] z-50 rounded-xl shadow-xl flex flex-col overflow-hidden"
                        style={{
                            backgroundColor: currentTheme.colors.background.card,
                            border: `1px solid ${currentTheme.colors.background.hover}`
                        }}
                    >
                        {/* Rest of the panel content... */}
                        <div className="p-4 flex items-center justify-between border-b"
                            style={{ borderColor: currentTheme.colors.background.hover }}>
                            <div>
                                <h2
                                    className="text-lg font-medium"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    Notifications
                                </h2>
                                <p
                                    className="text-sm"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    {notifications.length === 0
                                        ? 'No notifications'
                                        : `${unreadCount} unread`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="p-2 rounded-lg transition-colors duration-200 hover:bg-black/10"
                                                style={{ color: currentTheme.colors.accent.primary }}
                                                title="Mark all as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={clearAll}
                                            className="p-2 rounded-lg transition-colors duration-200 hover:bg-black/10"
                                            style={{ color: currentTheme.colors.text.secondary }}
                                            title="Clear all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                                        style={{ backgroundColor: currentTheme.colors.background.hover }}
                                    >
                                        <BellOff
                                            size={24}
                                            style={{ color: currentTheme.colors.text.secondary }}
                                        />
                                    </div>
                                    <p
                                        className="text-center"
                                        style={{ color: currentTheme.colors.text.secondary }}
                                    >
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                <div style={{ borderColor: currentTheme.colors.background.hover }}>
                                    <AnimatePresence mode="popLayout">
                                        {notifications.map((notification, index) => (
                                            <motion.div
                                                key={notification.id}
                                                layout
                                                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={`relative group ${index !== notifications.length - 1 ? 'border-b' : ''}`}
                                                style={{ borderColor: currentTheme.colors.background.hover }}
                                                onHoverStart={() => !notification.read && markAsRead(notification.id)}
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div style={{ color: colorsByType[notification.type] }}>
                                                            {iconsByType[notification.type]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3
                                                                className="font-medium mb-1"
                                                                style={{
                                                                    color: currentTheme.colors.text.primary,
                                                                    opacity: notification.read ? 0.7 : 1
                                                                }}
                                                            >
                                                                {notification.title}
                                                            </h3>
                                                            <p
                                                                className="text-sm mb-2"
                                                                style={{
                                                                    color: currentTheme.colors.text.secondary,
                                                                    opacity: notification.read ? 0.7 : 1
                                                                }}
                                                            >
                                                                {notification.message}
                                                            </p>
                                                            <span
                                                                className="text-xs"
                                                                style={{ color: currentTheme.colors.text.secondary }}
                                                            >
                                                                {formatTime(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeNotification(notification.id)}
                                                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/10"
                                                            style={{ color: currentTheme.colors.text.secondary }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div
                            className="p-3 border-t text-center text-xs"
                            style={{
                                borderColor: currentTheme.colors.background.hover,
                                color: currentTheme.colors.text.secondary
                            }}
                        >
                            Click a notification to mark it as read
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}