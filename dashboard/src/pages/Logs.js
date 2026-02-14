import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Logs Page
 * Real-time log viewer with search, filtering, and auto-refresh
 */
import { useState, useEffect } from 'react';
import { useLogs } from '../hooks/useApi';
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
export const LogsPage = () => {
    const { logs, isLoading, error, fetch, startPolling, stopPolling } = useLogs();
    const [botFilter, setBotFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    // Mock logs for demo
    const mockLogs = [
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
        }
        else {
            stopPolling();
        }
        return () => stopPolling();
    }, [isAutoRefresh, botFilter, levelFilter, searchText, startPolling, stopPolling]);
    const displayLogs = logs.length > 0 ? logs : mockLogs;
    const filteredLogs = displayLogs.filter(log => {
        if (botFilter && log.bot !== botFilter)
            return false;
        if (levelFilter && log.level !== levelFilter)
            return false;
        if (searchText && !log.message.toLowerCase().includes(searchText.toLowerCase())) {
            return false;
        }
        return true;
    });
    const getLevelColor = (level) => {
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
    const getBotColor = (bot) => {
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
        return (_jsxs("div", { className: "p-6 bg-red-900/10 border border-red-800 rounded-lg", children: [_jsx("p", { className: "text-red-400 font-semibold", children: "Failed to load logs" }), _jsx("p", { className: "text-red-300 text-sm mt-1", children: error.message })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "bg-slate-800 rounded-lg border border-slate-700 p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Search Logs" }), _jsx("input", { type: "text", value: searchText, onChange: (e) => setSearchText(e.target.value), placeholder: "Search by message...", className: "w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Bot" }), _jsxs("select", { value: botFilter, onChange: (e) => setBotFilter(e.target.value), className: "w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Bots" }), _jsx("option", { value: "kalshi", children: "Kalshi" }), _jsx("option", { value: "crypto", children: "Crypto" }), _jsx("option", { value: "grid", children: "Grid" }), _jsx("option", { value: "system", children: "System" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Level" }), _jsxs("select", { value: levelFilter, onChange: (e) => setLevelFilter(e.target.value), className: "w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Levels" }), _jsx("option", { value: "DEBUG", children: "Debug" }), _jsx("option", { value: "INFO", children: "Info" }), _jsx("option", { value: "WARNING", children: "Warning" }), _jsx("option", { value: "ERROR", children: "Error" }), _jsx("option", { value: "CRITICAL", children: "Critical" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Auto-Refresh" }), _jsx("button", { onClick: () => setIsAutoRefresh(!isAutoRefresh), className: `w-full px-4 py-2 rounded text-sm font-medium transition ${isAutoRefresh
                                                ? 'bg-green-700 hover:bg-green-600 text-white'
                                                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`, children: isAutoRefresh ? '✓ Auto-Refresh (10s)' : 'Manual Refresh' })] })] })] }) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("p", { className: "text-slate-400 text-sm", children: ["Showing ", filteredLogs.length, " of ", displayLogs.length, " logs"] }), _jsx("button", { onClick: () => fetch(botFilter || undefined, levelFilter || undefined, searchText), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition", children: "Refresh Now" })] }), _jsx("div", { className: "bg-slate-800 rounded-lg border border-slate-700 overflow-hidden", children: isLoading && displayLogs.length === 0 ? (_jsxs("div", { className: "p-6 text-center text-slate-400", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" }), "Loading logs..."] })) : filteredLogs.length === 0 ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "No logs found matching your filters" })) : (_jsx("div", { className: "overflow-x-auto max-h-[600px] overflow-y-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-700/50 text-slate-300 border-b border-slate-600 sticky top-0", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left font-semibold min-w-[200px]", children: "Timestamp" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold min-w-[100px]", children: "Bot" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold min-w-[100px]", children: "Level" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold", children: "Message" }), _jsx("th", { className: "px-6 py-3 text-left font-semibold min-w-[150px]", children: "Module" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-700", children: filteredLogs.map((log, index) => (_jsxs("tr", { className: "hover:bg-slate-700/50 transition", children: [_jsx("td", { className: "px-6 py-4 text-slate-400 text-xs whitespace-nowrap", children: new Date(log.timestamp).toLocaleString() }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded text-xs font-semibold ${getBotColor(log.bot)}`, children: log.bot.toUpperCase() }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded text-xs font-semibold ${getLevelColor(log.level)}`, children: log.level }) }), _jsx("td", { className: "px-6 py-4 text-slate-300", children: log.message }), _jsx("td", { className: "px-6 py-4 text-slate-500 text-xs", children: log.module && log.function
                                                ? `${log.module}:${log.function}`
                                                : log.module || '-' })] }, `${log.timestamp}-${index}`))) })] }) })) }), isAutoRefresh && (_jsx("div", { className: "text-center text-slate-500 text-xs", children: "Auto-refreshing every 10 seconds..." }))] }));
};
export default LogsPage;
//# sourceMappingURL=Logs.js.map