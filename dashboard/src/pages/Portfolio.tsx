/**
 * Portfolio Dashboard Page
 * Displays real-time portfolio summary, positions, and P&L chart
 */

import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../hooks/useApi';
import { Position, PortfolioPnlPoint } from '../types/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * PortfolioPage Component
 * Shows:
 * - Total capital and P&L metrics
 * - Per-bot breakdowns (Kalshi, Crypto, Grid)
 * - Open positions across all bots
 * - 30-day P&L chart
 * - Real-time updates every 30s
 */
export const PortfolioPage: React.FC = () => {
  const { portfolio, isLoading, error, refresh } = usePortfolio(30000);
  const [selectedBot, setSelectedBot] = useState<'all' | 'kalshi' | 'crypto' | 'grid'>('all');

  // Mock P&L data - in production, fetch from /api/portfolio/pnl-history
  const pnlHistory = useMemo(() => {
    const data: PortfolioPnlPoint[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      data.push({
        timestamp: date.toISOString(),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total_value: portfolio ? portfolio.current_value + (Math.random() - 0.5) * 1000 : 0,
        profit_loss: portfolio ? portfolio.total_profit_loss + (Math.random() - 0.5) * 500 : 0,
        roi_percent: portfolio ? portfolio.roi_percent + (Math.random() - 0.5) * 5 : 0,
        kalshi_value: portfolio ? portfolio.kalshi_balance + portfolio.kalshi_positions_value : 0,
        crypto_value: portfolio ? portfolio.crypto_balance + portfolio.crypto_positions_value : 0,
        grid_value: portfolio ? portfolio.grid_balance + portfolio.grid_positions_value : 0,
      });
    }
    return data;
  }, [portfolio]);

  // Mock positions - in production, fetch from /api/positions
  const allPositions: Position[] = useMemo(() => [
    // Kalshi positions
    {
      id: 'pos-1',
      bot: 'kalshi',
      market_id: 'market-123',
      market_name: 'Will Bitcoin exceed $100k by Dec 2025?',
      entry_price: 0.45,
      current_price: 0.68,
      quantity: 100,
      side: 'yes',
      value: 68,
      unrealized_pnl: 23,
      unrealized_pnl_percent: 51.1,
      entry_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString(),
    },
    {
      id: 'pos-2',
      bot: 'kalshi',
      market_id: 'market-124',
      market_name: 'Will Fed cut rates in March?',
      entry_price: 0.62,
      current_price: 0.55,
      quantity: 150,
      side: 'no',
      value: 82.5,
      unrealized_pnl: -10.5,
      unrealized_pnl_percent: -11.3,
      entry_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString(),
    },
    // Crypto positions
    {
      id: 'pos-3',
      bot: 'crypto',
      market_id: 'BTC',
      market_name: 'Bitcoin',
      entry_price: 62000,
      current_price: 66500,
      quantity: 0.002,
      side: 'buy',
      value: 133,
      unrealized_pnl: 9,
      unrealized_pnl_percent: 7.3,
      entry_time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString(),
    },
    {
      id: 'pos-4',
      bot: 'crypto',
      market_id: 'SOL',
      market_name: 'Solana',
      entry_price: 210,
      current_price: 198,
      quantity: 1,
      side: 'buy',
      value: 198,
      unrealized_pnl: -12,
      unrealized_pnl_percent: -5.7,
      entry_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString(),
    },
  ], []);

  const positions = selectedBot === 'all'
    ? allPositions
    : allPositions.filter(p => p.bot === selectedBot);

  const pieData = useMemo(() => {
    if (!portfolio) return [];
    return [
      { name: 'Kalshi', value: portfolio.kalshi_balance + portfolio.kalshi_positions_value, color: '#3b82f6' },
      { name: 'Crypto', value: portfolio.crypto_balance + portfolio.crypto_positions_value, color: '#f59e0b' },
      { name: 'Grid', value: portfolio.grid_balance + portfolio.grid_positions_value, color: '#8b5cf6' },
    ].filter(item => item.value > 0);
  }, [portfolio]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-800 rounded-lg">
        <p className="text-red-400 font-semibold">Failed to load portfolio</p>
        <p className="text-red-300 text-sm mt-1">{error.message}</p>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!portfolio) return null;

  const positiveROI = portfolio.roi_percent >= 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Capital */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Total Capital</p>
          <p className="text-3xl font-bold text-white mt-2">
            ${portfolio.total_capital.toFixed(2)}
          </p>
          <p className="text-slate-500 text-xs mt-2">Starting balance</p>
        </div>

        {/* Current Value */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Current Value</p>
          <p className="text-3xl font-bold text-white mt-2">
            ${portfolio.current_value.toFixed(2)}
          </p>
          <p className="text-slate-500 text-xs mt-2">Including positions</p>
        </div>

        {/* Total P&L */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Total P&L</p>
          <p className={`text-3xl font-bold mt-2 ${positiveROI ? 'text-green-400' : 'text-red-400'}`}>
            {positiveROI ? '+' : ''}{portfolio.total_profit_loss.toFixed(2)}
          </p>
          <p className="text-slate-500 text-xs mt-2">Realized + Unrealized</p>
        </div>

        {/* ROI */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Total ROI</p>
          <p className={`text-3xl font-bold mt-2 ${positiveROI ? 'text-green-400' : 'text-red-400'}`}>
            {positiveROI ? '+' : ''}{portfolio.roi_percent.toFixed(2)}%
          </p>
          <p className="text-slate-500 text-xs mt-2">Return on investment</p>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Daily P&L</p>
          <p className={`text-2xl font-bold mt-2 ${portfolio.daily_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.daily_profit_loss >= 0 ? '+' : ''}{portfolio.daily_profit_loss.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Daily ROI</p>
          <p className={`text-2xl font-bold mt-2 ${portfolio.daily_roi_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {portfolio.daily_roi_percent >= 0 ? '+' : ''}{portfolio.daily_roi_percent.toFixed(3)}%
          </p>
        </div>
      </div>

      {/* Bot Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kalshi */}
        <div
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-blue-500 transition"
          onClick={() => setSelectedBot(selectedBot === 'kalshi' ? 'all' : 'kalshi')}
        >
          <p className="text-slate-400 text-sm font-medium">Kalshi</p>
          <p className="text-2xl font-bold text-white mt-2">
            ${(portfolio.kalshi_balance + portfolio.kalshi_positions_value).toFixed(2)}
          </p>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Cash: ${portfolio.kalshi_balance.toFixed(2)}</p>
            <p>Positions: ${portfolio.kalshi_positions_value.toFixed(2)}</p>
          </div>
        </div>

        {/* Crypto */}
        <div
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-amber-500 transition"
          onClick={() => setSelectedBot(selectedBot === 'crypto' ? 'all' : 'crypto')}
        >
          <p className="text-slate-400 text-sm font-medium">Crypto</p>
          <p className="text-2xl font-bold text-white mt-2">
            ${(portfolio.crypto_balance + portfolio.crypto_positions_value).toFixed(2)}
          </p>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Cash: ${portfolio.crypto_balance.toFixed(2)}</p>
            <p>Holdings: ${portfolio.crypto_positions_value.toFixed(2)}</p>
          </div>
        </div>

        {/* Grid */}
        <div
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-purple-500 transition"
          onClick={() => setSelectedBot(selectedBot === 'grid' ? 'all' : 'grid')}
        >
          <p className="text-slate-400 text-sm font-medium">Grid Trading</p>
          <p className="text-2xl font-bold text-white mt-2">
            ${(portfolio.grid_balance + portfolio.grid_positions_value).toFixed(2)}
          </p>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p>Cash: ${portfolio.grid_balance.toFixed(2)}</p>
            <p>Grids: ${portfolio.grid_positions_value.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Chart */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">30-Day P&L Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pnlHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Line
                type="monotone"
                dataKey="profit_loss"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="P&L"
              />
              <Line
                type="monotone"
                dataKey="total_value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Total Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Capital Allocation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} $${entry.value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Open Positions {selectedBot !== 'all' && `(${selectedBot.toUpperCase()})`}
          </h2>
        </div>

        {positions.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            No open positions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 text-slate-300 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Market</th>
                  <th className="px-6 py-3 text-left font-semibold">Side</th>
                  <th className="px-6 py-3 text-right font-semibold">Quantity</th>
                  <th className="px-6 py-3 text-right font-semibold">Entry Price</th>
                  <th className="px-6 py-3 text-right font-semibold">Current Price</th>
                  <th className="px-6 py-3 text-right font-semibold">Value</th>
                  <th className="px-6 py-3 text-right font-semibold">P&L</th>
                  <th className="px-6 py-3 text-right font-semibold">ROI %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {positions.map((position) => (
                  <tr key={position.id} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-white font-medium">{position.market_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        ['yes', 'buy', 'long'].includes(position.side)
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {position.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300">{position.quantity}</td>
                    <td className="px-6 py-4 text-right text-slate-300">${position.entry_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-300">${position.current_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-300">${position.value.toFixed(2)}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {position.unrealized_pnl >= 0 ? '+' : ''}{position.unrealized_pnl.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${
                      position.unrealized_pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {position.unrealized_pnl_percent >= 0 ? '+' : ''}{position.unrealized_pnl_percent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
