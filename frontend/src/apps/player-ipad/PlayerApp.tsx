import { useState } from 'react';
import { apiClient } from '../../lib/api/client';
import { useGameStore } from '../../lib/stores/gameStore';
import { PlayerRegistration } from './PlayerRegistration';
import { ThankYouScreen } from './ThankYouScreen';
import type { Player } from '../../types/api';

type GameStep = 'registration' | 'thank_you';

export function PlayerApp() {
  const [step, setStep] = useState<GameStep>('registration');
  const [player, setPlayer] = useState<Player | null>(null);

  const setCurrentPlayer = useGameStore((state) => state.setCurrentPlayer);

  // Handle registration completion
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

  // Handle start over
  const handleStartOver = () => {
    setStep('registration');
    setPlayer(null);
    setCurrentPlayer(null);

    // Reset game state to idle
    apiClient.updateGameState({ state: 'idle' });
  };

  // Render current step
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
}
