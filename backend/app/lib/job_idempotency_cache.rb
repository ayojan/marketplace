# frozen_string_literal: true

# Idempotency cache for Sidekiq jobs to prevent duplicate execution on retries
# Usage:
#   key = JobIdempotencyCache.generate_key('notification_job', booking_id, recipient_id)
#   return if JobIdempotencyCache.processed?(key)
#   # do work
#   JobIdempotencyCache.mark_processed(key)
class JobIdempotencyCache
  CACHE_EXPIRY = 7.days.freeze
  PREFIX = 'job_idempotency:'

  class << self
    # Generate a unique idempotency key for a job
    def generate_key(job_class, *identifiers)
      "#{PREFIX}#{job_class}:#{identifiers.join(':')}"
    end

    # Check if a job has already been processed
    def processed?(key)
      Rails.cache.exist?(key)
    end

    # Mark a job as processed
    def mark_processed(key)
      Rails.cache.write(key, true, expires_in: CACHE_EXPIRY)
    end

    # Clear the idempotency record (useful for testing)
    def clear(key)
      Rails.cache.delete(key)
    end
  end
end
