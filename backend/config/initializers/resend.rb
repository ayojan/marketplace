# frozen_string_literal: true

require 'resend'

# Configure Resend API Key from environment or credentials
Resend.api_key = ENV['RESEND_API_KEY'] || Rails.application.credentials.dig(:resend, :api_key)

if Rails.env.production? && Resend.api_key.blank?
  Rails.logger.warn '[Resend] RESEND_API_KEY is not set. Outbound emails will fail until configured.'
end
