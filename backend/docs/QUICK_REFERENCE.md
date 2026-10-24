# Quick Reference: Clean Architecture Layers

## The 4 Layers (Bottom to Top)

### 1️⃣ MODEL LAYER (Lean)
**File:** `app/models/booking.rb`
**Size:** < 50 LOC
**Responsibility:** Data integrity only
```ruby
# ✅ DO
validates :event_date, presence: true
scope :cancellable, -> { where(status: %i[pending accepted]).where('event_date > ?', 24.hours.from_now) }
def can_be_cancelled?; cancellable?; end

# ❌ DON'T
validate :complex_business_logic  # Move to domain service
```

### 2️⃣ QUERY OBJECTS LAYER (SRP)
**File:** `app/models/queries/booking_conflicts_query.rb`
**Size:** < 20 LOC
**Responsibility:** Single query, reusable everywhere
```ruby
class BookingConflictsQuery
  def self.call(vendor_profile:, event_date:, event_end_date:)
    # Pure Ruby, no Rails dependencies
    # Used by: Model scopes, domain services, controllers, GraphQL
  end
end
```

### 3️⃣ DOMAIN LAYER (Rich)
**File:** `app/domain/bookings/validate.rb`
**Size:** < 40 LOC
**Responsibility:** Business logic, framework-independent
```ruby
class Bookings::Validate
  def self.call(booking:)
    # Calls query objects
    # Returns error messages
    # Testable without Rails
  end
end
```

### 4️⃣ HTTP LAYER (Thin)
**File:** `app/controllers/bookings_controller.rb`
**Responsibility:** Request/response handling only
```ruby
def create
  booking = @user.bookings.build(booking_params)
  errors = Bookings::Validate.call(booking: booking)  # ← Domain service

  if errors.empty?
    booking.save && render_success
  else
    render_errors(errors)
  end
end
```

---

## When to Use Each Layer

| Task | Layer | Example |
|------|-------|---------|
| **Add basic validation** | Model | `validates :event_date, presence: true` |
| **Add state predicate** | Model | `scope :cancellable` |
| **Write reusable query** | Query Object | `BookingConflictsQuery` |
| **Complex validation** | Domain Service | `Bookings::Validate.call` |
| **State transitions** | Domain Service | `Bookings::StateMachine` |
| **Authorization** | Domain Service | `Bookings::AuthorizeAccess` |
| **HTTP response** | Controller | `render_created`, `render_errors` |

---

## Dependency Flow (One Direction Only)

```
HTTP Layer
    ↓
Domain Layer
    ↓
Query Objects
    ↓
Models
    ↓
Database
```

**Rule:** Lower layers never call higher layers

---

## Code Examples

### ❌ WRONG: Complex Logic in Model
```ruby
class Booking < ApplicationRecord
  validate :vendor_availability, on: :create

  private

  def vendor_availability
    # 20 lines of complex business logic
    # Hard to test, hard to reuse
  end
end
```

### ✅ RIGHT: Logic in Domain Service
```ruby
# Model (5 LOC)
class Booking < ApplicationRecord
  validate :event_date_in_future, on: :create
end

# Domain Service (25 LOC)
class Bookings::Validate
  def call
    errors = []
    errors << validate_vendor_availability
    errors << validate_no_conflicts
    errors.compact
  end
end

# Controller (10 LOC)
def create
  booking = @user.bookings.build(booking_params)
  errors = Bookings::Validate.call(booking: booking)

  if errors.empty?
    booking.save && render_success
  else
    render_errors(errors)
  end
end
```

---

## Adding New Features

### Step 1: Add Model Scope
```ruby
# app/models/booking.rb
scope :past, -> { where('event_date < ?', Time.current) }
```

### Step 2: Add Query Object (if complex)
```ruby
# app/models/queries/past_bookings_query.rb
class PastBookingsQuery
  def self.call(vendor_profile:)
    Booking.for_vendor_profile(vendor_profile).past
  end
end
```

### Step 3: Add Domain Service (if business logic)
```ruby
# app/domain/bookings/calculate_stats.rb
class Bookings::CalculateStats
  def self.call(bookings:)
    {
      total: bookings.count,
      completed: bookings.completed.count,
      cancelled: bookings.cancelled.count
    }
  end
end
```

### Step 4: Use in Controller
```ruby
# app/controllers/api/bookings_controller.rb
def stats
  bookings = Bookings::ScopeForUser.call(user: current_user)
  stats = Bookings::CalculateStats.call(bookings: bookings)
  render_success(stats)
end
```

