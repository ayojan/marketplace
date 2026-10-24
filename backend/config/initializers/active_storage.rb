# frozen_string_literal: true

# Configure Active Storage to use clean domain/entity-first directory hierarchy in R2/S3
# Pattern: <environment>/<domain>/<YYYY>/<MM>/<secure_token>.<ext>
# Existing blobs with flat keys remain 100% backward-compatible.
ActiveSupport.on_load(:active_storage_blob) do
  attr_accessor :custom_record

  # Capture attached record during upload
  class << self
    prepend(Module.new do
      def build_after_unfurling(record: nil, **kwargs)
        super(**kwargs).tap do |blob|
          blob.custom_record = record if record
        end
      end
    end)
  end

  # Prepend structured key generator when key is unassigned
  prepend(Module.new do
    def key
      self[:key] ||= begin
        rec = custom_record || attachments.first&.record
        ActiveStorageKeyGenerator.call(
          record: rec,
          filename: filename,
          metadata: metadata
        )
      end
    end
  end)
end
