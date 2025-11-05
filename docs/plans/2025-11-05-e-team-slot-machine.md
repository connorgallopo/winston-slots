# E-Team Slot Machine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive digital slot machine for real estate lead generation that gamifies daily performance across 5 lead sources with a bonus "Double-Sided Deal" wheel, deployed on Raspberry Pi 5 for convention booths.

**Architecture:** Rails 7.2 backend with SQLite database serves two React frontends (iPad controller, TV display). TV uses PixiJS for 60fps slot animations. Physical GPIO button triggers spins via ActionCable WebSockets. Daily leaderboard tracks top performers. Webhook integration with Make.com for CRM.

**Tech Stack:** Ruby on Rails 7.2, SQLite3, ActionCable, React 18, PixiJS 7, Vite, Raspberry Pi OS, GPIO (rpi_gpio gem)

---

## Phase 1: Rails Backend Foundation

### Task 1.1: Initialize Rails Application

**Files:**
- Create: `Gemfile`
- Create: `config/database.yml`
- Create: `.gitignore`

**Step 1: Create new Rails app with API and SQLite**

Run:
```bash
rails new . --api --database=sqlite3 --skip-test --skip-bundle
```

Expected: Rails app structure created

**Step 2: Add required gems to Gemfile**

Modify `Gemfile`:
```ruby
source "https://rubygems.org"

ruby "3.2.0"

gem "rails", "~> 7.2.0"
gem "sqlite3", "~> 1.4"
gem "puma", "~> 6.0"
gem "rpi_gpio" # GPIO hardware interface
gem "httparty" # For webhooks
gem "rack-cors" # CORS for frontend

group :development, :test do
  gem "debug"
  gem "rspec-rails", "~> 6.0"
  gem "factory_bot_rails"
  gem "faker"
end

group :development do
  gem "spring"
end
```

**Step 3: Install dependencies**

Run:
```bash
bundle install
```

Expected: All gems installed successfully

**Step 4: Initialize RSpec**

Run:
```bash
rails generate rspec:install
```

Expected: `spec/` directory created with rails_helper.rb and spec_helper.rb

**Step 5: Configure CORS**

Modify `config/initializers/cors.rb`:
```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*' # Local network access from iPad/TV

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['X-Request-Id']
  end
end
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Rails app with SQLite and RSpec"
```

---

### Task 1.2: Create Players Model and Table

**Files:**
- Create: `db/migrate/TIMESTAMP_create_players.rb`
- Create: `app/models/player.rb`
- Create: `spec/models/player_spec.rb`

**Step 1: Write failing test for Player model**

Create `spec/models/player_spec.rb`:
```ruby
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
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/models/player_spec.rb
```

Expected: FAIL with "uninitialized constant Player"

**Step 3: Create migration**

Run:
```bash
rails generate migration CreatePlayers name:string email:string phone:string
```

Modify the generated migration file:
```ruby
class CreatePlayers < ActiveRecord::Migration[7.2]
  def change
    create_table :players do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :phone, null: false

      t.timestamps
    end

    add_index :players, :created_at
    add_index :players, :email
  end
end
```

**Step 4: Run migration**

Run:
```bash
rails db:migrate
```

Expected: Migration runs successfully

**Step 5: Create Player model**

Create `app/models/player.rb`:
```ruby
class Player < ApplicationRecord
  has_many :spins, dependent: :destroy

  validates :name, presence: true, length: { minimum: 1, maximum: 100 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
end
```

**Step 6: Install shoulda-matchers for cleaner tests**

Add to `Gemfile`:
```ruby
group :test do
  gem 'shoulda-matchers', '~> 6.0'
end
```

Run:
```bash
bundle install
```

Add to `spec/rails_helper.rb` at the end:
```ruby
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
```

**Step 7: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/models/player_spec.rb
```

Expected: All tests PASS

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add Player model with validations"
```

---

### Task 1.3: Create Spins Model and Table

**Files:**
- Create: `db/migrate/TIMESTAMP_create_spins.rb`
- Create: `app/models/spin.rb`
- Create: `spec/models/spin_spec.rb`

**Step 1: Write failing test for Spin model**

Create `spec/models/spin_spec.rb`:
```ruby
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
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/models/spin_spec.rb
```

Expected: FAIL with "uninitialized constant Spin"

**Step 3: Create migration**

Run:
```bash
rails generate migration CreateSpins
```

Modify the generated migration:
```ruby
class CreateSpins < ActiveRecord::Migration[7.2]
  def change
    create_table :spins do |t|
      t.references :player, null: false, foreign_key: true

      t.integer :zillow_value, null: false
      t.integer :realtor_value, null: false
      t.integer :homes_value, null: false
      t.integer :google_value, null: false
      t.integer :smart_sign_value, null: false

      t.integer :banana_count, default: 0, null: false
      t.decimal :bonus_multiplier, precision: 3, scale: 1

      t.integer :base_score, null: false
      t.integer :total_score, null: false

      t.timestamps
    end

    add_index :spins, :created_at
    add_index :spins, :total_score
    add_index :spins, [:player_id, :created_at]
  end
end
```

**Step 4: Run migration**

Run:
```bash
rails db:migrate
```

Expected: Migration runs successfully

**Step 5: Create Spin model**

