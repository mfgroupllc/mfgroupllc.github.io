/**
 * API Polling and Data Fetching Hook
 * Manages REST API calls with Cloudflare Access authentication
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioSummary, Transaction, LogEntry, BotStatus, ListResponse } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

/**
 * Base API client hook
 * Handles Cloudflare Access authentication via cookies, error handling, and request configuration
 */
export const useApi = () => {
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Make authenticated API request
   * Authentication is handled by Cloudflare Access cookies (CF_Authorization)
   * @param endpoint - API endpoint (e.g., '/api/portfolio')
   * @param options - Fetch options
   */
  const request = useCallback(
    async <T,>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include', // CRITICAL: Allows Cloudflare CF_Authorization cookie to be sent
        });

        // Cloudflare Access specific check:
        // If the token is invalid/expired, Cloudflare often redirects (302) to a login HTML page.
        // Fetch follows redirects transparently, so we check if we got HTML back instead of JSON.
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          setError({
            message: 'Authentication session expired. Please refresh to log in via Cloudflare.',
            status: 401,
          });
          return null;
        }

        if (!response.ok) {
          // Handle 401/403 specifically
          if (response.status === 401 || response.status === 403) {
            setError({
              message: 'Unauthorized: You do not have access to this resource.',
              status: response.status,
            });
            return null;
          }

          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          setError({
            message: errorData.message || errorData.error || response.statusText,
            status: response.status,
            details: JSON.stringify(errorData),
          });
          return null;
        }

        // Return empty object for 204 No Content
        if (response.status === 204) {
          setError(null);
          return {} as T;
        }

        const data = await response.json();
        setError(null);
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError({
          message: `API request failed: ${message}`,
          details: String(err),
        });
        return null;
      }
    },
    []
  );

  return { request, error, setError };
};

/**
 * Portfolio polling hook
 * Fetches portfolio summary every 30 seconds by default
 * @param pollInterval - Polling interval in milliseconds (default: 30000)
 */
export const usePortfolio = (pollInterval = 30000) => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { request } = useApi();
  const pollTimerRef = useRef<NodeJS.Timeout>();

  const fetchPortfolio = useCallback(async () => {
    const data = await request<PortfolioSummary>('/api/portfolio');
    if (data) {
      setPortfolio(data);
      setError(null);
    } else {
      setError({
        message: 'Failed to fetch portfolio data',
      });
    }
    setIsLoading(false);
  }, [request]);

  useEffect(() => {
    // Initial fetch
    fetchPortfolio();

    // Set up polling
    pollTimerRef.current = setInterval(fetchPortfolio, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [pollInterval, fetchPortfolio]);

  /**
   * Manually refresh portfolio data
   */
  const refresh = useCallback(async () => {
    await fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, isLoading, error, refresh };
};

/**
 * Transactions fetching hook
 * Fetches historical trades with pagination and filtering
 * @param limit - Number of items per page (default: 50)
 */
export const useTransactions = (limit = 50) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { request } = useApi();

  /**
   * Fetch transactions with optional filters
   * @param page - Page number (0-indexed)
   * @param bot - Filter by bot name
   * @param search - Search in market names
   */
  const fetch = useCallback(
    async (page = 0, bot?: string, search?: string) => {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (bot) params.append('bot', bot);
      if (search) params.append('search', search);

      const data = await request<ListResponse<Transaction>>(
        `/api/transactions?${params}`
      );

      if (data) {
        setTransactions(data.items);
        setTotal(data.total);
        setHasMore(data.has_more);
        setError(null);
      } else {
        setError({
          message: 'Failed to fetch transactions',
        });
      }
      setIsLoading(false);
    },
    [limit, request]
  );

  return { transactions, isLoading, error, total, hasMore, fetch };
};

/**
 * Logs fetching hook
 * Fetches and searches logs with filtering
 */
export const useLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { request } = useApi();
  const pollTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Fetch logs with optional filtering
   * @param bot - Filter by bot (kalshi/crypto/grid/system)
   * @param level - Filter by log level (DEBUG/INFO/WARNING/ERROR)
   * @param search - Search in message content
   * @param limit - Number of logs to return (default: 100)
   */
  const fetch = useCallback(
    async (bot?: string, level?: string, search?: string, limit = 100) => {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (bot) params.append('bot', bot);
      if (level) params.append('level', level);
      if (search) params.append('search', search);

      const data = await request<ListResponse<LogEntry>>(
        `/api/logs?${params}`
      );

      if (data) {
        setLogs(data.items);
        setError(null);
      } else {
        setError({
          message: 'Failed to fetch logs',
        });
      }
      setIsLoading(false);
    },
    [request]
  );

  /**
   * Start auto-polling logs every 10 seconds
   */
  const startPolling = useCallback(
    (bot?: string, level?: string, search?: string) => {
      fetch(bot, level, search);
      pollTimerRef.current = setInterval(
        () => fetch(bot, level, search),
        10000
      );
    },
    [fetch]
  );

  /**
   * Stop auto-polling
   */
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return { logs, isLoading, error, fetch, startPolling, stopPolling };
};

/**
 * Bot status fetching hook
 * Polls bot status every 30 seconds
 */
export const useBots = () => {
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { request } = useApi();
  const pollTimerRef = useRef<NodeJS.Timeout>();

  const fetch = useCallback(async () => {
    const data = await request<BotStatus[]>('/api/bots');
    if (data) {
      setBots(data);
      setError(null);
    } else {
      setError({
        message: 'Failed to fetch bot status',
      });
    }
    setIsLoading(false);
  }, [request]);

  useEffect(() => {
    fetch();
    pollTimerRef.current = setInterval(fetch, 30000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [fetch]);

  /**
   * Refresh bot status immediately
   */
  const refresh = useCallback(async () => {
    await fetch();
  }, [fetch]);

  return { bots, isLoading, error, refresh };
};

/**
 * Generic API call hook for manual requests
 * Use for one-off API calls (POST, PUT, DELETE)
 */
export const useApiCall = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { request } = useApi();

  /**
   * Make API call with custom method and body
   * @param endpoint - API endpoint
   * @param method - HTTP method (POST, PUT, DELETE, etc.)
   * @param body - Request body
   */
  const call = useCallback(
    async <T,>(endpoint: string, method = 'POST', body?: any): Promise<T | null> => {
      setIsLoading(true);
      const options: RequestInit = {
        method,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const data = await request<T>(endpoint, options);
      setIsLoading(false);
      return data;
    },
    [request]
  );

  return { call, isLoading, error, setError };
};
