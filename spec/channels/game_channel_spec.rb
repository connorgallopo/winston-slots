require 'rails_helper'

RSpec.describe GameChannel, type: :channel do
  it "subscribes to game_updates stream" do
    subscribe
    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_from("game_updates")
  end
end
