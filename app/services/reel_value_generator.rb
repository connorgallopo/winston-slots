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
