module Api
  class LeaderboardController < ApplicationController
    def index
      players = Player.daily_leaderboard

      render json: {
        date: Date.today.to_s,
        players: players
      }
    end
  end
end
