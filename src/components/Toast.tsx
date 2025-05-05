import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import {
  useNotifications,
  type NotificationType,
} from "../contexts/NotificationContext";

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

const icons: Record<NotificationType, React.ReactNode> = {
  info: <Info size={20} />,
  success: <CheckCircle2 size={20} />,
  warning: <AlertCircle size={20} />,
  error: <XCircle size={20} />,
};

interface ToastTimer {
  startTime: number;
  pauseTime?: number;
  remainingTime: number;
  timeoutId?: number;
}

export default function Toast() {
  const { currentTheme } = useTheme();
  const { notifications, removeNotification } = useNotifications();
  const [activeToastIds, setActiveToastIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const toastTimers = useRef<Record<string, ToastTimer>>({});

  // Listen for toast events
  useEffect(() => {
    const handleShowToast = (
      event: CustomEvent<{ notification: { id: string; duration?: number } }>
    ) => {
      const id = event.detail.notification.id;
      setActiveToastIds((prev) => [...prev, id]);

      // Initialize timer for new toast
      const duration =
        event.detail.notification.duration ?? DEFAULT_TOAST_DURATION;

      // If duration is 0, don't auto-dismiss
      if (duration === 0) {
        toastTimers.current[id] = {
          startTime: Date.now(),
          remainingTime: 0,
        };
        return;
      }

      toastTimers.current[id] = {
        startTime: Date.now(),
        remainingTime: duration,
      };

      startToastTimer(id);
    };

    window.addEventListener("showToast", handleShowToast as EventListener);
    return () =>
      window.removeEventListener("showToast", handleShowToast as EventListener);
  }, []);

  const startToastTimer = (id: string) => {
    if (!toastTimers.current[id]) {
      // Initialize new timer
      toastTimers.current[id] = {
        startTime: Date.now(),
        remainingTime: DEFAULT_TOAST_DURATION,
      };
    }

    const timer = toastTimers.current[id];

    // Clear any existing timeout
    if (timer.timeoutId) {
      clearTimeout(timer.timeoutId);
    }

    // Only start a new timer if we have remaining time
    if (timer.remainingTime > 0) {
      const timeoutId = window.setTimeout(() => {
        setActiveToastIds((prev) => prev.filter((toastId) => toastId !== id));
        delete toastTimers.current[id];
      }, timer.remainingTime);

      timer.timeoutId = timeoutId;
      timer.startTime = Date.now();
      timer.pauseTime = undefined;
    }
  };

  const pauseToastTimer = (id: string) => {
    const timer = toastTimers.current[id];
    if (!timer) return;

    // Clear the timeout
    if (timer.timeoutId) {
      clearTimeout(timer.timeoutId);
    }

    // Calculate remaining time
    const elapsedTime = Date.now() - timer.startTime;
    timer.remainingTime = Math.max(0, timer.remainingTime - elapsedTime);
    timer.pauseTime = Date.now();
  };

  const activeNotifications = notifications
    .filter((n) => activeToastIds.includes(n.id))
    .slice(0, 3); // Show max 3 toasts at a time

  const getAccentColor = (type: NotificationType) => {
    switch (type) {
      case "info":
        return currentTheme.colors.accent.primary;
      case "success":
        return "#22c55e";
      case "warning":
        return "#eab308";
      case "error":
        return "#ef4444";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="sync">
        {activeNotifications.map((notification, index) => {
          const accentColor = getAccentColor(notification.type);
          const duration = notification.duration ?? DEFAULT_TOAST_DURATION;

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
                transition: { duration: 0.2 },
              }}
              transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="pointer-events-auto"
              style={{ zIndex: 1000 - index }}
              onMouseEnter={() => {
                setHoveredId(notification.id);
                pauseToastTimer(notification.id);
              }}
              onMouseLeave={() => {
                setHoveredId(null);
                startToastTimer(notification.id);
              }}
            >
              <div
                className="relative w-96 rounded-lg shadow-lg overflow-hidden"
                style={{
                  backgroundColor: currentTheme.colors.background.card,
                  border: `1px solid ${currentTheme.colors.background.hover}`,
                }}
              >
                {/* Content */}
                <div className="p-4 flex items-start gap-3">
                  {/* Icon with background */}
                  <div
                    className="p-1 rounded-lg"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                    }}
                  >
                    {icons[notification.type]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium mb-1"
                      style={{ color: currentTheme.colors.text.primary }}
                    >
                      {notification.title}
                    </h3>
                    <p
                      className="text-sm pb-2"
                      style={{ color: currentTheme.colors.text.secondary }}
                    >
                      {notification.message}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveToastIds((prev) =>
                        prev.filter((id) => id !== notification.id)
                      );
                      removeNotification(notification.id);
                    }}
                    className="p-1 -mr-1 rounded-lg transition-colors duration-200 hover:bg-black/10"
                    style={{ color: currentTheme.colors.text.secondary }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Action buttons */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-2 px-4 pb-4">
                    {notification.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => {
                          action.onClick();
                          // Remove the notification after clicking an action
                          setActiveToastIds((prev) =>
                            prev.filter((id) => id !== notification.id)
                          );
                        }}
                        className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Progress bar */}
                <div className="absolute bottom-2 left-3 right-3">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: `${accentColor}15`,
                    }}
                  >
                    {notification.progress !== undefined ? (
                      // Custom progress value
                      <div
                        className="h-full rounded-full origin-left transition-transform duration-300"
                        style={{
                          backgroundColor: accentColor,
                          opacity: 0.7,
                          width: "100%",
                          transform: `scaleX(${notification.progress / 100})`,
                        }}
                      />
                    ) : duration > 0 ? (
                      // Auto-decreasing progress
                      <div
                        className="h-full rounded-full origin-left"
                        style={{
                          backgroundColor: accentColor,
                          opacity: 0.7,
                          animation: `${duration}ms linear progress`,
                          animationPlayState:
                            hoveredId === notification.id
                              ? "paused"
                              : "running",
                        }}
                      />
                    ) : null}
                  </div>
                </div>

                {/* Define animation */}
                <style>{`
                  @keyframes progress {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                  }
                `}</style>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
