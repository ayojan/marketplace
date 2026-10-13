const vi = jest;
import { renderHook } from '@testing-library/react';
import { useAuthUtils } from '../useAuthUtils.js';
import { useAuth } from '../../contexts/AuthContext';
import { tokenService } from '../../tokenService';

// Mock dependencies
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../tokenService', () => ({
  tokenService: {
    getTokenPayload: jest.fn(),
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('useAuthUtils', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  describe('role checking functions', () => {
    it('should check if user has specific role', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'vendor' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.hasRole('vendor')).toBe(true);
      expect(result.current.hasRole('customer')).toBe(false);
      expect(result.current.hasRole('admin')).toBe(false);
    });

    it('should check if user has any of specified roles', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'vendor' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.hasAnyRole(['vendor', 'admin'])).toBe(true);
      expect(result.current.hasAnyRole(['customer', 'admin'])).toBe(false);
    });

    it('should identify customer role', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'customer' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.isCustomer()).toBe(true);
      expect(result.current.isVendor()).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
    });

    it('should identify vendor role', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'vendor' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.isVendor()).toBe(true);
      expect(result.current.isCustomer()).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
    });

    it('should identify admin role', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'admin' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.isCustomer()).toBe(false);
      expect(result.current.isVendor()).toBe(false);
    });

    it('should handle null user', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.hasRole('customer')).toBe(false);
      expect(result.current.isCustomer()).toBe(false);
      expect(result.current.isVendor()).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
    });
  });

  describe('user name functions', () => {
    it('should get full name', () => {
      useAuth.mockReturnValue({
        user: { id: 1, first_name: 'John', last_name: 'Doe' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getFullName()).toBe('John Doe');
    });

    it('should handle missing first name', () => {
      useAuth.mockReturnValue({
        user: { id: 1, last_name: 'Doe' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getFullName()).toBe('Doe');
    });

    it('should handle missing last name', () => {
      useAuth.mockReturnValue({
        user: { id: 1, first_name: 'John' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getFullName()).toBe('John');
    });

    it('should handle null user for full name', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getFullName()).toBe('');
    });

    it('should get user initials', () => {
      useAuth.mockReturnValue({
        user: { id: 1, first_name: 'John', last_name: 'Doe' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getInitials()).toBe('JD');
    });

    it('should handle missing names for initials', () => {
      useAuth.mockReturnValue({
        user: { id: 1, first_name: 'John' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getInitials()).toBe('J');
    });

    it('should handle null user for initials', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getInitials()).toBe('');
    });
  });

  describe('token expiration functions', () => {
    it('should detect token expiring soon', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = currentTime + 240; // 4 minutes from now
      
      tokenService.getTokenPayload.mockReturnValue({
        exp: expirationTime,
      });

      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.isTokenExpiringSoon()).toBe(true);
    });

    it('should detect token not expiring soon', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = currentTime + 600; // 10 minutes from now
      
      tokenService.getTokenPayload.mockReturnValue({
        exp: expirationTime,
      });

      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.isTokenExpiringSoon()).toBe(false);
    });

    it('should handle null token payload for expiration check', () => {
      tokenService.getTokenPayload.mockReturnValue(null);

      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.isTokenExpiringSoon()).toBe(false);
    });

    it('should get time until expiration', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = currentTime + 600; // 10 minutes from now
      
      tokenService.getTokenPayload.mockReturnValue({
        exp: expirationTime,
      });

      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      // Allow for small timing differences (within 1 second)
      const timeUntilExpiration = result.current.getTimeUntilExpiration();
      expect(timeUntilExpiration).toBeGreaterThan(595);
      expect(timeUntilExpiration).toBeLessThanOrEqual(600);
    });

    it('should return 0 for expired token', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = currentTime - 600; // 10 minutes ago
      
      tokenService.getTokenPayload.mockReturnValue({
        exp: expirationTime,
      });

      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getTimeUntilExpiration()).toBe(0);
    });

    it('should return 0 for null token payload', () => {
      tokenService.getTokenPayload.mockReturnValue(null);

      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.getTimeUntilExpiration()).toBe(0);
    });
  });

  describe('logout and redirect', () => {
    it('should logout and redirect to login', async () => {
      useAuth.mockReturnValue({
        user: { id: 1 },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      await result.current.logoutAndRedirect();

      expect(mockLogout).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    });
  });

  describe('route access control', () => {
    it('should allow access when authenticated and no role required', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'customer' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.canAccessRoute()).toBe(true);
    });

    it('should allow access when authenticated and has required role', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'vendor' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.canAccessRoute('vendor')).toBe(true);
    });

    it('should deny access when not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.canAccessRoute('vendor')).toBe(false);
    });

    it('should deny access when authenticated but lacks required role', () => {
      useAuth.mockReturnValue({
        user: { id: 1, role: 'customer' },
        isAuthenticated: true,
        logout: mockLogout,
      });

      const { result } = renderHook(() => useAuthUtils());

      expect(result.current.canAccessRoute('vendor')).toBe(false);
    });
  });
});