# frozen_string_literal: true

module Authenticable
  extend ActiveSupport::Concern

  included do
    attr_reader :current_user

    before_action :authenticate_request
  end

  private

  def authenticate_request
    @current_user = Auth::AuthorizeApiRequest.call(request.headers)[:user]
  end
end
