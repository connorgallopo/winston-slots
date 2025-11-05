class GameState < ApplicationRecord
  validates :state, presence: true,
            inclusion: { in: %w[idle ready spinning bonus_wheel results] }

  # Singleton pattern - always use ID 1
  def self.current
    find_or_create_by!(id: 1) do |state|
      state.state = 'idle'
    end
  end

  def self.update_state(new_state, player_id: nil, player_name: nil, spin_id: nil)
    current.update!(
      state: new_state,
      current_player_id: player_id,
      current_player_name: player_name,
      current_spin_id: spin_id
    )

    # Broadcast via ActionCable
    ActionCable.server.broadcast(
      'game_updates',
      {
        event: 'state_changed',
        state: new_state,
        player_id: player_id,
        player_name: player_name,
        spin_id: spin_id,
        timestamp: Time.current.to_i
      }
    )

    current
  end

  def self.reset!
    current.update!(
      state: 'idle',
      current_player_id: nil,
      current_player_name: nil,
      current_spin_id: nil
    )
  end
end
