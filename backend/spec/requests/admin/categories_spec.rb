# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin Categories' do
  let(:admin_user) { create(:admin_user) }
  let!(:category) { create(:category, name: 'Photography', slug: 'photography') }

  before do
    sign_in admin_user, scope: :admin_user
  end

  describe 'GET /admin/categories/:id' do
    it 'finds category by slug' do
      get "/admin/categories/#{category.slug}"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(category.name)
    end

    it 'finds category by numeric id' do
      get "/admin/categories/#{category.id}"
      expect(response).to have_http_status(:ok)
      expect(response.body).to include(category.name)
    end
  end
end
