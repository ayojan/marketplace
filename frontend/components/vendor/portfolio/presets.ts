import type { PortfolioItemType } from './types';

export const DEFAULT_CATEGORIES: string[] = [
  'Weddings',
  'Pre-Wedding',
  'Candid & Moments',
  'Portraits & Bridal',
  'Traditional Rituals',
  'Cinematography',
  'Venues & Decor'
];

export const INITIAL_SHOWCASES: PortfolioItemType[] = [
  {
    id: 's-1',
    title: 'Royal Destination Wedding at Taj Lake Palace',
    category: 'Weddings',
    description: 'Heritage palace celebration in Udaipur capturing grand pheras under the mandap, night illuminations, and royal guest entries.',
    is_featured: true,
    image_count: 4,
    created_at: '2026-03-12',
    images: [
      {
        id: 'img-101',
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
        filename: 'royal_mandap_udaipur.jpg'
      },
      {
        id: 'img-102',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        filename: 'sangeet_dance_moments.jpg'
      },
      {
        id: 'img-103',
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
        filename: 'sunset_varmala_exchange.jpg'
      },
      {
        id: 'img-104',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        filename: 'candid_couple_laughter.jpg'
      }
    ]
  },
  {
    id: 's-2',
    title: 'Sunset Editorial Pre-Wedding in South Goa',
    category: 'Pre-Wedding',
    description: 'Bespoke golden hour portraits along coastal cliffs and heritage Portuguese villas with soft natural lighting and candid laughter.',
    is_featured: true,
    image_count: 3,
    created_at: '2026-03-24',
    images: [
      {
        id: 'img-201',
        url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=400&q=80',
        filename: 'goa_sunset_cliffs.jpg'
      },
      {
        id: 'img-202',
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
        filename: 'heritage_villa_walk.jpg'
      },
      {
        id: 'img-203',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
        filename: 'beachfront_candid_twilight.jpg'
      }
    ]
  },
  {
    id: 's-3',
    title: 'Vibrant Haldi & Sangeet Celebrations',
    category: 'Traditional Rituals',
    description: 'High-energy cultural joy, marigold floral showers, family performances, and authentic emotion preserved in rich color fidelity.',
    is_featured: false,
    image_count: 3,
    created_at: '2026-04-02',
    images: [
      {
        id: 'img-301',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
        filename: 'marigold_haldi_splash.jpg'
      },
      {
        id: 'img-302',
        url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=400&q=80',
        filename: 'sangeet_stage_lights.jpg'
      },
      {
        id: 'img-303',
        url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80',
        filename: 'mehendi_hands_detail.jpg'
      }
    ]
  },
  {
    id: 's-4',
    title: 'Bridal Couture & Fine Art Portraits',
    category: 'Portraits & Bridal',
    description: 'Intricate zardozi embroidery, heritage jewellery styling, and editorial close-ups designed for magazine features.',
    is_featured: false,
    image_count: 2,
    created_at: '2026-04-10',
    images: [
      {
        id: 'img-401',
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
        filename: 'bridal_lehenga_veil.jpg'
      },
      {
        id: 'img-402',
        url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
        thumbnail_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=400&q=80',
        filename: 'kundan_jewellery_portrait.jpg'
      }
    ]
  }
];