Create `app/models/spin.rb`:
```ruby
class Spin < ApplicationRecord
  belongs_to :player

  before_validation :calculate_scores

  validates :player_id, presence: true
  validates :zillow_value, :realtor_value, :homes_value,
            :google_value, :smart_sign_value,
            numericality: { greater_than: 0 }

  BANANA_VALUE = 3_000_000

  def calculate_scores
    # Calculate banana count
    self.banana_count = [
      zillow_value,
      realtor_value,
      homes_value,
      google_value,
      smart_sign_value
    ].compact.count(BANANA_VALUE)

    # Calculate base score (sum of all reels)
    self.base_score = [
      zillow_value,
      realtor_value,
      homes_value,
      google_value,
      smart_sign_value
    ].compact.sum

    # Apply multiplier if set
    multiplier = bonus_multiplier || 1.0
    self.total_score = (base_score * multiplier).to_i
  end

  def apply_bonus_multiplier!(multiplier)
    update!(
      bonus_multiplier: multiplier,
      total_score: (base_score * multiplier).to_i
    )
  end

  def bonus_triggered?
    banana_count >= 3
  end
end
```

**Step 6: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/models/spin_spec.rb
```

Expected: All tests PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add Spin model with scoring logic"
```

---

### Task 1.4: Create GameState Model (Singleton)

**Files:**
- Create: `db/migrate/TIMESTAMP_create_game_states.rb`
- Create: `app/models/game_state.rb`
- Create: `spec/models/game_state_spec.rb`

**Step 1: Write failing test**

Create `spec/models/game_state_spec.rb`:
```ruby
require 'rails_helper'

RSpec.describe GameState, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:state) }
    it { should validate_inclusion_of(:state).in_array(%w[idle ready spinning bonus_wheel results]) }
  end

  describe '.current' do
    it 'returns the singleton game state' do
      state1 = GameState.current
      state2 = GameState.current
      expect(state1.id).to eq(state2.id)
      expect(state1.id).to eq(1)
    end

    it 'initializes with idle state' do
      GameState.destroy_all
      state = GameState.current
      expect(state.state).to eq('idle')
    end
  end

  describe '.update_state' do
    it 'updates the game state' do
      GameState.update_state('ready', player_id: 42, player_name: 'Test')

      state = GameState.current
      expect(state.state).to eq('ready')
      expect(state.current_player_id).to eq(42)
      expect(state.current_player_name).to eq('Test')
    end
  end

  describe '.reset!' do
    it 'resets to idle state' do
      GameState.update_state('spinning', player_id: 42, player_name: 'Test', spin_id: 1)
      GameState.reset!

      state = GameState.current
      expect(state.state).to eq('idle')
      expect(state.current_player_id).to be_nil
      expect(state.current_player_name).to be_nil
      expect(state.current_spin_id).to be_nil
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/models/game_state_spec.rb
```

Expected: FAIL

**Step 3: Create migration**

Run:
```bash
rails generate migration CreateGameStates
```

Modify migration:
```ruby
class CreateGameStates < ActiveRecord::Migration[7.2]
  def change
    create_table :game_states do |t|
      t.string :state, default: 'idle', null: false
      t.integer :current_player_id
      t.string :current_player_name
      t.integer :current_spin_id

      t.timestamp :updated_at, null: false
    end
  end
end
```

**Step 4: Run migration and seed singleton**

Run:
```bash
rails db:migrate
```

Create `db/seeds.rb`:
```ruby
# Create singleton game state
GameState.find_or_create_by!(id: 1) do |state|
  state.state = 'idle'
end

puts "Game state initialized"
```

Run:
```bash
rails db:seed
```

**Step 5: Create GameState model**

Create `app/models/game_state.rb`:
```ruby
class GameState < ApplicationRecord
  validates :state, presence: true,
            inclusion: { in: %w[idle ready spinning bonus_wheel results] }

  # Singleton pattern - always use ID 1
  def self.current
    find_or_create_by!(id: 1) do |state|
      state.state = 'idle'
    end
  end

  def self.update_state(new_state, player_id: nil, player_name: nil, spin_id: nil)
    current.update!(
      state: new_state,
      current_player_id: player_id,
      current_player_name: player_name,
      current_spin_id: spin_id
    )

    current
  end

  def self.reset!
    current.update!(
      state: 'idle',
      current_player_id: nil,
      current_player_name: nil,
      current_spin_id: nil
    )
  end
end
```

**Step 6: Run tests**

Run:
```bash
bundle exec rspec spec/models/game_state_spec.rb
```

