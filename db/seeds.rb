# Create singleton game state
GameState.find_or_create_by!(id: 1) do |state|
  state.state = 'idle'
end

puts "Game state initialized"
