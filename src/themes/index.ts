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

export type Theme = {
    name: string;
    colors: ThemeColors;
};

export const themes: Record<string, Theme> = {
    starryNight: {
        name: "Starry Night",
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
    sakuraSpring: {
        name: "Sakura Spring",
        colors: {
            primary: "#2d2d2d",
            secondary: "#353535",
            background: {
                main: "#282828",
                card: "#303030",
                hover: "#383838"
            },
            text: {
                primary: "#ffeded",
                secondary: "#ffd7d7",
                accent: "#ffb7b7"
            },
            accent: {
                primary: "#ff9494",    // Soft pink
                secondary: "#ffa7a7"   // Light pink
            }
        }
    },
    oceanDepth: {
        name: "Ocean Depth",
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
    forestShade: {
        name: "Forest Shade",
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
    sunsetGlow: {
        name: "Sunset Glow",
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
    }
};

export type ThemeKey = keyof typeof themes;