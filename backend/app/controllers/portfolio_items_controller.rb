# frozen_string_literal: true

# rubocop:disable Metrics/ClassLength
class PortfolioItemsController < ApiController
  # Authentication is handled by ApiController
  before_action :authenticate_user!, except: %i[index show]
  before_action :ensure_vendor_role, only: %i[create]
  before_action :set_vendor_profile, only: %i[index create]
  before_action :set_portfolio_item, only: %i[show update destroy upload_images remove_image duplicate]
  before_action :ensure_vendor_access, only: %i[update destroy upload_images remove_image duplicate]

  # GET /vendors/:vendor_id/portfolio_items
  # GET /portfolio_items (for current vendor)
  # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
  def index
    # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    if params[:vendor_profile_id] || params[:vendor_id]
      # Public access to view any vendor's portfolio
      @portfolio_items = @vendor_profile.portfolio_items.ordered
      @portfolio_items = @portfolio_items.by_category(params[:category]) if params[:category].present?
      @portfolio_items = @portfolio_items.featured if params[:featured] == 'true'
      categories = @vendor_profile.portfolio_categories
    else
      # Vendor accessing their own portfolio - requires authentication
      authenticate_user!
      ensure_vendor_role
      return if performed?

      unless current_user&.vendor_profile
        return render json: { portfolio_items: [], categories: [] }
      end

      @portfolio_items = current_user.vendor_profile.portfolio_items.ordered
      @portfolio_items = @portfolio_items.by_category(params[:category]) if params[:category].present?
      categories = current_user.vendor_profile.portfolio_categories
    end

    render json: {
      portfolio_items: @portfolio_items.map { |item| portfolio_item_json(item) },
      categories: categories
    }
  end

  # GET /portfolio_items/:id
  def show
    render json: { portfolio_item: portfolio_item_json(@portfolio_item) }
  end

  # POST /portfolio_items
  def create
    unless current_user&.vendor_profile
      return render json: { errors: ['Vendor profile not found'] }, status: :not_found
    end

    result = CreatePortfolioItem.call(current_user.vendor_profile, portfolio_item_params)

    if result[:success]
      render json: {
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Portfolio item created successfully'
      }, status: :created
    else
      render json: {
        errors: result[:errors]
      }, status: :unprocessable_content
    end
  end

  # PATCH/PUT /portfolio_items/:id
  def update
    result = UpdatePortfolioItem.call(@portfolio_item, portfolio_item_params)

    if result[:success]
      render json: {
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Portfolio item updated successfully'
      }
    else
      render json: {
        errors: result[:errors]
      }, status: :unprocessable_content
    end
  end

  # DELETE /portfolio_items/:id
  def destroy
    result = DeletePortfolioItem.call(@portfolio_item)
    if result[:success]
      render json: { message: 'Portfolio item deleted successfully' }
    else
      render json: { errors: result[:errors] }, status: :unprocessable_content
    end
  end

  # POST /portfolio_items/:id/upload_images
  def upload_images
    uploaded_files = params[:images] || params[:image]
    result = BulkUploadPortfolioImages.call(@portfolio_item, uploaded_files)

    if result[:success]
      render json: {
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Images uploaded successfully',
        images_uploaded: result[:images_count]
      }
    else
      render json: {
        errors: result[:errors]
      }, status: :unprocessable_content
    end
  end

  # DELETE /portfolio_items/:id/remove_image/:image_id
  def remove_image
    set_portfolio_item

    image = @portfolio_item.images.find(params[:image_id])
    image.purge

    render json: {
      portfolio_item: portfolio_item_json(@portfolio_item),
      message: 'Image removed successfully'
    }
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Image not found'] }, status: :not_found
  end

  # GET /portfolio_items/summary
  def summary
    ensure_vendor_role
    summary = PortfolioSummaryService.call(current_user.vendor_profile)

    render json: { summary: summary }
  end

  # POST /portfolio_items/reorder
  def reorder
    ensure_vendor_role
    result = ReorderPortfolioItems.call(current_user.vendor_profile, params[:category], params[:item_orders])

    if result[:success]
      render json: {
        message: "Successfully reordered #{result[:updated_count]} items",
        updated_count: result[:updated_count]
      }
    else
      render json: {
        errors: result[:errors],
        updated_count: result[:updated_count]
      }, status: :unprocessable_content
    end
  end

  # POST /portfolio_items/:id/duplicate
  def duplicate
    result = DuplicatePortfolioItem.call(@portfolio_item)

    if result[:success]
      render json: {
        portfolio_item: portfolio_item_json(result[:portfolio_item]),
        message: 'Portfolio item duplicated successfully'
      }, status: :created
    else
      render json: {
        errors: result[:errors]
      }, status: :unprocessable_content
    end
  end

  # PATCH /portfolio_items/set_featured
  def set_featured
    ensure_vendor_role
    result = SetFeaturedPortfolioItems.call(
      current_user.vendor_profile,
      params[:item_ids],
      featured_status: params[:featured]
    )

    if result[:success]
      render json: {
        message: "Successfully updated #{result[:updated_count]} items",
        updated_count: result[:updated_count]
      }
    else
      render json: {
        errors: result[:errors],
        updated_count: result[:updated_count]
      }, status: :unprocessable_content
    end
  end

  private

  def set_vendor_profile
    vendor_id = params[:vendor_profile_id] || params[:vendor_id]
    return unless vendor_id

    if vendor_id == 'me'
      authenticate_user!
      @vendor_profile = current_user&.vendor_profile
      unless @vendor_profile
        render json: { errors: ['Vendor profile not found for current user'] }, status: :not_found
      end
    else
      @vendor_profile = VendorProfile.find(vendor_id)
    end
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Vendor profile not found'] }, status: :not_found
  end

  def set_portfolio_item
    @portfolio_item = PortfolioItem.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ['Portfolio item not found'] }, status: :not_found
  end

  def ensure_vendor_access
    return if @portfolio_item.vendor_profile.user == current_user

    render json: { errors: ['Access denied'] }, status: :forbidden
  end

  def ensure_vendor_role
    return if current_user&.vendor?

    render json: { errors: ['Vendor access required'] }, status: :forbidden
  end

  def portfolio_item_params
    params.require(:portfolio_item).permit(:title, :description, :category, :display_order, :is_featured, images: [])
  end

  def portfolio_item_json(item)
    {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      display_order: item.display_order,
      is_featured: item.is_featured,
      created_at: item.created_at,
      updated_at: item.updated_at,
      primary_image_url: item.images.attached? ? (url_for(item.images.first) rescue nil) : nil,
      images: item.images.attached? ? item.images.map { |image| image_json(image) } : [],
      image_count: item.image_count,
      vendor_profile: {
        id: item.vendor_profile.id,
        business_name: item.vendor_profile.business_name
      }
    }
  end

  def image_json(image)
    image_url = begin
      url_for(image)
    rescue StandardError
      nil
    end

    thumb_url = begin
      if image.respond_to?(:representable?) && image.representable?
        url_for(image.variant(resize_to_limit: [300, 300]))
      else
        image_url
      end
    rescue StandardError
      image_url
    end

    {
      id: image.id,
      filename: image.filename.to_s,
      content_type: image.content_type,
      byte_size: image.byte_size,
      url: image_url,
      thumbnail_url: thumb_url || image_url
    }
  end
end
# rubocop:enable Metrics/ClassLength
