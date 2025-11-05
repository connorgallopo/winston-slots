class CreateGameStates < ActiveRecord::Migration[7.2]
  def change
    create_table :game_states do |t|
      t.string :state, default: 'idle', null: false
      t.integer :current_player_id
      t.string :current_player_name
      t.integer :current_spin_id

      t.timestamp :updated_at, null: false
    end
  end
end
