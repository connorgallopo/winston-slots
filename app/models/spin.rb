class Spin < ApplicationRecord
  belongs_to :player

  before_validation :randomize_reel_values, on: :create
  before_validation :calculate_scores

  validates :player_id, presence: true
  validates :zillow_value, :realtor_value, :homes_value,
            :google_value, :smart_sign_value,
            numericality: { greater_than: 0 }

  BANANA_VALUE = 3_000_000

  def randomize_reel_values
    return if zillow_value.present? # Already set

    values = ReelValueGenerator.generate_all
    self.zillow_value = values[:zillow]
    self.realtor_value = values[:realtor]
    self.homes_value = values[:homes]
    self.google_value = values[:google]
    self.smart_sign_value = values[:smart_sign]
  end

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
