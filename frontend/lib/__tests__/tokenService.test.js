const vi = jest;
import { tokenService } from '../tokenService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window for SSR compatibility
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
  },
  writable: true,
});

describe('TokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const mockToken = 'mock-token';
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = tokenService.getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      expect(result).toBe(mockToken);
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.getToken();

      expect(result).toBeNull();
    });

    it('should return null when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      global.window = undefined;

      const result = tokenService.getToken();

      expect(result).toBeNull();
      
      global.window = originalWindow;
    });
  });

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      const mockToken = 'mock-token';

      tokenService.setToken(mockToken);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', mockToken);
    });

    it('should remove token when null is passed', () => {
      tokenService.setToken(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle SSR gracefully', () => {
      const originalWindow = global.window;
      global.window = undefined;

      expect(() => tokenService.setToken('token')).not.toThrow();
      
      global.window = originalWindow;
    });
  });

  describe('getUser', () => {
    it('should return parsed user from localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = tokenService.getUser();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.getUser();

      expect(result).toBeNull();
    });

    it('should handle invalid JSON and remove user', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = tokenService.getUser();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return null when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      global.window = undefined;

      const result = tokenService.getUser();

      expect(result).toBeNull();
      
      global.window = originalWindow;
    });
  });

  describe('setUser', () => {
    it('should store user in localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      tokenService.setUser(mockUser);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should remove user when null is passed', () => {
      tokenService.setUser(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('clearAuthData', () => {
    it('should remove all auth data from localStorage', () => {
      tokenService.clearAuthData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('hasToken', () => {
    it('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');

      const result = tokenService.hasToken();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.hasToken();

      expect(result).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.isTokenExpired();

      expect(result).toBe(true);
    });

    it('should return true when token is expired', () => {
      const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 3600 }; // 1 hour ago
      const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      localStorageMock.getItem.mockReturnValue(expiredToken);

      const result = tokenService.isTokenExpired();

      expect(result).toBe(true);
    });

    it('should return false when token is valid', () => {
      const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour from now
      const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
      localStorageMock.getItem.mockReturnValue(validToken);

      const result = tokenService.isTokenExpired();

      expect(result).toBe(false);
    });

    it('should return true when token is malformed', () => {
      localStorageMock.getItem.mockReturnValue('malformed-token');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = tokenService.isTokenExpired();

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getTokenPayload', () => {
    it('should return decoded payload from token', () => {
      const mockPayload = { userId: 1, role: 'customer' };
      const mockToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;
      localStorageMock.getItem.mockReturnValue(mockToken);

      const result = tokenService.getTokenPayload();

      expect(result).toEqual(mockPayload);
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = tokenService.getTokenPayload();

      expect(result).toBeNull();
    });

    it('should return null when token is malformed', () => {
      localStorageMock.getItem.mockReturnValue('malformed-token');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = tokenService.getTokenPayload();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});