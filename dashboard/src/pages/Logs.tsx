/**
 * Logs Page
 * Real-time log viewer with search, filtering, and auto-refresh
 */

import React, { useState, useEffect } from 'react';
import { useLogs } from '../hooks/useApi';
import { LogEntry } from '../types/api';

/**
 * LogsPage Component
 * Features:
 * - Real-time log streaming with 10s auto-refresh
 * - Search by message content
 * - Filter by bot and log level
 * - Timestamp display with timezone
 * - Color-coded log levels
 * - Tail last 100 lines
 */
export const LogsPage: React.FC = () => {
  const { logs, isLoading, error, fetch, startPolling, stopPolling } = useLogs();
  const [botFilter, setBotFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Mock logs for demo
  const mockLogs: LogEntry[] = [
    {
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      bot: 'kalshi',
      level: 'INFO',
      message: 'Cycle started - scanning 150 markets',
      module: 'runner',
      function: 'run_strategy',
    },
    {
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      bot: 'kalshi',
      level: 'INFO',
      message: 'Found 8 edges with >8% EV',
      module: 'scanner',
      function: 'find_edges',
    },
    {
      timestamp: new Date(Date.now() - 26 * 60 * 1000).toISOString(),
      bot: 'kalshi',
      level: 'WARNING',
      message: 'Edge liquidity below threshold: market-123 has only $250 volume',
      module: 'validation',
      function: 'check_liquidity',
    },
    {
      timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
      bot: 'kalshi',
      level: 'INFO',
      message: 'Placed trade: YES on Bitcoin prediction - risking $45 for $120 EV',
      module: 'executor',
      function: 'place_trade',
    },
    {
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      bot: 'crypto',
      level: 'INFO',
      message: 'BTC price: $66,500 - momentum score: 7.2/10',
      module: 'strategies',
      function: 'analyze_momentum',
    },
    {
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      bot: 'crypto',
      level: 'DEBUG',
      message: 'RSI(14) = 65 - approaching overbought territory',
      module: 'indicators',
      function: 'calculate_rsi',
    },
    {
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      bot: 'grid',
      level: 'INFO',
      message: 'Grid rebalance triggered - price moved 0.6% from center',
      module: 'grid_trader',
      function: 'rebalance_grid',
    },
    {
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      bot: 'system',
      level: 'INFO',
      message: 'Daily loss limit check: $-12.34 of $50 allowed',
      module: 'guardrails',
      function: 'check_daily_loss',
    },
  ];

  useEffect(() => {
    if (isAutoRefresh) {
      startPolling(botFilter || undefined, levelFilter || undefined, searchText);
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isAutoRefresh, botFilter, levelFilter, searchText, startPolling, stopPolling]);

  const displayLogs = logs.length > 0 ? logs : mockLogs;

  const filteredLogs = displayLogs.filter(log => {
    if (botFilter && log.bot !== botFilter) return false;
    if (levelFilter && log.level !== levelFilter) return false;
    if (searchText && !log.message.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'DEBUG':
        return 'bg-gray-900/30 text-gray-400';
      case 'INFO':
        return 'bg-blue-900/30 text-blue-400';
      case 'WARNING':
        return 'bg-yellow-900/30 text-yellow-400';
      case 'ERROR':
        return 'bg-red-900/30 text-red-400';
      case 'CRITICAL':
        return 'bg-red-900/50 text-red-300';
      default:
        return 'bg-slate-900/30 text-slate-400';
    }
  };

  const getBotColor = (bot: string) => {
    switch (bot) {
      case 'kalshi':
        return 'bg-blue-900/30 text-blue-400';
      case 'crypto':
        return 'bg-amber-900/30 text-amber-400';
      case 'grid':
        return 'bg-purple-900/30 text-purple-400';
      case 'system':
        return 'bg-slate-900/30 text-slate-400';
      default:
        return 'bg-slate-900/30 text-slate-400';
    }
  };

  if (error && displayLogs.length === 0) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-800 rounded-lg">
        <p className="text-red-400 font-semibold">Failed to load logs</p>
        <p className="text-red-300 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Search Logs</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by message..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Bot</label>
              <select
                value={botFilter}
                onChange={(e) => setBotFilter(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Bots</option>
                <option value="kalshi">Kalshi</option>
                <option value="crypto">Crypto</option>
                <option value="grid">Grid</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Auto-Refresh</label>
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`w-full px-4 py-2 rounded text-sm font-medium transition ${
                  isAutoRefresh
                    ? 'bg-green-700 hover:bg-green-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {isAutoRefresh ? '✓ Auto-Refresh (10s)' : 'Manual Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Count */}
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-sm">
          Showing {filteredLogs.length} of {displayLogs.length} logs
        </p>
        <button
          onClick={() => fetch(botFilter || undefined, levelFilter || undefined, searchText)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          Refresh Now
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {isLoading && displayLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No logs found matching your filters
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 text-slate-300 border-b border-slate-600 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold min-w-[200px]">Timestamp</th>
                  <th className="px-6 py-3 text-left font-semibold min-w-[100px]">Bot</th>
                  <th className="px-6 py-3 text-left font-semibold min-w-[100px]">Level</th>
                  <th className="px-6 py-3 text-left font-semibold">Message</th>
                  <th className="px-6 py-3 text-left font-semibold min-w-[150px]">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLogs.map((log, index) => (
                  <tr key={`${log.timestamp}-${index}`} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getBotColor(log.bot)}`}>
                        {log.bot.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.message}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {log.module && log.function
                        ? `${log.module}:${log.function}`
                        : log.module || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Footer */}
      {isAutoRefresh && (
        <div className="text-center text-slate-500 text-xs">
          Auto-refreshing every 10 seconds...
        </div>
      )}
    </div>
  );
};

export default LogsPage;
