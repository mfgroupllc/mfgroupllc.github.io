/**
 * API Polling and Data Fetching Hook
 * Manages REST API calls with Cloudflare Access authentication
 */
import { PortfolioSummary, Transaction, LogEntry, BotStatus } from '../types/api';
interface ApiError {
    message: string;
    status?: number;
    details?: string;
}
/**
 * Base API client hook
 * Handles Cloudflare Access authentication via cookies, error handling, and request configuration
 */
export declare const useApi: () => {
    request: <T>(endpoint: string, options?: RequestInit) => Promise<T | null>;
    error: ApiError | null;
    setError: import("react").Dispatch<import("react").SetStateAction<ApiError | null>>;
};
/**
 * Portfolio polling hook
 * Fetches portfolio summary every 30 seconds by default
 * @param pollInterval - Polling interval in milliseconds (default: 30000)
 */
export declare const usePortfolio: (pollInterval?: number) => {
    portfolio: PortfolioSummary | null;
    isLoading: boolean;
    error: ApiError | null;
    refresh: () => Promise<void>;
};
/**
 * Transactions fetching hook
 * Fetches historical trades with pagination and filtering
 * @param limit - Number of items per page (default: 50)
 */
export declare const useTransactions: (limit?: number) => {
    transactions: Transaction[];
    isLoading: boolean;
    error: ApiError | null;
    total: number;
    hasMore: boolean;
    fetch: (page?: number, bot?: string, search?: string) => Promise<void>;
};
/**
 * Logs fetching hook
 * Fetches and searches logs with filtering
 */
export declare const useLogs: () => {
    logs: LogEntry[];
    isLoading: boolean;
    error: ApiError | null;
    fetch: (bot?: string, level?: string, search?: string, limit?: number) => Promise<void>;
    startPolling: (bot?: string, level?: string, search?: string) => void;
    stopPolling: () => void;
};
/**
 * Bot status fetching hook
 * Polls bot status every 30 seconds
 */
export declare const useBots: () => {
    bots: BotStatus[];
    isLoading: boolean;
    error: ApiError | null;
    refresh: () => Promise<void>;
};
/**
 * Generic API call hook for manual requests
 * Use for one-off API calls (POST, PUT, DELETE)
 */
export declare const useApiCall: () => {
    call: <T>(endpoint: string, method?: string, body?: any) => Promise<T | null>;
    isLoading: boolean;
    error: ApiError | null;
    setError: import("react").Dispatch<import("react").SetStateAction<ApiError | null>>;
};
export {};
//# sourceMappingURL=useApi.d.ts.map