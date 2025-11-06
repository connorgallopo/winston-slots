// frontend/src/utils/reelTiers.ts

/**
 * Casino-style heat map color coding for reel values
 * Gray → Blue → Purple → Orange → Gold based on value ranges
 */

export const getValueTierColor = (value: number): string => {
  if (value === 3_000_000) return 'text-yellow-400'; // Banana special
  if (value >= 2_000_000) return 'text-yellow-500'; // Gold - Jackpot
  if (value >= 1_000_000) return 'text-orange-500'; // Orange - Hot
  if (value >= 500_000) return 'text-purple-500';   // Purple - Medium
  return 'text-blue-400';                            // Blue - Cool
};

export const getValueTierBorder = (value: number): string => {
  if (value === 3_000_000) return 'border-yellow-400';
  if (value >= 2_000_000) return 'border-yellow-500';
  if (value >= 1_000_000) return 'border-orange-500';
  if (value >= 500_000) return 'border-purple-500';
  return 'border-blue-400';
};

export const getValueTierGlow = (value: number): string => {
  if (value === 3_000_000) return 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]';
  if (value >= 2_000_000) return 'drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]';
  if (value >= 1_000_000) return 'drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]';
  if (value >= 500_000) return 'drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]';
  return 'drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]';
};

/**
 * Generate random values for reel spinning animation
 * Returns array of realistic reel values for visual variety
 */
export const generateRandomReelValues = (count: number): number[] => {
  const possibleValues = [
    200_000,
    300_000,
    450_000,
    500_000,
    750_000,
    1_000_000,
    1_500_000,
    2_000_000,
    2_500_000,
    3_000_000,
  ];

  return Array(count)
    .fill(0)
    .map(() => possibleValues[Math.floor(Math.random() * possibleValues.length)]);
};

/**
 * Format value for display
 * Handles banana special case and currency formatting
 */
export const formatReelValue = (value: number): string => {
  if (value === 3_000_000) return '🍌';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Reel configuration constants
 */
export const REEL_CONFIG = {
  spinDuration: 5000,        // 5 seconds per reel
  stopDelay: 800,            // 800ms between sequential stops
  decelerationDuration: 1000, // 1 second deceleration phase
  scrollDistance: -2000,     // Pixels to scroll upward
  valuesPerCycle: 20,        // Number of values shown during spin
} as const;

export const REEL_NAMES = ['Zillow', 'Realtor', 'Homes.com', 'Google', 'Smart Sign'] as const;

export type ReelName = typeof REEL_NAMES[number];
