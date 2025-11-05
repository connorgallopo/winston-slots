import { create } from 'zustand';
import type { Player, Spin, GameState, LeaderboardEntry } from '../../types/api';

interface GameStore {
  // Game state
  gameState: GameState | null;
  setGameState: (state: GameState) => void;

  // Current player
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;

  // Current spin
  currentSpin: Spin | null;
  setCurrentSpin: (spin: Spin | null) => void;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  setLeaderboard: (entries: LeaderboardEntry[]) => void;

  // UI state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;

  // Reset
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  gameState: null,
  currentPlayer: null,
  currentSpin: null,
  leaderboard: [],
  isConnected: false,

  // Actions
  setGameState: (gameState) => set({ gameState }),
  setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),
  setCurrentSpin: (currentSpin) => set({ currentSpin }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setIsConnected: (isConnected) => set({ isConnected }),

  reset: () =>
    set({
      currentPlayer: null,
      currentSpin: null,
    }),
}));
