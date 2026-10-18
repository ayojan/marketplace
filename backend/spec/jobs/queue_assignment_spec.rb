# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
RSpec.describe 'Queue Assignments' do
  let(:queue_config) do
    YAML.load_file(Rails.root.join('config/queue.yml'), aliases: true)
  end

  describe 'Solid Queue Priority Configuration' do
    it 'defines queue priorities in config/queue.yml' do
      worker_queues = queue_config.dig('default', 'workers', 0, 'queues')
      expect(worker_queues).to include('critical', 'default', 'low')
    end
  end

  describe 'Job Queue Assignments' do
    describe 'Default Queue (Standard Priority)' do
      it 'NotificationJob is assigned to default queue' do
        expect(NotificationJob.new.queue_name).to eq('default')
      end
    end

    describe 'Low Queue (Background Priority)' do
      it 'BookingReminderJob is assigned to low queue' do
        expect(BookingReminderJob.new.queue_name).to eq('low')
      end

      it 'RecalculateVendorTrustStatsJob is assigned to low queue' do
        expect(RecalculateVendorTrustStatsJob.new.queue_name).to eq('low')
      end

      it 'ImageProcessingJob is assigned to low queue' do
        expect(ImageProcessingJob.new.queue_name).to eq('low')
      end
    end
  end
end
# rubocop:enable RSpec/DescribeClass
