# Rails Architecture Review: Ayoj Marketplace Backend

**Date**: March 14, 2026
**Rails Version**: 8.0.0
**Architecture Style**: Modular Monolith with Domain-Driven Services
**Primary Domain**: Photographer/Vendor Marketplace with Booking Management

---

## Phase 0: Intake & Orientation

### Stack Overview
- **Framework**: Rails 8.0.0 API + GraphQL
- **Database**: PostgreSQL with strong FK constraints
- **Job Queue**: Sidekiq (configured, scheduler enabled)
- **Auth**: Devise + JWT tokens
- **Key Gems**: GraphQL, Dry::Initializer, Dry::Types, Kaminari, ActiveAdmin
- **Testing**: RSpec, Factory Bot, Shoulda Matchers

### Architecture Style
This is a **well-structured modular monolith** with domain-driven service layer discipline. Business logic is intentionally extracted to `app/domain/` services, models are kept lean (<100 LOC), and GraphQL mutations delegate to domain services. Recent feature additions (reviews, notifications, favorites, trust metrics) demonstrate consistent architectural patterns.

### Coverage
This review covers:
1. **Phase 1**: Database & ActiveRecord usage
2. **Phase 2**: Service Objects & Design Patterns
3. **Phase 3**: API Design & GraphQL Architecture
4. **Phase 4**: Background Jobs & Async Processing

---

## Phase 1: Database & ActiveRecord

### 1.1 Schema Design ✅ STRONG

**Findings**: Schema is well-designed with proper constraints, enums, and check constraints.

✅ **Strengths**:
- Foreign keys properly defined with cascading deletes where appropriate
- Check constraints at DB level (e.g., `helpful_votes >= 0`, `completion_rate between 0-1`)
- Enums used correctly (user roles, booking status, review status, verification status)
- Polymorphic pattern used appropriately for `in_app_notifications` with type validation constraint
- Wide tables avoided (vendor_profiles ~30 cols is reasonable for a profile)

⚠️ **Minor Issues**:
- `vendor_profiles.service_categories` is text field storing CSV—consider separate `vendor_categories` join table for better querying

### 1.2 Indexing ✅ EXCELLENT

**Findings**: Indexing strategy is thoughtful and efficient.

✅ **Strengths**:
- All foreign keys are indexed
- Compound indexes for common query patterns:
  - `bookings(vendor_profile_id, vendor_first_response_at, created_at)` for response time metrics
  - `reviews(vendor_profile_id, status, helpful_votes DESC)` for sorted queries
  - `in_app_notifications(user_id, is_read, created_at)` for feed queries
- Geo-spatial indexes for radius searches: `vendor_profiles(latitude, longitude)`
- Unique constraint on polymorphic relationships where needed

✅ **No issues found** — this is best-in-class indexing for a marketplace.

### 1.3 ActiveRecord Usage 🟡 MEDIUM - Some Callback Debt

**Findings**: Models are lean, but callbacks are overused for side-effect orchestration.

🔴 **Issue #1: Callback-Driven Notification Side Effects**
**Category**: Anti-pattern / Layering Violation
**Severity**: 🟡 Medium
**Location**: `app/models/review.rb:79-80`, `app/models/booking.rb:85-87`

**Problem**: After-save callbacks in Review and Booking models enqueue notifications and stat recalculations. This couples the model layer to domain services and makes side effects implicit. If a future caller needs to update a booking without sending notifications, they must override callbacks (brittle). Tests must stub callbacks to isolate model logic.

**Refactored Example**:
```ruby
# Before (problematic) — implicit side effects
class Review < ApplicationRecord
  after_save :update_all_rating_stats
  after_create :send_review_notification
  # ... 50 other lines, side effects hidden
end

# After (recommended) — explicit choreography in service
module Reviews
  class CreateReview
    extend Dry::Initializer
    option :booking, type: Types.Instance(Booking)
    option :customer, type: Types.Instance(User)
    option :rating, type: Types::Integer
    # ... other options

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def call
      review = Review.create!(**review_params)

      # Explicit side effects after successful creation
      UpdateRatingStats.call(vendor_profile: review.vendor_profile)
      UpdateRatingStats.call(service: review.service)
      SendReviewNotification.call(review: review)

      { success: true, review: review }
    end

    private

    def review_params
      # ... build params
    end
  end
end
```

