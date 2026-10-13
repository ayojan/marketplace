# frozen_string_literal: true

module Types
  class EmailNotificationPreferenceType < Types::BaseObject
    description 'Email notification preferences for a user'

    field :booking_accepted, Boolean, null: false, description: 'Receive email when booking is accepted'
    field :booking_cancelled, Boolean, null: false, description: 'Receive email when booking is cancelled'
    field :booking_created, Boolean, null: false, description: 'Receive email when booking is created'
    field :booking_rejected, Boolean, null: false, description: 'Receive email when booking is rejected'
    field :booking_reminder, Boolean, null: false, description: 'Receive email reminder before booking'
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false,
                                                        description: 'Timestamp when preferences were created'
    field :id, ID, null: false, description: 'Unique identifier for the preferences record'
    field :new_message, Boolean, null: false, description: 'Receive email for new messages'
    field :review_received, Boolean, null: false, description: 'Receive email when review is received'
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false,
                                                        description: 'Timestamp when preferences were last updated'
    field :user_id, ID, null: false, description: 'ID of the associated user'
  end
end
