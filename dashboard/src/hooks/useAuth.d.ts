/**
 * Simplified Authentication Hook for Cloudflare Access
 * Authentication is handled by Cloudflare Access at the network edge
 * This hook simply validates that the user can access the API
 */
import { User } from '../types/api';
/**
 * useAuth Hook - Validates API accessibility via Cloudflare Access
 * Features:
 * - Checks if user can access the API (authenticated via Cloudflare)
 * - Fetches user profile from API if available
 * - No local token storage needed (Cloudflare handles via cookies)
 */
export declare const useAuth: () => {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    logout: () => void;
};
/**
 * Clear authentication is no longer needed with Cloudflare
 * Keeping as no-op for backwards compatibility
 */
export declare const clearAuthData: () => void;
/**
 * Get auth header is no longer needed with Cloudflare
 * Keeping stub for backwards compatibility
 */
export declare const getAuthHeader: (_token: string | null) => {};
/**
 * Get stored token is no longer needed with Cloudflare
 * Keeping stub for backwards compatibility
 */
export declare const getStoredToken: () => string | null;
//# sourceMappingURL=useAuth.d.ts.map