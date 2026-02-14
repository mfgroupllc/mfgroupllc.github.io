import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Portfolio Dashboard Page
 * Displays real-time portfolio summary, positions, and P&L chart
 */
import { useState, useMemo } from 'react';
import { usePortfolio } from '../hooks/useApi';
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
export const PortfolioPage = () => {
    const { portfolio, isLoading, error, refresh } = usePortfolio(30000);
    const [selectedBot, setSelectedBot] = useState('all');
    // Mock P&L data - in production, fetch from /api/portfolio/pnl-history
    const pnlHistory = useMemo(() => {
        const data = [];
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
    const allPositions = useMemo(() => [
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
        if (!portfolio)
            return [];
        return [
            { name: 'Kalshi', value: portfolio.kalshi_balance + portfolio.kalshi_positions_value, color: '#3b82f6' },
            { name: 'Crypto', value: portfolio.crypto_balance + portfolio.crypto_positions_value, color: '#f59e0b' },
            { name: 'Grid', value: portfolio.grid_balance + portfolio.grid_positions_value, color: '#8b5cf6' },
        ].filter(item => item.value > 0);
    }, [portfolio]);
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto" }), _jsx("p", { className: "text-slate-400", children: "Loading portfolio..." })] }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-6 bg-red-900/10 border border-red-800 rounded-lg", children: [_jsx("p", { className: "text-red-400 font-semibold", children: "Failed to load portfolio" }), _jsx("p", { className: "text-red-300 text-sm mt-1", children: error.message }), _jsx("button", { onClick: refresh, className: "mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg", children: "Retry" })] }));
    }
    if (!portfolio)
        return null;
    const positiveROI = portfolio.roi_percent >= 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Total Capital" }), _jsxs("p", { className: "text-3xl font-bold text-white mt-2", children: ["$", portfolio.total_capital.toFixed(2)] }), _jsx("p", { className: "text-slate-500 text-xs mt-2", children: "Starting balance" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Current Value" }), _jsxs("p", { className: "text-3xl font-bold text-white mt-2", children: ["$", portfolio.current_value.toFixed(2)] }), _jsx("p", { className: "text-slate-500 text-xs mt-2", children: "Including positions" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Total P&L" }), _jsxs("p", { className: `text-3xl font-bold mt-2 ${positiveROI ? 'text-green-400' : 'text-red-400'}`, children: [positiveROI ? '+' : '', portfolio.total_profit_loss.toFixed(2)] }), _jsx("p", { className: "text-slate-500 text-xs mt-2", children: "Realized + Unrealized" })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Total ROI" }), _jsxs("p", { className: `text-3xl font-bold mt-2 ${positiveROI ? 'text-green-400' : 'text-red-400'}`, children: [positiveROI ? '+' : '', portfolio.roi_percent.toFixed(2), "%"] }), _jsx("p", { className: "text-slate-500 text-xs mt-2", children: "Return on investment" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Daily P&L" }), _jsxs("p", { className: `text-2xl font-bold mt-2 ${portfolio.daily_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [portfolio.daily_profit_loss >= 0 ? '+' : '', portfolio.daily_profit_loss.toFixed(2)] })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Daily ROI" }), _jsxs("p", { className: `text-2xl font-bold mt-2 ${portfolio.daily_roi_percent >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [portfolio.daily_roi_percent >= 0 ? '+' : '', portfolio.daily_roi_percent.toFixed(3), "%"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-blue-500 transition", onClick: () => setSelectedBot(selectedBot === 'kalshi' ? 'all' : 'kalshi'), children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Kalshi" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-2", children: ["$", (portfolio.kalshi_balance + portfolio.kalshi_positions_value).toFixed(2)] }), _jsxs("div", { className: "mt-3 text-xs text-slate-500 space-y-1", children: [_jsxs("p", { children: ["Cash: $", portfolio.kalshi_balance.toFixed(2)] }), _jsxs("p", { children: ["Positions: $", portfolio.kalshi_positions_value.toFixed(2)] })] })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-amber-500 transition", onClick: () => setSelectedBot(selectedBot === 'crypto' ? 'all' : 'crypto'), children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Crypto" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-2", children: ["$", (portfolio.crypto_balance + portfolio.crypto_positions_value).toFixed(2)] }), _jsxs("div", { className: "mt-3 text-xs text-slate-500 space-y-1", children: [_jsxs("p", { children: ["Cash: $", portfolio.crypto_balance.toFixed(2)] }), _jsxs("p", { children: ["Holdings: $", portfolio.crypto_positions_value.toFixed(2)] })] })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700 cursor-pointer hover:border-purple-500 transition", onClick: () => setSelectedBot(selectedBot === 'grid' ? 'all' : 'grid'), children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Grid Trading" }), _jsxs("p", { className: "text-2xl font-bold text-white mt-2", children: ["$", (portfolio.grid_balance + portfolio.grid_positions_value).toFixed(2)] }), _jsxs("div", { className: "mt-3 text-xs text-slate-500 space-y-1", children: [_jsxs("p", { children: ["Cash: $", portfolio.grid_balance.toFixed(2)] }), _jsxs("p", { children: ["Grids: $", portfolio.grid_positions_value.toFixed(2)] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("h2", { className: "text-lg font-semibold text-white mb-4", children: "30-Day P&L Trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: pnlHistory, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155" }), _jsx(XAxis, { dataKey: "date", stroke: "#94a3b8", style: { fontSize: '12px' } }), _jsx(YAxis, { stroke: "#94a3b8", style: { fontSize: '12px' } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155' }, labelStyle: { color: '#e2e8f0' } }), _jsx(Legend, { wrapperStyle: { color: '#cbd5e1' } }), _jsx(Line, { type: "monotone", dataKey: "profit_loss", stroke: "#10b981", strokeWidth: 2, dot: false, name: "P&L" }), _jsx(Line, { type: "monotone", dataKey: "total_value", stroke: "#3b82f6", strokeWidth: 2, dot: false, name: "Total Value" })] }) })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("h2", { className: "text-lg font-semibold text-white mb-4", children: "Capital Allocation" }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieData, cx: "50%", cy: "50%", labelLine: false, label: (entry) => `${entry.name} $${entry.value.toFixed(0)}`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: pieData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155' }, labelStyle: { color: '#e2e8f0' } })] }) })] })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg border border-slate-700 overflow-hidden", children: [_jsx("div", { className: "p-6 border-b border-slate-700", children: _jsxs("h2", { className: "text-lg font-semibold text-white", children: ["Open Positions ", selectedBot !== 'all' && `(${selectedBot.toUpperCase()})`] }) }), positions.length === 0 ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "No open positions" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-700/50 text-slate-300 border-b border-slate-600", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left font-semibold", children: "Market" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold", children: "Side" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "Quantity" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "Entry Price" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "Current Price" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "Value" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "P&L" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "ROI %" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-700", children: positions.map((position) => (_jsxs("tr", { className: "hover:bg-slate-700/50 transition", children: [_jsx("td", { className: "px-6 py-4 text-white font-medium", children: position.market_name }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded text-xs font-semibold ${['yes', 'buy', 'long'].includes(position.side)
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : 'bg-red-900/30 text-red-400'}`, children: position.side.toUpperCase() }) }), _jsx("td", { className: "px-6 py-4 text-right text-slate-300", children: position.quantity }), _jsxs("td", { className: "px-6 py-4 text-right text-slate-300", children: ["$", position.entry_price.toFixed(2)] }), _jsxs("td", { className: "px-6 py-4 text-right text-slate-300", children: ["$", position.current_price.toFixed(2)] }), _jsxs("td", { className: "px-6 py-4 text-right text-slate-300", children: ["$", position.value.toFixed(2)] }), _jsxs("td", { className: `px-6 py-4 text-right font-semibold ${position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [position.unrealized_pnl >= 0 ? '+' : '', position.unrealized_pnl.toFixed(2)] }), _jsxs("td", { className: `px-6 py-4 text-right font-semibold ${position.unrealized_pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [position.unrealized_pnl_percent >= 0 ? '+' : '', position.unrealized_pnl_percent.toFixed(2), "%"] })] }, position.id))) })] }) }))] })] }));
};
export default PortfolioPage;
//# sourceMappingURL=Portfolio.js.map