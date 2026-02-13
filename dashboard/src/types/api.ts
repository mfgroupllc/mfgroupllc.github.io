/**
 * Trading Portfolio API Type Definitions
 * Comprehensive TypeScript interfaces for all API responses
 */

/**
 * User authentication and profile
 */
export interface User {
  id: string;
  github_username: string;
  github_avatar_url: string;
  created_at: string;
  last_login: string;
}

/**
 * JWT authentication token response
 */
export interface AuthToken {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}

/**
 * Portfolio summary with P&L and holdings
 */
export interface PortfolioSummary {
  total_capital: number;
  current_value: number;
  total_profit_loss: number;
  roi_percent: number;
  daily_profit_loss: number;
  daily_roi_percent: number;
  kalshi_balance: number;
  kalshi_positions_value: number;
  crypto_balance: number;
  crypto_positions_value: number;
  grid_balance: number;
  grid_positions_value: number;
  last_updated: string;
}

/**
 * Individual position held in a market
 */
export interface Position {
  id: string;
  bot: 'kalshi' | 'crypto' | 'grid';
  market_id: string;
  market_name: string;
  entry_price: number;
  current_price: number;
  quantity: number;
  side: 'yes' | 'no' | 'buy' | 'sell' | 'long' | 'short';
  value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  entry_time: string;
  last_updated: string;
}

/**
 * Completed transaction or trade
 */
export interface Transaction {
  id: string;
  timestamp: string;
  bot: 'kalshi' | 'crypto' | 'grid';
  market_id: string;
  market_name: string;
  side: 'yes' | 'no' | 'buy' | 'sell' | 'long' | 'short';
  quantity: number;
  entry_price: number;
  exit_price?: number;
  profit_loss?: number;
  profit_loss_percent?: number;
  status: 'open' | 'closed' | 'settled' | 'pending';
  notes?: string;
}

/**
 * Bot status and operational state
 */
export interface BotStatus {
  name: 'kalshi' | 'crypto' | 'grid';
  is_running: boolean;
  is_paused: boolean;
  last_cycle_time: string;
  last_cycle_duration_ms: number;
  last_trades_count: number;
  total_trades_today: number;
  error_message?: string;
  next_cycle_time: string;
  capital: number;
  positions_count: number;
}

/**
 * Log entry from bot execution
 */
export interface LogEntry {
  timestamp: string;
  bot: 'kalshi' | 'crypto' | 'grid' | 'system';
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  module?: string;
  function?: string;
}

/**
 * Historical P&L data point for charting
 */
export interface PortfolioPnlPoint {
  timestamp: string;
  date: string;
  total_value: number;
  profit_loss: number;
  roi_percent: number;
  kalshi_value: number;
  crypto_value: number;
  grid_value: number;
}

/**
 * API response envelope for list endpoints
 */
export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  error: string;
  message: string;
  status_code: number;
  timestamp: string;
}

/**
 * Cycle completion result
 */
export interface CycleResult {
  cycle_id: string;
  timestamp: string;
  bot: 'kalshi' | 'crypto' | 'grid';
  duration_ms: number;
  trades_found: number;
  trades_executed: number;
  scan_result: {
    markets_scanned: number;
    edges_found: number;
    high_confidence_edges: number;
  };
  status: 'success' | 'partial' | 'error';
  error_message?: string;
}

/**
 * Git pull result
 */
export interface GitPullResult {
  success: boolean;
  message: string;
  timestamp: string;
  changes_count: number;
}

/**
 * Manual scan trigger result
 */
export interface ScanResult {
  scan_id: string;
  bot: 'kalshi' | 'crypto' | 'grid';
  timestamp: string;
  markets_found: number;
  edges_found: number;
  pending_analysis: number;
}
