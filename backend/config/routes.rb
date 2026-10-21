Rails.application.routes.draw do
  mount SolidQueueMonitor::Engine => '/solid_queue' if defined?(SolidQueueMonitor::Engine)
  # Redirect root to ActiveAdmin when accessed on admin subdomain (e.g. admin.ayoj.test or admin.ayoj.in)
  constraints subdomain: 'admin' do
    root to: redirect('/admin'), as: :admin_subdomain_root
  end

  root to: 'rails/health#show'

  if defined?(ActiveAdmin)
    devise_for :admin_users, ActiveAdmin::Devise.config
    ActiveAdmin.routes(self)
  end
  devise_for :users

  # Health check endpoints
  get 'up' => 'rails/health#show', as: :rails_health_check
  get 'health' => 'health#show'

  # Redirect sitemap requests to frontend application
  get '/sitemap.xml', to: redirect("#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/sitemap.xml")

  # Authentication routes (user_management pack)
  scope :auth do
    post :login, to: 'auth#login'
    post :register, to: 'auth#register'
    post :google, to: 'auth#google'
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
      put :me, to: 'profiles#update_me'
      patch :me, to: 'profiles#update_me'
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
      get :reviews, to: 'reviews#vendor_reviews'
      get :vendor_reviews
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
      get 'check/:vendor_id', action: :check
      delete 'by_vendor/:vendor_id', action: :destroy_by_vendor
    end
  end

  # Customer checklist items routes
  resources :checklist_items, only: %i[index create update destroy] do
    member do
      patch :toggle
    end
  end

  # Customer route
  resource :customer, only: %i[show update]

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

  # Mission Control Jobs dashboard (Solid Queue)
  mount MissionControl::Jobs::Engine, at: '/jobs' if Rails.env.development?
end
