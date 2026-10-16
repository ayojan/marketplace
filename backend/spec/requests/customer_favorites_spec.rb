# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Customer Favorites API' do
  let(:vendor_user_one) { create(:user, :vendor) }
  let(:vendor_one) { vendor_user_one.vendor }
  let(:vendor_user_two) { create(:user, :vendor) }
  let(:vendor_two) { vendor_user_two.vendor }
  let(:customer_user) { create(:user, :customer) }

  def auth_headers(user)
    token = Auth::JwtService.encode(user_id: user.id)
    { 'Authorization' => "Bearer #{token}" }
  end

  describe 'POST /customer_favorites' do
    context 'when logged in as a vendor' do
      it 'allows favoriting another vendor' do
        post '/customer_favorites',
             params: { vendor_id: vendor_two.id },
             headers: auth_headers(vendor_user_one)

        expect(response).to have_http_status(:created)
        expect(CustomerFavorite.where(user: vendor_user_one, vendor: vendor_two)).to exist
      end

      it 'prevents favoriting own vendor profile with a clear error message' do
        post '/customer_favorites',
             params: { vendor_id: vendor_one.id },
             headers: auth_headers(vendor_user_one)

        expect(response).to have_http_status(:unprocessable_content)
        json = response.parsed_body
        expect(json['error']).to eq('You cannot favorite your own business profile')
      end
    end

    context 'when logged in as a customer' do
      it 'allows favoriting a vendor' do
        post '/customer_favorites',
             params: { vendor_id: vendor_one.id },
             headers: auth_headers(customer_user)

        expect(response).to have_http_status(:created)
        expect(CustomerFavorite.where(user: customer_user, vendor: vendor_one)).to exist
      end
    end

    context 'when unauthenticated' do
      it 'returns unauthorized error' do
        post '/customer_favorites', params: { vendor_id: vendor_one.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /customer_favorites/by_vendor/:vendor_id' do
    before do
      create(:customer_favorite, user: vendor_user_one, vendor: vendor_two)
    end

    it 'allows vendor to remove a favorite' do
      delete "/customer_favorites/by_vendor/#{vendor_two.id}",
             headers: auth_headers(vendor_user_one)

      expect(response).to have_http_status(:ok)
      expect(CustomerFavorite.where(user: vendor_user_one, vendor: vendor_two)).not_to exist
    end
  end
end
