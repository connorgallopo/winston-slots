// frontend/src/config/theme.ts

/**
 * Visual theme configuration: colors, typography, brand colors
 */

export const THEME_CONFIG = {
  // Brand colors per reel
  brands: {
    zillow: '#006AFF',
    realtor: '#C62828',
    homes: '#F57C00',
    google: '#34A853',
    smartSign: '#673AB7',
  },

  // Value tier colors (for heat map)
  tiers: {
    legendary: {
      text: 'text-yellow-400',
      border: 'border-yellow-400',
      glow: 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]',
      bg: 'bg-yellow-400',
    },
    gold: {
      text: 'text-yellow-500',
      border: 'border-yellow-500',
      glow: 'drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]',
      bg: 'bg-yellow-500',
    },
    hot: {
      text: 'text-orange-500',
      border: 'border-orange-500',
      glow: 'drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]',
      bg: 'bg-orange-500',
    },
    medium: {
      text: 'text-purple-500',
      border: 'border-purple-500',
      glow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]',
      bg: 'bg-purple-500',
    },
    cool: {
      text: 'text-blue-400',
      border: 'border-blue-400',
      glow: 'drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]',
      bg: 'bg-blue-400',
    },
  },

  // Podium colors
  podium: {
    first: {
      bg: 'bg-yellow-500',
      text: 'text-gray-900',
      gradient: 'from-yellow-400 to-yellow-600',
    },
    second: {
      bg: 'bg-gray-400',
      text: 'text-gray-900',
      gradient: 'from-gray-300 to-gray-500',
    },
    third: {
      bg: 'bg-orange-600',
      text: 'text-white',
      gradient: 'from-orange-500 to-orange-700',
    },
  },

  // Typography scale (for 10-foot displays)
  typography: {
    hero: 'text-9xl',          // Massive celebration text
    title: 'text-7xl',         // Main titles
    large: 'text-5xl',         // Large text
    medium: 'text-3xl',        // Medium text
    small: 'text-xl',          // Small text
  },

  // Spacing scale
  spacing: {
    section: 'space-y-12',
    card: 'p-12',
    content: 'space-y-8',
  },
} as const;

export const BRAND_COLORS = THEME_CONFIG.brands;
export const TIER_STYLES = THEME_CONFIG.tiers;
export const PODIUM_STYLES = THEME_CONFIG.podium;
