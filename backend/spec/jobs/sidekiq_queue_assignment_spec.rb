# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Sidekiq Queue Assignments' do
  let(:queues) do
    if Sidekiq.respond_to?(:options) && Sidekiq.options[:queues].present?
      Sidekiq.options[:queues]
    else
      YAML.load_file(Rails.root.join('config/sidekiq.yml'))[:queues]
    end
  end

  describe 'Queue Priority Configuration' do
    it 'defines three queue tiers' do
      expect(queues).to include(['critical', 3])
      expect(queues).to include(['default', 1])
      expect(queues).to include(['low', 1])
    end

    it 'critical queue has higher weight than default' do
      critical_weight = queues.find { |q| q[0] == 'critical' }[1]
      default_weight = queues.find { |q| q[0] == 'default' }[1]
      expect(critical_weight).to be > default_weight
    end
  end

  describe 'Job Queue Assignments' do
    describe 'Critical Queue' do
      # Reserved for future authentication/payment jobs
      it 'is reserved for high-priority operations' do
        # No jobs currently assigned, but queue is available
        expect(queues).to include(['critical', 3])
      end
    end

    describe 'Default Queue (Standard Priority)' do
      it 'NotificationJob is assigned to default queue' do
        expect(NotificationJob.new.sidekiq_options['queue']).to eq('default')
      end

      it 'allows quick notification processing' do
        job = NotificationJob.new
        expect(job.sidekiq_options['queue']).to eq('default')
      end
    end

    describe 'Low Queue (Background Priority)' do
      it 'BookingReminderJob is assigned to low queue' do
        expect(BookingReminderJob.new.sidekiq_options['queue']).to eq('low')
      end

      it 'RecalculateVendorTrustStatsJob is assigned to low queue' do
        expect(RecalculateVendorTrustStatsJob.new.sidekiq_options['queue']).to eq('low')
      end

      it 'ImageProcessingJob is assigned to low queue' do
        expect(ImageProcessingJob.new.sidekiq_options['queue']).to eq('low')
      end

      it 'background jobs can wait without blocking critical operations' do
        low_jobs = [BookingReminderJob, RecalculateVendorTrustStatsJob, ImageProcessingJob]
        low_jobs.each do |job_class|
          job = job_class.new
          expect(job.sidekiq_options['queue']).to eq('low')
        end
      end
    end
  end

  describe 'Queue Distribution Strategy' do
    it 'prevents low-priority jobs from blocking default-priority jobs' do
      # Low queue has weight 1
      # Default queue has weight 1
      # They won't starve each other

      low_queue = queues.find { |q| q[0] == 'low' }
      default_queue = queues.find { |q| q[0] == 'default' }

      expect(low_queue[1]).to eq(default_queue[1])
    end

    it 'ensures critical queue gets more processing power' do
      critical_weight = queues.find { |q| q[0] == 'critical' }[1]
      default_weight = queues.find { |q| q[0] == 'default' }[1]

      # Critical should get 3x more processing power
      expect(critical_weight / default_weight).to eq(3)
    end
  end

  describe 'Job Retry Configuration' do
    it 'BookingReminderJob has appropriate retry settings' do
      job_options = BookingReminderJob.new.sidekiq_options
      expect(job_options['retry']).to eq(3)
      expect(job_options['dead']).to be true
    end

    it 'NotificationJob is configured for job processing' do
      job = NotificationJob.new
      expect(job).to respond_to(:perform)
    end

    it 'RecalculateVendorTrustStatsJob has retry settings' do
      job_options = RecalculateVendorTrustStatsJob.new.sidekiq_options
      expect(job_options['retry']).to eq(3)
      expect(job_options['dead']).to be true
    end
  end

  describe 'Queue Configuration Files' do
    it 'has Sidekiq configuration in config/sidekiq.yml' do
      sidekiq_config_path = Rails.root.join('config/sidekiq.yml')
      expect(sidekiq_config_path).to exist
    end

    it 'configuration defines all three queue levels' do
      config_content = Rails.root.join('config/sidekiq.yml').read
      expect(config_content).to include('critical')
      expect(config_content).to include('default')
      expect(config_content).to include('low')
    end
  end

  describe 'Documentation' do
    it 'has queue priority documentation' do
      docs_path = Rails.root.join('docs/SIDEKIQ_QUEUE_PRIORITY.md')
      expect(docs_path).to exist
    end

    it 'documents how to run Sidekiq with queue priorities' do
      docs_content = Rails.root.join('docs/SIDEKIQ_QUEUE_PRIORITY.md').read
      expect(docs_content).to include('bundle exec sidekiq')
      expect(docs_content).to include('-q critical')
      expect(docs_content).to include('-q default')
      expect(docs_content).to include('-q low')
    end
  end
end
