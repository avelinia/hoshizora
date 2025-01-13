import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircle2, Circle, Monitor, Languages } from 'lucide-react';
import type { Server } from '../types/watch';

export interface ServerSelectorProps {
    servers: Server[];
    currentServer?: string;
    onServerSelect: (server: Server) => void;
}

export default function ServerSelector({
    servers,
    currentServer,
    onServerSelect
}: ServerSelectorProps) {
    const { currentTheme } = useTheme();
    const [selectedType, setSelectedType] = useState<'sub' | 'dub'>('sub');

    const filteredServers = servers.filter(server => server.type === selectedType);

    return (
        <div
            // Change this line to properly handle hover visibility
            className="absolute left-0 right-0 top-full mt-2 transition-all duration-200 rounded-xl overflow-hidden shadow-lg z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible"
            style={{ backgroundColor: currentTheme.colors.background.card }}
        >
            {/* Type Selector */}
            <div
                className="p-4 flex gap-2"
                style={{ borderBottom: `1px solid ${currentTheme.colors.background.hover}` }}
            >
                {(['sub', 'dub'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                        style={{
                            backgroundColor: selectedType === type
                                ? currentTheme.colors.background.hover
                                : 'transparent',
                            color: currentTheme.colors.text.primary
                        }}
                    >
                        {type === 'sub' ? (
                            <Languages className="w-4 h-4" />
                        ) : (
                            <Monitor className="w-4 h-4" />
                        )}
                        <span className="font-medium capitalize">{type}</span>
                    </button>
                ))}
            </div>

            {/* Server List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {filteredServers.map((server) => (
                        <button
                            key={server.id}
                            onClick={() => onServerSelect(server)}
                            className="w-full p-4 rounded-lg flex items-center gap-4 transition-all duration-200 relative group"
                            style={{
                                backgroundColor: currentServer === server.id
                                    ? currentTheme.colors.background.hover
                                    : currentTheme.colors.background.main
                            }}
                        >
                            {/* Selection Indicator */}
                            {currentServer === server.id ? (
                                <CheckCircle2
                                    className="w-5 h-5"
                                    style={{ color: currentTheme.colors.accent.primary }}
                                />
                            ) : (
                                <Circle
                                    className="w-5 h-5"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                />
                            )}

                            {/* Server Info */}
                            <div className="flex-1 text-left">
                                <h3
                                    className="font-medium"
                                    style={{ color: currentTheme.colors.text.primary }}
                                >
                                    {server.name}
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{ color: currentTheme.colors.text.secondary }}
                                >
                                    {server.quality}
                                </p>
                            </div>

                            {/* Hover Background */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                                style={{ backgroundColor: `${currentTheme.colors.background.hover}80` }}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}