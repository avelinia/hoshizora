import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useNotifications } from "../contexts/NotificationContext";
import { platform } from "@tauri-apps/plugin-os";

interface DownloadProgress {
  downloaded: number;
  total: number | null;
  percent: number;
}

interface OsInfo {
  platform: string;
}

export function UpdateChecker() {
  const { addNotification } = useNotifications();
  const [isChecking, setIsChecking] = useState(false);
  const [, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [osInfo, setOsInfo] = useState<OsInfo | null>(null);
  const [, setCurrentProgressPercent] = useState<number>(0);

  const getOsInfo = async () => {
    try {
      const platformValue = await platform();

      setOsInfo({
        platform: platformValue,
      });
      console.log("OS Info:", {
        platform: platformValue,
      });
    } catch (error) {
      console.error("Failed to get OS info:", error);
    }
  };

  const checkForUpdates = async () => {
    if (isChecking) return;

    try {
      setIsChecking(true);

      if (!osInfo) {
        await getOsInfo();
      }

      const update = await check();

      if (update) {
        console.log(
          `Update found: ${update.version} (current: ${update.currentVersion})`
        );
        console.log(`Update info:`, update);

        console.log("Update info:", {
          version: update.version,
          currentVersion: update.currentVersion,
        });

        const osSpecificMessage = getOsSpecificUpdateMessage(osInfo?.platform);

        addNotification({
          type: "info",
          title: "Update Available",
          message: `Version ${update.version} is available. ${osSpecificMessage} Would you like to update now?`,
          persistent: true,
          duration: 0,
          actions: [
            {
              label: "Update Now",
              onClick: () => installUpdate(update),
            },
            {
              label: "Later",
              onClick: () => console.log("Update postponed"),
            },
          ],
        });
      } else {
        console.log("No updates available");
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      addNotification({
        type: "error",
        title: "Update Check Failed",
        message: `Failed to check for updates: ${error}`,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getOsSpecificUpdateMessage = (platform?: string): string => {
    switch (platform) {
      case "windows":
        return "The application will restart automatically after the update.";
      case "macos":
        return "The application will restart automatically after the update.";
      case "linux":
        return "The update will be installed when you restart the application.";
      default:
        return "";
    }
  };

  const installUpdate = async (update: any) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress({ downloaded: 0, total: null, percent: 0 });

      setCurrentProgressPercent(0);

      addNotification({
        type: "info",
        title: "Downloading Update",
        message: "Starting download...",
        progress: 0,
        duration: 0,
        persistent: true,
      });

      await update.downloadAndInstall((event: any) => {
        switch (event.event) {
          case "Started":
            const total = event.data.contentLength;
            setDownloadProgress({
              downloaded: 0,
              total,
              percent: 0,
            });

            setCurrentProgressPercent(0);

            addNotification({
              type: "info",
              title: "Downloading Update",
              message: `Starting download (${formatBytes(total)})...`,
              progress: 0,
              duration: 0,
              persistent: true,
            });
            break;

          case "Progress":
            const chunkLength = event.data.chunkLength;
            setDownloadProgress((prev) => {
              if (!prev) return null;

              const downloaded = prev.downloaded + chunkLength;
              const percent = prev.total
                ? Math.round((downloaded / prev.total) * 100)
                : 0;

              setCurrentProgressPercent(percent);

              if (percent % 10 === 0 || percent === 99) {
                addNotification({
                  type: "info",
                  title: "Downloading Update",
                  message: `Downloaded ${formatBytes(
                    downloaded
                  )} of ${formatBytes(prev.total || 0)} (${percent}%)`,
                  progress: percent,
                  duration: 0,
                  persistent: true,
                });
              }

              return { downloaded, total: prev.total, percent };
            });
            break;

          case "Finished":
            setCurrentProgressPercent(100);

            addNotification({
              type: "success",
              title: "Update Downloaded",
              message: "Update has been downloaded and will be installed now.",
              progress: 100,
              duration: 3000,
            });
            break;
        }
      });

      const restartMessage = getOsSpecificRestartMessage(osInfo?.platform);

      addNotification({
        type: "success",
        title: "Update Installed",
        message: restartMessage,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await relaunch();
    } catch (error) {
      console.error("Failed to install update:", error);
      setIsDownloading(false);
      addNotification({
        type: "error",
        title: "Update Failed",
        message: `Failed to install update: ${error}`,
      });
    }
  };

  const getOsSpecificRestartMessage = (platform?: string): string => {
    switch (platform) {
      case "windows":
        return "The update has been installed. The application will restart now.";
      case "macos":
        return "The update has been installed. The application will restart now.";
      case "linux":
        return "The update has been installed. The application will restart now.";
      default:
        return "The update has been installed. The application will restart now.";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    getOsInfo();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates();
    }, 5000);

    return () => clearTimeout(timer);
  }, [osInfo]);

  return null;
}
