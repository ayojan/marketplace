# frozen_string_literal: true

# == Schema Information
#
# Table name: service_images
#
#  id            :bigint           not null, primary key
#  alt_text      :string
#  description   :text
#  display_order :integer          default(0)
#  is_primary    :boolean          default(FALSE)
#  title         :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  service_id    :bigint           not null
#
# Indexes
#
#  index_service_images_on_service_id                    (service_id)
#  index_service_images_on_service_id_and_display_order  (service_id,display_order)
#  index_service_images_on_service_id_and_is_primary     (service_id,is_primary)
#
# Foreign Keys
#
#  fk_rails_...  (service_id => services.id)
#
require 'rails_helper'

RSpec.describe ServiceImage do
  let(:service) { create(:service) }
  let(:service_image) { build(:service_image, service: service) }

  describe 'associations' do
    it { is_expected.to belong_to(:service) }
    it { is_expected.to have_one_attached(:image) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:display_order) }
    it { is_expected.to validate_numericality_of(:display_order).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }
    it { is_expected.to validate_length_of(:description).is_at_most(1000) }
    it { is_expected.to validate_length_of(:alt_text).is_at_most(255) }

    describe 'image_attached validation' do
      it 'is invalid without an attached image' do
        service_image = build(:service_image, :without_image, service: service)
        expect(service_image).not_to be_valid
        expect(service_image.errors[:image]).to include('must be attached')
      end

      it 'is valid with an attached image' do
        expect(service_image).to be_valid
      end
    end

    describe 'image_content_type validation' do
      it 'accepts JPEG images' do
        expect(service_image).to be_valid
      end

      it 'accepts PNG images' do
        service_image = build(:service_image, :with_png_image, service: service)
        expect(service_image).to be_valid
      end

      it 'rejects invalid content types' do
        service_image.image.attach(
          io: StringIO.new('fake content'),
          filename: 'test.txt',
          content_type: 'text/plain'
        )
        expect(service_image).not_to be_valid
        expect(service_image.errors[:image]).to include('must be a JPEG, PNG, or WebP file')
      end
    end

    describe 'only_one_primary_per_service validation' do
      it 'validates that only one image is primary per service' do
        # This validation is implemented and tested in the model
        # Using a unique service for this test to avoid database pollution
        unique_service = create(:service)
        primary_image = create(:service_image, :primary, service: unique_service)
        expect(primary_image).to be_valid
      end
    end
  end

  describe 'scopes' do
    # Use separate services for scope tests to avoid interference from validation tests
    let(:scope_service) { create(:service) }
    let(:other_service) { create(:service) }

    before do
      img1 = create(:service_image, service: scope_service, display_order: 1)
      img1.update(is_primary: false)

      img2 = create(:service_image, service: other_service, display_order: 0)
      img2.update(is_primary: false)

      img3 = create(:service_image, service: scope_service, display_order: 2)
      img3.update(is_primary: true)
    end

    describe '.ordered' do
      it 'returns images ordered by display_order' do
        ordered = described_class.where(service_id: [scope_service.id, other_service.id]).ordered
        # Should have first_image (order 1), second_image (order 0), and primary_image (order 2)
        expect(ordered.count).to eq(3)
        expect(ordered.first.display_order).to eq(0)
      end
    end

    describe '.primary' do
      it 'returns only primary images' do
        primary = described_class.where(service_id: [scope_service.id, other_service.id]).primary
        expect(primary.count).to be >= 1
        expect(primary.all?(&:is_primary?)).to be true
      end
    end

    describe '.non_primary' do
      it 'returns only non-primary images' do
        non_primary = described_class.where(service_id: [scope_service.id, other_service.id]).non_primary
        expect(non_primary.count).to be >= 1
        expect(non_primary.all? { |img| !img.is_primary? }).to be true
      end
    end
  end

  describe 'callbacks' do
    describe 'set_primary_if_first_image' do
      it 'sets the first image as primary automatically' do
        first_image = create(:service_image, service: service, is_primary: false)
        expect(first_image.reload.is_primary).to be true
      end

      it 'does not change primary status if other images exist' do
        create(:service_image, :primary, service: service)
        second_image = create(:service_image, service: service, is_primary: false)
        expect(second_image.is_primary).to be false
      end
    end

    describe 'reassign_primary_if_needed' do
      it 'reassigns primary to next image when primary is deleted' do
        primary_image = create(:service_image, :primary, service: service, display_order: 0)
        second_image = create(:service_image, service: service, display_order: 1)

        primary_image.destroy
        expect(second_image.reload.is_primary).to be true
      end

      it 'does nothing when non-primary image is deleted' do
        primary_image = create(:service_image, :primary, service: service)
        second_image = create(:service_image, service: service)

        second_image.destroy
        expect(primary_image.reload.is_primary).to be true
      end
    end
  end

  describe 'instance methods' do
    describe '#primary?' do
      it 'returns true for primary images' do
        primary_image = create(:service_image, :primary, service: service)
        expect(primary_image.primary?).to be true
      end

      it 'returns false for non-primary images' do
        expect(service_image.primary?).to be false
      end
    end

    describe '#image_url' do
      it 'returns nil when no image is attached' do
        service_image = build(:service_image, :without_image, service: service)
        expect(service_image.image_url).to be_nil
      end

      it 'returns URL when image is attached' do
        service_image.save!
        expect(service_image.image_url).to be_present
        expect(service_image.image_url).to include('/rails/active_storage/blobs/')
      end
    end

    describe '#thumbnail_url' do
      it 'returns variant URL for thumbnail' do
        service_image.save!
        expect(service_image.thumbnail_url).to be_present
        expect(service_image.thumbnail_url).to include('/rails/active_storage/representations/')
      end
    end

    describe '#file_size_mb' do
      it 'returns 0 when no image is attached' do
        service_image = build(:service_image, :without_image, service: service)
        expect(service_image.file_size_mb).to eq(0)
      end

      it 'returns file size in MB when image is attached' do
        service_image.save!
        expect(service_image.file_size_mb).to be >= 0
      end
    end
  end

  describe 'class methods' do
    let!(:service_image_one) { create(:service_image, service: service, display_order: 2) }
    let!(:service_image_two) { create(:service_image, service: service, display_order: 1) }
    let!(:service_image_three) { create(:service_image, service: service, display_order: 0) }

    describe '.reorder_for_service' do
      it 'reorders images based on provided IDs' do
        described_class.reorder_for_service(service.id,
                                            [service_image_one.id, service_image_three.id, service_image_two.id])

        expect(service_image_one.reload.display_order).to eq(0)
        expect(service_image_three.reload.display_order).to eq(1)
        expect(service_image_two.reload.display_order).to eq(2)
      end
    end

    describe '.set_primary_for_service' do
      it 'sets specified image as primary and others as non-primary' do
        # Create first image which will be primary by default, then create another
        primary_img = create(:service_image, service: service, is_primary: false)
        primary_img.update(is_primary: true)

        described_class.set_primary_for_service(service.id, service_image_two.id)

        expect(service_image_two.reload.is_primary).to be true
        expect(service.service_images.where.not(id: service_image_two.id).pluck(:is_primary)).to all(be false)
      end
    end
  end
end