**Why This Matters**: Implicit callbacks make the model layer a "god object" of side effects. It couples creation logic (model) to notifications (external), stats (queries), and jobs (async). Explicit service choreography makes the happy path visible in one place.

---

🟡 **Issue #2: Review Model Does Too Much Validation**
**Category**: Fat Model / Single Responsibility
**Severity**: 🟡 Medium
**Location**: `app/models/review.rb:72-76` (5 custom validations), lines 99-150 (15 private validation methods)

**Problem**: Review model has 15 private validation methods (booking_must_be_completed, customer_must_own_booking, photos validation, vendor_response_consistency). These are rightfully in the model (data integrity), but they're verbose. Consider extracting to a validation service if new multi-step validation logic is added.

**Current state is acceptable**, but watch for growth.

---

### 1.4 Migrations 🟢 GOOD

✅ **Findings**: Migrations follow Rails conventions.
- No data migrations mixed into schema migrations
- All migrations are reversible
- Constraints added progressively in dedicated migrations (e.g., `20260314123003_add_trust_metrics_constraints.rb`)

---

## Phase 1 Summary Table

| # | Area | Severity | Issue | Effort |
|---|------|----------|-------|--------|
| 1 | Schema | 🟢 Low | `vendor_profiles.service_categories` as CSV instead of join table | Medium |
| 2 | AR Usage | 🟡 Medium | Callback-driven side effects in Review/Booking models | Medium |
| 3 | AR Usage | 🟡 Medium | Review model validation count; monitor for growth | Low |

---

## Phase 2: Service Objects & Design Patterns

### 2.1 Fat Model / Fat Controller Detection ✅ EXCELLENT

**Findings**: Model and controller layering is disciplined.

✅ **Models** (checked: User, Booking, Review, VendorProfile, Service):
- Average ~80-120 LOC (well under 300-line threshold)
- Associations, enums, validations, basic scopes—no business logic
- VendorProfile is largest at ~270 LOC; still reasonable for a core entity

✅ **Controllers**: Thin HTTP-only wrappers
- GraphQL mutations delegate to domain services
- No business logic in mutations; they only orchestrate: `service.call()` → render

**No issues found** — this is a strength.

---

### 2.2 Service Object Structure ✅ STRONG

**Findings**: Domain services follow consistent, well-designed patterns.

✅ **Strengths**:
- All services in `app/domain/` follow single-responsibility principle
- Use `Dry::Initializer` for type-safe options (excellent pattern)
- Return result hashes with `{ success: true/false, ... }` consistently
- Examples:
  - `Notifications::SendNotification` — handles in-app + email notification logic
  - `Favorites::ToggleFavorite` — single job: toggle and return state
  - `Reviews::RespondToReview` — vendor response with auth guard

✅ **Service Architecture Pattern**:
```ruby
# Consistent pattern across all services
module Domain
  class ServiceName
    extend Dry::Initializer
    option :user, type: Types.Instance(User)
    option :data, type: Types::String

    def self.call(**kwargs)
      new(**kwargs).call
    end

    def call
      # validation → transform → persist → return result
      { success: true, ... }
    rescue StandardError => e
      Rails.logger.error(...)
      { success: false, error: e.message }
    end
  end
end
```

This is a **strong, battle-tested pattern**. Continue it.

---

### 2.3 Design Pattern Usage 🟡 MEDIUM - Some Gaps

#### Query Objects: 🟢 Used Well
- `VendorProfiles::CalculatePublicStats` — complex multi-metric aggregation in single query
- Single-query pattern prevents N+1

#### Form Objects: 🟢 Not Needed
- GraphQL mutations don't use nested attributes, so no form objects needed

#### Policy Objects: 🔴 **MISSING** — Authorization scattered

