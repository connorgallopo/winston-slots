import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebSocket } from './lib/websocket/useWebSocket';
import { useGameStore } from './lib/stores/gameStore';
import { Button, Card, CardBody, ScoreDisplay } from './components';

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
  const gameState = useGameStore((state) => state.gameState);
  const isConnected = useGameStore((state) => state.isConnected);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <Card className="max-w-2xl w-full">
        <CardBody>
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-primary-500">
              E-Team Slot Machine
            </h1>

            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {gameState && (
              <div className="p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">Current State</p>
                <p className="text-2xl font-bold text-white mt-2">{gameState.state}</p>
                {gameState.current_player_name && (
                  <p className="text-gray-300 mt-2">
                    Player: {gameState.current_player_name}
                  </p>
                )}
              </div>
            )}

            <div className="pt-6">
              <ScoreDisplay score={1000000} label="Demo Score" />
            </div>

            <div className="flex gap-4">
              <Button variant="primary" fullWidth>
                Primary Button
              </Button>
              <Button variant="secondary" fullWidth>
                Secondary
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <p className="text-gray-500 text-sm text-center">
        Frontend infrastructure is ready!
        <br />
        Next: Build iPad Player Interface
      </p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
