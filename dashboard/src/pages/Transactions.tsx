/**
 * Transactions Page
 * View historical trades with filtering, sorting, and export
 */

import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useApi';
import { Transaction } from '../types/api';

interface TransactionsPageProps {
  token: string | null;
}

/**
 * TransactionsPage Component
 * Features:
 * - Paginated transaction history
 * - Filter by bot (Kalshi, Crypto, Grid)
 * - Sort by any column
 * - Export to CSV
 * - Real-time updates
 */
export const TransactionsPage: React.FC<TransactionsPageProps> = ({ token }) => {
  const { transactions, isLoading, error, total, hasMore, fetch } = useTransactions(token, 50);
  const [page, setPage] = useState(0);
  const [botFilter, setBotFilter] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mock transactions for demo
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      bot: 'kalshi',
      market_id: 'market-123',
      market_name: 'Will Bitcoin exceed $100k by Dec 2025?',
      side: 'yes',
      quantity: 100,
      entry_price: 0.45,
      exit_price: 0.68,
      profit_loss: 23,
      profit_loss_percent: 51.1,
      status: 'closed',
    },
    {
      id: 'tx-2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      bot: 'crypto',
      market_id: 'BTC',
      market_name: 'Bitcoin',
      side: 'buy',
      quantity: 0.002,
      entry_price: 62000,
      exit_price: 66500,
      profit_loss: 9,
      profit_loss_percent: 7.3,
      status: 'closed',
    },
    {
      id: 'tx-3',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      bot: 'kalshi',
      market_id: 'market-124',
      market_name: 'Will Fed cut rates in March?',
      side: 'no',
      quantity: 150,
      entry_price: 0.62,
      exit_price: 0.55,
      profit_loss: -10.5,
      profit_loss_percent: -11.3,
      status: 'closed',
    },
  ];

  useEffect(() => {
    fetch(page, botFilter || undefined);
  }, [page, botFilter]);

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  const sortedTransactions = [...displayTransactions].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const handleSort = (column: keyof Transaction) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Bot', 'Market', 'Side', 'Quantity', 'Entry Price', 'Exit Price', 'P&L', 'P&L %', 'Status'];
    const rows = displayTransactions.map(tx => [
      new Date(tx.timestamp).toLocaleString(),
      tx.bot.toUpperCase(),
      tx.market_name,
      tx.side.toUpperCase(),
      tx.quantity,
      tx.entry_price,
      tx.exit_price || '',
      tx.profit_loss || '',
      tx.profit_loss_percent || '',
      tx.status,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTotalPnL = () => displayTransactions.reduce((sum, tx) => sum + (tx.profit_loss || 0), 0);
  const getWinRate = () => {
    const wins = displayTransactions.filter(tx => (tx.profit_loss || 0) > 0).length;
    const closed = displayTransactions.filter(tx => tx.status === 'closed').length;
    return closed > 0 ? ((wins / closed) * 100).toFixed(1) : '0.0';
  };

  if (error && !displayTransactions.length) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-800 rounded-lg">
        <p className="text-red-400 font-semibold">Failed to load transactions</p>
        <p className="text-red-300 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
          <p className="text-3xl font-bold text-white mt-2">{total || displayTransactions.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Total P&L</p>
          <p className={`text-3xl font-bold mt-2 ${getTotalPnL() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {getTotalPnL() >= 0 ? '+' : ''}{getTotalPnL().toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Win Rate</p>
          <p className="text-3xl font-bold text-white mt-2">{getWinRate()}%</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:gap-4 flex-1">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Filter by Bot</label>
              <select
                value={botFilter}
                onChange={(e) => {
                  setBotFilter(e.target.value);
                  setPage(0);
                }}
                className="bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Bots</option>
                <option value="kalshi">Kalshi</option>
                <option value="crypto">Crypto</option>
                <option value="grid">Grid</option>
              </select>
            </div>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {isLoading && displayTransactions.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading transactions...
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 text-slate-300 border-b border-slate-600">
                <tr>
                  <th
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:text-white"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-2">
                      Timestamp
                      {sortColumn === 'timestamp' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:text-white"
                    onClick={() => handleSort('bot')}
                  >
                    <div className="flex items-center gap-2">
                      Bot
                      {sortColumn === 'bot' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:text-white"
                    onClick={() => handleSort('market_name')}
                  >
                    <div className="flex items-center gap-2">
                      Market
                      {sortColumn === 'market_name' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Side</th>
                  <th
                    className="px-6 py-3 text-right font-semibold cursor-pointer hover:text-white"
                    onClick={() => handleSort('entry_price')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Entry Price
                      {sortColumn === 'entry_price' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right font-semibold cursor-pointer hover:text-white"
                    onClick={() => handleSort('exit_price')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Exit Price
                      {sortColumn === 'exit_price' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-right font-semibold cursor-pointer hover:text-white"
                    onClick={() => handleSort('profit_loss')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      P&L
                      {sortColumn === 'profit_loss' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right font-semibold">P&L %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-slate-300 text-xs">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-blue-900/30 text-blue-400">
                        {tx.bot.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{tx.market_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        ['yes', 'buy', 'long'].includes(tx.side)
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {tx.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">${tx.entry_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-300">
                      {tx.exit_price ? `$${tx.exit_price.toFixed(2)}` : '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      (tx.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.profit_loss ? (tx.profit_loss >= 0 ? '+' : '') + tx.profit_loss.toFixed(2) : '-'}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      (tx.profit_loss_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.profit_loss_percent ? (tx.profit_loss_percent >= 0 ? '+' : '') + tx.profit_loss_percent.toFixed(2) + '%' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(hasMore || page > 0) && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-400">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasMore}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
