/**
 * API Polling and Data Fetching Hook
 * Manages REST API calls with JWT authentication and automatic polling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioSummary, Transaction, LogEntry, BotStatus, ListResponse } from '../types/api';
import { getAuthHeader } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

/**
 * Base API client hook
 * Handles authentication, error handling, and request configuration
 */
export const useApi = () => {
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Make authenticated API request
   * @param endpoint - API endpoint (e.g., '/api/portfolio')
   * @param token - JWT authentication token
   * @param options - Fetch options
   */
  const request = useCallback(
    async <T,>(
      endpoint: string,
      token: string | null,
      options: RequestInit = {}
    ): Promise<T | null> => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...getAuthHeader(token),
          ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          setError({
            message: errorData.message || errorData.error || response.statusText,
            status: response.status,
            details: JSON.stringify(errorData),
          });
          return null;
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
 * @param token - JWT authentication token
 * @param pollInterval - Polling interval in milliseconds (default: 30000)
 */
export const usePortfolio = (token: string | null, pollInterval = 30000) => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { request } = useApi();
  const pollTimerRef = useRef<NodeJS.Timeout>();

  const fetchPortfolio = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const data = await request<PortfolioSummary>('/api/portfolio', token);
    if (data) {
      setPortfolio(data);
      setError(null);
    } else {
      setError({
        message: 'Failed to fetch portfolio data',
      });
    }
    setIsLoading(false);
  }, [token, request]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchPortfolio();

    // Set up polling
    pollTimerRef.current = setInterval(fetchPortfolio, pollInterval);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [token, pollInterval, fetchPortfolio]);

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
 * @param token - JWT authentication token
 * @param limit - Number of items per page (default: 50)
 */
export const useTransactions = (token: string | null, limit = 50) => {
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
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (bot) params.append('bot', bot);
      if (search) params.append('search', search);

      const data = await request<ListResponse<Transaction>>(
        `/api/transactions?${params}`,
        token
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
    [token, limit, request]
  );

  return { transactions, isLoading, error, total, hasMore, fetch };
};

/**
 * Logs fetching hook
 * Fetches and searches logs with filtering
 * @param token - JWT authentication token
 */
export const useLogs = (token: string | null) => {
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
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (bot) params.append('bot', bot);
      if (level) params.append('level', level);
      if (search) params.append('search', search);

      const data = await request<ListResponse<LogEntry>>(
        `/api/logs?${params}`,
        token
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
    [token, request]
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
 * @param token - JWT authentication token
 */
export const useBots = (token: string | null) => {
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { request } = useApi();
  const pollTimerRef = useRef<NodeJS.Timeout>();

  const fetch = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const data = await request<BotStatus[]>('/api/bots', token);
    if (data) {
      setBots(data);
      setError(null);
    } else {
      setError({
        message: 'Failed to fetch bot status',
      });
    }
    setIsLoading(false);
  }, [token, request]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch();
    pollTimerRef.current = setInterval(fetch, 30000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [token, fetch]);

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
 * @param token - JWT authentication token
 */
export const useApiCall = (token: string | null) => {
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
      if (!token) {
        setError({ message: 'Not authenticated' });
        return null;
      }

      setIsLoading(true);
      const options: RequestInit = {
        method,
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const data = await request<T>(endpoint, token, options);
      setIsLoading(false);
      return data;
    },
    [token, request]
  );

  return { call, isLoading, error, setError };
};
