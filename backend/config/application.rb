require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_mailbox/engine'
require 'action_text/engine'
require 'action_view/railtie'
require 'action_cable/engine'
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Marketplace
  class Application < Rails::Application
    config.active_record.query_log_tags_enabled = true
    config.active_record.query_log_tags = [
      # Rails query log tags:
      :application, :controller, :action, :job,
      # GraphQL-Ruby query log tags:
      { current_graphql_operation: ->(*) { GraphQL::Current.operation_name },
        current_graphql_field: ->(*) { GraphQL::Current.field&.path },
        current_dataloader_source: ->(*) { GraphQL::Current.dataloader_source_class } }
    ]
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"

    # Opt in to Rails 8.1 to_time behavior
    config.active_support.to_time_preserves_timezone = :zone

    # Auto-load query objects and domain services
    config.eager_load_paths << Rails.root.join('app/models/queries')
    config.eager_load_paths << Rails.root.join('app/domain')

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    # Note: Setting to false to support ActiveAdmin
    config.api_only = false

    # Configure Redis for caching
    config.cache_store = :redis_cache_store, {
      url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/0'),
      namespace: 'marketplace_cache'
    }
    # Configure Active Job to use Solid Queue (PostgreSQL-backed, no Redis required)
    config.active_job.queue_adapter = :solid_queue
  end
end
