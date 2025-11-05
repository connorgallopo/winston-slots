class GameChannel < ApplicationCable::Channel
  def subscribed
    stream_from "game_updates"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def button_pressed
    # Triggered by GPIO daemon when button pressed
    ActionCable.server.broadcast(
      "game_updates",
      {
        event: "spin_started",
        timestamp: Time.current.to_i
      }
    )
  end
end