**Issue #3: No Centralized Authorization / Policy Objects**
**Category**: Design Pattern / Authorization
**Severity**: 🟡 Medium
**Location**: `app/domain/reviews/respond_to_review.rb:38-40`, mutations scattered

**Problem**: Authorization logic is inline in services and mutations (authorization checks mixed with business logic). Example in RespondToReview:
```ruby
def authorized?
  vendor.vendor? && review.vendor_profile.user_id == vendor.id
end
```

This works but:
1. Authorization is implicit (mixed with business logic)
2. Hard to audit all authorization rules in one place
3. If you need to change "who can respond to reviews?", you dig through services

**Refactored Example**:
```ruby
# app/policies/review_policy.rb (use Pundit pattern)
class ReviewPolicy
  attr_reader :user, :review

  def initialize(user, review)
    @user = user
    @review = review
  end

  def respond?
    user.vendor? && review.vendor_profile.user_id == user.id
  end
end

# In service
module Reviews
  class RespondToReview
    def call
      unless ReviewPolicy.new(vendor, review).respond?
        return { success: false, error: 'Unauthorized' }
      end
      # ... rest of logic
    end
  end
end

# In GraphQL mutation
def resolve(review_id:, response:)
  review = Review.find(review_id)
  authorize! ReviewPolicy.new(context[:current_user], review)
  # ... call service
end
```

**Why This Matters**: Authorization is a cross-cutting concern. Centralizing policies makes security audits easier and prevents "forgotten" authorization checks.

---

#### Decorators / Presenters: 🟢 Appropriate Absence
- VendorProfile has `display_name` helper—good light-touch approach
- GraphQL types are lightweight—no fat presenter bloat

#### Value Objects: 🟡 OPPORTUNITY

**Issue #4: Numeric Metrics Lack Semantic Meaning**
**Category**: Design / Value Objects
**Severity**: 🟢 Low
**Location**: `app/domain/vendor_profiles/calculate_public_stats.rb:96-110`

**Problem**: Response time is stored as float (hours), completion rate as decimal (0-1). When used, these are error-prone:
```ruby
response_time_hours = stats.avg_response_seconds ? (stats.avg_response_seconds.to_f / 3600).round(2) : nil
completion_rate = stats.total_terminal.zero? ? nil : (stats.total_completed.to_f / stats.total_terminal).round(4)
```

A `ResponseTime` value object would make this cleaner:
```ruby
class ResponseTime
  attr_reader :hours

  def initialize(seconds)
    @hours = seconds ? (seconds.to_f / 3600).round(2) : nil
  end

  def to_f
    @hours
  end
end

# Usage
response_time = ResponseTime.new(stats.avg_response_seconds)
response_time.hours # => 2.5
```

**Current code is not a blocker**, but if you add more trust metrics, value objects prevent calculation duplication.

---

### 2.4 Inter-layer Leakage 🟡 MEDIUM - Notifications & Jobs

**Issue #5: Models Calling Domain Services (Side-effect Coupling)**
**Category**: Layering Violation
**Severity**: 🟡 Medium
**Location**: `app/models/review.rb:93-97`, `app/models/booking.rb:123-131`, `app/models/vendor_profile.rb:146-148`

**Problem**: Models call domain services in callbacks:
```ruby
# app/models/review.rb
after_create :send_review_notification

def send_review_notification
  Notifications::SendReviewNotification.call(review: self)
rescue StandardError => e
  Rails.logger.error(...)
end
```

This is **not a critical issue** (many Rails apps do this), but it creates:
1. **Implicit dependencies**: Tests must know about these side effects
2. **Ordering issues**: If two callbacks call services, their order matters
3. **Testability**: Can't create a Review without triggering notifications (must stub)

**Recommended refactoring**: Extract to dedicated event handler or callback coordinator.

