# frozen_string_literal: true

# == Schema Information
#
# Table name: auth_identities
#
#  id         :bigint           not null, primary key
#  email      :string
#  metadata   :jsonb
#  provider   :string           not null
#  uid        :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :bigint           not null
#
# Indexes
#
#  index_auth_identities_on_provider_and_uid  (provider,uid) UNIQUE
#  index_auth_identities_on_user_id           (user_id)
#  index_auth_identities_on_user_id_provider  (user_id,provider) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class AuthIdentity < ApplicationRecord
  belongs_to :user

  validates :provider, presence: true
  validates :uid, presence: true, uniqueness: { scope: :provider }

  scope :google, -> { where(provider: 'google') }

  def self.find_google_identity(uid)
    find_by(provider: 'google', uid: uid.to_s)
  end

  def google?
    provider == 'google'
  end
end
