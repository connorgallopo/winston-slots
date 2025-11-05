# Frontend iPad/TV Split - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

## ✅ What's Already Complete

### Backend (100% Complete)
- ✅ Rails 7.2 API with SQLite
- ✅ Models: Player, Spin, GameState
- ✅ API Endpoints: Players, Spins, GameState, Leaderboard
- ✅ ActionCable WebSocket (GameChannel)
- ✅ 43 passing tests
- ✅ CORS configured
- ✅ ReelValueGenerator service

### Frontend Infrastructure (100% Complete)
- ✅ Vite + React + TypeScript
- ✅ Tailwind CSS configured
- ✅ Shared Components: Button, Card, Loading, ScoreDisplay, Input
- ✅ API Client (TypeScript, all endpoints)
- ✅ WebSocket Client (ActionCable integration)
- ✅ Zustand store for state management
- ✅ TanStack Query for data fetching

### Frontend iPad App (Needs Fixing)
- ✅ PlayerRegistration form (KEEP THIS)
- ❌ WaitingScreen (MOVE TO TV)
- ❌ SpinningAnimation (MOVE TO TV)
- ❌ ResultsScreen (MOVE TO TV)

---

## 🎯 What Needs To Be Done

## Phase 1: Fix iPad App (Registration Only)

### Task 1.1: Simplify iPad PlayerApp

**Goal:** iPad shows ONLY the registration form, then a "Thank you" message

**Files to modify:**
- `frontend/src/apps/player-ipad/PlayerApp.tsx`

**Current behavior:** 4-screen flow (registration, waiting, spinning, results)
**New behavior:** 2-screen flow (registration, thank you)

**Implementation:**

**Step 1: Update PlayerApp state machine**

Modify `frontend/src/apps/player-ipad/PlayerApp.tsx`:
- Change state from 4 steps to 2: `'registration' | 'thank_you'`
- Remove: waiting, spinning, results logic
- Remove: WebSocket listener for button press
- Remove: keyboard spacebar handler
- After registration → Update game state to 'ready' → Show thank you screen

Expected: Simplified flow

**Step 2: Create ThankYouScreen component**

Create `frontend/src/apps/player-ipad/ThankYouScreen.tsx`:
```typescript
import { motion } from 'framer-motion';
import { Card, CardBody, Button } from '../../components';
import type { Player } from '../../types/api';

interface ThankYouScreenProps {
  player: Player;
  onStartOver: () => void;
}

export function ThankYouScreen({ player, onStartOver }: ThankYouScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardBody className="text-center py-16 space-y-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl"
            >
              ✅
            </motion.div>

            <div>
              <h1 className="text-5xl font-bold text-primary-500 mb-4">
                Thanks, {player.name.split(' ')[0]}!
              </h1>
              <p className="text-2xl text-gray-300">
                Now go press the big red button!
              </p>
            </div>

            <p className="text-gray-400 text-lg">
              Watch the TV screen for your results
            </p>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onStartOver}
            >
              Register Another Player
            </Button>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
```

Expected: New component created

**Step 3: Update PlayerApp imports and logic**

Modify `frontend/src/apps/player-ipad/PlayerApp.tsx`:
- Remove imports: WaitingScreen, SpinningAnimation, ResultsScreen
- Add import: ThankYouScreen
- Update state type: `type GameStep = 'registration' | 'thank_you'`
- Remove: createSpinMutation
- Remove: all WebSocket listeners
- Remove: keyboard handler
- Simplify handleRegistrationComplete:
  ```typescript
  const handleRegistrationComplete = async (newPlayer: Player) => {
    setPlayer(newPlayer);
    setCurrentPlayer(newPlayer);

    await apiClient.updateGameState({
      state: 'ready',
      player_id: newPlayer.id,
      player_name: newPlayer.name,
    });

    setStep('thank_you');
  };
  ```
- Update render logic:
  ```typescript
  switch (step) {
    case 'registration':
      return <PlayerRegistration onComplete={handleRegistrationComplete} />;
    case 'thank_you':
      return player ? (
        <ThankYouScreen
          player={player}
          onStartOver={handleStartOver}
        />
      ) : null;
    default:
      return null;
  }
  ```

Expected: Clean, simple iPad app

**Step 4: Test iPad flow**

Run:
```bash
cd frontend
npm run dev
```

Test:
1. Fill out registration form
2. Submit
3. See thank you screen
4. Click "Register Another Player"
5. Back to registration

Expected: Smooth 2-screen flow, no errors

**Step 5: Commit**

```bash
git add frontend/src/apps/player-ipad
git commit -m "fix: simplify iPad app to registration only"
```

---

## Phase 2: Build TV Display App

### Task 2.1: Create TV Display State Machine

**Goal:** TV shows leaderboard, waiting screen, spinning animation, and results based on game state

