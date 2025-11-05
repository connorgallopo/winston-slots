# Testing the Slot Machine Frontend

## Prerequisites

1. **Backend running** on `http://localhost:3000`
2. **Frontend dev server** running

## Start the Application

### Terminal 1: Start Rails Backend
```bash
cd /path/to/slot_machine
bundle exec rails server
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns).

## Testing the Player Flow

### 1. Registration Screen
- Enter your name, email, and phone
- Click "Let's Play!"
- Backend creates a player via API

### 2. Waiting Screen
- See animated "Press The Big Red Button" indicator
- **Testing without hardware:** Press **SPACEBAR** to simulate button press
- Backend updates game state to "ready"

### 3. Spinning Animation
- 5 reels spin with animated values
- Spins for 4 seconds
- Backend creates a spin with random values via API

### 4. Results Screen
- See your reel values
- See total score
- If 3+ bananas (3M values), see "BONUS!" message
- Click "Play Again" to restart

## Features to Verify

- ✅ **WebSocket Connection**: Green dot in header = connected
- ✅ **Form Validation**: Try submitting empty fields
- ✅ **API Calls**: Check browser console for API requests
- ✅ **Animations**: Smooth transitions between screens
- ✅ **Responsive**: Resize browser to test iPad sizing

## Environment Variables

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` if your backend is on a different port:
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/cable
```

## Keyboard Shortcuts

- **SPACEBAR** (on waiting screen): Simulate button press and trigger spin

## Troubleshooting

### WebSocket not connecting
- Check that Rails server is running
- Check browser console for connection errors
- Verify `VITE_WS_URL` in `.env`

### API calls failing
- Check that Rails server is running on correct port
- Check browser console Network tab
- Verify `VITE_API_URL` in `.env`

### Animations not smooth
- Make sure you're in development mode (`npm run dev`)
- Check CPU usage - animations are GPU-accelerated

## Production Build

```bash
npm run build
npm run preview
```

This creates an optimized production build in `dist/`.
