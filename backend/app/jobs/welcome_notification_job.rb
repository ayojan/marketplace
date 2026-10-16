# frozen_string_literal: true

class WelcomeNotificationJob < ApplicationJob
  queue_as :default
  discard_on ActiveRecord::RecordNotFound

  def perform(user_id)
    idempotency_key = JobIdempotencyCache.generate_key(self.class.name, user_id)
    return if JobIdempotencyCache.processed?(idempotency_key)

    user = User.find(user_id)
    Notifications::EmailService.send_welcome_email(user)

    JobIdempotencyCache.mark_processed(idempotency_key)
    Rails.logger.info "Welcome notification sent to user #{user_id} (#{user.email})"
  rescue Errno::ECONNREFUSED => e
    Rails.logger.warn "Welcome notification skipped (SMTP offline): #{e.message}"
  end
end
