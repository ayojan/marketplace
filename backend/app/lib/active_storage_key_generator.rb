# frozen_string_literal: true

# Generates clean, domain-partitioned object keys for Active Storage uploads
# Structure: <environment>/<domain>/<YYYY>/<MM>/<secure_token>.<ext>
class ActiveStorageKeyGenerator
  DOMAIN_MAPPINGS = {
    'Service' => 'services',
    'ServiceImage' => 'services',
    'PortfolioItem' => 'portfolios',
    'Review' => 'reviews',
    'User' => 'avatars',
    'ActiveStorage::VariantRecord' => 'variants'
  }.freeze

  DEFAULT_DOMAIN = 'general'
  TOKEN_LENGTH = 28

  def self.call(record: nil, filename: nil, metadata: nil, environment: Rails.env)
    domain = determine_domain(record, metadata)
    date_partition = Time.current.strftime('%Y/%m')
    token = SecureRandom.base36(TOKEN_LENGTH)
    ext = sanitize_extension(filename)

    "#{environment}/#{domain}/#{date_partition}/#{token}#{ext}"
  end

  def self.determine_domain(record, metadata)
    return metadata['domain'] if metadata.is_a?(Hash) && metadata['domain'].present?

    case record
    when String
      DOMAIN_MAPPINGS.fetch(record, record.underscore.pluralize)
    when Class
      DOMAIN_MAPPINGS.fetch(record.name, record.model_name.plural)
    when Module
      DOMAIN_MAPPINGS.fetch(record.name, record.name.underscore.pluralize)
    else
      match_record_instance(record)
    end
  end

  def self.match_record_instance(record)
    if record.respond_to?(:class) && DOMAIN_MAPPINGS.key?(record.class.name)
      DOMAIN_MAPPINGS[record.class.name]
    elsif record.respond_to?(:model_name)
      record.model_name.plural
    else
      DEFAULT_DOMAIN
    end
  end

  def self.sanitize_extension(filename)
    return '' if filename.blank?

    raw_ext = File.extname(filename.to_s).downcase
    raw_ext.match?(/\A\.[a-z0-9]{2,5}\z/) ? raw_ext : ''
  end
end
