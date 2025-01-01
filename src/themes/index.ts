// src/themes/index.ts
export type ThemeColors = {
    primary: string;
    secondary: string;
    background: {
        main: string;
        card: string;
        hover: string;
    };
    text: {
        primary: string;
        secondary: string;
        accent: string;
    };
    accent: {
        primary: string;
        secondary: string;
    };
};

export type ColorMode = 'light' | 'dark';

export type Theme = {
    name: string;
    mode: ColorMode;
    colors: ThemeColors;
};

export const themes: Record<string, Theme> = {
    starryNight: {
        name: "Starry Night",
        mode: 'dark',
        colors: {
            primary: "#1a1b26",      // Deep night sky blue
            secondary: "#24283b",    // Slightly lighter navy
            background: {
                main: "#16161e",       // Dark background
                card: "#1f2335",       // Card background
                hover: "#292e42"       // Hover state
            },
            text: {
                primary: "#c0caf5",    // Soft blue-white
                secondary: "#9aa5ce",   // Muted lavender
                accent: "#7aa2f7"      // Bright star blue
            },
            accent: {
                primary: "#bb9af7",    // Soft purple
                secondary: "#7dcfff"    // Light blue
            }
        }
    },
    lavenderCloudLight: {
        name: "Starry Dawn",
        mode: 'light',
        colors: {
            primary: "#F5F0FF",      // Soft lavender background
            secondary: "#F0E6FF",    // Slightly lighter lavender tone
            background: {
                main: "#FFFFFF",        // Pure white main background
                card: "#F8F4FF",        // Very soft lavender card background
                hover: "#F0E6FF"        // Soft lilac hover state
            },
            text: {
                primary: "#333333",     // Deep charcoal for primary text
                secondary: "#666666",   // Medium gray for secondary text
                accent: "#6A5ACD"       // Soft slate blue for accents
            },
            accent: {
                primary: "#9370DB",     // Soft medium purple primary accent
                secondary: "#20B2AA"    // Soft light sea green secondary accent
            }
        }
    },
    sakuraSpring: {
        name: "Sakura Spring",
        mode: 'dark',
        colors: {
            primary: "#1f1d1e",          // Slightly warmer dark
            secondary: "#2a2526",        // Warmer dark tone
            background: {
                main: "#211d1e",         // Warm dark background
                card: "#2d2627",         // Warmer card background
                hover: "#363031"         // Warm hover state
            },
            text: {
                primary: "#fff5f5",      // Warm white
                secondary: "#ffeaea",     // Soft warm white
                accent: "#ffd6d6"        // Light pink tint
            },
            accent: {
                primary: "#ff7b7b",      // Vibrant cherry blossom pink
                secondary: "#ff9292"      // Lighter cherry blossom
            }
        }
    },
    softBlossomLight: {
        name: "Sakura Winter",
        mode: 'light',
        colors: {
            primary: "#FFF0F5",      // Soft pastel pink background
            secondary: "#FFF5EE",    // Slightly warmer pastel tone
            background: {
                main: "#FFFFFF",        // Pure white main background
                card: "#FFF3F5",        // Very soft pink card background
                hover: "#FFE4E1"        // Soft misty rose hover state
            },
            text: {
                primary: "#333333",     // Deep charcoal for primary text
                secondary: "#666666",   // Medium gray for secondary text
                accent: "#FF69B4"       // Hot pink accent for highlights
            },
            accent: {
                primary: "#FFB6C1",     // Light pink primary accent
                secondary: "#FFD700"    // Soft golden yellow secondary accent
            }
        }
    },
    oceanDepth: {
        name: "Ocean Depth",
        mode: 'dark',
        colors: {
            primary: "#0f172a",      // Deep ocean blue
            secondary: "#1e293b",
            background: {
                main: "#0c1425",
                card: "#162032",
                hover: "#1c2a42"
            },
            text: {
                primary: "#94ecf9",    // Bright cyan
                secondary: "#7ed4e6",  // Muted cyan
                accent: "#38bdf8"      // Bright blue
            },
            accent: {
                primary: "#0ea5e9",    // Ocean blue
                secondary: "#22d3ee"   // Light cyan
            }
        }
    },
    oceanBreach: {
        name: "Ocean Breach",
        mode: 'light',
        colors: {
            primary: "#e6f2ff",
            secondary: "#f0f7ff",
            background: {
                main: "#f5faff",
                card: "#ffffff",
                hover: "#e0f0ff"
            },
            text: {
                primary: "#2c3e50",
                secondary: "#34495e",
                accent: "#3498db"
            },
            accent: {
                primary: "#2980b9",
                secondary: "#3498db"
            }
        }
    },
    forestShade: {
        name: "Forest Shade",
        mode: 'dark',
        colors: {
            primary: "#1a2721",      // Deep forest green
            secondary: "#233029",
            background: {
                main: "#15201b",
                card: "#1c2922",
                hover: "#263832"
            },
            text: {
                primary: "#c1f0c1",    // Soft green
                secondary: "#9ed89e",  // Muted green
                accent: "#6ee7b7"      // Bright mint
            },
            accent: {
                primary: "#059669",    // Emerald
                secondary: "#34d399"   // Light emerald
            }
        }
    },
    seafoamBreezLight: {
        name: "Meadow Glow",
        mode: 'light',
        colors: {
            primary: "#F0FFF4",      // Soft mint-like background
            secondary: "#E6FFF0",    // Slightly lighter mint tone
            background: {
                main: "#FFFFFF",        // Pure white main background
                card: "#F5FFFB",        // Very soft seafoam card background
                hover: "#E0FFF5"        // Soft aqua hover state
            },
            text: {
                primary: "#2C3E50",     // Deep sea blue for primary text
                secondary: "#34495E",   // Slightly lighter sea blue for secondary text
                accent: "#16A085"       // Deep teal for accents
            },
            accent: {
                primary: "#2ECC71",     // Soft green primary accent
                secondary: "#3498DB"    // Soft blue secondary accent
            }
        }
    },
    sunsetGlow: {
        name: "Sunset Glow",
        mode: 'dark',
        colors: {
            primary: "#27181a",      // Deep warm brown
            secondary: "#321e20",
            background: {
                main: "#211618",
                card: "#2a1c1e",
                hover: "#382325"
            },
            text: {
                primary: "#fde4cf",    // Warm white
                secondary: "#fac5a5",  // Muted orange
                accent: "#fb923c"      // Bright orange
            },
            accent: {
                primary: "#ea580c",    // Deep orange
                secondary: "#f97316"   // Bright orange
            }
        }
    },
    sunsetRise: {
        name: "Sunset Rise",
        mode: 'light',
        colors: {
            primary: "#fff2e6",
            secondary: "#fff7f0",
            background: {
                main: "#fffaf5",
                card: "#ffffff",
                hover: "#fff0e6"
            },
            text: {
                primary: "#4a4a4a",
                secondary: "#6c6c6c",
                accent: "#f39c12"
            },
            accent: {
                primary: "#d35400",
                secondary: "#e67e22"
            }
        }
    },
    lightsOut: {
        name: "Lights Out",
        mode: 'dark',
        colors: {
            primary: "#000000",      // Absolute black for AMOLED screens
            secondary: "#0a0a0a",    // Near-black for subtle contrast
            background: {
                main: "#000000",       // Fully black background
                card: "#0e0e0e",       // Very dark grey for cards
                hover: "#1a1a1a"       // Dark grey for hover state
            },
            text: {
                primary: "#c7c7c7",    // Dim white for softer contrast
                secondary: "#7a7a7a",  // Muted dark grey for secondary text
                accent: "#5a646e"      // Dark, calming blue-grey
            },
            accent: {
                primary: "#5a646e",    // Deep blue-grey for primary accent
                secondary: "#3e464e"   // Darker slate grey for secondary accent
            }
        }
    },
    softLight: {
        name: "Soft Light",
        mode: 'light',
        colors: {
            primary: "#F0F4F8",      // Soft lavender-blue background
            secondary: "#F5F7FA",    // Slightly lighter pastel tone
            background: {
                main: "#FFFFFF",        // Pure white main background
                card: "#F0F3F7",        // Very soft blue-gray card background
                hover: "#E6E9F0"        // Soft misty hover state
            },
            text: {
                primary: "#333333",     // Deep charcoal for primary text
                secondary: "#666666",   // Medium gray for secondary text
                accent: "#3A5A95"       // Deep muted blue for accents
            },
            accent: {
                primary: "#919191",     // Soft muted blue primary accent
                secondary: "#BDBDBD"    // Soft mint secondary accent
            }
        }
    },
    mangoNightfall: {
        name: "Mango Twilight",
        mode: 'dark',
        colors: {
            primary: "#2A1F13",      // Soft deep burnt sienna background
            secondary: "#3A2A1A",    // Slightly warmer dark tone
            background: {
                main: "#1F1610",        // Soft deep brown main background
                card: "#2F221A",        // Warm, muted auburn card background
                hover: "#3F2D22"        // Soft warm hover state
            },
            text: {
                primary: "#F5D4B4",     // Soft warm cream for primary text
                secondary: "#E0BC9C",   // Lighter warm beige for secondary text
                accent: "#FF8C42"       // Soft warm orange for accents
            },
            accent: {
                primary: "#FF7F50",     // Soft coral orange primary accent
                secondary: "#2ECC71"    // Soft muted green secondary accent
            }
        }
    },
    mangoSunriseLight: {
        name: "Mango Swag",
        mode: 'light',
        colors: {
            primary: "#FFF5E6",      // Soft mango-like background
            secondary: "#FFF0E6",    // Slightly warmer orange tone
            background: {
                main: "#FFFFFF",        // Pure white main background
                card: "#FFF2D9",        // Very soft mango-like card background
                hover: "#FFE4C4"        // Soft wheat-like hover state
            },
            text: {
                primary: "#4A3933",     // Deep brownish tone for primary text
                secondary: "#6E5C4F",   // Warm brown for secondary text
                accent: "#D35400"       // Deep orange for accents
            },
            accent: {
                primary: "#FF7F50",     // Coral orange primary accent
                secondary: "#2ECC71"    // Soft muted green secondary accent
            }
        }
    },
    rosePineDark: {
        name: "Rose Moon",
        mode: 'dark',
        colors: {
            primary: "#191724",      // Deep dark purple background
            secondary: "#1F1D2E",    // Slightly lighter dark tone
            background: {
                main: "#151320",        // Very deep purple-black main background
                card: "#1E1C2F",        // Dark purple card background
                hover: "#211F3A"        // Soft deep purple hover state
            },
            text: {
                primary: "#E0DEF4",     // Soft pale lavender for primary text
                secondary: "#9893A5",   // Muted gray-lavender for secondary text
                accent: "#31748F"       // Soft muted teal for accents
            },
            accent: {
                primary: "#9CCFD8",     // Soft pale blue primary accent
                secondary: "#EB6F92"    // Soft rose accent
            }
        }
    },
    rosePineLight: {
        name: "Rose Pine",
        mode: 'light',
        colors: {
            primary: "#F0F1F4",      // Soft, pale gray background
            secondary: "#F5F6F8",    // Slightly lighter neutral tone
            background: {
                main: "#FFFFFF",        // Pure white main background
                card: "#F2F3F5",        // Very soft gray card background
                hover: "#E6E7EB"        // Subtle light gray hover state
            },
            text: {
                primary: "#575279",     // Deep muted purple for primary text
                secondary: "#6E6A86",   // Slightly lighter muted purple for secondary text
                accent: "#286983"       // Soft muted blue for accents
            },
            accent: {
                primary: "#907AA9",     // Soft lavender primary accent
                secondary: "#EA9D34"    // Warm golden accent
            }
        }
    }
};

export type ThemeKey = keyof typeof themes;