**Files to create:**
- `frontend/src/apps/display-tv/TVDisplay.tsx`
- `frontend/src/apps/display-tv/IdleLeaderboard.tsx`
- `frontend/src/apps/display-tv/WaitingScreen.tsx`
- `frontend/src/apps/display-tv/SpinningAnimation.tsx`
- `frontend/src/apps/display-tv/ResultsScreen.tsx`
- `frontend/src/apps/display-tv/index.ts`

**Step 1: Create TVDisplay main component**

Create `frontend/src/apps/display-tv/TVDisplay.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { useGameStore } from '../../lib/stores/gameStore';
import { IdleLeaderboard } from './IdleLeaderboard';
import { WaitingScreen } from './WaitingScreen';
import { SpinningAnimation } from './SpinningAnimation';
import { ResultsScreen } from './ResultsScreen';
import { FullPageLoading } from '../../components';
import type { Spin } from '../../types/api';

export function TVDisplay() {
  const gameState = useGameStore((state) => state.gameState);
  const [currentSpin, setCurrentSpin] = useState<Spin | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch current spin when spin_id changes
  const { data: spin, isLoading } = useQuery({
    queryKey: ['spin', gameState?.current_spin_id],
    queryFn: () => apiClient.getSpin(gameState!.current_spin_id!),
    enabled: !!gameState?.current_spin_id && !currentSpin,
  });

  useEffect(() => {
    if (spin) {
      setCurrentSpin(spin);
    }
  }, [spin]);

  // Listen to game state changes
  useEffect(() => {
    if (!gameState) return;

    // When state changes to results, wait a moment then show results
    if (gameState.state === 'results' && currentSpin) {
      setTimeout(() => {
        setShowResults(true);
      }, 500);
    }

    // When state returns to idle, reset
    if (gameState.state === 'idle') {
      setTimeout(() => {
        setCurrentSpin(null);
        setShowResults(false);
      }, 5000); // Show results for 5 seconds before returning to leaderboard
    }
  }, [gameState, currentSpin]);

  // Show loading while fetching spin data
  if (isLoading && gameState?.state === 'spinning') {
    return <FullPageLoading message="Loading spin data..." />;
  }

  // Render based on game state
  switch (gameState?.state) {
    case 'idle':
      return <IdleLeaderboard />;

    case 'ready':
      return (
        <WaitingScreen
          playerName={gameState.current_player_name || 'Player'}
        />
      );

    case 'spinning':
      return currentSpin ? (
        <SpinningAnimation spin={currentSpin} />
      ) : (
        <FullPageLoading message="Generating spin..." />
      );

    case 'results':
      return currentSpin && showResults ? (
        <ResultsScreen spin={currentSpin} />
      ) : (
        <SpinningAnimation spin={currentSpin!} />
      );

    default:
      return <IdleLeaderboard />;
  }
}
```

Expected: Main TV component created with state machine

**Step 2: Move and adapt WaitingScreen for TV**

Copy `frontend/src/apps/player-ipad/WaitingScreen.tsx` to `frontend/src/apps/display-tv/WaitingScreen.tsx`

Modify:
- Remove `player` prop, use `playerName: string` instead
- Update greeting to use `playerName`
- Make button animation larger (TV is far away)
- Increase font sizes for TV visibility

Expected: TV-optimized waiting screen

**Step 3: Move and adapt SpinningAnimation for TV**

Copy `frontend/src/apps/player-ipad/SpinningAnimation.tsx` to `frontend/src/apps/display-tv/SpinningAnimation.tsx`

Modify:
- Add `spin: Spin` prop to show actual reel values after spinning
- Change animation duration to 3 seconds
- On animation complete, show actual values from spin
- Remove player name (not needed on TV)
- Increase font sizes for TV visibility

Expected: TV-optimized spinning animation

**Step 4: Move and adapt ResultsScreen for TV**

Copy `frontend/src/apps/player-ipad/ResultsScreen.tsx` to `frontend/src/apps/display-tv/ResultsScreen.tsx`

Modify:
- Remove `player` and `onPlayAgain` props
- Just show spin results
- Auto-return to leaderboard after timeout (handled in TVDisplay)
- Increase font sizes for TV visibility
- Add more celebration animations

Expected: TV-optimized results screen

**Step 5: Create IdleLeaderboard component**

