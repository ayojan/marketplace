# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    allowed = [
      'https://ayoj.in',
      'https://www.ayoj.in',
      'https://admin.ayoj.in',
      'http://ayoj.test',
      'http://ayoj.test:3000',
      'http://admin.ayoj.test',
      'http://admin.ayoj.test:3001',
      'http://api.ayoj.test',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ]
    allowed += ENV['ALLOWED_ORIGINS'].split(',').map(&:strip) if ENV['ALLOWED_ORIGINS'].present?

    origins(*allowed, %r{\Ahttps?://([a-z0-9-]+\.)?ayoj\.(in|test)(:\d+)?\z})

    resource '*',
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: %w[Authorization Content-Type],
             credentials: true
  end
end