Expected: All tests PASS

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add GameState singleton model"
```

---

### Task 1.5: Add Daily Leaderboard Query to Player Model

**Files:**
- Modify: `app/models/player.rb`
- Create: `spec/models/player_leaderboard_spec.rb`

**Step 1: Write failing test**

Create `spec/models/player_leaderboard_spec.rb`:
```ruby
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
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/models/player_leaderboard_spec.rb
```

Expected: FAIL with "undefined method `daily_leaderboard`"

**Step 3: Implement daily_leaderboard method**

Modify `app/models/player.rb`:
```ruby
class Player < ApplicationRecord
  has_many :spins, dependent: :destroy

  validates :name, presence: true, length: { minimum: 1, maximum: 100 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true

  # Daily leaderboard calculation
  def self.daily_leaderboard(date = Date.today)
    joins(:spins)
      .where(spins: { created_at: date.beginning_of_day..date.end_of_day })
      .group('players.id')
      .select(
        'players.id',
        'players.name',
        'SUM(spins.total_score) as total_score',
        'COUNT(spins.id) as spin_count',
        'MAX(spins.total_score) as best_score',
        'MAX(spins.id) as best_spin_id'
      )
      .order('total_score DESC')
      .limit(10)
      .map.with_index do |player, index|
        {
          rank: index + 1,
          player_id: player.id,
          name: player.name,
          total_score: player.total_score.to_i,
          spin_count: player.spin_count,
          best_spin_id: player.best_spin_id
        }
      end
  end
end
```

**Step 4: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/models/player_leaderboard_spec.rb
```

Expected: All tests PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add daily leaderboard query to Player model"
```

---

## Phase 2: API Controllers and Endpoints

### Task 2.1: Players API Controller

**Files:**
- Create: `app/controllers/api/players_controller.rb`
- Create: `spec/requests/api/players_spec.rb`
- Modify: `config/routes.rb`

**Step 1: Write failing request spec**

Create `spec/requests/api/players_spec.rb`:
```ruby
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
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/requests/api/players_spec.rb
```

Expected: FAIL with routing error

**Step 3: Add routes**

Modify `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  namespace :api do
    resources :players, only: [:create]
  end
end
```

**Step 4: Create controller**

Create `app/controllers/api/players_controller.rb`:
```ruby
module Api
  class PlayersController < ApplicationController
    def create
      player = Player.new(player_params)

      if player.save
        render json: player, status: :created
      else
        render json: { errors: player.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def player_params
      params.permit(:name, :email, :phone)
    end
  end
end
```

**Step 5: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/requests/api/players_spec.rb
```

Expected: All tests PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Players API endpoint"
```

---

### Task 2.2: Game State API Controller

**Files:**
- Create: `app/controllers/api/game_state_controller.rb`
- Create: `spec/requests/api/game_state_spec.rb`
- Modify: `config/routes.rb`

**Step 1: Write failing request spec**

Create `spec/requests/api/game_state_spec.rb`:
```ruby
require 'rails_helper'

RSpec.describe "Api::GameState", type: :request do
  describe "GET /api/game_state" do
    it "returns the current game state" do
      GameState.update_state('ready', player_id: 42, player_name: 'Test')

      get '/api/game_state'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['state']).to eq('ready')
      expect(json['current_player_id']).to eq(42)
      expect(json['current_player_name']).to eq('Test')
    end
  end

  describe "POST /api/game_state" do
    it "updates the game state" do
      post '/api/game_state', params: {
        state: 'spinning',
        player_id: 99,
        player_name: 'Alice'
      }, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['state']).to eq('spinning')
      expect(json['current_player_id']).to eq(99)
      expect(json['current_player_name']).to eq('Alice')
    end

    it "validates state value" do
      post '/api/game_state', params: {
        state: 'invalid_state'
      }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/requests/api/game_state_spec.rb
```

Expected: FAIL

**Step 3: Add routes**

Modify `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  namespace :api do
    resources :players, only: [:create]
    resource :game_state, only: [:show, :create]
  end
end
```

**Step 4: Create controller**

Create `app/controllers/api/game_state_controller.rb`:
```ruby
module Api
  class GameStateController < ApplicationController
    def show
      state = GameState.current
      render json: {
        state: state.state,
        current_player_id: state.current_player_id,
        current_player_name: state.current_player_name,
        current_spin_id: state.current_spin_id,
        updated_at: state.updated_at
      }
    end

    def create
      state = GameState.update_state(
        params[:state],
        player_id: params[:player_id],
        player_name: params[:player_name],
        spin_id: params[:spin_id]
      )

      render json: {
        state: state.state,
        current_player_id: state.current_player_id,
        current_player_name: state.current_player_name,
        current_spin_id: state.current_spin_id
      }
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

**Step 5: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/requests/api/game_state_spec.rb
```

Expected: All tests PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add GameState API endpoints"
```

---

### Task 2.3: Spins API Controller with Value Generation

**Files:**
- Create: `app/controllers/api/spins_controller.rb`
- Create: `app/services/reel_value_generator.rb`
- Create: `spec/requests/api/spins_spec.rb`
- Create: `spec/services/reel_value_generator_spec.rb`
- Modify: `config/routes.rb`

**Step 1: Write failing test for value generator service**

Create `spec/services/reel_value_generator_spec.rb`:
```ruby
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
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/services/reel_value_generator_spec.rb
```

Expected: FAIL

**Step 3: Create ReelValueGenerator service**

Create `app/services/reel_value_generator.rb`:
```ruby
class ReelValueGenerator
  REEL_VALUES = [
    # Low tier
    200_000, 250_000, 300_000,
    # Medium tier
    375_000, 450_000, 550_000,
    # High tier
    750_000, 1_000_000,
    # Premium tier
    1_500_000, 3_000_000,
    # Special (banana - also $3M)
    3_000_000
  ].freeze

  def self.generate
    REEL_VALUES.sample
  end

  def self.generate_all
    {
      zillow: generate,
      realtor: generate,
      homes: generate,
      google: generate,
      smart_sign: generate
    }
  end
end
```

**Step 4: Run service tests**

Run:
```bash
bundle exec rspec spec/services/reel_value_generator_spec.rb
```

Expected: All tests PASS

**Step 5: Write failing request spec for spins**

Create `spec/requests/api/spins_spec.rb`:
```ruby
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
```

**Step 6: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/requests/api/spins_spec.rb
```

Expected: FAIL

**Step 7: Add routes**

Modify `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  namespace :api do
    resources :players, only: [:create]
    resource :game_state, only: [:show, :create]
    resources :spins, only: [:create, :show] do
      member do
        patch :apply_bonus
      end
    end
  end
