require 'rails_helper'

RSpec.describe "Api::Players", type: :request do
  describe "POST /api/players" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "423-555-1234"
        }
      end

      it "creates a new player" do
        expect {
          post '/api/players', params: valid_params, as: :json
        }.to change(Player, :count).by(1)
      end

      it "returns the created player" do
        post '/api/players', params: valid_params, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)

        expect(json['id']).to be_present
        expect(json['name']).to eq('Jane Smith')
        expect(json['email']).to eq('jane@example.com')
        expect(json['phone']).to eq('423-555-1234')
      end
    end

    context "with invalid parameters" do
      let(:invalid_params) do
        {
          name: "",
          email: "invalid-email",
          phone: ""
        }
      end

      it "returns validation errors" do
        post '/api/players', params: invalid_params, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)

        expect(json['errors']).to be_present
      end
    end
  end
end