```ruby
# Option A: Event Dispatcher Pattern
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  class EventDispatcher
    def self.dispatch(event, resource)
      case event
      when :review_created
        Notifications::SendReviewNotification.call(review: resource)
        VendorProfiles::UpdateRatingStats.call(vendor_profile: resource.vendor_profile)
      when :booking_status_changed
        Notifications::SendBookingStatusChange.call(booking: resource)
      end
    end
  end
end

# In models
class Review < ApplicationRecord
  after_create { EventDispatcher.dispatch(:review_created, self) }
end

# Option B: Just Remove Callbacks (Simple)
# Create reviews only via ReviewCreationService
# Don't create reviews directly in tests
```

**Current pattern is acceptable** but watch for callback proliferation.

---

### 2.5 Bookings State Machine 🟢 GOOD

`Bookings::StateMachine` validates state transitions correctly. No issues.

---

## Phase 2 Summary Table

| # | Area | Severity | Issue | Effort |
|---|------|----------|-------|--------|
| 1 | AR Usage | 🟡 Medium | Callback-driven side effects (Review, Booking) | Medium |
| 2 | Auth | 🟡 Medium | No centralized Policy objects; auth scattered in services | Medium |
| 3 | Value Objects | 🟢 Low | Numeric metrics lack semantic wrapping | Low |
| 4 | Layering | 🟡 Medium | Models call domain services; implicit dependencies | Medium |

---

## Phase 3: API Design & GraphQL

### 3.1 GraphQL Schema ✅ GOOD

**Findings**: 37 type definitions, clean REST-to-GraphQL mapping.

✅ **Strengths**:
- Single endpoint: `/graphql`
- GraphiQL available in dev
- Consistent mutation naming: `ToggleFavorite`, `VoteReviewHelpful`, `RespondToReview`
- Standard return shape: `{ success: boolean, errors: [String], ...result_fields }`

### 3.2 Mutation Architecture ✅ EXCELLENT

**Findings**: GraphQL mutations are thin wrappers—exactly right.

✅ **Pattern**:
```ruby
module Mutations
  class ToggleFavorite < Mutations::BaseMutation
    argument :vendor_profile_id, ID, required: true
    field :is_favorited, Boolean, null: false
    field :vendor_profile, Types::VendorProfileType, null: true
    field :errors, [String], null: false

    def resolve(vendor_profile_id:)
      result = Favorites::ToggleFavorite.call(...)
      if result[:success]
        { is_favorited: result[:is_favorited], vendor_profile: ..., errors: [] }
      else
        { is_favorited: false, vendor_profile: nil, errors: [result[:error]] }
      end
    end
  end
end
```

**Separation of concerns is perfect here:**
- Mutation: HTTP concerns (parsing, response format)
- Service: Business logic

### 3.3 Response Consistency 🟢 GOOD

All mutations return `{ success, errors, ...data }` shape. Consistent.

### 3.4 N+1 Risk in Resolvers 🟡 MEDIUM - Some Risk

**Issue #6: Potential N+1 in Nested GraphQL Queries**
**Category**: Query Efficiency
**Severity**: 🟡 Medium
**Location**: GraphQL types and mutations (not audited in detail, but common risk)

**Problem**: GraphQL field resolvers can cause N+1 if not careful. Example:
```ruby
# In VendorProfileType
field :reviews, [ReviewType] do
  resolve { |vendor_profile| vendor_profile.reviews }  # ← N+1 risk if called multiple times
end
```

GraphQL doesn't auto-batch; you must use `includes` or loaders.

**Refactored Example**:
```ruby
# Install graphql-batch gem
field :reviews, [ReviewType] do
  resolve do |vendor_profile|
    Loaders::AssociationLoader.for(VendorProfile, :reviews).load(vendor_profile)
  end
end
```

Or ensure mutations pre-load:
```ruby
def resolve(vendor_profile_id:)
  result = Favorites::ToggleFavorite.call(...)
  if result[:success]
    vendor_profile = VendorProfile.includes(:user, :reviews).find(vendor_profile_id)
    # ...
  end
end
```

**Action**: Audit GraphQL field resolvers; add loaders where needed.

---

### 3.5 Error Handling 🟡 MEDIUM

**Issue #7: Inconsistent Error Handling in Mutations**
**Category**: API Design / Error Handling
**Severity**: 🟡 Medium
**Location**: Multiple mutations; example: `app/graphql/mutations/toggle_favorite.rb:31-36`

