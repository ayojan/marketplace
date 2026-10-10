# frozen_string_literal: true

class NotificationMailer < ApplicationMailer
  def booking_created_email(user, related_id)
    @user = user
    @booking = Booking.find_by(id: related_id)
    mail(to: @user.email, subject: 'Booking Request Received') do |format|
      format.text { render plain: "Hello #{@user.first_name}, your booking request has been received." }
    end
  end

  def booking_accepted_email(user, related_id)
    @user = user
    @booking = Booking.find_by(id: related_id)
    mail(to: @user.email, subject: 'Booking Confirmed') do |format|
      format.text { render plain: "Hello #{@user.first_name}, your booking has been confirmed." }
    end
  end

  def booking_rejected_email(user, related_id)
    @user = user
    @booking = Booking.find_by(id: related_id)
    mail(to: @user.email, subject: 'Booking Update') do |format|
      format.text { render plain: "Hello #{@user.first_name}, your booking request has been declined." }
    end
  end

  def booking_cancelled_email(user, related_id)
    @user = user
    @booking = Booking.find_by(id: related_id)
    mail(to: @user.email, subject: 'Booking Cancelled') do |format|
      format.text { render plain: "Hello #{@user.first_name}, your booking has been cancelled." }
    end
  end

  def booking_reminder_email(user, related_id)
    @user = user
    @booking = Booking.find_by(id: related_id)
    mail(to: @user.email, subject: 'Upcoming Booking Reminder') do |format|
      format.text { render plain: "Hello #{@user.first_name}, you have an upcoming event." }
    end
  end

  def new_message_email(user, related_id)
    @user = user
    @message = BookingMessage.find_by(id: related_id)
    mail(to: @user.email, subject: 'New Message Received') do |format|
      format.text { render plain: "Hello #{@user.first_name}, you have received a new message." }
    end
  end

  def review_received_email(user, related_id)
    @user = user
    @review = Review.find_by(id: related_id)
    mail(to: @user.email, subject: 'New Review Received') do |format|
      format.text { render plain: "Hello #{@user.first_name}, a new review has been posted." }
    end
  end
end
