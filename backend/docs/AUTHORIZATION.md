# Authorization Layer Documentation

## Overview

The Ayoj marketplace uses **Pundit** for role-based and resource-based authorization. Authorization rules are centralized in policy objects (`app/policies/`) rather than scattered throughout controllers or services.

## Architecture

### Policy Classes

All policies inherit from `ApplicationPolicy` and are responsible for answering the question: "Can user X perform action Y on resource Z?"

```
app/policies/
├── application_policy.rb      # Base policy with default behaviors
├── review_policy.rb           # Review-specific authorization
├── booking_policy.rb          # Booking-specific authorization
├── vendor_profile_policy.rb   # Vendor profile-specific authorization
```

### AuthorizationService

`AuthorizationService` is the centralized entry point for authorization checks. It:
1. Finds the appropriate policy for a resource
2. Calls the policy with the user and resource
3. Raises exceptions if authorization fails

**Exceptions**:
- `AuthorizationService::NotAuthenticatedError` — User is nil
- `AuthorizationService::NotAuthorizedError` — User lacks permission

## Usage Guide

### In Domain Services

```ruby
module Reviews
  class RespondToReview
    extend Dry::Initializer
    option :review, type: Types.Instance(Review)
    option :vendor, type: Types.Instance(User)
    option :response, type: Types::Strict::String

    def call
      # Centralized authorization check
      authorize_vendor!

      # Business logic follows...
      review.update(vendor_response: response, vendor_responded_at: Time.current)
      { success: true, review: review }
    rescue AuthorizationService::NotAuthorizedError => e
      { success: false, error: e.message }
    end

    private

    def authorize_vendor!
      AuthorizationService.authorize!(vendor, review, :respond)
    end
  end
end
```

### In GraphQL Mutations

Authorization is typically handled by the domain service. Mutations delegate to services:

```ruby
module Mutations
  class RespondToReview < Mutations::BaseMutation
    argument :review_id, ID, required: true
    argument :response, String, required: true

    def resolve(review_id:, response:)
      user = context[:current_user]
      review = Review.find_by(id: review_id)

      result = ::Reviews::RespondToReview.call(
        review: review,
        vendor: user,
        response: response
      )

      # Service handles authorization internally
      if result[:success]
        { review: result[:review], errors: [] }
      else
        { review: nil, errors: [result[:error]] }
      end
    end
  end
end
```

### Direct Authorization Checks (Rare)

If you need to check authorization without calling a service:

```ruby
begin
  AuthorizationService.authorize!(current_user, vendor_profile, :update)
  # User is authorized; proceed
rescue AuthorizationService::NotAuthorizedError => e
  # Handle unauthorized access
  render_error(e.message)
end
```

## Policy Reference

### ReviewPolicy

```ruby
review_policy = ReviewPolicy.new(user, review)

review_policy.respond?      # Vendor can respond to own review
review_policy.view?         # Reviewer or vendor can view
review_policy.vote_helpful? # Any user except reviewer can vote
review_policy.update?       # Reviewer can edit published review
review_policy.destroy?      # Reviewer can delete own review
```

### BookingPolicy

```ruby
booking_policy = BookingPolicy.new(user, booking)

booking_policy.show?              # Customer can view own booking
booking_policy.vendor_view?       # Vendor can view own bookings
booking_policy.update?            # Customer can modify pending booking (within 24h)
booking_policy.cancel?            # Customer can cancel booking (within 24h)
booking_policy.accept?            # Vendor can accept pending booking
booking_policy.decline?           # Vendor can decline pending booking
booking_policy.complete?          # Vendor can mark accepted as completed
booking_policy.send_message?      # Customer or vendor can message
```

### VendorProfilePolicy

```ruby
vendor_policy = VendorProfilePolicy.new(user, vendor_profile)

vendor_policy.show?                # Anyone can view vendor profile
vendor_policy.update?              # Vendor can update own profile
vendor_policy.request_verification?    # Vendor can request own verification
vendor_policy.approve_verification?    # Only admin can approve
vendor_policy.reject_verification?     # Only admin can reject
vendor_policy.view_analytics?          # Vendor can view own analytics
vendor_policy.toggle_favorite?         # Customer can favorite vendor
```

## Adding New Authorization Rules

### 1. Create or Update a Policy

```ruby
# app/policies/custom_resource_policy.rb
class CustomResourcePolicy < ApplicationPolicy
  def custom_action?
    # Return true if authorized, false otherwise
    user.admin? || record.owner == user
  end
end
```

### 2. Use Authorization in Service

```ruby
module Domain
  class CustomService
    def call
      AuthorizationService.authorize!(user, resource, :custom_action)
      # Proceed with business logic
    rescue AuthorizationService::NotAuthorizedError => e
      { success: false, error: e.message }
    end
  end
end
```

### 3. Write Tests

```ruby
# spec/policies/custom_resource_policy_spec.rb
RSpec.describe CustomResourcePolicy do
  let(:user) { create(:user) }
  let(:resource) { create(:custom_resource) }

  subject { CustomResourcePolicy.new(user, resource) }

  describe '#custom_action?' do
    context 'when user is owner' do
      before { resource.owner = user }
      it { is_expected.to permit(:custom_action) }
    end

    context 'when user is not owner' do
      it { is_expected.not_to permit(:custom_action) }
    end
  end
end
```

## Testing

### Policy Tests

Use `expect(...).to permit(:action)` and `expect(...).not_to permit(:action)` matchers:

```ruby
expect(ReviewPolicy.new(vendor, review)).to permit(:respond)
expect(ReviewPolicy.new(customer, review)).not_to permit(:respond)
```

### Service Tests

Catch authorization exceptions:

```ruby
expect {
  Reviews::RespondToReview.call(review: review, vendor: unauthorized_user, response: 'test')
}.to raise_error(AuthorizationService::NotAuthorizedError)

# Or check result hash
result = Reviews::RespondToReview.call(...)
expect(result[:success]).to be false
expect(result[:error]).to include('not authorized')
```

## Best Practices

### ✅ DO

- Centralize all authorization logic in policy classes
- Use `AuthorizationService.authorize!` in domain services
- Test policies independently with clear user roles
- Document complex authorization rules with comments
- Return consistent error messages from services

### ❌ DON'T

- Scatter authorization checks throughout services/controllers
- Mix authorization with business logic
- Hardcode role checks (`if user.admin?`) outside policies
- Forget to test authorization edge cases
- Return generic "Unauthorized" without context

## Migration Guide (For Existing Code)

If you find authorization checks outside policies:

**Before** (Scattered):
```ruby
def respond_to_review
  return error unless vendor.vendor? && review.vendor_profile.user_id == vendor.id
  # ...
end
```

**After** (Centralized):
```ruby
def respond_to_review
  AuthorizationService.authorize!(vendor, review, :respond)
  # ...
rescue AuthorizationService::NotAuthorizedError => e
  return error(e.message)
end
```

## Future Enhancements

- Add role-scoped policies (e.g., VendorPolicy for admin actions)
- Implement attribute-level authorization for sensitive fields
- Add scope policies for list queries
- Integrate with GraphQL authorization middleware
