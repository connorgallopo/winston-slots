require 'rails_helper'

RSpec.describe Spin, type: :model do
  describe 'associations' do
    it { should belong_to(:player) }
  end

  describe 'validations' do
    it { should validate_presence_of(:player_id) }
    it { should validate_numericality_of(:zillow_value).is_greater_than(0) }
    it { should validate_numericality_of(:realtor_value).is_greater_than(0) }
    it { should validate_numericality_of(:homes_value).is_greater_than(0) }
    it { should validate_numericality_of(:google_value).is_greater_than(0) }
    it { should validate_numericality_of(:smart_sign_value).is_greater_than(0) }
  end

  describe 'callbacks' do
    let(:player) { Player.create!(name: 'Test', email: 'test@example.com', phone: '555-1234') }

    it 'calculates base_score from sum of reel values' do
      spin = Spin.create!(
        player: player,
        zillow_value: 200_000,
        realtor_value: 300_000,
        homes_value: 400_000,
        google_value: 500_000,
        smart_sign_value: 600_000
      )

      expect(spin.base_score).to eq(2_000_000)
    end

    it 'calculates banana_count correctly' do
      spin = Spin.create!(
        player: player,
        zillow_value: 3_000_000,
        realtor_value: 3_000_000,
        homes_value: 1_000_000,
        google_value: 3_000_000,
        smart_sign_value: 500_000
      )

      expect(spin.banana_count).to eq(3)
    end

    it 'sets total_score equal to base_score when no multiplier' do
      spin = Spin.create!(
        player: player,
        zillow_value: 200_000,
        realtor_value: 300_000,
        homes_value: 400_000,
        google_value: 500_000,
        smart_sign_value: 600_000
      )

      expect(spin.total_score).to eq(2_000_000)
    end
  end

  describe '#bonus_triggered?' do
    let(:player) { Player.create!(name: 'Test', email: 'test@example.com', phone: '555-1234') }

    it 'returns true when 3 or more bananas' do
      spin = Spin.create!(
        player: player,
        zillow_value: 3_000_000,
        realtor_value: 3_000_000,
        homes_value: 3_000_000,
        google_value: 500_000,
        smart_sign_value: 600_000
      )

      expect(spin.bonus_triggered?).to be true
    end

    it 'returns false when less than 3 bananas' do
      spin = Spin.create!(
        player: player,
        zillow_value: 3_000_000,
        realtor_value: 1_000_000,
        homes_value: 500_000,
        google_value: 500_000,
        smart_sign_value: 600_000
      )

      expect(spin.bonus_triggered?).to be false
    end
  end

  describe '#apply_bonus_multiplier!' do
    let(:player) { Player.create!(name: 'Test', email: 'test@example.com', phone: '555-1234') }
    let(:spin) do
      Spin.create!(
        player: player,
        zillow_value: 1_000_000,
        realtor_value: 1_000_000,
        homes_value: 1_000_000,
        google_value: 1_000_000,
        smart_sign_value: 1_000_000
      )
    end

    it 'applies 2x multiplier correctly' do
      spin.apply_bonus_multiplier!(2.0)
      expect(spin.bonus_multiplier).to eq(2.0)
      expect(spin.total_score).to eq(10_000_000)
    end

    it 'applies 0x multiplier correctly' do
      spin.apply_bonus_multiplier!(0.0)
      expect(spin.bonus_multiplier).to eq(0.0)
      expect(spin.total_score).to eq(0)
    end
  end
end
