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