end
```

**Step 8: Modify Spin model to use generator**

Modify `app/models/spin.rb`, update the `randomize_reel_values` callback:
```ruby
def randomize_reel_values
  return if zillow_value.present? # Already set

  values = ReelValueGenerator.generate_all
  self.zillow_value = values[:zillow]
  self.realtor_value = values[:realtor]
  self.homes_value = values[:homes]
  self.google_value = values[:google]
  self.smart_sign_value = values[:smart_sign]
end
```

Add callback in model:
```ruby
before_validation :randomize_reel_values, on: :create
```

**Step 9: Create controller**

Create `app/controllers/api/spins_controller.rb`:
```ruby
module Api
  class SpinsController < ApplicationController
    def create
      player = Player.find(params[:player_id])
      spin = player.spins.create!

      render json: spin_json(spin), status: :created
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Player not found' }, status: :not_found
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
    end

    def show
      spin = Spin.find(params[:id])
      render json: spin_json(spin)
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Spin not found' }, status: :not_found
    end

    def apply_bonus
      spin = Spin.find(params[:id])
      spin.apply_bonus_multiplier!(params[:multiplier].to_f)

      render json: spin_json(spin)
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Spin not found' }, status: :not_found
    end

    private

    def spin_json(spin)
      {
        id: spin.id,
        player_id: spin.player_id,
        zillow_value: spin.zillow_value,
        realtor_value: spin.realtor_value,
        homes_value: spin.homes_value,
        google_value: spin.google_value,
        smart_sign_value: spin.smart_sign_value,
        banana_count: spin.banana_count,
        base_score: spin.base_score,
        bonus_multiplier: spin.bonus_multiplier,
        total_score: spin.total_score,
        bonus_triggered: spin.bonus_triggered?,
        created_at: spin.created_at
      }
    end
  end
end
```

**Step 10: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/requests/api/spins_spec.rb
```

Expected: All tests PASS

**Step 11: Commit**

```bash
git add .
git commit -m "feat: add Spins API with random value generation"
```

---

### Task 2.4: Leaderboard API Endpoint

**Files:**
- Create: `app/controllers/api/leaderboard_controller.rb`
- Create: `spec/requests/api/leaderboard_spec.rb`
- Modify: `config/routes.rb`

**Step 1: Write failing request spec**

Create `spec/requests/api/leaderboard_spec.rb`:
```ruby
require 'rails_helper'

RSpec.describe "Api::Leaderboard", type: :request do
  describe "GET /api/leaderboard" do
    let!(:player1) { Player.create!(name: 'Alice', email: 'alice@example.com', phone: '111') }
    let!(:player2) { Player.create!(name: 'Bob', email: 'bob@example.com', phone: '222') }

    before do
      Spin.create!(player: player1, zillow_value: 2_000_000, realtor_value: 2_000_000,
                   homes_value: 2_000_000, google_value: 2_000_000, smart_sign_value: 2_000_000)

      Spin.create!(player: player2, zillow_value: 1_000_000, realtor_value: 1_000_000,
                   homes_value: 1_000_000, google_value: 1_000_000, smart_sign_value: 1_000_000)
    end

    it "returns the daily leaderboard" do
      get '/api/leaderboard'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['date']).to eq(Date.today.to_s)
      expect(json['players'].length).to eq(2)

      expect(json['players'][0]['name']).to eq('Alice')
      expect(json['players'][0]['rank']).to eq(1)
      expect(json['players'][0]['total_score']).to eq(10_000_000)

      expect(json['players'][1]['name']).to eq('Bob')
      expect(json['players'][1]['rank']).to eq(2)
    end

    it "returns empty array when no spins today" do
      Spin.destroy_all

      get '/api/leaderboard'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)

      expect(json['players']).to eq([])
    end
  end
end
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/requests/api/leaderboard_spec.rb
```

Expected: FAIL

**Step 3: Add route**

Modify `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  namespace :api do
    resources :players, only: [:create]
    resource :game_state, only: [:show, :create]
    resources :spins, only: [:create, :show] do
      member do
        patch :apply_bonus
      end
    end
    get :leaderboard, to: 'leaderboard#index'
  end
end
```

**Step 4: Create controller**

Create `app/controllers/api/leaderboard_controller.rb`:
```ruby
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
```

**Step 5: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/requests/api/leaderboard_spec.rb
```

Expected: All tests PASS

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add Leaderboard API endpoint"
```

---

## Phase 3: ActionCable for Real-Time Updates

### Task 3.1: Setup ActionCable for Game Updates

**Files:**
- Create: `app/channels/game_channel.rb`
- Create: `spec/channels/game_channel_spec.rb`
- Modify: `app/models/game_state.rb`

**Step 1: Write failing channel spec**

Create `spec/channels/game_channel_spec.rb`:
```ruby
require 'rails_helper'

RSpec.describe GameChannel, type: :channel do
  it "subscribes to game_updates stream" do
    subscribe
    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_from("game_updates")
  end
end
```

**Step 2: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/channels/game_channel_spec.rb
```

Expected: FAIL

**Step 3: Create GameChannel**

Create `app/channels/game_channel.rb`:
```ruby
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
```

**Step 4: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/channels/game_channel_spec.rb
```

Expected: All tests PASS

**Step 5: Update GameState to broadcast changes**

