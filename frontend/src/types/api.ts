// API Types matching Rails backend

export interface Player {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Spin {
  id: number;
  player_id: number;
  zillow_value: number;
  realtor_value: number;
  homes_value: number;
  google_value: number;
  smart_sign_value: number;
  banana_count: number;
  base_score: number;
  bonus_multiplier: number | null;
  total_score: number;
  bonus_triggered: boolean;
  created_at: string;
}

export interface GameState {
  state: 'idle' | 'ready' | 'spinning' | 'bonus_wheel' | 'results';
  current_player_id: number | null;
  current_player_name: string | null;
  current_spin_id: number | null;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  player_id: number;
  name: string;
  total_score: number;
  spin_count: number;
  best_spin_id: number;
}

export interface LeaderboardResponse {
  date: string;
  players: LeaderboardEntry[];
}

// Request types
export interface CreatePlayerRequest {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateGameStateRequest {
  state: GameState['state'];
  player_id?: number;
  player_name?: string;
  spin_id?: number;
}

export interface ApplyBonusRequest {
  multiplier: number;
}

// WebSocket event types
export interface WebSocketEvent {
  event: 'state_changed' | 'spin_started' | 'button_pressed';
  timestamp: number;
}

export interface StateChangedEvent extends WebSocketEvent {
  event: 'state_changed';
  state: GameState['state'];
  player_id: number | null;
  player_name: string | null;
  spin_id: number | null;
}

export interface ButtonPressedEvent extends WebSocketEvent {
  event: 'button_pressed';
}
