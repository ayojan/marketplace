import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

jest.mock('../../lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

type UseAuthMock = jest.MockedFunction<typeof useAuth>;
type UseRouterMock = jest.MockedFunction<typeof useRouter>;

const mockUseAuth = useAuth as UseAuthMock;
const mockUseRouter = useRouter as UseRouterMock;
const mockPush = jest.fn();

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: mockPush } as never);
  });

  it('shows skeleton while auth state is loading', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    } as any);

    render(<ProtectedRoute>Child</ProtectedRoute>);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    } as any);

    render(<ProtectedRoute>Child</ProtectedRoute>);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
    });
  });

  it('redirects to unauthorized when role mismatch', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'customer' },
    } as any);

    render(
      <ProtectedRoute requiredRole="vendor">
        <div>Child</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    });
  });

  it('renders children when user is authenticated and authorized', async () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'vendor' },
    } as any);

    render(<ProtectedRoute requiredRole="vendor">Child</ProtectedRoute>);

    await waitFor(() => {
      expect(screen.getByText('Child')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