Modify `app/models/game_state.rb`:
```ruby
class GameState < ApplicationRecord
  validates :state, presence: true,
            inclusion: { in: %w[idle ready spinning bonus_wheel results] }

  # Singleton pattern - always use ID 1
  def self.current
    find_or_create_by!(id: 1) do |state|
      state.state = 'idle'
    end
  end

  def self.update_state(new_state, player_id: nil, player_name: nil, spin_id: nil)
    current.update!(
      state: new_state,
      current_player_id: player_id,
      current_player_name: player_name,
      current_spin_id: spin_id
    )

    # Broadcast via ActionCable
    ActionCable.server.broadcast(
      'game_updates',
      {
        event: 'state_changed',
        state: new_state,
        player_id: player_id,
        player_name: player_name,
        spin_id: spin_id,
        timestamp: Time.current.to_i
      }
    )

    current
  end

  def self.reset!
    current.update!(
      state: 'idle',
      current_player_id: nil,
      current_player_name: nil,
      current_spin_id: nil
    )
  end
end
```

**Step 6: Configure ActionCable for development**

Modify `config/environments/development.rb`, add:
```ruby
config.action_cable.allowed_request_origins = [
  'http://localhost:3000',
  /http:\/\/192\.168\.\d+\.\d+:3000/
]
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add ActionCable GameChannel for real-time updates"
```

---

## Phase 4: Webhook Integration

### Task 4.1: Make.com Webhook Service

**Files:**
- Create: `app/services/webhook_service.rb`
- Create: `spec/services/webhook_service_spec.rb`
- Modify: `app/models/spin.rb`

**Step 1: Write failing test for webhook service**

Create `spec/services/webhook_service_spec.rb`:
```ruby
require 'rails_helper'

RSpec.describe WebhookService do
  let(:player) { Player.create!(name: 'Test', email: 'test@example.com', phone: '555-1234') }
  let(:spin) do
    Spin.create!(
      player: player,
      zillow_value: 1_000_000,
      realtor_value: 2_000_000,
      homes_value: 3_000_000,
      google_value: 3_000_000,
      smart_sign_value: 3_000_000
    )
  end

  describe '.send_spin_completed' do
    it 'sends POST request to webhook URL' do
      stub_request(:post, ENV['WEBHOOK_URL'] || 'https://hook.us1.make.com/test')
        .to_return(status: 200, body: '{"success": true}')

      result = WebhookService.send_spin_completed(spin)

      expect(result).to be true
    end

    it 'handles timeout gracefully' do
      stub_request(:post, ENV['WEBHOOK_URL'] || 'https://hook.us1.make.com/test')
        .to_timeout

      result = WebhookService.send_spin_completed(spin)

      expect(result).to be false
    end

    it 'includes correct payload structure' do
      request_stub = stub_request(:post, ENV['WEBHOOK_URL'] || 'https://hook.us1.make.com/test')
        .to_return(status: 200)

      WebhookService.send_spin_completed(spin)

      expect(request_stub).to have_been_requested
    end
  end
end
```

**Step 2: Add webmock gem for testing**

Add to `Gemfile` in test group:
```ruby
group :test do
  gem 'shoulda-matchers', '~> 6.0'
  gem 'webmock'
end
```

Run:
```bash
bundle install
```

Add to `spec/rails_helper.rb`:
```ruby
require 'webmock/rspec'
```

**Step 3: Run test to verify it fails**

Run:
```bash
bundle exec rspec spec/services/webhook_service_spec.rb
```

Expected: FAIL

**Step 4: Create webhook service**

Create `app/services/webhook_service.rb`:
```ruby
class WebhookService
  WEBHOOK_URL = 'https://hook.us1.make.com/sw8he8fn2vy4wzzwrvku3v9taey1ju7r'.freeze

  def self.send_spin_completed(spin)
    payload = build_payload(spin)

    HTTParty.post(
      ENV['WEBHOOK_URL'] || WEBHOOK_URL,
      body: payload.to_json,
      headers: { 'Content-Type' => 'application/json' },
      timeout: 2
    )

    Rails.logger.info "Webhook sent successfully for spin #{spin.id}"
    true
  rescue StandardError => e
    Rails.logger.warn "Webhook failed for spin #{spin.id}: #{e.message}"
    false
  end

  private

  def self.build_payload(spin)
    player = spin.player
    leaderboard = Player.daily_leaderboard
    rank_data = leaderboard.find { |p| p[:player_id] == player.id }

    {
      event: 'spin_completed',
      timestamp: spin.created_at.iso8601,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone
      },
      spin: {
        id: spin.id,
        reels: {
          zillow: spin.zillow_value,
          realtor: spin.realtor_value,
          homes: spin.homes_value,
          google: spin.google_value,
          smart_sign: spin.smart_sign_value
        },
        banana_count: spin.banana_count,
        base_score: spin.base_score,
        bonus_activated: spin.bonus_triggered?,
        bonus_multiplier: spin.bonus_multiplier,
        final_score: spin.total_score
      },
      leaderboard: {
        rank: rank_data&.dig(:rank),
        total_players_today: leaderboard.length
      }
    }
  end
end
```

**Step 5: Run tests to verify they pass**

Run:
```bash
bundle exec rspec spec/services/webhook_service_spec.rb
```

Expected: All tests PASS

**Step 6: Add after_create callback to Spin**

Modify `app/models/spin.rb`, add callback:
```ruby
after_create :send_webhook

private

def send_webhook
  WebhookService.send_spin_completed(self)
end
```

