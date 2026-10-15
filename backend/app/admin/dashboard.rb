# frozen_string_literal: true

ActiveAdmin.register_page 'Dashboard' do
  menu priority: 1, label: proc { I18n.t('active_admin.dashboard') }

  content title: proc { I18n.t('active_admin.dashboard') } do
    # KPI Summary Cards
    columns do
      column do
        panel '👥 Users' do
          div style: 'display: flex; justify-content: space-around; text-align: center; padding: 12px 0;' do
            div do
              h2 User.count, style: 'margin: 0; font-size: 2rem; color: #1E40AF;'
              para 'Total Users', style: 'color: #64748B; margin: 0;'
            end
            div do
              h2 User.customers.count, style: 'margin: 0; font-size: 2rem; color: #059669;'
              para 'Customers', style: 'color: #64748B; margin: 0;'
            end
            div do
              h2 User.vendors.count, style: 'margin: 0; font-size: 2rem; color: #D97706;'
              para 'Vendors', style: 'color: #64748B; margin: 0;'
            end
          end
        end
      end

      column do
        panel '🏪 Vendors & Verification' do
          div style: 'display: flex; justify-content: space-around; text-align: center; padding: 12px 0;' do
            div do
              h2 VendorProfile.count, style: 'margin: 0; font-size: 2rem; color: #1E40AF;'
              para 'Total Profiles', style: 'color: #64748B; margin: 0;'
            end
            div do
              h2 VendorProfile.verification_verified.count, style: 'margin: 0; font-size: 2rem; color: #059669;'
              para 'Verified', style: 'color: #64748B; margin: 0;'
            end
            div do
              h2 VendorProfile.verification_pending_verification.count,
                 style: 'margin: 0; font-size: 2rem; color: #DC2626;'
              para 'Pending Review', style: 'color: #64748B; margin: 0;'
            end
          end
        end
      end

      column do
        panel '📅 Bookings & Volume' do
          div style: 'display: flex; justify-content: space-around; text-align: center; padding: 12px 0;' do
            div do
              h2 Booking.count, style: 'margin: 0; font-size: 2rem; color: #1E40AF;'
              para 'Total Bookings', style: 'color: #64748B; margin: 0;'
            end
            div do
              h2 Booking.where(status: :completed).count, style: 'margin: 0; font-size: 2rem; color: #059669;'
              para 'Completed', style: 'color: #64748B; margin: 0;'
            end
            div do
              h2 number_to_currency(Booking.sum(:total_amount), unit: '₹', precision: 0),
                 style: 'margin: 0; font-size: 1.5rem; color: #7C3AED;'
              para 'Total Volume', style: 'color: #64748B; margin: 0;'
            end
          end
        end
      end
    end

    # Operational Columns
    columns do
      column do
        panel 'Recent Bookings' do
          recent_bookings = Booking.includes(:customer, :vendor_profile, :service).order(created_at: :desc).limit(6)
          if recent_bookings.any?
            table_for recent_bookings do
              column :id do |b|
                link_to "##{b.id}", admin_booking_path(b)
              end
              column :customer do |b|
                b.customer&.full_name
              end
              column :vendor do |b|
                b.vendor_profile&.business_name
              end
              column :amount do |b|
                number_to_currency(b.total_amount, unit: '₹')
              end
              column :status do |b|
                status_classes = {
                  'pending' => :warning,
                  'accepted' => :ok,
                  'completed' => :ok,
                  'declined' => :error,
                  'cancelled' => :error
                }
                status_tag b.status, class: status_classes[b.status]
              end
            end
          else
            para 'No bookings found yet.', style: 'padding: 10px; color: #64748B;'
          end
        end

        panel 'Recent User Registrations' do
          recent_users = User.order(created_at: :desc).limit(6)
          table_for recent_users do
            column :name do |u|
              link_to u.full_name, admin_user_path(u)
            end
            column :email
            column :role do |u|
              status_tag u.role
            end
            column :created_at do |u|
              "#{time_ago_in_words(u.created_at)} ago"
            end
          end
        end
      end

      column do
        panel 'Vendors Awaiting Verification' do
          pending_vendors = VendorProfile.verification_pending_verification.includes(:user).order(created_at: :asc).limit(6)
          if pending_vendors.any?
            table_for pending_vendors do
              column :business_name do |vp|
                link_to vp.business_name, admin_vendor_profile_path(vp)
              end
              column :owner do |vp|
                vp.user&.full_name
              end
              column :location
              column :actions do |vp|
                link_to 'Review', admin_vendor_profile_path(vp), class: 'member_link'
              end
            end
          else
            para '✅ All vendor applications have been processed!', style: 'padding: 10px; color: #059669;'
          end
        end

        panel 'Recent Customer Reviews' do
          recent_reviews = Review.includes(:customer, :vendor_profile, :service).order(created_at: :desc).limit(6)
          if recent_reviews.any?
            table_for recent_reviews do
              column :rating do |r|
                "#{r.rating} ★"
              end
              column :vendor do |r|
                r.vendor_profile&.business_name
              end
              column :comment do |r|
                truncate(r.comment, length: 45)
              end
              column :status do |r|
                status_tag r.status
              end
            end
          else
            para 'No reviews yet.', style: 'padding: 10px; color: #64748B;'
          end
        end
      end
    end
  end
end
