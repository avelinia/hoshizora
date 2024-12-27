// src/components/ThemeSwitcher.tsx
import { Menu, Transition } from '@headlessui/react';
import { Moon, Sun } from 'lucide-react';
import { Fragment } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeKey } from '../themes';

export function ThemeSwitcher() {
    const { currentTheme, setTheme, availableThemes } = useTheme();

    return (
        <Menu as="div" className="relative">
            <Menu.Button
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: currentTheme.colors.background.card }}
            >
                {currentTheme.name === 'Starry Night' ? (
                    <Moon className="w-5 h-5" />
                ) : (
                    <Sun className="w-5 h-5" />
                )}
                <span className="hidden md:inline">{currentTheme.name}</span>
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg"
                    style={{ backgroundColor: currentTheme.colors.background.card }}
                >
                    {Object.entries(availableThemes).map(([key, theme]) => (
                        <Menu.Item key={key}>
                            {({ active }) => (
                                <button
                                    className={`w-full text-left px-4 py-2 first:rounded-t-lg last:rounded-b-lg ${active ? 'brightness-125' : ''
                                        }`}
                                    style={{
                                        backgroundColor: active
                                            ? currentTheme.colors.background.hover
                                            : 'transparent',
                                        color: currentTheme.colors.text.primary
                                    }}
                                    onClick={() => setTheme(key as ThemeKey)}
                                >
                                    {theme.name}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    );
}