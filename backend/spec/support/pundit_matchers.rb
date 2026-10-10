# frozen_string_literal: true

RSpec::Matchers.define :permit do |action|
  match do |policy|
    policy.public_send("#{action}?")
  end

  failure_message do |policy|
    "expected #{policy.class} to permit #{action} for #{policy.user.inspect} on #{policy.record.inspect}"
  end

  failure_message_when_negated do |policy|
    "expected #{policy.class} not to permit #{action} for #{policy.user.inspect} on #{policy.record.inspect}"
  end
end