**Step 7: Commit**

```bash
git add .
git commit -m "feat: add webhook integration for spin completion"
```

---

## Phase 5: Frontend Setup - iPad Controller

### Task 5.1: Initialize React App for iPad Controller

**Files:**
- Create: `frontend/ipad-controller/package.json`
- Create: `frontend/ipad-controller/vite.config.js`
- Create: `frontend/ipad-controller/index.html`
- Create: `frontend/ipad-controller/src/main.jsx`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p frontend/ipad-controller/src
cd frontend/ipad-controller
```

**Step 2: Initialize npm project**

Run:
```bash
npm init -y
```

**Step 3: Install dependencies**

Run:
```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react
```

**Step 4: Create vite.config.js**

Create `frontend/ipad-controller/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../../public/ipad',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    }
  }
});
```

**Step 5: Create index.html**

Create `frontend/ipad-controller/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-Team Slot Machine - Controller</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 6: Create main.jsx**

Create `frontend/ipad-controller/src/main.jsx`:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 7: Create basic App component**

Create `frontend/ipad-controller/src/App.jsx`:
```javascript
import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>E-Team Slot Machine</h1>
      <p>Controller Interface</p>
    </div>
  );
}

export default App;
```

**Step 8: Create basic CSS**

Create `frontend/ipad-controller/src/index.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  width: 1920px;
  height: 1080px;
  padding: 40px;
}
```

**Step 9: Add build script to package.json**

Modify `frontend/ipad-controller/package.json`:
```json
{
  "name": "ipad-controller",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

**Step 10: Test build**

Run:
```bash
npm run build
```

Expected: Build completes, files in `../../public/ipad/`

**Step 11: Return to project root and commit**

Run:
```bash
cd ../..
git add .
git commit -m "feat: initialize iPad controller React app"
```

---

### Task 5.2: Build iPad Form Component

**Files:**
- Create: `frontend/ipad-controller/src/components/PlayerForm.jsx`
- Create: `frontend/ipad-controller/src/components/PlayerForm.css`
- Modify: `frontend/ipad-controller/src/App.jsx`

**Step 1: Create PlayerForm component**

Create `frontend/ipad-controller/src/components/PlayerForm.jsx`:
```javascript
import React, { useState } from 'react';
import './PlayerForm.css';

function PlayerForm({ onSubmit, disabled }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="player-form" onSubmit={handleSubmit}>
      <h2>Enter Your Information</h2>

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Your full name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={disabled}
          placeholder="your.email@example.com"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={disabled}
          placeholder="(423) 555-1234"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <button type="submit" disabled={disabled} className="submit-btn">
        Submit & Get Ready to Spin!
      </button>
    </form>
  );
}

export default PlayerForm;
```

**Step 2: Create PlayerForm styles**

Create `frontend/ipad-controller/src/components/PlayerForm.css`:
```css
.player-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.player-form h2 {
  font-size: 48px;
  margin-bottom: 40px;
  color: #1e293b;
  text-align: center;
}

.form-group {
  margin-bottom: 32px;
}

.form-group label {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.form-group input {
  width: 100%;
  padding: 20px;
  font-size: 28px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.form-group .error {
  display: block;
  color: #dc2626;
  font-size: 20px;
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  padding: 24px;
  font-size: 32px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
```

**Step 3: Update App.jsx to use PlayerForm**

Modify `frontend/ipad-controller/src/App.jsx`:
```javascript
import React, { useState } from 'react';
import PlayerForm from './components/PlayerForm';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('idle');
  const [playerId, setPlayerId] = useState(null);

  const handleFormSubmit = async (formData) => {
    try {
      // Create player
      const playerResponse = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!playerResponse.ok) throw new Error('Failed to create player');

      const player = await playerResponse.json();
      setPlayerId(player.id);

      // Update game state to ready
      await fetch('/api/game_state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: 'ready',
          player_id: player.id,
          player_name: player.name
        })
      });

      setGameState('ready');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="app">
      <div className="logo">
        <h1>The Edrington Team</h1>
        <p>Slot Machine</p>
      </div>

      {gameState === 'idle' && (
        <PlayerForm onSubmit={handleFormSubmit} disabled={false} />
      )}

      {gameState === 'ready' && (
        <div className="waiting-message">
          <h2>Ready to Spin!</h2>
          <p>Press the button on the display to spin the reels</p>
        </div>
      )}
    </div>
  );
}

