import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorProfile from '../pages/VendorProfile';
import { apiService } from '../../lib/api';
import { toast } from 'sonner';

let mockAuthUser = { id: 1, role: 'customer' };

jest.mock('../../lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: true,
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the API service
jest.mock('../../lib/api', () => ({
  apiService: {
    vendors: {
      getById: jest.fn(),
      getServices: jest.fn(),
      getPortfolio: jest.fn(),
      getReviews: jest.fn(),
      getAvailability: jest.fn().mockResolvedValue({ data: { availability_slots: [] } }),
    },
    favorites: {
      check: jest.fn().mockResolvedValue({ data: { is_favorite: false } }),
      add: jest.fn().mockResolvedValue({}),
      removeByVendor: jest.fn().mockResolvedValue({}),
    },
  },
}));

const mockVendor = {
  id: '1',
  business_name: 'Test Photography Studio',
  description: 'Professional photography services for all occasions',
  location: 'New York, NY',
  phone: '+1-555-123-4567',
  website: 'https://testphoto.com',
  service_categories: ['Photography', 'Videography'],
  business_license: 'BL123456',
  years_experience: 10,
  average_rating: '4.5',
  total_reviews: 25,
  is_verified: true,
  profile_complete: true,
  services_count: 3,
  portfolio_items_count: 12,
  featured_portfolio: [
    {
      id: '1',
      title: 'Wedding Photography',
      description: 'Beautiful wedding photos',
      category: 'photography',
      is_featured: true,
      image_count: 5,
      images: [],
      primary_image_url: 'https://example.com/image1.jpg',
    },
  ],
  portfolio_categories: ['photography', 'videography'],
  coordinates: {
    latitude: 40.7128,
    longitude: -74.0060,
  },
  user: {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@testphoto.com',
  },
};

const mockServices = [
  {
    id: '1',
    name: 'Wedding Photography',
    description: 'Complete wedding photography package',
    base_price: 1500,
    formatted_price: '$1,500',
    pricing_type: 'package',
    category: {
      id: '1',
      name: 'Photography',
      slug: 'photography',
    },
    has_images: true,
    primary_image_url: 'https://example.com/service1.jpg',
  },
];

const mockPortfolio = [
  {
    id: '1',
    title: 'Wedding Portfolio',
    description: 'Collection of wedding photos',
    category: 'photography',
    is_featured: true,
    image_count: 10,
    images: [],
    primary_image_url: 'https://example.com/portfolio1.jpg',
  },
];

const mockReviews = [];

describe('VendorProfile', () => {
  const mockParams = { id: '1' };

  beforeEach(() => {
    apiService.vendors.getById.mockResolvedValue({ data: { vendor: mockVendor } });
    apiService.vendors.getServices.mockResolvedValue({ data: { services: mockServices } });
    apiService.vendors.getPortfolio.mockResolvedValue({ data: { portfolio_items: mockPortfolio } });
    apiService.vendors.getReviews.mockResolvedValue({ data: { reviews: mockReviews } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<VendorProfile params={mockParams} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders vendor profile information', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Test Photography Studio' })).toBeInTheDocument();
    });

    expect(screen.getByText('Professional photography services for all occasions')).toBeInTheDocument();
    expect(screen.getByText(/New York, NY/)).toBeInTheDocument();
    expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
    expect(screen.getByText(/Verified Partner/)).toBeInTheDocument();
    expect(screen.getByText(/10\+ Years Experience/)).toBeInTheDocument();
    expect(screen.getAllByText('4.5').length).toBeGreaterThan(0);
  });

  it('renders portfolio section with showcase items', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Selected Portfolio')).toBeInTheDocument();
    });

    expect(screen.getByText('Wedding Portfolio')).toBeInTheDocument();
  });

  it('renders services with correct package information', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getAllByText('Wedding Photography').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('Complete wedding photography package')).toBeInTheDocument();
    expect(screen.getByText('Available Service Packages')).toBeInTheDocument();
    expect(screen.getByText('Confirm Booking Request')).toBeInTheDocument();
  });

  it('renders reviews section correctly', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText(/Based on 25 verified client reviews/)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    apiService.vendors.getById.mockRejectedValue(new Error('API Error'));

    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Vendor Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to load vendor profile/)).toBeInTheDocument();
  });

  it('renders rating badge correctly', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      const ratings = screen.getAllByText('4.5');
      expect(ratings.length).toBeGreaterThan(0);
    });
  });

  it('calls API endpoints with correct parameters', async () => {
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(apiService.vendors.getById).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getServices).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getPortfolio).toHaveBeenCalledWith('1');
      expect(apiService.vendors.getReviews).toHaveBeenCalledWith('1');
    });
  });

  it('allows a vendor user to favorite another vendor', async () => {
    mockAuthUser = { id: 99, role: 'vendor', vendor_id: '99' };
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(apiService.favorites.add).toHaveBeenCalledWith('1');
    });
  });

  it('prevents a vendor user from favoriting their own business profile', async () => {
    mockAuthUser = { id: 1, role: 'vendor', vendor_id: '1' };
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(toast.info).toHaveBeenCalledWith('You cannot favorite your own business profile');
    expect(apiService.favorites.add).not.toHaveBeenCalled();
  });

  it('allows a customer to click on a service to see details in a modal', async () => {
    mockAuthUser = { id: 1, role: 'customer' };
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('Available Service Packages')).toBeInTheDocument();
      expect(screen.getByText('View Service Details')).toBeInTheDocument();
    });

    // Click "View Service Details"
    fireEvent.click(screen.getByText('View Service Details'));

    // Modal should be open displaying full details
    await waitFor(() => {
      expect(screen.getByText('Full Description & Scope of Work')).toBeInTheDocument();
      expect(screen.getAllByText('Complete wedding photography package').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Transparent Pricing & Jashnify Guarantee/i)).toBeInTheDocument();
      expect(screen.getByText(/What This Service Includes/i)).toBeInTheDocument();
    });

    // Click "Close" button to close modal
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Full Description & Scope of Work')).not.toBeInTheDocument();
    });
  });

  it('allows selecting the package directly from the service details modal', async () => {
    mockAuthUser = { id: 1, role: 'customer' };
    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getByText('View Service Details')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View Service Details'));

    await waitFor(() => {
      expect(screen.getByText('Full Description & Scope of Work')).toBeInTheDocument();
    });

    const selectBtn = screen.getByRole('button', { name: /Package Already Selected|Select & Reserve This Package/i });
    expect(selectBtn).toBeInTheDocument();
    fireEvent.click(selectBtn);

    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Selected "Wedding Photography"'));
  });

  it('renders neutral "New on Ayoj" label and empty state when vendor has no reviews', async () => {
    apiService.vendors.getById.mockResolvedValue({
      data: {
        vendor: {
          ...mockVendor,
          average_rating: '0.0',
          total_reviews: 0,
        },
      },
    });

    render(<VendorProfile params={mockParams} />);

    await waitFor(() => {
      expect(screen.getAllByText('New on Ayoj').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('No Client Reviews Yet')).toBeInTheDocument();
    expect(screen.getByText(/All Ayoj reviews are written by confirmed hosts after an event booking is completed/)).toBeInTheDocument();
    expect(screen.queryByText('Priya Sharma')).not.toBeInTheDocument();
    expect(screen.queryByText('Rahul Kapoor')).not.toBeInTheDocument();
  });
});