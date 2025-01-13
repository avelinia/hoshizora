import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MonitorPlay, Settings, ChevronLeft } from 'lucide-react';
import Player from '../components/Player';
import EpisodeList from '../components/EpisodeList';
import ServerSelector from '../components/ServerSelector';

interface Episode {
  number: number;
  title: string;
  current?: boolean;
}

interface Server {
  id: string;
  name: string;
  type: 'sub' | 'dub';
  quality: string;
}

interface WatchPageLayoutProps {
  src?: string;
  title?: string;
  episodeNumber?: string;
  quality?: string;
  onNextEpisode?: () => void;
  onPreviousEpisode?: () => void;
  hasNextEpisode?: boolean;
  hasPreviousEpisode?: boolean;
  episodes: Episode[];
  servers: Server[];
  currentServer?: string;
  onServerSelect: (server: Server) => void;
  onEpisodeSelect: (episode: Episode) => void;
  isLoading?: boolean;
}

export default function WatchPageLayout({
  src = '',
  title = 'Loading...',
  episodeNumber = '1',
  quality = '1080p',
  onNextEpisode,
  onPreviousEpisode,
  hasNextEpisode,
  hasPreviousEpisode,
  episodes,
  servers,
  currentServer,
  onServerSelect,
  onEpisodeSelect
}: WatchPageLayoutProps) {
  const { currentTheme } = useTheme();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'episodes' | 'servers'>('episodes');

  return (
    <div className="h-full w-full flex">
      {/* Main Grid Container */}
      <div
        className="flex-1 grid grid-cols-[1fr_auto] h-full"
        style={{ backgroundColor: currentTheme.colors.background.main }}
      >
        {/* Main Content Area */}
        <div className="flex flex-col h-full">
          {/* Video Player Container */}
          <div className="flex-1 min-h-0 relative">
            <Player
              src={src}
              title={title}
              episodeNumber={episodeNumber}
              quality={quality}
              onNextEpisode={onNextEpisode}
              onPreviousEpisode={onPreviousEpisode}
              hasNextEpisode={hasNextEpisode}
              hasPreviousEpisode={hasPreviousEpisode}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex">
          {/* Toggle Button */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="h-full w-6 flex items-center justify-center transition-colors duration-200"
            style={{ backgroundColor: currentTheme.colors.background.card }}
          >
            <ChevronLeft
              size={16}
              className={`transition-transform duration-200 ${isRightSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
              style={{ color: currentTheme.colors.text.secondary }}
            />
          </button>

          {/* Sidebar Content */}
          {isRightSidebarOpen && (
            <div
              className="w-80 h-full flex flex-col"
              style={{ backgroundColor: currentTheme.colors.background.card }}
            >
              {/* Tabs */}
              <div className="flex border-b"
                style={{ borderColor: currentTheme.colors.background.hover }}
              >
                <button
                  className="flex-1 px-4 py-3 flex items-center justify-center gap-2"
                  onClick={() => setActiveTab('episodes')}
                  style={{
                    color: currentTheme.colors.text.primary,
                    backgroundColor: activeTab === 'episodes' ? currentTheme.colors.background.hover : 'transparent'
                  }}
                >
                  <MonitorPlay size={16} />
                  <span>Episodes</span>
                </button>
                <button
                  className="flex-1 px-4 py-3 flex items-center justify-center gap-2"
                  onClick={() => setActiveTab('servers')}
                  style={{
                    color: currentTheme.colors.text.primary,
                    backgroundColor: activeTab === 'servers' ? currentTheme.colors.background.hover : 'transparent'
                  }}
                >
                  <Settings size={16} />
                  <span>Servers</span>
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'episodes' ? (
                  <EpisodeList episodes={episodes} onEpisodeSelect={onEpisodeSelect} />
                ) : (
                  <ServerSelector
                    servers={servers}
                    currentServer={currentServer}
                    onServerSelect={onServerSelect}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}