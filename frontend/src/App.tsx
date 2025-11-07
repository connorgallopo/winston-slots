import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWebSocket } from './lib/websocket/useWebSocket';
import { PlayerApp } from './apps/player-ipad';
import { TVDisplay } from './apps/display-tv';
import { QADebugPanel } from './apps/qa-debug/QADebugPanel';
import { ErrorBoundary } from './components';
import { preloadSounds } from './utils/audioManager';

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

  // Preload audio files on mount
  useEffect(() => {
    preloadSounds().catch((error) => {
      console.warn('Failed to preload sounds:', error);
    });
  }, []);

  // Check URL parameter for display type
  const params = new URLSearchParams(window.location.search);
  const display = params.get('display');
  const debug = params.get('debug');

  // QA Debug mode: ?debug=qa
  if (debug === 'qa') {
    return (
      <ErrorBoundary fallbackTitle="QA Debug Error">
        <QADebugPanel />
      </ErrorBoundary>
    );
  }

  if (display === 'tv') {
    return (
      <ErrorBoundary fallbackTitle="TV Display Error">
        <TVDisplay />
      </ErrorBoundary>
    );
  }

  // Default to iPad
  return (
    <ErrorBoundary fallbackTitle="iPad App Error">
      <PlayerApp />
    </ErrorBoundary>
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
