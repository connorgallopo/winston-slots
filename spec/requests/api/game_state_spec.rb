require 'rails_helper'

RSpec.describe "Api::GameState", type: :request do
  describe "GET /api/game_state" do
    it "returns the current game state" do
      GameState.update_state('ready', player_id: 42, player_name: 'Test')

      get '/api/game_state'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['state']).to eq('ready')
      expect(json['current_player_id']).to eq(42)
      expect(json['current_player_name']).to eq('Test')
    end
  end

  describe "POST /api/game_state" do
    it "updates the game state" do
      post '/api/game_state', params: {
        state: 'spinning',
        player_id: 99,
        player_name: 'Alice'
      }, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['state']).to eq('spinning')
      expect(json['current_player_id']).to eq(99)
      expect(json['current_player_name']).to eq('Alice')
    end

    it "validates state value" do
      post '/api/game_state', params: {
        state: 'invalid_state'
      }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
