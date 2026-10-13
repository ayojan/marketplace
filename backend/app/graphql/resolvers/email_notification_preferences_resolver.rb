# frozen_string_literal: true

module Resolvers
  class EmailNotificationPreferencesResolver < GraphQL::Schema::Resolver
    description 'Resolver for the current user email notification preferences'

    type Types::EmailNotificationPreferenceType, null: true

    def resolve
      user = context[:current_user]
      return nil unless user

      user.email_notification_preference
    end
  end
end