---

## Testing Each Layer

### Model Tests
```ruby
describe Booking do
  it { should validate_presence_of(:event_date) }
  it { expect(booking.can_be_cancelled?).to eq(true) }
end
```

### Query Tests
```ruby
describe BookingConflictsQuery do
  it { expect(BookingConflictsQuery.call(v, d, e)).to eq(false) }
end
```

### Domain Service Tests
```ruby
describe Bookings::Validate do
  it { expect(Bookings::Validate.call(booking:)).to be_empty }
end
```

### Controller Tests
```ruby
describe Api::BookingsController do
  it { expect(post :create, params: {booking: {...}}).to have_http_status(:created) }
end
```

---

## Size Guidelines

| Layer | Ideal Size | Max Size | If Bigger |
|-------|-----------|----------|-----------|
| Model | 30-50 LOC | 100 LOC | Move logic to domain |
| Query | 10-20 LOC | 30 LOC | Split into 2 queries |
| Domain Service | 20-40 LOC | 60 LOC | Compose multiple services |
| Controller Method | 10-15 LOC | 25 LOC | Extract to service |

---

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Complex logic in model | Move to `Bookings::Validate` |
| Duplicate queries (3 places) | Create `BookingConflictsQuery` |
| Authorization in controller | Move to `Bookings::AuthorizeAccess` |
| Scattered state rules | Create `Bookings::StateMachine` |
| Fat validation method | Split into `Bookings::Validate` |
| Hard to test code | Use query objects & services |
| HTTP logic in model | Move to controller/concern |

---

## File Locations

```
app/
├── models/
│   ├── booking.rb                          # Lean model
│   └── queries/
│       └── booking_conflicts_query.rb      # Query object
├── domain/
│   └── bookings/
│       ├── validate.rb                     # Validation service
│       ├── state_machine.rb                # State machine
│       ├── authorize_access.rb             # Authorization
│       └── send_message.rb                 # Message service
└── controllers/
    └── bookings_controller.rb              # Thin HTTP handler
```

---

## Checklist: Adding New Validation

- [ ] Is it just a format check? → Add to **Model**
- [ ] Is it complex logic? → Create **Query Object**
- [ ] Does it involve multiple validations? → Create **Domain Service**
- [ ] Is it about state rules? → Use **StateMachine**
- [ ] Need to call it from multiple places? → Use **Query Object** or **Service**

---

## Performance Tips

- **Query Objects:** Cache results if called multiple times
- **Domain Services:** Keep minimal, delegate to models/queries
- **Models:** Use database indexes for scopes
- **Controllers:** Eager load associations before passing to services

---

## When to Refactor

- **Model > 100 LOC** → Extract logic to domain services
- **Same query in 2+ places** → Extract to query object
- **Service > 60 LOC** → Compose multiple smaller services
- **Controller method > 25 LOC** → Extract to service or concern helper

---

## Reading Code

1. **Find what you need:** Start with HTTP layer (controller)
2. **Find business logic:** Look in domain layer
3. **Find queries:** Look in query objects
4. **Find associations:** Look in models

**Reverse Engineering:**
```
Controller.create
  ↓ calls
Bookings::Validate.call(booking:)
  ↓ uses
BookingConflictsQuery.call(...)
  ↓ uses
Booking.overlapping_period(...)
  ↓ returns results
```

---

## Key Principle

> **Each layer does ONE thing and does it well.**

- Model = Data integrity
- Query = Fetch data
- Domain = Business logic
- Controller = HTTP handling

---

## Questions to Ask

**"Should this code go in the model?"**
- Is it a data validation? YES → Model
- Is it a state predicate? YES → Model scope
- Is it business logic? NO → Domain service

**"Should this be a query object?"**
- Is it a complex query? YES → Query object
- Will I use it in multiple places? YES → Query object
- Is it pure Ruby? YES → Query object

**"Should this be a domain service?"**
- Is it business logic? YES → Domain service
- Does it orchestrate multiple operations? YES → Domain service
- Is it framework-independent? YES → Domain service

**"Should this be in the controller?"**
- Is it HTTP-specific? YES → Controller
- Is it request/response handling? YES → Controller
- Is it authentication/authorization? YES → Controller (or use service)

---

## Remember

✅ **Lean models**
✅ **Reusable queries**
✅ **Rich domain services**
✅ **Thin controllers**
✅ **Clear responsibilities**
✅ **No duplication**
✅ **Easy to test**

You're following clean architecture principles! 🎯
