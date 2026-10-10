# Sidekiq Queue Priority Configuration

**Date**: March 14, 2026
**Configuration Version**: 1.0

## Overview

This document describes the Sidekiq queue priority configuration for the Ayoj marketplace. Queue prioritization ensures that critical operations (like authentication and urgent notifications) are processed before background tasks (like image processing and stats calculation).

---

## Queue Structure

### Three-Tier Queue System

```
┌─────────────────────────────────────────────┐
│ CRITICAL (Weight: 3)                        │
│ • Authentication jobs                       │
│ • Payment processing                        │
│ • Urgent system notifications               │
│ (3x processing power vs default/low)        │
└─────────────────────────────────────────────┘
                     ↑
           (highest priority)
                     ↑
┌─────────────────────────────────────────────┐
│ DEFAULT (Weight: 1)                         │
│ • Booking notifications                     │
│ • Review notifications                      │
│ • Email notifications                       │
│ • Standard messaging                        │
└─────────────────────────────────────────────┘
                     ↑
                     ↑
┌─────────────────────────────────────────────┐
│ LOW (Weight: 1)                             │
│ • Vendor trust stats recalculation          │
│ • Image processing                          │
│ • Analytics and reporting                   │
│ • Portfolio image generation                │
│ (lowest priority, background work)          │
└─────────────────────────────────────────────┘
```

---

## Job Assignments

### Critical Queue
Currently not assigned any jobs (reserved for future authentication/payment work).

### Default Queue (Standard Priority)
```ruby
# Notification-related jobs
NotificationJob
  - Booking notifications (created, approved, rejected, cancelled)
  - Booking reminders
  - Message notifications
```

### Low Queue (Background Priority)
```ruby
# Batch and background jobs
BookingReminderJob         # Scheduled batch job
RecalculateVendorTrustStatsJob  # Stats recalculation
ImageProcessingJob         # Image variant generation
```

---

## Configuration Files

### config/sidekiq.yml

Main Sidekiq configuration with queue definitions:

```yaml
:queues:
  - [critical, 3]   # Weight 3: 3x the processing power
  - [default, 1]    # Weight 1: standard jobs
  - [low, 1]        # Weight 1: background jobs
```

**Weight Explanation**:
- Weight 3 means "critical" queue will be checked 3 times more frequently than "default" or "low"
- With 10 concurrent workers:
  - ~6 workers focus on critical
  - ~2 workers focus on default
  - ~2 workers focus on low
- This ratio prevents low-priority jobs from blocking high-priority work

---

## Running Sidekiq

### Development

```bash
# Start Sidekiq with proper queue priority
bundle exec sidekiq -c 10 -q critical,3 -q default,1 -q low,1

# Or with verbose logging
bundle exec sidekiq -c 10 -q critical,3 -q default,1 -q low,1 -v
```

### Production

Update your Procfile or systemd service:

```yaml
# Procfile
sidekiq: bundle exec sidekiq -c 10 -q critical,3 -q default,1 -q low,1
```

Or as a systemd service unit:

```ini
[Unit]
Description=Sidekiq job processor
After=network.target redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/www-data/app
ExecStart=/usr/local/bin/bundle exec sidekiq -c 10 -q critical,3 -q default,1 -q low,1
Restart=always

[Install]
WantedBy=multi-user.target
```

### Docker

In your docker-compose.yml:

```yaml
services:
  sidekiq:
    build: .
    command: bundle exec sidekiq -c 10 -q critical,3 -q default,1 -q low,1
    depends_on:
      - db
      - redis
    environment:
      - REDIS_URL=redis://redis:6379/1
```

---

## Job Class Queue Assignment

### How to Specify Queue in a Job

```ruby
class MyJob < ApplicationJob
  queue_as :low  # or :default, or :critical

  def perform(*args)
    # Job logic
  end
end
```

### Or with Sidekiq::Job

```ruby
class MyJob
  include Sidekiq::Job

  sidekiq_options queue: 'low', retry: 3

  def perform(*args)
    # Job logic
  end
end
```

---

## Adding New Jobs

When creating a new background job, decide its priority:

### Decision Matrix

| Job Type | Priority | Queue | Reasoning |
|----------|----------|-------|-----------|
| Authentication, payments, security | Critical | critical | Must be processed immediately |
| User notifications, messages | Default | default | Important but can wait seconds |
| Stats recalc, analytics, cleanup | Low | low | Can wait minutes to hours |

### Example

```ruby
# High priority notification
class UrgentNotificationJob < ApplicationJob
  queue_as :critical  # Urgent, user-facing

  def perform(user_id)
    # Send urgent notification
  end
end

# Standard notification
class BookingConfirmationJob < ApplicationJob
  queue_as :default  # Important, but standard priority

  def perform(booking_id)
    # Send booking confirmation
  end
end

# Background processing
class GenerateAnalyticsJob < ApplicationJob
  queue_as :low  # Can run anytime

  def perform(date_range)
    # Generate analytics report
  end
end
```

---

