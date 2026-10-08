# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include ExceptionHandler

  # Skip forgery protection for API requests
  skip_forgery_protection

  # called before every action on controllers
  before_action :authenticate_request
  attr_reader :current_user

  private

  def authenticate_request
    @current_user = AuthorizeApiRequest.new(request.headers).call[:user]
  end
end