export default App;
```

**Step 4: Create App.css**

Create `frontend/ipad-controller/src/App.css`:
```css
.app {
  width: 1920px;
  height: 1080px;
  padding: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo {
  text-align: center;
  margin-bottom: 60px;
}

.logo h1 {
  font-size: 72px;
  color: white;
  margin-bottom: 12px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logo p {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.9);
}

.waiting-message {
  text-align: center;
  color: white;
}

.waiting-message h2 {
  font-size: 64px;
  margin-bottom: 24px;
}

.waiting-message p {
  font-size: 32px;
  opacity: 0.9;
}
```

**Step 5: Build and test**

Run:
```bash
cd frontend/ipad-controller
npm run build
cd ../..
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: build iPad form component with validation"
```

---

## Phase 6: Frontend Setup - TV Display

### Task 6.1: Initialize React + PixiJS App for TV Display

**Files:**
- Create: `frontend/tv-display/package.json`
- Create: `frontend/tv-display/vite.config.js`
- Create: `frontend/tv-display/index.html`
- Create: `frontend/tv-display/src/main.jsx`

**Step 1: Create directory and initialize**

Run:
```bash
mkdir -p frontend/tv-display/src
cd frontend/tv-display
npm init -y
```

**Step 2: Install dependencies**

Run:
```bash
npm install react react-dom pixi.js @pixi/react
npm install -D vite @vitejs/plugin-react
```

**Step 3: Create vite.config.js**

Create `frontend/tv-display/vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../../public/tv',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ['pixi.js'],
          react: ['react', 'react-dom']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/cable': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
});
```

**Step 4: Create index.html**

Create `frontend/tv-display/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>E-Team Slot Machine - Display</title>
    <style>
      body {
        margin: 0;
        overflow: hidden;
        background: #000;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Step 5: Create main.jsx**

Create `frontend/tv-display/src/main.jsx`:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 6: Create App skeleton**

Create `frontend/tv-display/src/App.jsx`:
```javascript
import React, { useState, useEffect } from 'react';

function App() {
  const [gameState, setGameState] = useState('idle');

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }}>
      <h1 style={{ color: 'white', textAlign: 'center', paddingTop: '40px' }}>
        E-Team Slot Machine
      </h1>
      <p style={{ color: 'white', textAlign: 'center' }}>
        State: {gameState}
      </p>
    </div>
  );
}

export default App;
```

**Step 7: Add build script**

Modify `frontend/tv-display/package.json`:
```json
{
  "name": "tv-display",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@pixi/react": "^7.1.0",
    "pixi.js": "^7.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

**Step 8: Build and test**

Run:
```bash
npm run build
cd ../..
```

**Step 9: Commit**

```bash
git add .
git commit -m "feat: initialize TV display React + PixiJS app"
```

---

## Phase 7: GPIO Integration

### Task 7.1: Create GPIO Monitoring Script

**Files:**
- Create: `scripts/gpio_monitor.rb`
- Create: `.env.example`

**Step 1: Create GPIO monitor script**

Create `scripts/gpio_monitor.rb`:
```ruby
#!/usr/bin/env ruby

require 'bundler/setup'
require 'rpi_gpio'
require 'action_cable_client'
require 'logger'

BUTTON_PIN = 12  # Physical pin 12 (GPIO 18)
CABLE_URL = ENV.fetch('CABLE_URL', 'ws://localhost:3000/cable')

logger = Logger.new(STDOUT)
logger.info "Starting GPIO monitor on pin #{BUTTON_PIN}"

# Setup GPIO
RPi::GPIO.set_numbering :board
RPi::GPIO.setup BUTTON_PIN, as: :input, pull: :up

logger.info "GPIO configured"

# Setup ActionCable connection
client = ActionCableClient.new(CABLE_URL)
channel = client.subscribe('GameChannel')

logger.info "Connected to ActionCable at #{CABLE_URL}"

# Monitor button with debouncing
last_press = Time.now - 10
DEBOUNCE_SECONDS = 0.5

logger.info "Monitoring button presses (debounce: #{DEBOUNCE_SECONDS}s)"

loop do
  button_state = RPi::GPIO.read(BUTTON_PIN)

  if button_state == RPi::GPIO::LOW  # Button pressed (active low with pull-up)
    time_since_last = Time.now - last_press

    if time_since_last > DEBOUNCE_SECONDS
      logger.info "Button pressed! Broadcasting spin event..."

      begin
        channel.perform('button_pressed')
        logger.info "Spin event broadcasted successfully"
      rescue => e
        logger.error "Failed to broadcast: #{e.message}"
      end

      last_press = Time.now
    end
  end

  sleep 0.01  # 10ms polling
end
```

**Step 2: Make script executable**

Run:
```bash
chmod +x scripts/gpio_monitor.rb
```

**Step 3: Add action_cable_client gem**

Add to `Gemfile`:
```ruby
gem "action_cable_client"
```

Run:
```bash
bundle install
```

**Step 4: Create .env.example**

Create `.env.example`:
```bash
# ActionCable URL for GPIO monitor
CABLE_URL=ws://localhost:3000/cable

# Webhook URL for Make.com
WEBHOOK_URL=https://hook.us1.make.com/sw8he8fn2vy4wzzwrvku3v9taey1ju7r
```

**Step 5: Add dotenv gem**

Add to `Gemfile`:
```ruby
gem 'dotenv-rails', groups: [:development, :test]
```

Run:
```bash
bundle install
```

**Step 6: Create .env file (git ignored)**

Create `.env`:
```bash
CABLE_URL=ws://localhost:3000/cable
WEBHOOK_URL=https://hook.us1.make.com/sw8he8fn2vy4wzzwrvku3v9taey1ju7r
```

**Step 7: Update .gitignore**

Add to `.gitignore`:
```
.env
```

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add GPIO monitoring script for physical button"
```

---

## Phase 8: Deployment Configuration

### Task 8.1: Create Systemd Service Files

**Files:**
- Create: `config/systemd/slot-machine-rails.service`
- Create: `config/systemd/slot-machine-gpio.service`
- Create: `config/systemd/slot-machine-kiosk.service`

**Step 1: Create Rails service file**

Create `config/systemd/slot-machine-rails.service`:
```ini
[Unit]
Description=E-Team Slot Machine Rails Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/slot-machine
Environment="RAILS_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/local/bin/bundle exec puma -C config/puma.rb
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Step 2: Create GPIO service file**

Create `config/systemd/slot-machine-gpio.service`:
```ini
[Unit]
Description=E-Team Slot Machine GPIO Monitor
After=slot-machine-rails.service
Requires=slot-machine-rails.service

[Service]
Type=simple
User=root
WorkingDirectory=/home/pi/slot-machine
Environment="RAILS_ENV=production"
ExecStart=/usr/local/bin/ruby scripts/gpio_monitor.rb
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Step 3: Create kiosk service file**

Create `config/systemd/slot-machine-kiosk.service`:
```ini
[Unit]
Description=E-Team Slot Machine Kiosk Display
After=graphical.target slot-machine-rails.service
Wants=graphical.target

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
Environment=XAUTHORITY=/home/pi/.Xauthority
ExecStartPre=/bin/sleep 10
ExecStart=/usr/bin/chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI \
  --disable-component-update \
  --ignore-gpu-blocklist \
  --enable-gpu-rasterization \
  --enable-zero-copy \
  --enable-features=VaapiVideoDecoder \
  --check-for-update-interval=31536000 \
  http://localhost:3000/tv
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

**Step 4: Create README for deployment**

Create `docs/DEPLOYMENT.md`:
```markdown
# Deployment Guide

## Prerequisites
- Raspberry Pi 5 with Raspberry Pi OS (64-bit)
- Physical button wired to GPIO Pin 12
- Large display connected via HDMI
- Internet connection

## Installation

1. Clone repository to /home/pi/slot-machine
2. Run setup script: `bash scripts/setup.sh`
3. Reboot: `sudo reboot`

## Service Management

Start services:
```bash
sudo systemctl start slot-machine-rails
sudo systemctl start slot-machine-gpio
sudo systemctl start slot-machine-kiosk
```

Check status:
```bash
sudo systemctl status slot-machine-rails
sudo systemctl status slot-machine-gpio
sudo systemctl status slot-machine-kiosk
```

View logs:
```bash
journalctl -u slot-machine-rails -f
journalctl -u slot-machine-gpio -f
```

## Convention Day Checklist

- [ ] Power on Pi
- [ ] Verify TV shows leaderboard (2 min boot time)
- [ ] Test button press
- [ ] Connect iPad to WiFi
- [ ] Perform test spin
- [ ] Clear test data: `rails console` → `Spin.destroy_all`
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add systemd service files for deployment"
```

---

## Phase 9: Production Configuration

### Task 9.1: Configure Rails for Production

**Files:**
- Modify: `config/environments/production.rb`
- Modify: `config/puma.rb`
- Modify: `config/database.yml`

**Step 1: Update production environment**

Modify `config/environments/production.rb`:
```ruby
require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.public_file_server.enabled = true

  config.assets.compile = false
  config.assets.digest = true

  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "warn")
  config.log_tags = [ :request_id ]

  config.action_cable.allowed_request_origins = [
    'http://localhost:3000',
    /http:\/\/192\.168\.\d+\.\d+:3000/
  ]

  config.hosts.clear

  config.active_record.dump_schema_after_migration = false
