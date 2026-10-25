# frozen_string_literal: true

module Auth
  class Result
    attr_reader :status, :payload

    def initialize(success:, status:, payload:)
      @success = success
      @status = status
      @payload = payload
    end

    def success?
      @success
    end

    def self.success(status:, payload:)
      new(success: true, status: status, payload: payload)
    end

    def self.failure(status:, payload:)
      new(success: false, status: status, payload: payload)
    end
  end
end
