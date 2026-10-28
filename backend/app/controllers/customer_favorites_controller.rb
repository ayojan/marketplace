# frozen_string_literal: true

class CustomerFavoritesController < ApiController
  before_action :authenticate_user!
  before_action :set_favorite, only: %i[destroy]

  # GET /customer_favorites
  def index
    favorites = CustomerFavorite.for_user(current_user.id)
                                .recent_first
                                .includes(:vendor)

    render json: {
      favorites: favorites.map { |fav| favorite_json(fav) }
    }
  end

  # POST /customer_favorites
  def create
    target_id = params[:vendor_id] || params[:id]
    vendor = Vendor.find_by_id_or_slug(target_id)
    return render json: { error: 'Vendor not found' }, status: :not_found unless vendor

    if vendor.user_id == current_user.id
      return render json: { error: 'You cannot favorite your own business profile' }, status: :unprocessable_content
    end

    authorize_favorite!(vendor)
    save_and_render_favorite(vendor)
  rescue Auth::AuthorizationService::NotAuthorizedError => e
    render json: { error: e.message }, status: :forbidden
  end

  # DELETE /customer_favorites/:id
  def destroy
    @favorite.destroy
    render json: { message: 'Vendor removed from favorites' }
  end

  # DELETE /customer_favorites/by_vendor/:vendor_id
  def destroy_by_vendor
    target_id = params[:vendor_id] || params[:id]
    vendor = Vendor.find_by_id_or_slug(target_id)
    return render json: { error: 'Vendor not found' }, status: :not_found unless vendor

    favorite = CustomerFavorite.find_by(user_id: current_user.id, vendor_id: vendor.id)

    if favorite
      favorite.destroy
      render json: { message: 'Vendor removed from favorites' }
    else
      render json: { error: 'Favorite not found' }, status: :not_found
    end
  end

  # GET /customer_favorites/check/:vendor_id
  def check
    target = params[:vendor_id] || params[:id]
    vendor_id = if target.to_s.match?(/\A\d+\z/)
                  target.to_i
                else
                  Vendor.find_by(slug: target.to_s.downcase)&.id
                end

    favorite = CustomerFavorite.find_by(user_id: current_user.id, vendor_id: vendor_id) if vendor_id

    render json: {
      is_favorite: favorite.present?,
      favorite_id: favorite&.id
    }
  end

  private

  def authorize_favorite!(vendor)
    Auth::AuthorizationService.authorize!(current_user, vendor, :toggle_favorite)
  end

  def save_and_render_favorite(vendor)
    favorite = CustomerFavorite.find_or_initialize_by(
      user_id: current_user.id,
      vendor: vendor
    )

    if favorite.save
      favorite.vendor = vendor
      render json: { message: 'Vendor added to favorites', favorite: favorite_json(favorite) },
             status: :created
    else
      render json: { error: 'Failed to add favorite', details: favorite.errors.full_messages },
             status: :unprocessable_content
    end
  end

  def set_favorite
    @favorite = CustomerFavorite.find_by(id: params[:id], user_id: current_user.id)
    render json: { error: 'Favorite not found' }, status: :not_found unless @favorite
  end

  def favorite_json(favorite)
    vendor = favorite.vendor
    {
      id: favorite.id,
      vendor_id: vendor.id,
      created_at: favorite.created_at,
      vendor: {
        id: vendor.id,
        slug: vendor.slug,
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
