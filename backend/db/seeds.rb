# frozen_string_literal: true

puts "🚀 Starting Ayoj database seeding..."

# 1. Seed Categories
puts "--- Seeding Categories ---"
categories_data = [
  { name: 'Photography', slug: 'photography', icon: 'Camera', description: 'Candid, traditional, and portrait photography' },
  { name: 'Videography', slug: 'videography', icon: 'Video', description: 'Cinematic wedding films and teaser trailers' },
  { name: 'Makeup Artist', slug: 'makeup-artist', icon: 'Brush', description: 'Bridal makeup, hair styling, and beauty services' },
  { name: 'Decorator', slug: 'decorator', icon: 'Flower2', description: 'Stage decor, floral arrangements, and venue styling' },
  { name: 'Event Planner', slug: 'event-planner', icon: 'Sparkles', description: 'End-to-end wedding and corporate event planning' }
]

categories = categories_data.map do |cat_data|
  Category.find_or_create_by!(slug: cat_data[:slug]) do |c|
    c.name = cat_data[:name]
    c.icon = cat_data[:icon]
    c.description = cat_data[:description]
    c.active = true
  end
end
puts "Total categories: #{Category.count}"

# 2. Seed Admin User
puts "--- Creating Admin User ---"
admin = User.find_or_create_by!(email: 'admin@example.com') do |u|
  u.first_name = 'Ayoj'
  u.last_name = 'Admin'
  u.password = 'password123'
  u.password_confirmation = 'password123'
  u.role = :admin
  u.confirmed_at = Time.current
end

# 3. Seed Customers
puts "--- Creating Customers ---"
customer_data = [
  { first_name: 'Priya', last_name: 'Verma', email: 'priya@example.com', phone: '+91 98765 43210', location: 'Delhi NCR' },
  { first_name: 'Rahul', last_name: 'Sharma', email: 'customer1@example.com', phone: '+91 98765 43211', location: 'Mumbai' },
  { first_name: 'Anjali', last_name: 'Gupta', email: 'customer2@example.com', phone: '+91 98765 43212', location: 'Gurgaon' }
]

customers = customer_data.map do |c_data|
  user = User.find_or_create_by!(email: c_data[:email]) do |u|
    u.first_name = c_data[:first_name]
    u.last_name = c_data[:last_name]
    u.password = 'password123'
    u.password_confirmation = 'password123'
    u.role = :customer
    u.confirmed_at = Time.current
  end

  profile = user.customer_profile || user.create_customer_profile!
  profile.update!(
    phone: c_data[:phone],
    location: c_data[:location],
    preferences: 'Interested in candid photography and airbrush bridal makeup.'
  )
  user
end

# 4. Seed Vendors
puts "--- Creating Vendors ---"
vendors_info = [
  {
    email: 'vendor1@example.com',
    first_name: 'Aarav',
    last_name: 'Mehra',
    business_name: 'The Wedding Narratives',
    location: 'Delhi NCR',
    category: categories[0], # Photography
    experience: 8,
    rating: 4.9,
    reviews_count: 320,
    price: 50000,
    description: 'Premier wedding photography studio specializing in timeless candid moments and traditional rituals.'
  },
  {
    email: 'vendor2@example.com',
    first_name: 'Meera',
    last_name: 'Kapoor',
    business_name: 'Meera Makeovers',
    location: 'Gurgaon',
    category: categories[2], # Makeup
    experience: 6,
    rating: 4.8,
    reviews_count: 214,
    price: 15000,
    description: 'HD Airbrush bridal makeup specialist giving brides flawless, radiant looks for their special day.'
  },
  {
    email: 'vendor3@example.com',
    first_name: 'Siddharth',
    last_name: 'Roy',
    business_name: 'Eventica Decor',
    location: 'Delhi NCR',
    category: categories[3], # Decorator
    experience: 10,
    rating: 4.9,
    reviews_count: 189,
    price: 100000,
    description: 'Bespoke event and wedding stage decorators creating grand floral setups and royal entrance mandaps.'
  }
]

vendor_profiles = []

vendors_info.each do |v_data|
  user = User.find_or_create_by!(email: v_data[:email]) do |u|
    u.first_name = v_data[:first_name]
    u.last_name = v_data[:last_name]
    u.password = 'password123'
    u.password_confirmation = 'password123'
    u.role = :vendor
    u.confirmed_at = Time.current
  end

  profile = user.vendor_profile || user.create_vendor_profile!(business_name: v_data[:business_name])
  profile.update!(
    business_name: v_data[:business_name],
    location: v_data[:location],
    description: v_data[:description],
    years_experience: v_data[:experience],
    verification_status: :verified,
    verified_at: Time.current,
    phone: '+91 98111 22334',
    average_rating: v_data[:rating],
    total_reviews: v_data[:reviews_count]
  )

  # Create Services for vendor
  service = Service.find_or_create_by!(name: "#{v_data[:business_name]} Signature Package", vendor_profile: profile) do |s|
    s.description = v_data[:description]
    s.base_price = v_data[:price]
    s.pricing_type = :package
    s.status = :active
  end
  service.categories << v_data[:category] unless service.categories.include?(v_data[:category])

  # Create Availability Slots (up to 90 days ahead)
  (0..90).each do |day_offset|
    AvailabilitySlot.find_or_create_by!(
      vendor_profile: profile,
      date: Date.current + day_offset.days
    ) do |slot|
      slot.start_time = "10:00"
      slot.end_time = "18:00"
      slot.is_available = true
    end
  end

  # Create Portfolio Items
  PortfolioItem.find_or_create_by!(title: "#{v_data[:business_name]} Highlights", vendor_profile: profile) do |p|
    p.category = v_data[:category].name
    p.description = "Best moments captured by #{v_data[:business_name]}."
    p.is_featured = true
    p.display_order = 1
  end

  vendor_profiles << profile
end

# 5. Seed Customer Favorites
puts "--- Creating Customer Favorites ---"
priya_user = customers[0]
CustomerFavorite.find_or_create_by!(user: priya_user, vendor_profile: vendor_profiles[0])
CustomerFavorite.find_or_create_by!(user: priya_user, vendor_profile: vendor_profiles[1])

# 6. Seed Checklist Items
puts "--- Creating Checklist Items ---"
default_tasks = [
  'Book Wedding Photographer',
  'Book Bridal Makeup Artist',
  'Finalize Stage Decorator & Theme',
  'Reserve Catering Service Package',
  'Hire DJ & Entertainment Crew'
]

default_tasks.each_with_index do |task_title, idx|
  ChecklistItem.find_or_create_by!(user: priya_user, title: task_title) do |item|
    item.completed = (idx < 2)
  end
end

# 7. Seed Notifications
puts "--- Creating In-App Notifications ---"
InAppNotification.create_notification(
  user_id: priya_user.id,
  title: 'Booking Confirmed!',
  message: 'The Wedding Narratives confirmed your session reservation.',
  notification_type: 'booking_accepted'
)

puts "✅ Seeding complete!"
puts ""
puts "========================================================"
puts "  DEMO LOGINS & CREDENTIALS FOR TESTING AYOJ MARKETPLACE"
puts "========================================================"
puts ""
puts "  Role       | Email                   | Password"
puts "  -----------|-------------------------|------------"
puts "  CUSTOMER   | priya@example.com       | password123"
puts "  CUSTOMER   | customer1@example.com   | password123"
puts "  VENDOR     | vendor1@example.com     | password123"
puts "  VENDOR     | vendor2@example.com     | password123"
puts "  ADMIN      | admin@example.com       | password123"
puts ""
puts "========================================================"
