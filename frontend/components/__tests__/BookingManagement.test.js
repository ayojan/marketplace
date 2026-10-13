import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VendorBookings from '../VendorBookings';
import { apiService } from '../../lib/api';

// Mock the API service
jest.mock('../../lib/api', () => ({
  apiService: {
    bookings: {
      getAll: jest.fn(),
      respond: jest.fn(),
    },
  },
}));

describe('VendorBookings (Booking Management)', () => {
  const mockBookings = [
    {
      id: 1,
      status: 'pending',
      event_date: '2026-10-15T10:00:00Z',
      event_location: '123 Main St, Mumbai',
      total_amount: 50000,
      requirements: 'Need golden hour portraits and aerial shots.',
      service: { id: 10, name: 'Photography Session' },
      customer: { id: 1, name: 'John Doe', email: 'john@example.com' },
    },
    {
      id: 2,
      status: 'accepted',
      event_date: '2026-10-20T14:00:00Z',
      event_location: '456 Royal Palace, Jaipur',
      total_amount: 120000,
      service: { id: 11, name: 'Cinematic Video Production' },
      customer: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    },
    {
      id: 3,
      status: 'completed',
      event_date: '2026-09-10T09:00:00Z',
      event_location: '789 Heritage Lawn, Delhi',
      total_amount: 80000,
      service: { id: 12, name: 'Event Photography' },
      customer: { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders metric cards and inquiry filter tabs', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('Confirmed Events')).toBeInTheDocument();
      expect(screen.getByText('Completed Celebrations')).toBeInTheDocument();
      expect(screen.getByText('Booked Value')).toBeInTheDocument();
    });
  });

  it('loads bookings on mount via apiService', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(apiService.bookings.getAll).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Photography Session')).toBeInTheDocument();
      expect(screen.getByText('Cinematic Video Production')).toBeInTheDocument();
      expect(screen.getByText('Event Photography')).toBeInTheDocument();
    });
  });

  it('displays filter tabs with correct counts', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('All Inquiries')).toBeInTheDocument();
      expect(screen.getByText('Pending Action')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('filters bookings by status when clicking tabs', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Photography Session')).toBeInTheDocument();
    });

    // Switch to Pending Action tab
    fireEvent.click(screen.getByText('Pending Action'));

    expect(screen.getByText('Photography Session')).toBeInTheDocument();
    expect(screen.queryByText('Cinematic Video Production')).not.toBeInTheDocument();
    expect(screen.queryByText('Event Photography')).not.toBeInTheDocument();

    // Switch to Confirmed tab
    fireEvent.click(screen.getByText('Confirmed'));

    expect(screen.queryByText('Photography Session')).not.toBeInTheDocument();
    expect(screen.getByText('Cinematic Video Production')).toBeInTheDocument();
  });

  it('filters bookings by search query', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Photography Session')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by client or service...');
    fireEvent.change(searchInput, { target: { value: 'Jane Smith' } });

    expect(screen.getByText('Cinematic Video Production')).toBeInTheDocument();
    expect(screen.queryByText('Photography Session')).not.toBeInTheDocument();
  });

  it('handles booking accept action', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });
    apiService.bookings.respond.mockResolvedValue({
      data: {
        booking: {
          ...mockBookings[0],
          status: 'accepted',
        },
      },
    });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Accept Booking')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Accept Booking'));

    await waitFor(() => {
      expect(apiService.bookings.respond).toHaveBeenCalledWith(1, {
        response_action: 'accept',
      });
    });
  });

  it('handles booking decline action', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });
    apiService.bookings.respond.mockResolvedValue({
      data: {
        booking: {
          ...mockBookings[0],
          status: 'declined',
        },
      },
    });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Decline'));

    await waitFor(() => {
      expect(apiService.bookings.respond).toHaveBeenCalledWith(1, {
        response_action: 'decline',
      });
    });
  });

  it('handles mark event completed action for accepted bookings', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: mockBookings } });
    apiService.bookings.respond.mockResolvedValue({
      data: {
        booking: {
          ...mockBookings[1],
          status: 'completed',
        },
      },
    });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('Mark Event Completed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Mark Event Completed'));

    await waitFor(() => {
      expect(apiService.bookings.respond).toHaveBeenCalledWith(2, {
        response_action: 'complete',
      });
    });
  });

  it('displays empty state when no bookings exist', async () => {
    apiService.bookings.getAll.mockResolvedValue({ data: { bookings: [] } });

    render(<VendorBookings />);

    await waitFor(() => {
      expect(screen.getByText('No bookings found')).toBeInTheDocument();
    });
  });
});