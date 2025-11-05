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
