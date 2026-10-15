# frozen_string_literal: true

# Preview all emails at http://localhost:3001/rails/mailers/user_mailer
class UserMailerPreview < ActionMailer::Preview
  def welcome_email_customer
    user = User.customers.first || sample_customer_user
    UserMailer.welcome_email(user)
  end

  def welcome_email_vendor
    user = User.vendors.first || sample_vendor_user
    UserMailer.welcome_email(user)
  end

  private

  def sample_customer_user
    User.new(
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'priya@example.com',
      role: :customer
    )
  end

  def sample_vendor_user
    User.new(
      first_name: 'Arjun',
      last_name: 'Verma',
      email: 'arjun@example.com',
      role: :vendor
    )
  end
end
