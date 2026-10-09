# frozen_string_literal: true

class CustomerFavoritesController < ApiController
  before_action :authenticate_user!
  before_action :set_favorite, only: %i[destroy]

  # GET /customer_favorites
  def index
    favorites = CustomerFavorite.for_user(current_user.id)
                                .recent_first
                                .includes(:vendor_profile)

    render json: {
      favorites: favorites.map { |fav| favorite_json(fav) }
    }
  end

  # POST /customer_favorites
  def create
    vendor_profile_id = params[:vendor_profile_id]

    unless VendorProfile.exists?(vendor_profile_id)
      return render json: { error: 'Vendor profile not found' }, status: :not_found
    end

    favorite = CustomerFavorite.find_or_initialize_by(
      user_id: current_user.id,
      vendor_profile_id: vendor_profile_id
    )

    if favorite.save
      render json: {
        message: 'Vendor added to favorites',
        favorite: favorite_json(favorite)
      }, status: :created
    else
      render json: { error: 'Failed to add favorite', details: favorite.errors.full_messages },
             status: :unprocessable_content
    end
  end

  # DELETE /customer_favorites/:id
  def destroy
    @favorite.destroy
    render json: { message: 'Vendor removed from favorites' }
  end

  # DELETE /customer_favorites/by_vendor/:vendor_profile_id
  def destroy_by_vendor
    favorite = CustomerFavorite.find_by(user_id: current_user.id, vendor_profile_id: params[:vendor_profile_id])

    if favorite
      favorite.destroy
      render json: { message: 'Vendor removed from favorites' }
    else
      render json: { error: 'Favorite not found' }, status: :not_found
    end
  end

  # GET /customer_favorites/check/:vendor_profile_id
  def check
    favorite = CustomerFavorite.find_by(user_id: current_user.id, vendor_profile_id: params[:vendor_profile_id])

    render json: {
      is_favorite: favorite.present?,
      favorite_id: favorite&.id
    }
  end

  private

  def set_favorite
    @favorite = CustomerFavorite.find_by(id: params[:id], user_id: current_user.id)
    render json: { error: 'Favorite not found' }, status: :not_found unless @favorite
  end

  def favorite_json(favorite)
    vendor = favorite.vendor_profile
    {
      id: favorite.id,
      vendor_profile_id: vendor.id,
      created_at: favorite.created_at,
      vendor: {
        id: vendor.id,
        business_name: vendor.business_name,
        location: vendor.location,
        average_rating: vendor.average_rating,
        total_reviews: vendor.total_reviews,
        favorites_count: vendor.favorites_count,
        description: vendor.description,
        service_categories: vendor.respond_to?(:service_categories_list) ? vendor.service_categories_list : [],
        is_verified: vendor.verification_status == 'verified'
      }
    }
  end
end
