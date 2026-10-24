import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Marketplace from '../../app/marketplace/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'location') return 'Chennai';
      return null;
    },
  }),
  usePathname: () => '/marketplace',
}));

// Mock apiService to return empty vendors for this city
jest.mock('@/lib/api', () => ({
  apiService: {
    services: {
      search: jest.fn().mockResolvedValue({
        data: {
          services: [],
        }
      }),
    },
    vendors: {
      getAll: jest.fn().mockResolvedValue({
        data: {
          vendors: [],
          categories: [],
          cities: ['Chennai', 'Mumbai', 'Delhi NCR']
        }
      }),
    },
  },
}));

// Mock LocationContext
jest.mock('@/lib/contexts/LocationContext', () => ({
  useLocation: () => ({
    selectedCity: 'Chennai',
    setSelectedCity: jest.fn(),
    openLocationPrompt: false,
    detectLocation: jest.fn().mockResolvedValue({ success: true, city: 'Chennai' }),
    isDetecting: false,
    promptShown: true,
  }),
  CITIES: ['Chennai', 'Mumbai', 'Delhi NCR'],
}));

// Mock AuthContext
jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      first_name: 'Test',
      last_name: 'Customer',
      email: 'customer@example.com',
      phone: '9876543210'
    },
    isAuthenticated: true,
    logout: jest.fn(),
  }),
}));

describe('Marketplace Empty State - Network Building Transparency', () => {
  it('renders the transparent building Ayoj message and elements', async () => {
    render(<Marketplace />);

    // Wait for the empty state to appear after loading
    await waitFor(() => {
      expect(screen.getByText(/We're building Ayoj in Chennai/i)).toBeInTheDocument();
    }, { timeout: 6000 });

    // Check subtitle
    expect(screen.getByText(/Tell us what you're planning, and we'll work to connect you with suitable local event professionals\./i)).toBeInTheDocument();

    // Check service prompt
    expect(screen.getByText(/What service do you need\?/i)).toBeInTheDocument();

    // Check service options
    expect(screen.getByRole('button', { name: /^Photography$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Decoration$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Makeup$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Catering$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^More$/i })).toBeInTheDocument();

    // Check CTA button
    const requestBtn = screen.getByRole('button', { name: /Request a vendor/i });
    expect(requestBtn).toBeInTheDocument();

    // Check disclaimer
    expect(screen.getByText(/No guarantee of a match\. We'll contact you if we find a suitable provider\./i)).toBeInTheDocument();
  }, 15000);

  it('opens the Request a Vendor modal when clicking Request a vendor button', async () => {
    render(<Marketplace />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Request a vendor/i })).toBeInTheDocument();
    }, { timeout: 6000 });

    const requestBtn = screen.getByRole('button', { name: /Request a vendor/i });
    fireEvent.click(requestBtn);

    // Modal should now be open
    await waitFor(() => {
      expect(screen.getByText(/Request an Event Professional/i)).toBeInTheDocument();
    }, { timeout: 6000 });

    expect(screen.getByPlaceholderText(/Your full name/i)).toHaveValue('Test Customer');
    expect(screen.getByPlaceholderText(/name@example.com/i)).toHaveValue('customer@example.com');
  }, 15000);

  it('opens the Request a Vendor modal with pre-selected service when clicking a service chip', async () => {
    render(<Marketplace />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Decoration/i })).toBeInTheDocument();
    }, { timeout: 6000 });

    const decorChip = screen.getByRole('button', { name: /Decoration/i });
    fireEvent.click(decorChip);

    // Modal opens with Decoration
    await waitFor(() => {
      expect(screen.getByText(/Request an Event Professional/i)).toBeInTheDocument();
    }, { timeout: 6000 });

    // Submit request
    const submitBtn = screen.getByRole('button', { name: /Submit Request/i });
    fireEvent.click(submitBtn);

    // Confirmation shows
    await waitFor(() => {
      expect(screen.getByText(/Request Submitted!/i)).toBeInTheDocument();
    }, { timeout: 6000 });
  }, 15000);
});
