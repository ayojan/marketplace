Rails.application.routes.draw do
  root to: 'rails/health#show'

  post '/graphql', to: 'graphql#execute'
  if Rails.env.development?
    begin
      mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql'
    rescue NameError
      # GraphiQL not available, skip mounting
    end
  end
  if defined?(ActiveAdmin)
    devise_for :admin_users, ActiveAdmin::Devise.config
    ActiveAdmin.routes(self)
  end
  devise_for :users

  # Health check endpoints
  get 'up' => 'rails/health#show', as: :rails_health_check
  get 'health' => 'health#show'

  # Authentication routes (user_management pack)
  scope :auth do
    post :login, to: 'auth#login'
    post :register, to: 'auth#register'
    delete :logout, to: 'auth#logout'
  end

  # User routes (user_management pack)
  resources :users, only: %i[show update] do
    member do
      post :upload_avatar
    end
  end

  # Vendor profile routes (user_management pack)
  resources :profiles, only: %i[show create update destroy] do
    collection do
      get :me
      get :service_categories
      post :request_verification
    end
  end

  # Analytics routes
  get 'analytics/dashboard', to: 'analytics#dashboard'

  # Service routes (service_catalog pack)
  resources :services do
    collection do
      get :search
    end

    member do
      get :reviews, to: 'reviews#service_reviews'
    end

    # Service images nested routes
    resources :images, controller: 'service_images', except: %i[new edit] do
      member do
        post :set_primary
      end
      collection do
        post :reorder
        post :bulk_upload
      end
    end
  end

  # Vendor routes (service_catalog pack)
  resources :vendors, only: %i[index show] do
    member do
      get :services
      get :availability
      get :portfolio
      get :reviews, action: :vendor_reviews
    end

    # Portfolio items nested under vendors for public viewing
    resources :portfolio_items, only: %i[index show], controller: 'portfolio_items'
  end

  # Review routes (reviews pack)
  resources :reviews, only: %i[index show create update destroy] do
    member do
      post :vote
      post :respond
    end
  end

  # Customer favorites routes
  resources :customer_favorites, only: %i[index create destroy] do
    collection do
      get 'check/:vendor_profile_id', action: :check
      delete 'by_vendor/:vendor_profile_id', action: :destroy_by_vendor
    end
  end

  # Customer checklist items routes
  resources :checklist_items, only: %i[index create update destroy] do
    member do
      patch :toggle
    end
  end

  # Customer profile route
  resource :customer_profile, only: %i[show update]

  # In-app notifications routes
  resources :in_app_notifications, only: %i[index] do
    member do
      patch :read, action: :mark_as_read
    end
    collection do
      post :read_all, action: :mark_all_read
    end
  end

  # Portfolio items routes (service_catalog pack)
  resources :portfolio_items do
    member do
      post :upload_images
      delete 'remove_image/:image_id', action: :remove_image, as: :remove_image
      post :duplicate
    end
    collection do
      get :summary
      post :reorder
      patch :set_featured
    end
  end

  # Booking routes (booking_management pack)
  resources :bookings do
    member do
      post :respond
      get :messages
      post :send_message
    end
    collection do
      post :check_availability
      post :suggest_alternatives
    end
  end

  # Availability slots routes (booking_management pack)
  resources :availability_slots do
    collection do
      post :bulk_create
      get :check_conflicts
    end
  end

  # Sidekiq web interface (for development)
  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq' if Rails.env.development?
end
