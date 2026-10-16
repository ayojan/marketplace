# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def welcome_email(user)
    @user = user
    @role = user.role
    @dashboard_url = if user.vendor?
                       frontend_url('/vendor/dashboard')
                     else
                       frontend_url('/explore')
                     end

    mail(
      to: @user.email,
      from: welcome_sender,
      reply_to: support_sender,
      subject: "Welcome to Ayoj, #{@user.first_name}!"
    ) do |format|
      format.text
      format.html
    end
  end
end
