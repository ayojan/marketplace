# frozen_string_literal: true

# Cloudflare R2 compatibility:
# The AWS SDK (v1.150+) automatically calculates and sends CRC32/CRC64NVME checksums.
# ActiveStorage simultaneously calculates an MD5 checksum.
# When both are sent, Cloudflare R2 rejects the request with:
# "Aws::S3::Errors::InvalidRequest: You can only specify one non-default checksum at a time."
# Setting these to "when_required" tells the AWS SDK not to append conflicting automatic checksums.

begin
  require 'aws-sdk-s3'

  Aws.config.update(
    s3: {
      request_checksum_calculation: 'when_required',
      response_checksum_validation: 'when_required'
    }
  )
rescue LoadError
  # aws-sdk-s3 not available
end
