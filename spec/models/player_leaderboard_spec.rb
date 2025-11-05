require 'rails_helper'

RSpec.describe Player, '.daily_leaderboard', type: :model do
  let!(:player1) { Player.create!(name: 'Alice', email: 'alice@example.com', phone: '111') }
  let!(:player2) { Player.create!(name: 'Bob', email: 'bob@example.com', phone: '222') }
  let!(:player3) { Player.create!(name: 'Charlie', email: 'charlie@example.com', phone: '333') }

  before do
    # Today's spins
    Spin.create!(player: player1, zillow_value: 1_000_000, realtor_value: 1_000_000,
                 homes_value: 1_000_000, google_value: 1_000_000, smart_sign_value: 1_000_000)

    Spin.create!(player: player2, zillow_value: 2_000_000, realtor_value: 2_000_000,
                 homes_value: 2_000_000, google_value: 2_000_000, smart_sign_value: 2_000_000)

    Spin.create!(player: player3, zillow_value: 500_000, realtor_value: 500_000,
                 homes_value: 500_000, google_value: 500_000, smart_sign_value: 500_000)

    # Yesterday's spin (should be excluded)
    old_spin = Spin.create!(player: player1, zillow_value: 10_000_000, realtor_value: 10_000_000,
                            homes_value: 10_000_000, google_value: 10_000_000, smart_sign_value: 10_000_000)
    old_spin.update_column(:created_at, 1.day.ago)
  end

  it 'returns top 10 players by total score for today' do
    leaderboard = Player.daily_leaderboard

    expect(leaderboard.length).to eq(3)
    expect(leaderboard[0][:name]).to eq('Bob')
    expect(leaderboard[0][:total_score]).to eq(10_000_000)
    expect(leaderboard[0][:rank]).to eq(1)

    expect(leaderboard[1][:name]).to eq('Alice')
    expect(leaderboard[1][:total_score]).to eq(5_000_000)
    expect(leaderboard[1][:rank]).to eq(2)

    expect(leaderboard[2][:name]).to eq('Charlie')
    expect(leaderboard[2][:total_score]).to eq(2_500_000)
    expect(leaderboard[2][:rank]).to eq(3)
  end

  it 'sums multiple spins for same player' do
    Spin.create!(player: player1, zillow_value: 1_000_000, realtor_value: 1_000_000,
                 homes_value: 1_000_000, google_value: 1_000_000, smart_sign_value: 1_000_000)

    leaderboard = Player.daily_leaderboard
    alice = leaderboard.find { |p| p[:name] == 'Alice' }

    expect(alice[:total_score]).to eq(10_000_000) # Two spins of 5M each
    expect(alice[:spin_count]).to eq(2)
  end

  it 'limits to 10 players' do
    11.times do |i|
      player = Player.create!(name: "Player#{i}", email: "p#{i}@example.com", phone: "#{i}")
      Spin.create!(player: player, zillow_value: 200_000, realtor_value: 200_000,
                   homes_value: 200_000, google_value: 200_000, smart_sign_value: 200_000)
    end

    leaderboard = Player.daily_leaderboard
    expect(leaderboard.length).to eq(10)
  end
end
