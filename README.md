# Slot Machine Game

A real estate-themed slot machine game with separate iPad (player registration) and TV (game display) interfaces.

## Overview

This application provides an interactive slot machine experience with two distinct user interfaces:

- **iPad Interface**: Player registration only - users enter their information and are directed to press the physical button
- **TV Display**: Shows leaderboard, waiting screen, spinning animation, and results for all players to watch

## Architecture

### Backend
- **Framework**: Rails 7.2 API
- **Database**: SQLite3
- **WebSocket**: ActionCable for real-time game state synchronization
- **Testing**: RSpec (43 passing tests)

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **WebSocket**: ActionCable JS client

### Game Components

#### Models
- `Player`: User information (name, email, phone)
- `Spin`: Individual game spins with reel values
- `GameState`: Current state of the game (idle, ready, spinning, results)

#### Reel Values
- **Zillow**: $200K - $1M
- **Realtor**: $200K - $1M
- **Homes.com**: $200K - $1M
- **Google**: $200K - $1M
- **Smart Sign**: $200K - $1M
- **Banana**: Special value triggering bonus wheel

## Prerequisites

- Ruby 3.2.0+
- Node.js 18+
- Bundler
- npm or yarn

## Installation

### Backend Setup

```bash
# Install dependencies
bundle install

# Setup database
rails db:create db:migrate db:seed

# Run tests
bundle exec rspec

# Start server
bundle exec rails server
```

The backend will run on `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Running the Application

### Start Both Servers

**Terminal 1 - Backend:**
```bash
bundle exec rails server
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Interfaces

- **iPad Interface**: http://localhost:5173
- **TV Display**: http://localhost:5173?display=tv

## User Flow

### Player Journey (iPad)

1. **Registration Screen**
   - Player enters name, email, and phone number
   - Form validation ensures all fields are complete
   - Submit updates game state to 'ready'

2. **Thank You Screen**
   - Friendly message thanking the player
   - Directs player to press the physical button
   - Option to register another player

### TV Display Flow

1. **Idle - Leaderboard**
   - Shows top performers of the day
   - Displays player rankings, spin counts, and total scores
   - Auto-refreshes every 30 seconds
   - "Register on the iPad to play!" message

2. **Ready - Waiting Screen**
   - Shows player's first name
   - Large animated "Press The Big Red Button!" message
   - Pulsing button animation
   - Waiting for button press

3. **Spinning - Animation**
   - All 5 reels spin simultaneously
   - 3-second spinning animation
   - Reveals actual reel values
   - Smooth transitions

4. **Results Screen**
   - Shows all reel values
   - Displays total winnings
   - Shows banana count if bonus triggered
   - Auto-returns to leaderboard after 5 seconds

## API Endpoints

### Players
- `POST /api/players` - Create new player
- `GET /api/players` - List all players
- `GET /api/players/:id` - Get player details

### Spins
- `POST /api/spins` - Create new spin
- `GET /api/spins/:id` - Get spin details

### Game State
- `GET /api/game_state` - Get current game state
- `PUT /api/game_state` - Update game state

### Leaderboard
- `GET /api/leaderboard` - Get today's leaderboard

## WebSocket Events

### Channel: GameChannel

**Broadcasts:**
- `game_state_updated` - Sent when game state changes
- Payload includes: state, player info, spin ID

**States:**
- `idle` - No active player, showing leaderboard
- `ready` - Player registered, waiting for button press
- `spinning` - Spin in progress
- `results` - Showing spin results

## Testing

### Backend Tests
```bash
bundle exec rspec
```

Current coverage: 43 passing tests

### Frontend Tests
The frontend uses TypeScript for type safety. Build verification:
```bash
cd frontend
npm run build
```

### Manual Testing
See [docs/TESTING_RESULTS.md](docs/TESTING_RESULTS.md) for comprehensive manual testing checklist.

## Simulating Button Press

Since the physical button isn't implemented yet, use one of these methods:

### Method 1: API Call
```bash
curl -X POST http://localhost:3000/api/spins \
  -H "Content-Type: application/json" \
  -d '{"player_id": 1}'
```

### Method 2: Rails Console
```bash
rails console
> player = Player.last
> spin = player.spins.create!(
    zillow_value: 200000,
    realtor_value: 500000,
    homes_value: 1000000,
    google_value: 750000,
    smart_sign_value: 300000
  )
> GameState.update_state('spinning', player_id: player.id, player_name: player.name, spin_id: spin.id)
```

### Method 3: Direct State Update
```bash
# Start spinning
curl -X PUT http://localhost:3000/api/game_state \
  -H "Content-Type: application/json" \
  -d '{"state": "spinning", "player_id": 1, "spin_id": 1}'

# Show results
curl -X PUT http://localhost:3000/api/game_state \
  -H "Content-Type: application/json" \
  -d '{"state": "results", "player_id": 1, "spin_id": 1}'

# Return to idle
curl -X PUT http://localhost:3000/api/game_state \
  -H "Content-Type: application/json" \
  -d '{"state": "idle"}'
```

## Project Structure

```
slot_machine/
├── app/                    # Rails backend
│   ├── models/            # ActiveRecord models
│   ├── controllers/       # API controllers
│   ├── channels/          # ActionCable channels
│   └── services/          # Business logic
├── frontend/              # React frontend
│   ├── src/
│   │   ├── apps/
│   │   │   ├── player-ipad/    # iPad registration app
│   │   │   └── display-tv/     # TV display app
│   │   ├── components/         # Shared UI components
│   │   ├── lib/
│   │   │   ├── api/           # API client
│   │   │   ├── stores/        # Zustand stores
│   │   │   └── websocket/     # WebSocket client
│   │   └── types/             # TypeScript types
├── spec/                  # RSpec tests
└── docs/                  # Documentation
```

## Key Features

### Error Handling
- Error boundaries on both iPad and TV displays
- Graceful error messages with reload option
- Network failure resilience

### Loading States
- Initial connection loading
- API call loading indicators
- Smooth screen transitions (300ms fade)

### Animations
- Framer Motion for smooth animations
- Pulsing button effects
- Spinning reel animations
- Celebration effects for wins

### Real-time Updates
- WebSocket synchronization between iPad and TV
- Instant state changes across displays
- Auto-refresh leaderboard every 30 seconds

## Deployment

### Production Build

**Backend:**
```bash
RAILS_ENV=production rails assets:precompile
RAILS_ENV=production rails db:migrate
RAILS_ENV=production rails server
```

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

### Environment Variables

Create `.env` files for configuration:

**Backend (.env):**
```
RAILS_ENV=production
DATABASE_URL=sqlite3:db/production.sqlite3
SECRET_KEY_BASE=your_secret_key_here
```

**Frontend (.env):**
```
VITE_API_URL=http://your-backend-url
VITE_WS_URL=ws://your-backend-url/cable
```

## Known Issues

1. **TypeScript Build Warnings**: Pre-existing type configuration issues. Application functions correctly in development mode.
2. **Physical Button**: Not yet implemented - use API simulation methods above.
3. **Bonus Wheel**: Placeholder - "coming soon" when triggered.

## Future Enhancements

- [ ] Physical button integration with Raspberry Pi
- [ ] Bonus wheel implementation
- [ ] Sound effects and background music
- [ ] Player photo capture
- [ ] Email/SMS notification of results
- [ ] Historical statistics and analytics
- [ ] Multi-day leaderboards
- [ ] Tournament mode

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `bundle exec rspec`
4. Ensure type safety: `cd frontend && npm run build`
5. Commit with descriptive messages
6. Push and create a pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team.

---

Built with ❤️ using Rails 7.2 and React 18
