# Controller Layer - Quick Reference Guide

## The 5 Controller Concerns

### 1. **JsonResponse** - Consistent JSON Responses
Location: `app/controllers/concerns/json_response.rb`

```ruby
# Success responses
render_success(data, message, :ok)        # 200
render_created(data, message)             # 201

# Error responses
render_errors(errors, status)             # 422 (default)
render_bad_request(message)               # 400
render_unauthorized(message)              # 401
render_forbidden(message)                 # 403
render_not_found(resource)                # 404
render_conflict(message)                  # 409

# Pagination
render_paginated(records, presenter_class, message)
```

---

### 2. **AuthorizeAction** - Authorization Checks
Location: `app/controllers/concerns/authorize_action.rb`

```ruby
# Check authorization, render error if unauthorized
authorize_action(@booking, :access)           # → true/false
authorize_action!(@booking, :modify)          # → true or renders error

# Check specific states
require_cancellable_booking!(@booking)        # → true or renders error
require_modifiable_booking!(@booking)         # → true or renders error
```

**Usage:**
```ruby
def update
  return unless authorize_action(@booking, :modify)
  # Continue with update logic
end
```

---

### 3. **ResourceFinder** - Find Resources & Handle 404
Location: `app/controllers/concerns/resource_finder.rb`

```ruby
# Generic resource finder
find_resource(Booking, params[:id])           # → resource or renders 404

# Specialized finders
find_booking_for_user(id)                     # → booking or renders 404
find_availability_slot(id)                    # → slot or renders 404

# Set instance variables
set_resource(Booking, :booking)               # Sets @booking or renders 404
```

**Usage:**
```ruby
def set_booking
  @booking = find_booking_for_user(params[:id])  # Handles 404
end

def show
  @booking = find_resource(Booking, params[:id]) or return
  # Continue
end
```

---

### 4. **ParseParams** - Safe Parameter Parsing
Location: `app/controllers/concerns/parse_params.rb`

```ruby
# Date/time parsing with error handling
date_params = parse_date_params            # → {date:, start_time:, end_time:} or renders 400

# Form-based validation
attrs = parse_booking_create_params        # → attributes or renders errors
attrs = parse_booking_update_params        # → attributes or renders errors

# Pagination with safe defaults
page_params = parse_pagination_params      # → {page: N, per_page: N}

# Filters
filters = parse_filter_params              # → {status:, date:, ...}
```

**Usage:**
```ruby
def create
  attrs = parse_booking_create_params or return
  booking = @user.bookings.build(attrs)
  # Continue
end
```

---

## Form Objects - Parameter Validation

### Bookings::CreateForm
Location: `app/forms/bookings/create_form.rb`

```ruby
result = Bookings::CreateForm.call(params[:booking])

if result.success?
  attrs = result.value.to_booking_attributes
else
  errors = result.errors  # {field: message}
end
```

**Validates:**
- service_id (required, integer)
- event_date (required)
- event_location (required, 3-255 chars)
- total_amount (required, > 0)
- event_duration (optional, max 100 chars)

### Bookings::UpdateForm
Same pattern as CreateForm but for updates (most fields optional)

---

## Complete Controller Pattern

### BEFORE (Mixed Concerns)
```ruby
class BookingsController < ApiController
  def create
    # Parameter handling
    booking = @user.bookings.build(params.require(:booking).permit(...))

    # Validation
    errors = booking.errors.full_messages
    if errors.any?
      render json: { errors: errors }, status: :unprocessable_content
      return
    end

    # Business logic
    booking.save

    # Response
    render json: { booking: booking.as_json }, status: :created
  end

  def update
    # Authorization check (repeated pattern)
    unless booking.customer == current_user && booking.can_be_modified?
      render json: { error: 'Cannot modify' }, status: :forbidden
      return
    end

    # Update and respond
    if booking.update(params.require(:booking).permit(...))
      render json: { booking: booking.as_json }
    else
      render json: { errors: booking.errors.full_messages }, status: :unprocessable_content
    end
  end
end
```

### AFTER (Thin Controller)
```ruby
class BookingsController < ApiController
  include JsonResponse
  include AuthorizeAction
  include ResourceFinder
  include ParseParams

  def create
    # 1. Validate params
    attrs = parse_booking_create_params or return

    # 2. Build and validate business rules
    booking = @user.bookings.build(attrs)
    errors = Bookings::Validate.call(booking: booking)
    return render_errors(errors) unless errors.empty?

    # 3. Save and respond
    booking.save
    render_created(BookingPresenter.new(booking).as_json)
  end

  def update
    # 1. Find resource
    @booking = find_booking_for_user(params[:id]) or return

    # 2. Authorize
    return unless authorize_action(@booking, :modify)

    # 3. Parse and update
    attrs = parse_booking_update_params or return
    @booking.update(attrs)

    # 4. Respond
    render_success(BookingPresenter.new(@booking).as_json)
  end
end
```

