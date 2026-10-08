export interface MockVendor {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  rating: number;
  total_reviews: number;
  base_price: number;
  image: string;
  verified: boolean;
  revenue_stats: {
    total_revenue: number;
    monthly_growth: string;
    pending_payout: number;
  };
  overview: {
    total_bookings: number;
    active_services: number;
    average_rating: string;
  };
  services: Array<{
    id: string;
    name: string;
    category: string;
    formatted_price: string;
    base_price: number;
    pricing_type: string;
    description: string;
    duration: string;
  }>;
  recent_activity: Array<{
    id: string;
    customer: string;
    type: 'booking' | 'review';
    title: string;
    date: string;
    amount?: string;
    status?: 'Confirmed' | 'Pending' | 'Completed';
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    image_url: string;
    category: string;
  }>;
}

export const MOCK_VENDORS: MockVendor[] = [
  {
    id: '1',
    business_name: 'The Wedding Narratives',
    owner_name: 'Aarav Sharma',
    email: 'contact@weddingnarratives.in',
    phone: '+91 98765 43210',
    category: 'Photographers',
    location: 'Delhi NCR',
    rating: 4.9,
    total_reviews: 320,
    base_price: 50000,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    verified: true,
    revenue_stats: {
      total_revenue: 145000,
      monthly_growth: '+18.4%',
      pending_payout: 35000,
    },
    overview: {
      total_bookings: 28,
      active_services: 3,
      average_rating: '4.9',
    },
    services: [
      {
        id: 's1',
        name: 'Full Day Traditional & Candid Wedding Coverage',
        category: 'Photographers',
        formatted_price: '₹85,000 / day',
        base_price: 85000,
        pricing_type: 'Full Package',
        description: 'Complete 2-day team coverage with 2 candid photographers and 1 traditional cinematographer.',
        duration: '2 Days',
      },
      {
        id: 's2',
        name: 'Cinematic Pre-Wedding Shoot & Film',
        category: 'Photographers',
        formatted_price: '₹45,000 / session',
        base_price: 45000,
        pricing_type: 'Full Package',
        description: 'Drone footage, 3 dress changes, and edited 3-minute teaser reel.',
        duration: '1 Day',
      },
      {
        id: 's3',
        name: 'Engagement & Ring Ceremony Highlights',
        category: 'Photographers',
        formatted_price: '₹35,000 / event',
        base_price: 35000,
        pricing_type: 'Hourly Rate',
        description: 'Same-day photo slideshow and high-resolution digital gallery.',
        duration: '6 Hours',
      },
    ],
    recent_activity: [
      {
        id: 'a1',
        customer: 'Priya & Rahul',
        type: 'booking',
        title: 'Grand Wedding Session - Oberoi Sukhvilas',
        date: '2 hours ago',
        amount: '₹85,000',
        status: 'Confirmed',
      },
      {
        id: 'a2',
        customer: 'Ananya Verma',
        type: 'review',
        title: 'Left 5-star review: "Breathtaking candid photos and team!"',
        date: 'Yesterday',
      },
      {
        id: 'a3',
        customer: 'Kabir & Simran',
        type: 'booking',
        title: 'Pre-Wedding Film Shoot - Neemrana Fort',
        date: '3 days ago',
        amount: '₹45,000',
        status: 'Pending',
      },
    ],
    portfolio: [
      {
        id: 'p1',
        title: 'Royal Destination Wedding - Udaipur',
        image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
        category: 'Wedding',
      },
      {
        id: 'p2',
        title: 'Sangeet Night Celebration',
        image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        category: 'Events',
      },
      {
        id: 'p3',
        title: 'Sunset Pre-Wedding Portrait',
        image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        category: 'Pre-Wedding',
      },
    ],
  },
  {
    id: '2',
    business_name: 'Meera Makeovers',
    owner_name: 'Meera Kapoor',
    email: 'meera@meeramakeovers.com',
    phone: '+91 98112 34567',
    category: 'Makeup Artists',
    location: 'Gurgaon',
    rating: 4.8,
    total_reviews: 214,
    base_price: 15000,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    verified: true,
    revenue_stats: {
      total_revenue: 92000,
      monthly_growth: '+14.2%',
      pending_payout: 22000,
    },
    overview: {
      total_bookings: 19,
      active_services: 3,
      average_rating: '4.8',
    },
    services: [
      {
        id: 's4',
        name: 'HD Airbrush Bridal Makeup & Hair Styling',
        category: 'Makeup Artists',
        formatted_price: '₹25,000 / makeover',
        base_price: 25000,
        pricing_type: 'Custom Quote',
        description: 'Includes trial makeup, luxury lash extensions, and saree/dupatta draping.',
        duration: '4 Hours',
      },
      {
        id: 's5',
        name: 'Party & Reception Glam Makeover',
        category: 'Makeup Artists',
        formatted_price: '₹15,000 / person',
        base_price: 15000,
        pricing_type: 'Hourly Rate',
        description: 'Soft glam party makeup with hair styling for bridesmaids.',
        duration: '2 Hours',
      },
    ],
    recent_activity: [
      {
        id: 'a4',
        customer: 'Rhea Mehta',
        type: 'booking',
        title: 'Bridal Makeup Session - Gurgaon DLF',
        date: '5 hours ago',
        amount: '₹25,000',
        status: 'Confirmed',
      },
      {
        id: 'a5',
        customer: 'Siddhi Shah',
        type: 'review',
        title: 'Left 5-star review: "Flawless HD airbrush makeup!"',
        date: '2 days ago',
      },
    ],
    portfolio: [
      {
        id: 'p4',
        title: 'Classic Red Royal Bride',
        image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        category: 'Bridal',
      },
      {
        id: 'p5',
        title: 'Pastel Glow Sangeet Look',
        image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
        category: 'Party',
      },
    ],
  },
];
