module Api
  class GameStatesController < ApplicationController
    def show
      state = GameState.current
      render json: {
        state: state.state,
        current_player_id: state.current_player_id,
        current_player_name: state.current_player_name,
        current_spin_id: state.current_spin_id,
        updated_at: state.updated_at
      }
    end

    def create
      state = GameState.update_state(
        params[:state],
        player_id: params[:player_id],
        player_name: params[:player_name],
        spin_id: params[:spin_id]
      )

      render json: {
        state: state.state,
        current_player_id: state.current_player_id,
        current_player_name: state.current_player_name,
        current_spin_id: state.current_spin_id
      }
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
