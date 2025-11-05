import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebSocket } from './lib/websocket/useWebSocket';
import { PlayerApp } from './apps/player-ipad';

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
