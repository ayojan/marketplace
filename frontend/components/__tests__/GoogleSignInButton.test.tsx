import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoogleSignInButton from '../auth/GoogleSignInButton';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GoogleSignInButton', () => {
  const mockLoginWithGoogle = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({
      loginWithGoogle: mockLoginWithGoogle,
    });
  });

  it('renders Google sign in button in login mode', () => {
    render(<GoogleSignInButton mode="login" />);
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('renders Google sign up button in register mode', () => {
    render(<GoogleSignInButton mode="register" />);
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('renders custom button text when provided', () => {
    render(<GoogleSignInButton buttonText="Continue with Google Workspace" />);
    expect(screen.getByText('Continue with Google Workspace')).toBeInTheDocument();
  });
});