end
```

**Step 2: Configure Puma**

Modify `config/puma.rb`:
```ruby
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

workers ENV.fetch("WEB_CONCURRENCY") { 2 }

port ENV.fetch("PORT") { 3000 }
environment ENV.fetch("RAILS_ENV") { "production" }

preload_app!

plugin :tmp_restart

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end
```

**Step 3: Confirm database config**

Verify `config/database.yml` production section:
```yaml
production:
  adapter: sqlite3
  database: db/production.sqlite3
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  timeout: 5000
```

**Step 4: Create production setup script**

Create `scripts/production_setup.sh`:
```bash
#!/bin/bash

set -e

echo "Setting up production environment..."

# Install dependencies
bundle install --without development test
cd frontend/ipad-controller && npm ci && npm run build && cd ../..
cd frontend/tv-display && npm ci && npm run build && cd ../..

# Setup database
RAILS_ENV=production rails db:create db:migrate db:seed

# Precompile assets
RAILS_ENV=production rails assets:precompile

echo "Production setup complete!"
```

**Step 5: Make executable**

Run:
```bash
chmod +x scripts/production_setup.sh
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: configure Rails for production deployment"
```

---

## Implementation Complete - Summary

This implementation plan provides a complete, test-driven approach to building the E-Team Slot Machine system. The plan includes:

### ✅ Backend (Rails)
- Player, Spin, GameState models with full test coverage
- RESTful API endpoints for all operations
- ActionCable for real-time GPIO button events
- Webhook integration with Make.com
- Daily leaderboard queries
- SQLite database with proper indexes

### ✅ Frontend (React + PixiJS)
- iPad controller with form validation
- TV display framework (PixiJS ready for animations)
- API integration
- Responsive layouts

### ✅ Hardware Integration
- GPIO monitoring script for physical button
- ActionCable broadcasting
- Debouncing logic

### ✅ Deployment
- Systemd service files
- Production configuration
- Setup scripts
- Documentation

### 📝 Next Steps (Not in Plan)

The following components need to be implemented separately:
1. **PixiJS Slot Reel Animations** - Complex animation logic
2. **PixiJS Bonus Wheel** - Wheel physics and easing
3. **TV Display State Machine** - React components for each state
4. **iPad Polling Logic** - Auto-refresh and state sync
5. **Sound Effects** - Audio synthesis and playback

These can be tackled after the core system is deployed and tested.

---

**Plan saved to:** `docs/plans/2025-11-05-e-team-slot-machine.md`
