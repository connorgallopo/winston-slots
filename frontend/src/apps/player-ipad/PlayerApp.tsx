import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../lib/api/client';
import { useGameStore } from '../../lib/stores/gameStore';
import { PlayerRegistration } from './PlayerRegistration';
import { WaitingScreen } from './WaitingScreen';
import { SpinningAnimation } from './SpinningAnimation';
import { ResultsScreen } from './ResultsScreen';
import { FullPageLoading } from '../../components';
import type { Player, Spin } from '../../types/api';

type GameStep = 'registration' | 'waiting' | 'spinning' | 'results';

export function PlayerApp() {
  const [step, setStep] = useState<GameStep>('registration');
  const [player, setPlayer] = useState<Player | null>(null);
  const [spin, setSpin] = useState<Spin | null>(null);

  const gameState = useGameStore((state) => state.gameState);
  const setCurrentPlayer = useGameStore((state) => state.setCurrentPlayer);
  const setCurrentSpin = useGameStore((state) => state.setCurrentSpin);

  // Create spin mutation
  const createSpinMutation = useMutation({
    mutationFn: (playerId: number) => apiClient.createSpin(playerId),
    onSuccess: (newSpin) => {
      setSpin(newSpin);
      setCurrentSpin(newSpin);
      setStep('spinning');

      // Update game state to spinning
      apiClient.updateGameState({
        state: 'spinning',
        player_id: player?.id,
        player_name: player?.name,
        spin_id: newSpin.id,
      });

      // Simulate spin duration, then show results
      setTimeout(() => {
        setStep('results');
        apiClient.updateGameState({
          state: 'results',
          player_id: player?.id,
          player_name: player?.name,
          spin_id: newSpin.id,
        });
      }, 4000); // 4 seconds of spinning
    },
  });

  // Handle registration completion
  const handleRegistrationComplete = async (newPlayer: Player) => {
    setPlayer(newPlayer);
    setCurrentPlayer(newPlayer);

    // Update game state to ready
    await apiClient.updateGameState({
      state: 'ready',
      player_id: newPlayer.id,
      player_name: newPlayer.name,
    });

    setStep('waiting');
  };

  // Handle play again
  const handlePlayAgain = () => {
    setSpin(null);
    setStep('registration');
    setPlayer(null);
    setCurrentPlayer(null);
    setCurrentSpin(null);

    // Reset game state to idle
    apiClient.updateGameState({ state: 'idle' });
  };

  // Listen to WebSocket game state changes
  useEffect(() => {
    if (!gameState || !player) return;

    // When button is pressed (state changes to spinning) and we're waiting
    if (gameState.state === 'spinning' && step === 'waiting') {
      // Trigger spin creation
      createSpinMutation.mutate(player.id);
    }
  }, [gameState, step, player]);

  // Manual button press for testing (remove in production)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && step === 'waiting' && player) {
        e.preventDefault();
        createSpinMutation.mutate(player.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [step, player]);

  // Render current step
  if (createSpinMutation.isPending && step === 'waiting') {
    return <FullPageLoading message="Creating your spin..." />;
  }

  switch (step) {
    case 'registration':
      return <PlayerRegistration onComplete={handleRegistrationComplete} />;

    case 'waiting':
      return player ? <WaitingScreen player={player} /> : null;

    case 'spinning':
      return player ? <SpinningAnimation player={player} /> : null;

    case 'results':
      return player && spin ? (
        <ResultsScreen
          player={player}
          spin={spin}
          onPlayAgain={handlePlayAgain}
        />
      ) : null;

    default:
      return null;
  }
}
