# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_11_05_175514) do
  create_table "players", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "phone", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_players_on_created_at"
    t.index ["email"], name: "index_players_on_email"
  end

  create_table "spins", force: :cascade do |t|
    t.integer "player_id", null: false
    t.integer "zillow_value", null: false
    t.integer "realtor_value", null: false
    t.integer "homes_value", null: false
    t.integer "google_value", null: false
    t.integer "smart_sign_value", null: false
    t.integer "banana_count", default: 0, null: false
    t.decimal "bonus_multiplier", precision: 3, scale: 1
    t.integer "base_score", null: false
    t.integer "total_score", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_spins_on_created_at"
    t.index ["player_id", "created_at"], name: "index_spins_on_player_id_and_created_at"
    t.index ["player_id"], name: "index_spins_on_player_id"
    t.index ["total_score"], name: "index_spins_on_total_score"
  end

  add_foreign_key "spins", "players"
end
