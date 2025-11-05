require 'rails_helper'

RSpec.describe ReelValueGenerator do
  describe '.generate' do
    it 'returns a valid reel value' do
      value = ReelValueGenerator.generate

      valid_values = [
        200_000, 250_000, 300_000,  # Low
        375_000, 450_000, 550_000,  # Medium
        750_000, 1_000_000,         # High
        1_500_000, 3_000_000        # Premium/Banana
      ]

      expect(valid_values).to include(value)
    end

    it 'generates different values over multiple calls' do
      values = 100.times.map { ReelValueGenerator.generate }
      unique_values = values.uniq

      expect(unique_values.length).to be > 1
    end
  end

  describe '.generate_all' do
    it 'returns 5 reel values' do
      values = ReelValueGenerator.generate_all

      expect(values).to be_a(Hash)
      expect(values.keys).to match_array([:zillow, :realtor, :homes, :google, :smart_sign])
      expect(values.values).to all(be_a(Integer))
    end
  end
end
