import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PhotographerCard from '../PhotographerCard';
import { apiService } from '../../lib/api';
import { tokenService } from '../../lib/tokenService';
import { toast } from 'sonner';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../lib/api', () => ({
  apiService: {
    favorites: {
      check: jest.fn().mockResolvedValue({ data: { is_favorite: false } }),
      add: jest.fn().mockResolvedValue({ data: { success: true } }),
      removeByVendor: jest.fn().mockResolvedValue({ data: { success: true } }),
    },
  },
}));

jest.mock('../../lib/tokenService', () => ({
  tokenService: {
    hasToken: jest.fn(),
    isTokenExpired: jest.fn(),
    getUser: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('PhotographerCard - Favorite Functionality', () => {
  const mockPhotographer = {
    id: 'vendor-123',
    slug: 'raj-photography',
    name: 'Raj Photography',
    user_id: 10,
    rating: 4.8,
    total_reviews: 15,
    location: 'Delhi',
    base_price: 25000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prompts unauthenticated users to sign in when clicking favorite', async () => {
    (tokenService.hasToken as jest.Mock).mockReturnValue(false);
    (tokenService.isTokenExpired as jest.Mock).mockReturnValue(true);
    (tokenService.getUser as jest.Mock).mockReturnValue(null);

    render(<PhotographerCard photographer={mockPhotographer} />);

    const favButton = screen.getByTitle('Save to favorites');
    fireEvent.click(favButton);

    expect(toast.error).toHaveBeenCalledWith(
      'Please sign in to save favorite vendors',
      expect.any(Object)
    );
    expect(apiService.favorites.add).not.toHaveBeenCalled();
  });

  it('prevents a vendor from favoriting their own profile', async () => {
    (tokenService.hasToken as jest.Mock).mockReturnValue(true);
    (tokenService.isTokenExpired as jest.Mock).mockReturnValue(false);
    (tokenService.getUser as jest.Mock).mockReturnValue({
      id: 10,
      role: 'vendor',
      vendor_id: 'vendor-123',
    });

    render(<PhotographerCard photographer={mockPhotographer} />);

    const favButton = screen.getByTitle('Save to favorites');
    fireEvent.click(favButton);

    expect(toast.info).toHaveBeenCalledWith('You cannot favorite your own business profile');
    expect(apiService.favorites.add).not.toHaveBeenCalled();
  });

  it('allows a vendor to favorite another vendor profile successfully', async () => {
    (tokenService.hasToken as jest.Mock).mockReturnValue(true);
    (tokenService.isTokenExpired as jest.Mock).mockReturnValue(false);
    (tokenService.getUser as jest.Mock).mockReturnValue({
      id: 99,
      role: 'vendor',
      vendor_id: 'vendor-999',
    });

    render(<PhotographerCard photographer={mockPhotographer} />);

    const favButton = screen.getByTitle('Save to favorites');
    fireEvent.click(favButton);

    await waitFor(() => {
      expect(apiService.favorites.add).toHaveBeenCalledWith('vendor-123');
      expect(toast.success).toHaveBeenCalledWith(
        'Saved Raj Photography to favorites',
        expect.any(Object)
      );
    });
  });

  it('displays API error message if favoriting fails', async () => {
    (tokenService.hasToken as jest.Mock).mockReturnValue(true);
    (tokenService.isTokenExpired as jest.Mock).mockReturnValue(false);
    (tokenService.getUser as jest.Mock).mockReturnValue({
      id: 88,
      role: 'vendor',
      vendor_id: 'vendor-888',
    });

    (apiService.favorites.add as jest.Mock).mockRejectedValueOnce({
      response: {
        data: {
          error: 'You cannot favorite your own business profile',
        },
      },
    });

    render(<PhotographerCard photographer={mockPhotographer} />);

    const favButton = screen.getByTitle('Save to favorites');
    fireEvent.click(favButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You cannot favorite your own business profile');
    });
  });

  describe('Verification Badge', () => {
    it('does NOT render Verified Partner badge for unverified vendors', () => {
      render(
        <PhotographerCard
          photographer={{
            ...mockPhotographer,
            is_verified: false,
            verification_status: 'unverified',
          }}
        />
      );

      expect(screen.queryByText('Verified Partner')).not.toBeInTheDocument();
    });

    it('renders Verified Partner badge when is_verified is true', () => {
      render(
        <PhotographerCard
          photographer={{
            ...mockPhotographer,
            is_verified: true,
          }}
        />
      );

      expect(screen.getByText('Verified Partner')).toBeInTheDocument();
    });

    it('renders Verified Partner badge when verification_status is verified', () => {
      render(
        <PhotographerCard
          photographer={{
            ...mockPhotographer,
            is_verified: false,
            verification_status: 'verified',
          }}
        />
      );

      expect(screen.getByText('Verified Partner')).toBeInTheDocument();
    });
  });
});