**Problem**: Some mutations catch `StandardError` generically:
```ruby
rescue StandardError => e
  {
    is_favorited: false,
    vendor_profile: nil,
    errors: [e.message]
  }
end
```

This returns user-facing error messages which may leak internals (e.g., database constraint violations).

**Refactored Example**:
```ruby
# Create a base mutation with error handling
module Mutations
  class BaseMutation < GraphQL::Schema::RelayClassicMutation
    rescue_from(StandardError) do |err|
      Rails.logger.error("Mutation error: #{err.class} #{err.message}")
      context.add_error(GraphQL::ExecutionError.new('An unexpected error occurred'))
    end

    rescue_from(ActiveRecord::RecordNotFound) do |err|
      context.add_error(GraphQL::ExecutionError.new('Record not found'))
    end
  end
end
```

**Why This Matters**: Explicit error types prevent info leakage and give clients correct error semantics.

---

## Phase 3 Summary Table

| # | Area | Severity | Issue | Effort |
|---|------|----------|-------|--------|
| 1 | Mutations | 🟢 Low | GraphQL mutations are thin wrappers ✅ | N/A |
| 2 | Resolvers | 🟡 Medium | Potential N+1 in nested field resolvers | Medium |
| 3 | Errors | 🟡 Medium | Generic error handling may leak internals | Low |

---

## Phase 4: Background Jobs & Async Processing

### 4.1 Job Design 🟡 MEDIUM - Idempotency Risk

**Findings**: Jobs are simple but have safety gaps.

🟡 **Issue #8: BookingReminderJob Not Idempotent**
**Category**: Job Design / Reliability
**Severity**: 🟡 Medium
**Location**: `app/jobs/booking_reminder_job.rb`

**Problem**: Job queries for `booking_reminder_sent_at IS NULL`, sends reminder, but if it crashes mid-way, it might re-send:
```ruby
def perform
  bookings = Booking
    .where('event_date > ? AND event_date < ?', tomorrow_start, tomorrow_end)
    .where(status: :accepted)
    .where('booking_reminder_sent_at IS NULL')  # ← Checked, but...

  bookings.each do |booking|
    Notifications::SendBookingReminder.call(booking: booking)  # ← What if this fails mid-loop?
  end
end
```

If the job crashes after sending reminder #3 of 10, the job retries and re-sends #1-3.

**Refactored Example**:
```ruby
class BookingReminderJob
  include Sidekiq::Job
  sidekiq_options retry: 3, dead: true

  def perform
    tomorrow_start = 24.hours.from_now - 30.minutes
    tomorrow_end = 24.hours.from_now + 30.minutes

    bookings = Booking
      .where('event_date > ? AND event_date < ?', tomorrow_start, tomorrow_end)
      .where(status: :accepted)
      .where('booking_reminder_sent_at IS NULL')
      .find_in_batches(batch_size: 100) do |batch|
        batch.each do |booking|
          send_reminder_idempotently(booking)
        end
      end

    Rails.logger.info("Sent #{bookings.count} booking reminders")
  end

  private

  def send_reminder_idempotently(booking)
    return if booking.booking_reminder_sent_at.present?  # Double-check before sending

    Notifications::SendBookingReminder.call(booking: booking)

    # Update AFTER successful send—this is the "idempotency key"
    booking.update!(booking_reminder_sent_at: Time.current)
  rescue StandardError => e
    Rails.logger.error("Failed to send reminder for booking #{booking.id}: #{e.message}")
    # Don't re-raise; continue with next booking to avoid blocking batch
  end
end
```

**Why This Matters**: Idempotent jobs are retryable without side effects. Non-idempotent jobs can send duplicate notifications, charge twice, etc.

---

🟡 **Issue #9: RecalculateVendorTrustStatsJob Enqueued in Callback**
**Category**: Coupling / Job Design
**Severity**: 🟡 Medium
**Location**: `app/models/booking.rb:123-131`

