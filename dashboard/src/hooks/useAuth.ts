/**
 * Simplified Authentication Hook for Cloudflare Access
 * Authentication is handled by Cloudflare Access at the network edge
 * This hook simply validates that the user can access the API
 */

import { useState, useEffect } from 'react';
import { User } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * useAuth Hook - Validates API accessibility via Cloudflare Access
 * Features:
 * - Checks if user can access the API (authenticated via Cloudflare)
 * - Fetches user profile from API if available
 * - No local token storage needed (Cloudflare handles via cookies)
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check API accessibility and fetch user profile on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch user profile from API
        // If Cloudflare Access is configured correctly, this will succeed
        const response = await fetch(`${API_URL}/api/user`, {
          credentials: 'include', // Include Cloudflare cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setError(null);
        } else if (response.status === 404) {
          // Endpoint might not exist yet, but we're authenticated
          setUser({ email: 'authenticated@cloudflare', name: 'Cloudflare User' });
          setError(null);
        } else {
          setError('Unable to access API. Please ensure you are authenticated via Cloudflare.');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Failed to connect to API');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Check if user is authenticated (can access API)
   */
  const isAuthenticated = !!user && !error;

  /**
   * Logout - In Cloudflare Access, this should redirect to Cloudflare logout
   */
  const logout = () => {
    // Clear local state
    setUser(null);

    // Redirect to root to trigger Cloudflare re-authentication
    window.location.href = '/';
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    logout,
  };
};

/**
 * Clear authentication is no longer needed with Cloudflare
 * Keeping as no-op for backwards compatibility
 */
export const clearAuthData = () => {
  // No-op: Cloudflare handles auth via cookies
};

/**
 * Get auth header is no longer needed with Cloudflare
 * Keeping stub for backwards compatibility
 */
export const getAuthHeader = (_token: string | null) => {
  // No-op: Cloudflare handles auth via cookies
  return {};
};

/**
 * Get stored token is no longer needed with Cloudflare
 * Keeping stub for backwards compatibility
 */
export const getStoredToken = (): string | null => {
  // No-op: Cloudflare handles auth via cookies
  return null;
};
