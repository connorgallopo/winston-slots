require 'rails_helper'

RSpec.describe "Api::Spins", type: :request do
  let(:player) { Player.create!(name: 'Test', email: 'test@example.com', phone: '555-1234') }

  describe "POST /api/spins" do
    it "creates a new spin with random values" do
      expect {
        post '/api/spins', params: { player_id: player.id }, as: :json
      }.to change(Spin, :count).by(1)
    end

    it "returns the created spin with values" do
      post '/api/spins', params: { player_id: player.id }, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)

      expect(json['id']).to be_present
      expect(json['player_id']).to eq(player.id)
      expect(json['zillow_value']).to be > 0
      expect(json['realtor_value']).to be > 0
      expect(json['homes_value']).to be > 0
      expect(json['google_value']).to be > 0
      expect(json['smart_sign_value']).to be > 0
      expect(json['banana_count']).to be >= 0
      expect(json['base_score']).to be > 0
      expect(json['total_score']).to eq(json['base_score'])
      expect(json['bonus_triggered']).to be_in([true, false])
    end
  end

  describe "GET /api/spins/:id" do
    let!(:spin) do
      Spin.create!(
        player: player,
        zillow_value: 1_000_000,
        realtor_value: 2_000_000,
        homes_value: 3_000_000,
        google_value: 3_000_000,
        smart_sign_value: 3_000_000
      )
    end

    it "returns the spin details" do
      get "/api/spins/#{spin.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['id']).to eq(spin.id)
      expect(json['banana_count']).to eq(3)
      expect(json['bonus_triggered']).to be true
    end
  end

  describe "PATCH /api/spins/:id/apply_bonus" do
    let!(:spin) do
      Spin.create!(
        player: player,
        zillow_value: 1_000_000,
        realtor_value: 1_000_000,
        homes_value: 1_000_000,
        google_value: 1_000_000,
        smart_sign_value: 1_000_000
      )
    end

    it "applies the bonus multiplier" do
      patch "/api/spins/#{spin.id}/apply_bonus", params: { multiplier: 2.0 }, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['bonus_multiplier']).to eq(2.0)
      expect(json['total_score']).to eq(10_000_000)
    end
  end
end