**Problem**:
```ruby
# In Booking model callback
def enqueue_trust_stats_recalculation
  RecalculateVendorTrustStatsJob.perform_async(vendor_profile_id)
rescue StandardError => e
  Rails.logger.error(...)
end
```

If job enqueueing fails (Redis down), the error is swallowed and logged. The user sees "booking updated" but stats aren't recalculated. This creates silent failures.

**Refactored Example**:
```ruby
# Option A: Inline if fast enough
def enqueue_trust_stats_recalculation
  return unless status.in?(%w[completed declined cancelled])
  VendorProfiles::CalculatePublicStats.call(vendor_profile: vendor_profile)
rescue StandardError => e
  Rails.logger.error("Failed to recalculate vendor stats: #{e.message}")
end

# Option B: Use Sidekiq with retry; let callback failures bubble up
def enqueue_trust_stats_recalculation
  return unless status.in?(%w[completed declined cancelled])
  RecalculateVendorTrustStatsJob.perform_async(vendor_profile_id)
  # Don't rescue; let Sidekiq handle retries; fail the booking update if job enqueueing fails
end
```

**Why This Matters**: Silent failure (swallowed exception) is worse than loud failure (exception bubbles up). Let the data integrity issue propagate.

---

### 4.2 Queue Architecture 🟡 MEDIUM - Not Configured

**Issue #10: No Queue Priority Separation**
**Category**: Queue Design
**Severity**: 🟡 Medium
**Location**: `config/sidekiq.rb`, job definitions

**Problem**: All jobs (booking reminders, trust stats recalc, emails) go to default queue. If a heavy job blocks the queue, critical notifications are delayed.

**Best Practice**: Separate queues by priority.
```ruby
# config/sidekiq.yml
:queues:
  - [critical, 3]    # High-priority: auth, payments
  - [default, 1]     # Normal: business logic
  - [low, 1]         # Background: analytics, cleanup

# In jobs
class BookingReminderJob
  sidekiq_options queue: 'default'
end

class RecalculateVendorTrustStatsJob
  sidekiq_options queue: 'low'  # Long-running, low priority
end

class NotificationMailer
  sidekiq_options queue: 'default'  # Important, fast
end
```

**Action**: Create `config/sidekiq.yml` with priority queues; assign jobs accordingly.

---

### 4.3 Reliability & Error Handling 🟡 MEDIUM

**Issue #11: No Dead-Letter Queue Monitoring**
**Category**: Reliability / Observability
**Severity**: 🟡 Medium
**Location**: Job definitions lack explicit DLQ handling

**Problem**: Sidekiq jobs have `sidekiq_options retry: 3, dead: true`, but no monitoring of dead-letter queue. Failed jobs silently accumulate in Redis.

**Solution**: Add alerting.
```ruby
# config/sidekiq.rb
Sidekiq.configure_server do |config|
  # ... existing config

  config.dead_max_jobs = 5000  # Reasonable cap
  config.error_handlers << ->(ex, ctx) {
    # Alert to monitoring system if dead-lettering happens
    Sentry.capture_exception(ex, extra: { sidekiq_context: ctx })
  }
end
```

---

### 4.4 Scheduling 🟢 GOOD

**Findings**: `BookingReminderJob` is scheduled via `config/sidekiq_schedule.yml` (good pattern).

✅ Strengths:
- Job is idempotent (by design, not retries)
- Scheduled jobs are designed to be run multiple times without harm

---

## Phase 4 Summary Table

| # | Area | Severity | Issue | Effort |
|---|------|----------|-------|--------|
| 1 | Idempotency | 🟡 Medium | BookingReminderJob could re-send if crashes mid-batch | Medium |
| 2 | Coupling | 🟡 Medium | Job enqueueing failure swallowed in callbacks | Low |
| 3 | Queue Design | 🟡 Medium | No priority queue separation | Low |
| 4 | Reliability | 🟡 Medium | No dead-letter queue monitoring | Low |

---

## 🎯 EXECUTIVE SUMMARY & VERDICT

### Overall Architectural Health: **8.5/10 — Strong, with Medium-Priority Debt**