**Improvements:**
- 50% size reduction
- Clear flow
- Reusable concerns
- Easy to test

---

## Common Patterns

### Pattern 1: CRUD with Authorization
```ruby
def show
  @resource = find_booking_for_user(params[:id]) or return
  return unless authorize_action(@resource, :access)
  render_success(Presenter.new(@resource).as_json)
end

def update
  @resource = find_booking_for_user(params[:id]) or return
  return unless authorize_action(@resource, :modify)

  attrs = parse_booking_update_params or return
  @resource.update(attrs)
  render_success(Presenter.new(@resource).as_json)
end

def destroy
  @resource = find_booking_for_user(params[:id]) or return
  return unless require_cancellable_booking!(@resource)

  @resource.destroy
  render_success(nil, 'Deleted successfully')
end
```

### Pattern 2: List with Pagination
```ruby
def index
  scope = Bookings::ScopeForUser.call(user: current_user)
  page_params = parse_pagination_params

  bookings = scope.page(page_params[:page]).per(page_params[:per_page])
  render_paginated(bookings, BookingPresenter)
end
```

### Pattern 3: Create with Validation
```ruby
def create
  attrs = parse_booking_create_params or return

  resource = @user.bookings.build(attrs)
  errors = Bookings::Validate.call(booking: resource)
  return render_errors(errors) unless errors.empty?

  resource.save
  render_created(Presenter.new(resource).as_json, 'Created')
end
```

---

## Decision Tree: Which Concern?

```
Does controller need to...

├─ Send JSON responses?
│  └─ Use JsonResponse ✓
│
├─ Check authorization?
│  └─ Use AuthorizeAction ✓
│
├─ Find resources (with 404)?
│  └─ Use ResourceFinder ✓
│
├─ Parse parameters safely?
│  └─ Use ParseParams ✓
│
└─ All of the above?
   └─ Include all 4 concerns ✓
```

---

## File Structure

```
app/
├── forms/bookings/
│   ├── create_form.rb
│   └── update_form.rb
├── controllers/concerns/
│   ├── json_response.rb
│   ├── authorize_action.rb
│   ├── resource_finder.rb
│   ├── parse_params.rb
│   └── booking_management/
│       └── pagination_helper.rb
└── controllers/
    └── bookings_controller.rb
```

---

## Migration Checklist

When refactoring an existing controller:

- [ ] Add `include JsonResponse` for response handling
- [ ] Add `include AuthorizeAction` for authorization
- [ ] Add `include ResourceFinder` for finding resources
- [ ] Add `include ParseParams` for parameter parsing
- [ ] Replace `render json: {...}` with `render_*` methods
- [ ] Replace authorization checks with `authorize_action`
- [ ] Replace `Booking.find` with `find_booking_for_user`
- [ ] Replace parameter extraction with parse methods
- [ ] Test response formats match
- [ ] Verify all routes still work

---

## Size Reduction Example

| Component | Before | After | Change |
|-----------|--------|-------|--------|
| Authorization | 15 LOC × 3 | 5 LOC | -75% |
| Resource Finding | 5 LOC × N | 2 LOC | -60% |
| Parameter Parsing | 20 LOC | 2 LOC | -90% |
| Response Handling | 30+ LOC | 5 LOC | -85% |
| **Total Potential** | **100+ LOC** | **15 LOC** | **-85%** |

---

## Testing These Concerns

### Form Object Tests
```ruby
describe Bookings::CreateForm do
  it { expect(Bookings::CreateForm.call({...}).success?).to eq(true) }
end
```

### Concern Tests
```ruby
describe JsonResponse do
  it { render_success(data).should have_http_status(:ok) }
end
```

### Integration Tests
```ruby
it { post :create, params: {...} should have_http_status(:created) }
```

---

## Remember

✅ **Extract concerns** - Don't repeat patterns
✅ **Use form objects** - Validate early
✅ **Consistent responses** - Always use json_response helpers
✅ **DRY authorization** - Use authorize_action concern
✅ **Safe parsing** - Use parse_params concern
✅ **Thin controllers** - Delegate, don't duplicate

Result: Clean, maintainable, testable controllers! 🎯
