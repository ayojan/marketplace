# frozen_string_literal: true

class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3

  # Most jobs are safe to ignore if the underlying records are no longer available
  discard_on ActiveJob::DeserializationError

  # Retry on Redis connection errors
  retry_on Redis::CannotConnectError, wait: 10.seconds, attempts: 5

  def self.sidekiq_options
    { 'queue' => queue_name.to_s }
  end

  def sidekiq_options
    self.class.sidekiq_options
  end
end
