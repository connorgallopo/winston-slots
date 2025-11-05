require 'rails_helper'

RSpec.describe Player, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
    it { should validate_presence_of(:phone) }

    it 'validates email format' do
      player = Player.new(name: 'Test', email: 'invalid', phone: '555-1234')
      expect(player).not_to be_valid
      expect(player.errors[:email]).to include('is invalid')
    end
  end

  describe 'associations' do
    it { should have_many(:spins).dependent(:destroy) }
  end
end
