# frozen_string_literal: true

module Mutations
  class UpdateEmailNotificationPreferences < Mutations::BaseMutation
    description 'Update user email notification preferences'

    argument :booking_accepted, Boolean, required: false, description: 'Email on booking accepted'
    argument :booking_cancelled, Boolean, required: false, description: 'Email on booking cancelled'
    argument :booking_created, Boolean, required: false, description: 'Email on booking created'
    argument :booking_rejected, Boolean, required: false, description: 'Email on booking rejected'
    argument :booking_reminder, Boolean, required: false, description: 'Email reminder before booking'
    argument :new_message, Boolean, required: false, description: 'Email for new messages'
    argument :review_received, Boolean, required: false, description: 'Email on review received'

    field :errors, [String], null: false, description: 'List of error messages if the operation failed'
    field :preference, Types::EmailNotificationPreferenceType, null: true,
                                                               description: 'The updated email notification preference'

    def resolve(**args)
      preference = context[:current_user]&.email_notification_preference
      return error_response('Preferences not found') unless preference

      updates = args.compact
      return error_response('No updates provided') if updates.empty?

      if preference.update(updates)
        { preference: preference, errors: [] }
      else
        error_response(preference.errors.full_messages)
      end
    end

    private

    def error_response(messages)
      { preference: nil, errors: Array(messages) }
    end
  end
end