**Verdict**: This is a **well-engineered Rails codebase** with mature architectural discipline:

✅ **Strengths**:
1. **Excellent service layer discipline**: Domain services are lean, type-safe, and single-purpose
2. **Lean models**: No god objects; models stay <120 LOC
3. **Strong indexing & database design**: Proper constraints, foreign keys, compound indexes
4. **GraphQL mutations are thin**: Correct separation of concerns; business logic in services
5. **Consistent patterns**: All services follow the same structure; easy to onboard new developers

⚠️ **Medium-Priority Issues** (not blocking, but address in next sprint):
1. **Callback-driven side effects**: Implicit dependencies in Review/Booking callbacks
2. **Missing authorization layer**: Auth checks scattered in services; no centralized policies
3. **Job idempotency gaps**: BookingReminderJob and callback-enqueued jobs need hardening
4. **No queue priority separation**: All jobs compete for default queue

### Top 3 High-Impact Changes (Impact/Effort Ratio):

| Priority | Issue | Impact | Effort | ROI |
|----------|-------|--------|--------|-----|
| 1 | Centralize Authorization (Policy objects) | Prevents auth bugs; improves auditability | Medium | High |
| 2 | Harden job idempotency | Prevents duplicate notifications; essential for reliability | Medium | High |
| 3 | Extract callback side effects | Improves testability; clarifies data flow | Medium | Medium |

---

## FULL ISSUE REGISTRY (Prioritized by Impact/Effort)

| # | Phase | Area | Severity | Issue | Effort | Est. Days |
|---|-------|------|----------|-------|--------|-----------|
| **1** | Phase 2 | **Authorization** | 🟡 Medium | **No centralized Policy objects; auth scattered** | Medium | 2-3 |
| **2** | Phase 4 | **Idempotency** | 🟡 Medium | **BookingReminderJob not idempotent; retry risk** | Medium | 1-2 |
| **3** | Phase 1 | **Schema** | 🟡 Medium | **Callback-driven side effects in models** | Medium | 1-2 |
| **4** | Phase 4 | **Queue Design** | 🟡 Medium | **No priority queue separation** | Low | 0.5-1 |
| **5** | Phase 4 | **Reliability** | 🟡 Medium | **Silent failure in callback job enqueueing** | Low | 0.5 |
| **6** | Phase 3 | **Query Performance** | 🟡 Medium | **Potential N+1 in GraphQL resolvers** | Medium | 1-2 |
| **7** | Phase 3 | **Error Handling** | 🟡 Medium | **Generic error handling may leak internals** | Low | 0.5-1 |
| **8** | Phase 1 | **Schema** | 🟢 Low | **vendor_profiles.service_categories as CSV** | Medium | 1 |
| **9** | Phase 2 | **Value Objects** | 🟢 Low | **Numeric metrics lack semantic value objects** | Low | 1 |

---

## RECOMMENDED REFACTOR SEQUENCE

**Week 1** (High Impact):
1. **Implement Pundit policies** for authorization (Issue #1) — 2 days
2. **Harden BookingReminderJob idempotency** (Issue #2) — 1 day
3. **Extract callback orchestration** (Issue #3) — 2 days

**Week 2** (Medium Impact):
4. **Add queue priority separation** (Issue #4) — 0.5 days
5. **Fix callback job enqueueing** (Issue #5) — 0.5 days
6. **Add GraphQL loaders** (Issue #6) — 1 day
7. **Standardize error handling** (Issue #7) — 1 day

**Later** (Low Priority):
8. Migrate `service_categories` to join table (Issue #8)
9. Create `ResponseTime` value object (Issue #9)

---

## TECHNICAL DEBT SNAPSHOT

- **Callback Debt**: Low (only 3 callbacks across codebase)
- **Auth Debt**: Medium (no centralized policy layer)
- **Job Reliability Debt**: Medium (idempotency gaps)
- **Query Debt**: Low-Medium (potential N+1 in GraphQL)

**Total Refactor Estimate**: 8-10 days of focused work
**Post-Refactor Health Target**: 9.2/10

