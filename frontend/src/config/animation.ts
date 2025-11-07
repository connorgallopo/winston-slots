// frontend/src/config/animation.ts

/**
 * Central animation timing and easing configuration
 * All durations in milliseconds
 */

export const ANIMATION_CONFIG = {
  // Reel spinning configuration
  reels: {
    // Total spin duration per reel (5 seconds)
    spinDuration: 5000,

    // Delay between each reel starting (800ms stagger)
    staggerDelay: 800,

    // Three-phase easing durations
    phases: {
      acceleration: 500,    // Phase 1: Fast acceleration
      constant: 3000,       // Phase 2: Constant speed
      deceleration: 1500,   // Phase 3: Slow finish
    },

    // Easing curves
    easing: {
      acceleration: [0.4, 0, 1, 1] as const,           // Ease-in
      constant: [0, 0, 1, 1] as const,                 // Linear
      deceleration: [0.16, 1, 0.3, 1] as const,        // Ease-out cubic
    },

    // Visual properties
    scrollDistance: -2000,      // Pixels to scroll upward
    valuesPerCycle: 20,         // Number of values shown during spin

    // Pop animation on land
    popAnimation: {
      duration: 400,
      scaleKeyframes: [0.8, 1.15, 1.0] as const,
      brightnessKeyframes: [0.5, 1.5, 1.0] as const,
      times: [0, 0.6, 1] as const,
    },

    // Glow pulse ring
    glowPulse: {
      duration: 800,
      scaleKeyframes: [1, 1.4, 1] as const,
      opacityKeyframes: [0.8, 0, 0] as const,
    },
  },

  // State transitions
  transitions: {
    screenFade: 300,           // Screen transition duration
    resultsDelay: 500,         // Delay before showing results
    resultsDisplay: 5000,      // How long to show results screen
    leaderboardReturn: 5000,   // Time before returning to leaderboard
    readyCountdown: 3000,      // Ready state countdown
  },

  // Results screen animations
  results: {
    countUpDuration: 2000,     // Score count-up animation
    countUpSteps: 60,          // Number of steps in count-up
    screenShakeDuration: 500,  // Screen shake duration
    confettiDuration: 3000,    // Confetti animation duration
  },

  // Leaderboard animations
  leaderboard: {
    rowStagger: 100,           // Delay between each row appearing
    entryAnimation: 500,       // Individual entry animation duration
    medalBobDuration: 2000,    // Floating medal bob animation
    attractPulse: 3000,        // "Register to play" pulse
  },

  // Background effects
  background: {
    shimmerDuration: 4000,     // Background shimmer loop
    lightRaySpeed: 8000,       // Moving light rays
  },
} as const;

// Export individual sections for easier imports
export const REEL_ANIMATION = ANIMATION_CONFIG.reels;
export const TRANSITION_TIMING = ANIMATION_CONFIG.transitions;
export const RESULTS_ANIMATION = ANIMATION_CONFIG.results;
export const LEADERBOARD_ANIMATION = ANIMATION_CONFIG.leaderboard;
export const BACKGROUND_ANIMATION = ANIMATION_CONFIG.background;
