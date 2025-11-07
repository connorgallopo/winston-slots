# Lead Jackpot - Frontend

Vegas-style slot machine display for real estate lead generation gamification.

## Architecture

- **React 19** + **TypeScript**
- **Framer Motion** for animations
- **Zustand** for state management
- **Tailwind CSS 4** for styling
- **Vite** for build tooling

## State Flow

```
Idle/Leaderboard → Ready (player registered) → Spinning → Results → Leaderboard
```

## Configuration

All timing, easing, and visual constants are centralized:

- `src/config/animation.ts` - Animation timing and easing
- `src/config/theme.ts` - Colors, typography, brand styles

### Key Timing Constants

```typescript
REEL_ANIMATION.spinDuration        // 5000ms total per reel
REEL_ANIMATION.staggerDelay        // 800ms between reel starts
REEL_ANIMATION.phases.acceleration // 500ms fast start
REEL_ANIMATION.phases.constant     // 3000ms steady spin
REEL_ANIMATION.phases.deceleration // 1500ms slow finish
```

## Development

```bash
npm install
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint code
```

## QA Debug Mode

Enable automated testing via `?debug=qa` query parameter.

Runs 20 automated spins and validates:
- Reel alignment (centered values)
- Timing accuracy (5s per reel)
- FPS consistency (60 FPS target)
- Visual correctness

## Performance

Optimized for:
- **60 FPS** on Raspberry Pi 5
- **10-foot LED wall** visibility
- **GPU-accelerated** animations
- **< 2s** initial load time

See `PERFORMANCE.md` for detailed optimization notes.

## Key Features

### Sequential Reel Timing
- Reels spin one at a time with 800ms stagger
- 3-phase easing: acceleration → constant → deceleration
- Logo cover reveals on spin start
- Pop animation with glow on value land

### Tiered Celebrations
- Normal (<2M): Standard celebration
- Big (2M+): Confetti + medium shake
- Epic (3M+): More confetti + medium shake
- Legendary (5M+): Maximum confetti + intense shake + gold glow

### Visual Polish
- Ambient background shimmer
- Moving light rays
- Staggered leaderboard entrance
- Floating medal icons
- Brand-colored reel highlights

## File Structure

```
src/
├── config/              # Centralized configuration
│   ├── animation.ts     # Timing and easing constants
│   └── theme.ts         # Visual design system
├── apps/
│   ├── display-tv/      # TV display screens
│   │   ├── TVDisplay.tsx
│   │   ├── IdleLeaderboard.tsx
│   │   ├── WaitingScreen.tsx
│   │   ├── SpinningAnimation.tsx
│   │   └── ResultsScreen.tsx
│   └── qa-debug/        # QA debug mode
│       └── QADebugPanel.tsx
├── components/          # Reusable UI components
├── utils/               # Helper functions
│   ├── reelTiers.ts     # Value tier coloring
│   ├── winTiers.ts      # Win tier logic
│   └── qaDebug.ts       # QA testing utilities
└── types/               # TypeScript types
```
