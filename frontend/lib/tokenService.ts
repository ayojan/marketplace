import type { User, TokenPayload } from '@/types/user';

// Token storage keys
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';
const REFRESH_TOKEN_KEY = 'refreshToken';

export class TokenService {
  // Get stored token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set token in storage
  setToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Get stored user
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    try {
      return user ? (JSON.parse(user) as User) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      this.removeUser();
      return null;
    }
  }

  // Set user in storage
  setUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  // Remove user from storage
  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Set refresh token
  setRefreshToken(refreshToken: string | null): void {
    if (typeof window === 'undefined') return;
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  // Clear all stored auth data
  clearAuthData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // Check if token exists
  hasToken(): boolean {
    return !!this.getToken();
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.getTokenPayload();
      if (!payload || typeof payload.exp !== 'number') return true;
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Get token payload
  getTokenPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        throw new Error('Invalid token format');
      }
      return JSON.parse(atob(parts[1])) as TokenPayload;
    } catch (error) {
      console.error('Error decoding token payload:', error);
      return null;
    }
  }
}

export const tokenService = new TokenService();
export default tokenService;
