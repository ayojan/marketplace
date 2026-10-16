import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Header from '../Header';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useLocation } from '@/lib/contexts/LocationContext';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@/lib/contexts/LocationContext', () => ({
  useLocation: jest.fn(),
  CITIES: ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Jaipur'],
}));

jest.mock('@/components/NotificationDropdown', () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown">Notifications</div>,
}));

describe('Header Navigation with Categories & Occasions', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/');
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: jest.fn(),
    });
    (useLocation as jest.Mock).mockReturnValue({
      selectedCity: 'All Cities',
      setSelectedCity: jest.fn(),
      openLocationPrompt: jest.fn(),
      detectLocation: jest.fn(),
      isDetecting: false,
    });
  });

  it('renders Categories and Occasions nav items instead of Marketplace', () => {
    render(<Header />);
    expect(screen.queryByRole('link', { name: /^marketplace$/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Categories')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Occasions')[0]).toBeInTheDocument();
  });

  it('shows categories dropdown menu list on hover over Categories', () => {
    render(<Header />);
    const categoriesTrigger = screen.getAllByText('Categories')[0].closest('div');
    expect(categoriesTrigger).not.toBeNull();

    act(() => {
      fireEvent.mouseEnter(categoriesTrigger!);
    });

    expect(screen.getByText('Photographers')).toBeInTheDocument();
    expect(screen.getByText('Makeup Artists')).toBeInTheDocument();
    expect(screen.getByText('Decorators')).toBeInTheDocument();
    expect(screen.getByText('Event Planners')).toBeInTheDocument();
    expect(screen.getByText('Caterers')).toBeInTheDocument();
    expect(screen.getByText('DJs & Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Venues')).toBeInTheDocument();
    expect(screen.getByText('Explore all categories & talent')).toBeInTheDocument();
  });

  it('shows occasions dropdown menu list on hover over Occasions', () => {
    render(<Header />);
    const occasionsTrigger = screen.getAllByText('Occasions')[0].closest('div');
    expect(occasionsTrigger).not.toBeNull();

    act(() => {
      fireEvent.mouseEnter(occasionsTrigger!);
    });

    expect(screen.getByText('Weddings')).toBeInTheDocument();
    expect(screen.getByText('Pre-Wedding')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
    expect(screen.getByText('Birthdays')).toBeInTheDocument();
    expect(screen.getByText('Corporate Events')).toBeInTheDocument();
    expect(screen.getByText('Baby Shower')).toBeInTheDocument();
    expect(screen.getByText('Anniversaries')).toBeInTheDocument();
    expect(screen.getByText('Explore all celebrations & packages')).toBeInTheDocument();
  });
});
