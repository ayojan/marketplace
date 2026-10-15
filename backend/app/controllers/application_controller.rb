# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include ExceptionHandler

  # Skip forgery protection for API requests
  skip_forgery_protection

  # called before every action on controllers
  before_action :authenticate_request, unless: :active_admin_or_devise?
  attr_reader :current_user

  private

  def active_admin_or_devise?
    devise_controller? || self.class.name&.start_with?('ActiveAdmin::', 'Admin::')
  end

  def authenticate_request
    @current_user = AuthorizeApiRequest.new(request.headers).call[:user]
  end
end
