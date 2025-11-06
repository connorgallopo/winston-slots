source "https://rubygems.org"

ruby "3.4.1"

gem "rails", "~> 8.1.1"
gem "sqlite3", "~> 1.4"
gem "puma", "~> 6.0"
gem "httparty" # For webhooks
gem "rack-cors" # CORS for frontend
gem "bootsnap", require: false

# Only on Raspberry Pi
gem "rpi_gpio", require: false # GPIO hardware interface

group :development, :test do
  gem "debug"
  gem "rspec-rails", "~> 6.0"
  gem "factory_bot_rails"
  gem "faker"
end

group :test do
  gem 'shoulda-matchers', '~> 6.0'
end

group :development do
  gem "spring"
end
