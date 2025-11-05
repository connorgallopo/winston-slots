require 'rails_helper'

RSpec.describe GameState, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:state) }
    it { should validate_inclusion_of(:state).in_array(%w[idle ready spinning bonus_wheel results]) }
  end

  describe '.current' do
    it 'returns the singleton game state' do
      state1 = GameState.current
      state2 = GameState.current
      expect(state1.id).to eq(state2.id)
      expect(state1.id).to eq(1)
    end

    it 'initializes with idle state' do
      GameState.destroy_all
      state = GameState.current
      expect(state.state).to eq('idle')
    end
  end

  describe '.update_state' do
    it 'updates the game state' do
      GameState.update_state('ready', player_id: 42, player_name: 'Test')

      state = GameState.current
      expect(state.state).to eq('ready')
      expect(state.current_player_id).to eq(42)
      expect(state.current_player_name).to eq('Test')
    end
  end

  describe '.reset!' do
    it 'resets to idle state' do
      GameState.update_state('spinning', player_id: 42, player_name: 'Test', spin_id: 1)
      GameState.reset!

      state = GameState.current
      expect(state.state).to eq('idle')
      expect(state.current_player_id).to be_nil
      expect(state.current_player_name).to be_nil
      expect(state.current_spin_id).to be_nil
    end
  end
end
