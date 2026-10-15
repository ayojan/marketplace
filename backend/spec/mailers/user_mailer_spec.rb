# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserMailer do
  let(:customer) { create(:user, :customer, first_name: 'Priya', email: 'priya@example.com') }
  let(:vendor) { create(:user, :vendor, first_name: 'Arjun', email: 'arjun@example.com') }

  describe '#welcome_email' do
    context 'when sent to a customer' do
      let(:mail) { described_class.welcome_email(customer) }

      it 'renders headers correctly' do
        expect(mail.subject).to eq('Welcome to Ayoj, Priya!')
        expect(mail.to).to eq(['priya@example.com'])
        expect(mail.from).to eq(['noreply@marketplace.com'])
      end

      it 'renders both HTML and text parts' do
        expect(mail.parts.map(&:content_type)).to include(
          match(%r{text/html}),
          match(%r{text/plain})
        )
      end

      it 'includes welcome message and explore link in HTML body' do
        html_body = mail.html_part.body.encoded
        expect(html_body).to include('Welcome to Ayoj, Priya!')
        expect(html_body).to include('Explore Vendors')
        expect(html_body).to include('support@ayoj.in')
      end

      it 'includes welcome message in text body' do
        text_body = mail.text_part.body.encoded
        expect(text_body).to include('Hello Priya')
        expect(text_body).to include('Welcome to Ayoj')
      end
    end

    context 'when sent to a vendor' do
      let(:mail) { described_class.welcome_email(vendor) }

      it 'renders headers correctly' do
        expect(mail.subject).to eq('Welcome to Ayoj, Arjun!')
        expect(mail.to).to eq(['arjun@example.com'])
        expect(mail.from).to eq(['noreply@marketplace.com'])
      end

      it 'includes vendor portal content in HTML body' do
        html_body = mail.html_part.body.encoded
        expect(html_body).to include('Welcome to Ayoj, Arjun!')
        expect(html_body).to include('Vendor Dashboard')
        expect(html_body).to include('Business Profile')
      end

      it 'includes vendor portal content in text body' do
        text_body = mail.text_part.body.encoded
        expect(text_body).to include('Hello Arjun')
        expect(text_body).to include('service provider on Ayoj')
      end
    end
  end
end
