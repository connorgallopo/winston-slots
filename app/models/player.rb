class Player < ApplicationRecord
  has_many :spins, dependent: :destroy

  validates :name, presence: true, length: { minimum: 1, maximum: 100 }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :phone, presence: true
end
