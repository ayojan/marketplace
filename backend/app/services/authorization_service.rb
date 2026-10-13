# frozen_string_literal: true

class AuthorizationService
  def self.authorize!(user, record, action)
    new(user, record, action).authorize!
  end

  def initialize(user, record, action)
    @user = user
    @record = record
    @action = action
  end

  def authorize! # rubocop:disable Naming/PredicateMethod
    raise NotAuthenticatedError, 'User not authenticated' if @user.blank?

    policy = policy_class.new(@user, @record)

    unless policy.public_send("#{@action}?")
      raise NotAuthorizedError, "User is not authorized to #{@action} this #{@record.class.name}"
    end

    true
  end

  private

  def policy_class
    "#{@record.class.name}Policy".constantize
  end

  class NotAuthenticatedError < StandardError; end
  class NotAuthorizedError < StandardError; end
end
