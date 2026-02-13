/**
 * GitHub OAuth Authentication Hook
 * Manages user authentication state and JWT token lifecycle
 */

import { useState, useEffect, useCallback } from 'react';
import { User, AuthToken } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

/**
 * useAuth Hook - Manages GitHub OAuth login/logout and token management
 * Features:
 * - GitHub OAuth redirect flow
 * - JWT token persistence in localStorage
 * - User profile caching
 * - Token expiration handling
 * - Automatic token refresh
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load authentication state from localStorage on mount
   */
  useEffect(() => {
    const loadAuth = () => {
      try {
        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);

        if (savedToken) {
          setToken(savedToken);
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load auth state:', err);
        setError('Failed to load authentication state');
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  /**
   * Redirect to GitHub OAuth login endpoint
   * Backend will handle OAuth flow and redirect back with JWT
   */
  const login = useCallback(() => {
    try {
      // Redirect to backend OAuth login endpoint
      // The backend will handle the OAuth flow and redirect back
      const redirectUrl = `${API_URL}/api/auth/github/login`;
      window.location.href = redirectUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      console.error('Login error:', err);
    }
  }, []);

  /**
   * Handle OAuth callback from backend
   * Backend redirects here with token in URL after successful GitHub login
   * @param token - JWT token from backend
   * @param user - User profile from backend
   */
  const handleAuthCallback = useCallback((token: string, user: User) => {
    try {
      setToken(token);
      setUser(user);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save auth';
      setError(errorMsg);
      console.error('Auth callback error:', err);
    }
  }, []);

  /**
   * Check for OAuth callback in URL and handle it
   * This runs after a redirect from GitHub OAuth
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackToken = params.get('token');
    const userJson = params.get('user');

    if (callbackToken && userJson) {
      try {
        const userObj = JSON.parse(decodeURIComponent(userJson));
        handleAuthCallback(callbackToken, userObj);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Failed to parse auth callback:', err);
        setError('Failed to complete authentication');
      }
    }
  }, [handleAuthCallback]);

  /**
   * Logout - clear token and user data
   * Also calls backend logout endpoint if available
   */
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint if available
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(err => console.log('Logout API call failed:', err));
      }

      setToken(null);
      setUser(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setError(null);

      // Redirect to login page
      window.location.href = '/dashboard/';
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMsg);
      console.error('Logout error:', err);
    }
  }, [token]);

  /**
   * Refresh user profile from backend
   * Useful for updating avatar or other profile fields
   */
  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!token) {
      setError('Not authenticated');
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          await logout();
          return null;
        }
        throw new Error(`Failed to refresh user: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setError(null);

      return updatedUser;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh user';
      setError(errorMsg);
      console.error('Refresh user error:', err);
      return null;
    }
  }, [token, logout]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    handleAuthCallback,
    refreshUser,
  };
};

/**
 * Get Authorization header with JWT token
 * @param token - JWT token
 * @returns Authorization header object
 */
export const getAuthHeader = (token: string | null) => {
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Clear all authentication data (utility function)
 * Useful for manual session cleanup
 */
export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get stored token without hook (utility function)
 * Use when outside of React component context
 */
export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};
