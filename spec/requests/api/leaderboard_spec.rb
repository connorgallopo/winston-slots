require 'rails_helper'

RSpec.describe "Api::Leaderboard", type: :request do
  describe "GET /api/leaderboard" do
    let!(:player1) { Player.create!(name: 'Alice', email: 'alice@example.com', phone: '111') }
    let!(:player2) { Player.create!(name: 'Bob', email: 'bob@example.com', phone: '222') }

    before do
      Spin.create!(player: player1, zillow_value: 2_000_000, realtor_value: 2_000_000,
                   homes_value: 2_000_000, google_value: 2_000_000, smart_sign_value: 2_000_000)

      Spin.create!(player: player2, zillow_value: 1_000_000, realtor_value: 1_000_000,
                   homes_value: 1_000_000, google_value: 1_000_000, smart_sign_value: 1_000_000)
    end

    it "returns the daily leaderboard" do
      get '/api/leaderboard'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['date']).to eq(Date.today.to_s)
      expect(json['players'].length).to eq(2)

      expect(json['players'][0]['name']).to eq('Alice')
      expect(json['players'][0]['rank']).to eq(1)
      expect(json['players'][0]['total_score']).to eq(10_000_000)

      expect(json['players'][1]['name']).to eq('Bob')
      expect(json['players'][1]['rank']).to eq(2)
    end

    it "returns empty array when no spins today" do
      Spin.destroy_all

      get '/api/leaderboard'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['players']).to eq([])
    end
  end
end
