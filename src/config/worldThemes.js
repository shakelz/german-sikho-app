/**
 * World Select Screen Themes Configuration
 * Manages theme constants for the theme switching system
 */

export const WORLD_THEMES = {
    STANDARD: 'standard',
    GLASS: 'glass',
    CINEMATIC: 'cinematic',
};

export const DEFAULT_THEME = WORLD_THEMES.STANDARD;

export const THEME_CONFIG = {
    [WORLD_THEMES.STANDARD]: {
        id: WORLD_THEMES.STANDARD,
        name: 'Light & Fresh',
        description: 'Clean, bright colors with a friendly poster style.',
    },
    [WORLD_THEMES.GLASS]: {
        id: WORLD_THEMES.GLASS,
        name: 'Dark Glass',
        description: 'Sleek dark mode with premium glassmorphism effects.',
    },
    [WORLD_THEMES.CINEMATIC]: {
        id: WORLD_THEMES.CINEMATIC,
        name: 'Midnight Cinematic',
        description: 'Immersive deep dark mode with glowing accents.',
    },
};