Create `frontend/src/apps/display-tv/IdleLeaderboard.tsx`:
```typescript
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { Card, CardBody, Loading } from '../../components';

export function IdleLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: apiClient.getLeaderboard.bind(apiClient),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Loading size="lg" message="Loading leaderboard..." />
      </div>
    );
  }

  const players = leaderboard?.players || [];

  return (
    <div className="min-h-screen p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-7xl font-bold text-primary-500">
            Today's Leaderboard
          </h1>
          <p className="text-3xl text-gray-400">
            Top Performers - {leaderboard?.date}
          </p>
        </motion.div>

        {/* Leaderboard */}
        {players.length === 0 ? (
          <Card>
            <CardBody className="text-center py-20">
              <p className="text-4xl text-gray-400">
                No spins yet today. Be the first!
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {players.map((player, index) => (
              <motion.div
                key={player.player_id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={index === 0 ? 'border-4 border-primary-500' : ''}>
                  <CardBody className="py-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        {/* Rank */}
                        <div
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold
                            ${index === 0 ? 'bg-yellow-500 text-gray-900' : ''}
                            ${index === 1 ? 'bg-gray-400 text-gray-900' : ''}
                            ${index === 2 ? 'bg-orange-600 text-white' : ''}
                            ${index > 2 ? 'bg-gray-700 text-gray-300' : ''}
                          `}
                        >
                          {player.rank}
                        </div>

                        {/* Name */}
                        <div>
                          <h3 className="text-4xl font-bold text-white">
                            {player.name}
                          </h3>
                          <p className="text-xl text-gray-400 mt-2">
                            {player.spin_count} spin{player.spin_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-5xl font-bold text-primary-500">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                          }).format(player.total_score)}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Attract message */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-center pt-8"
        >
          <p className="text-3xl text-gray-400">
            Register on the iPad to play!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
```

Expected: Full leaderboard display with rankings

**Step 6: Create TV display index file**

Create `frontend/src/apps/display-tv/index.ts`:
```typescript
export { TVDisplay } from './TVDisplay';
```

Expected: TV app exported

**Step 7: Test TV flow**

Create test route in `frontend/src/App.tsx`:
- Add route parameter: Check URL for `?display=tv`
- If TV, show TVDisplay
- If iPad (default), show PlayerApp

Expected: Can test both displays

**Step 8: Commit**

```bash
git add frontend/src/apps/display-tv
git commit -m "feat: build TV display app with leaderboard and game flow"
```

---

## Phase 3: Wire Everything Together

### Task 3.1: Add Display Router

**Goal:** Route to correct display based on URL parameter

**Files to modify:**
- `frontend/src/App.tsx`

**Step 1: Update App.tsx with routing logic**

Modify `frontend/src/App.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebSocket } from './lib/websocket/useWebSocket';
import { PlayerApp } from './apps/player-ipad';
import { TVDisplay } from './apps/display-tv';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  useWebSocket(); // Connect to WebSocket

  // Check URL parameter for display type
  const params = new URLSearchParams(window.location.search);
  const display = params.get('display');

  if (display === 'tv') {
    return <TVDisplay />;
  }

  // Default to iPad
  return <PlayerApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
```

Expected: Routing works

**Step 2: Test both displays**

Run:
```bash
npm run dev
```

Test:
1. Open `http://localhost:5173` → See iPad registration
2. Open `http://localhost:5173?display=tv` → See TV leaderboard
3. Register player on iPad
4. See TV update to "ready" state
5. Manually update game state to "spinning" (via API or console)
6. Watch TV show spinning animation

Expected: Both displays work independently

**Step 3: Add manual test controls**

Create dev-only controls to simulate button press:
- Add keyboard shortcut (B key) on TV display to trigger spin
- Add API call function to manually advance game states

Expected: Can test full flow without hardware

**Step 4: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: add display routing (iPad vs TV)"
```

---

## Phase 4: Polish & Testing

### Task 4.1: Add Error Boundaries

Create error boundaries for both apps to handle crashes gracefully

### Task 4.2: Add Loading States

Ensure smooth transitions between states with proper loading indicators

### Task 4.3: Test Full Flow

Test complete user journey:
1. iPad: Register player
2. TV: See waiting screen
3. Press button (simulate)
4. TV: See spinning
5. TV: See results
6. TV: Return to leaderboard
7. Repeat

### Task 4.4: Update Documentation

Create deployment guide and testing instructions

---

## Testing Instructions

### Start Both Displays:

Terminal 1 - Backend:
```bash
bundle exec rails server
```

Terminal 2 - Frontend Dev:
```bash
cd frontend
npm run dev
```

### Open Displays:

1. **iPad:** `http://localhost:5173` (registration only)
2. **TV:** `http://localhost:5173?display=tv` (leaderboard/game flow)

### Simulate Button Press:

Option 1 - API Call:
```bash
curl -X POST http://localhost:3000/api/spins \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1}'
```

Option 2 - Rails Console:
```ruby
GameState.update_state('spinning', player_id: 1, player_name: 'Test', spin_id: 1)
```

Option 3 - Keyboard (on TV display):
Press 'B' key to trigger spin (if implemented)

---

## Summary

**Total Tasks:** 8
- Phase 1: 1 task (Fix iPad)
- Phase 2: 1 task (Build TV)
- Phase 3: 1 task (Wire together)
- Phase 4: 4 tasks (Polish)

**Estimated Time:** 90-120 minutes

**Key Deliverables:**
- iPad shows ONLY registration form + thank you
- TV shows leaderboard, waiting, spinning, results
- WebSocket-driven state synchronization
- Manual testing without hardware button