## Monitoring

### Check Queue Sizes

```ruby
# In Rails console
Sidekiq::Queue.new('critical').size
Sidekiq::Queue.new('default').size
Sidekiq::Queue.new('low').size

# Or total
Sidekiq::Stats.new.total_size
```

### Monitor Job Processing

```bash
# In another terminal, watch Sidekiq
watch -n 1 'redis-cli INFO stats'

# Or use Sidekiq Web UI (if enabled)
# http://localhost:3000/sidekiq
```

### Redis Memory Usage

```bash
redis-cli INFO memory
redis-cli DBSIZE
```

---

## Best Practices

✅ **DO**:
- Assign appropriate queue to each job based on priority
- Monitor queue sizes regularly
- Document why a job uses a specific queue
- Test with realistic job volumes
- Use idempotent jobs (can be retried safely)

❌ **DON'T**:
- Put all jobs in critical queue (defeats purpose of priority)
- Create jobs that block for long periods
- Ignore queue monitoring
- Process jobs synchronously when async is appropriate
- Forget error handling in jobs

---

## Performance Tuning

### Concurrency Settings

```yaml
# config/sidekiq.yml
:production:
  :concurrency: 10  # Default
  # Adjust based on:
  # - CPU cores available
  # - Memory per worker (~50MB each)
  # - Type of work (I/O vs CPU)
```

### For High-Traffic Scenarios

```bash
# More workers for I/O-bound jobs
bundle exec sidekiq -c 25 -q critical,5 -q default,3 -q low,2

# Fewer workers for CPU-bound jobs
bundle exec sidekiq -c 5 -q critical,3 -q default,1 -q low,1
```

### Timeout Settings

```yaml
:production:
  :timeout: 25  # seconds per job
  # Adjust for long-running jobs:
  # - 8 hours for reporting: 28800
  # - 1 hour for processing: 3600
  # - 25 seconds for standard: 25
```

---

## Troubleshooting

### Jobs Not Processing

1. Check if Sidekiq is running:
   ```bash
   ps aux | grep sidekiq
   ```

2. Check Redis connection:
   ```bash
   redis-cli ping  # Should return PONG
   ```

3. Check queue configuration:
   ```ruby
   Sidekiq::Queue.new('default').each { |job| puts job }
   ```

4. Check job dead-letter queue:
   ```ruby
   Sidekiq::DeadSet.new.size
   ```

### Queue Blocking

If low-priority jobs are blocking:

1. Increase critical/default weight:
   ```bash
   bundle exec sidekiq -c 20 -q critical,10 -q default,5 -q low,1
   ```

2. Separate Sidekiq processes:
   ```bash
   # Process 1: Critical and default only
   bundle exec sidekiq -c 10 -q critical,3 -q default,1

   # Process 2: Low priority
   bundle exec sidekiq -c 5 -q low
   ```

### Memory Issues

If memory usage is high:

1. Reduce concurrency:
   ```bash
   bundle exec sidekiq -c 5 -q critical,3 -q default,1 -q low,1
   ```

2. Increase timeout to fail fast:
   ```yaml
   :timeout: 15
   ```

3. Monitor with:
   ```bash
   watch -n 5 'redis-cli INFO stats; echo; redis-cli INFO memory'
   ```

---

## Migration from Old Configuration

If you previously had a single queue:

```ruby
# Old approach (single queue, all jobs mixed)
queue_as :default  # Everything in one queue

# New approach (prioritized queues)
queue_as :critical   # Or :default, or :low based on priority
```

**Action Items**:
1. ✅ Add `config/sidekiq.yml` with queue definitions
2. ✅ Assign queues to all existing jobs
3. ✅ Restart Sidekiq with new queue configuration
4. ✅ Monitor queue sizes to verify proper distribution
5. ✅ Adjust weights based on observed processing patterns

---

## Scaling Strategy

### Single Sidekiq Process (Development)

```bash
bundle exec sidekiq -c 5 -q critical,3 -q default,1 -q low,1
```

### Multiple Sidekiq Processes (Production)

```bash
# Process 1: Critical jobs (always responsive)
bundle exec sidekiq -c 5 -q critical -p sidekiq1 &

# Process 2: Standard jobs
bundle exec sidekiq -c 5 -q default -p sidekiq2 &

# Process 3: Low-priority background work
bundle exec sidekiq -c 5 -q low -p sidekiq3 &
```

### With Load Balancer (High Traffic)

```bash
# Scale critical processing
bundle exec sidekiq -c 10 -q critical -p critical &

# Scale standard notifications
bundle exec sidekiq -c 5 -q default -p default &

# Scale background work
bundle exec sidekiq -c 3 -q low -p low &
```

---

## References

- [Sidekiq Queue Documentation](https://github.com/sidekiq/sidekiq/wiki/Advanced-Options#queues)
- [Job Scheduling Best Practices](https://github.com/sidekiq/sidekiq/wiki/Reliable-Fetches)
- [Redis Configuration](https://redis.io/topics/config)

