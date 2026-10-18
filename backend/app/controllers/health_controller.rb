# frozen_string_literal: true

class HealthController < ActionController::API
  def show
    render json: {
      status: 'ok',
      timestamp: Time.current.iso8601,
      version: Rails.application.class.module_parent_name,
      environment: Rails.env,
      database: database_status,
      cache: cache_status,
      solid_queue: solid_queue_status
    }
  end

  private

  def database_status
    ActiveRecord::Base.connection.execute('SELECT 1')
    'connected'
  rescue StandardError => e
    Rails.logger.error "Database health check failed: #{e.message}"
    'disconnected'
  end

  def cache_status
    Rails.cache.write('health_check', 'ok', expires_in: 1.minute)
    Rails.cache.read('health_check') == 'ok' ? 'connected' : 'error'
  rescue StandardError => e
    Rails.logger.error "Cache health check failed: #{e.message}"
    'disconnected'
  end

  def solid_queue_status
    SolidQueue::Process.count
    'connected'
  rescue StandardError => e
    Rails.logger.error "Solid Queue health check failed: #{e.message}"
    'disconnected'
  end
end
