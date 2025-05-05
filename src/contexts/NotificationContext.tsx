// src/contexts/NotificationContext.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  progress?: number; // Progress value from 0 to 100
  duration?: number; // Duration in milliseconds, 0 for no auto-dismiss
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const MAX_NOTIFICATIONS = 50;
const STORAGE_KEY = "notifications";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      } catch (error) {
        console.error("Failed to parse stored notifications:", error);
        return [];
      }
    }
    return [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      // Create notification ID upfront so we can track it
      const id = uuidv4();
      const timestamp = new Date();
      setNotifications((prev) => {
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp,
          read: false,
        };

        // Show toast
        window.dispatchEvent(
          new CustomEvent("showToast", {
            detail: { notification: newNotification },
          })
        );

        const updated = [newNotification, ...prev];
        if (updated.length > MAX_NOTIFICATIONS) {
          // Remove oldest non-persistent notifications first
          const nonPersistent = updated.filter((n) => !n.persistent);
          const persistent = updated.filter((n) => n.persistent);
          return [
            ...persistent,
            ...nonPersistent.slice(0, MAX_NOTIFICATIONS - persistent.length),
          ];
        }
        return updated;
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
