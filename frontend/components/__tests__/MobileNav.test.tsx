import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBottomNav, MobileTopBar, MobileDetailHeader, MobileActionSheet } from '../layout';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/tokenService', () => ({
  tokenService: {
    hasToken: jest.fn(() => false),
    isTokenExpired: jest.fn(() => true),
  },
}));

jest.mock('@/lib/api', () => ({
  apiService: {
    favorites: {
      getAll: jest.fn().mockResolvedValue({ data: { favorites: [] } }),
    },
  },
}));

describe('MobileBottomNav collision avoidance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    });
  });

  it('hides MobileBottomNav on /vendors/[id] detail pages so VendorStickyMobileBar has full focus', () => {
    (usePathname as jest.Mock).mockReturnValue('/vendors/42');
    const { container } = render(<MobileBottomNav />);
    expect(container.firstChild).toBeNull();
  });

  it('hides MobileBottomNav on /photographer/[id] pages', () => {
    (usePathname as jest.Mock).mockReturnValue('/photographer/10');
    const { container } = render(<MobileBottomNav />);
    expect(container.firstChild).toBeNull();
  });

  it('hides MobileBottomNav on /booking checkout flow pages', () => {
    (usePathname as jest.Mock).mockReturnValue('/booking/55');
    const { container } = render(<MobileBottomNav />);
    expect(container.firstChild).toBeNull();
  });
});

describe('Role-Aware MobileBottomNav (Customer vs Vendor)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders Customer Tab Bar (Explore · Saved · Bookings · Profile) for guest / customer', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'customer', id: 1 },
      isAuthenticated: true,
      logout: jest.fn(),
    });
    (usePathname as jest.Mock).mockReturnValue('/marketplace');

    render(<MobileBottomNav />);

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Inquiries')).not.toBeInTheDocument();
  });

  it('renders Vendor Tab Bar (Dashboard · Inquiries · Calendar · Services · More) for vendor user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'vendor', id: 99, vendor_id: '99', business_name: 'Studio Lux' },
      isAuthenticated: true,
      logout: jest.fn(),
    });
    (usePathname as jest.Mock).mockReturnValue('/vendor/dashboard');

    render(<MobileBottomNav />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Inquiries')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
  });

  it('opens MobileActionSheet with vendor shortcuts when tapping More', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { role: 'vendor', id: 99, vendor_id: '99' },
      isAuthenticated: true,
      logout: jest.fn(),
    });
    (usePathname as jest.Mock).mockReturnValue('/vendor/dashboard');

    render(<MobileBottomNav />);

    // Click "More" tab
    fireEvent.click(screen.getByText('More'));

    // MobileActionSheet should be open
    expect(screen.getByText('Vendor Portal & Tools')).toBeInTheDocument();
    expect(screen.getByText('Portfolio & Media')).toBeInTheDocument();
    expect(screen.getByText('Business Settings')).toBeInTheDocument();
    expect(screen.getByText('View Public Storefront')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
});

describe('MobileTopBar & MobileDetailHeader Component', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
  });

  it('renders title, subtitle, and back button', () => {
    render(
      <MobileTopBar
        title="Royal Stories Photography"
        subtitle="Jaipur • 4.9★"
      />
    );

    expect(screen.getByText('Royal Stories Photography')).toBeInTheDocument();
    expect(screen.getByText('Jaipur • 4.9★')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('exports MobileDetailHeader as alias for MobileTopBar', () => {
    render(
      <MobileDetailHeader
        title="The Wedding Narratives"
        subtitle="New Delhi • Verified"
      />
    );

    expect(screen.getByText('The Wedding Narratives')).toBeInTheDocument();
    expect(screen.getByText('New Delhi • Verified')).toBeInTheDocument();
  });

  it('triggers router.back when clicking back button if onBack is not passed', () => {
    render(<MobileTopBar title="Vendor Details" />);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('calls custom onBack handler when provided', () => {
    const customOnBack = jest.fn();
    render(<MobileTopBar title="Vendor Details" onBack={customOnBack} />);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(customOnBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('navigates to backHref if provided and onBack is not set', () => {
    render(<MobileTopBar title="Vendor Details" backHref="/marketplace" />);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(mockPush).toHaveBeenCalledWith('/marketplace');
  });

  it('renders custom actions passed into the right slot', () => {
    render(
      <MobileTopBar
        title="Vendor Details"
        actions={<button type="button">Custom Action</button>}
      />
    );
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});

describe('MobileActionSheet Component', () => {
  it('renders title, subtitle, and selectable options when open', () => {
    const handleSelect = jest.fn();
    const handleClose = jest.fn();

    render(
      <MobileActionSheet
        isOpen={true}
        onClose={handleClose}
        title="Sort Listings By"
        subtitle="Select order"
        options={[
          { id: 'price_asc', label: 'Price: Low to High', selected: true, onClick: handleSelect },
          { id: 'price_desc', label: 'Price: High to Low', selected: false, onClick: jest.fn() },
        ]}
      />
    );

    expect(screen.getByText('Sort Listings By')).toBeInTheDocument();
    expect(screen.getByText('Select order')).toBeInTheDocument();
    expect(screen.getByText('Price: Low to High')).toBeInTheDocument();
    expect(screen.getByText('Price: High to Low')).toBeInTheDocument();

    // Clicking an option triggers its handler and closes the sheet
    fireEvent.click(screen.getByText('Price: Low to High'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render content when isOpen is false', () => {
    const { container } = render(
      <MobileActionSheet
        isOpen={false}
        onClose={jest.fn()}
        title="Sort Listings By"
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
