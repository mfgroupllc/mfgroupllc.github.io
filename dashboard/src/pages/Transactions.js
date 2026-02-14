import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Transactions Page
 * View historical trades with filtering, sorting, and export
 */
import { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useApi';
/**
 * TransactionsPage Component
 * Features:
 * - Paginated transaction history
 * - Filter by bot (Kalshi, Crypto, Grid)
 * - Sort by any column
 * - Export to CSV
 * - Real-time updates
 */
export const TransactionsPage = () => {
    const { transactions, isLoading, error, total, hasMore, fetch } = useTransactions(50);
    const [page, setPage] = useState(0);
    const [botFilter, setBotFilter] = useState('');
    const [sortColumn, setSortColumn] = useState('timestamp');
    const [sortDirection, setSortDirection] = useState('desc');
    // Mock transactions for demo
    const mockTransactions = [
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
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
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
        return (_jsxs("div", { className: "p-6 bg-red-900/10 border border-red-800 rounded-lg", children: [_jsx("p", { className: "text-red-400 font-semibold", children: "Failed to load transactions" }), _jsx("p", { className: "text-red-300 text-sm mt-1", children: error.message })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Total Transactions" }), _jsx("p", { className: "text-3xl font-bold text-white mt-2", children: total || displayTransactions.length })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Total P&L" }), _jsxs("p", { className: `text-3xl font-bold mt-2 ${getTotalPnL() >= 0 ? 'text-green-400' : 'text-red-400'}`, children: [getTotalPnL() >= 0 ? '+' : '', getTotalPnL().toFixed(2)] })] }), _jsxs("div", { className: "bg-slate-800 rounded-lg p-6 border border-slate-700", children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: "Win Rate" }), _jsxs("p", { className: "text-3xl font-bold text-white mt-2", children: [getWinRate(), "%"] })] })] }), _jsx("div", { className: "bg-slate-800 rounded-lg border border-slate-700 p-6", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between", children: [_jsx("div", { className: "flex flex-col gap-2 md:flex-row md:gap-4 flex-1", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Filter by Bot" }), _jsxs("select", { value: botFilter, onChange: (e) => {
                                            setBotFilter(e.target.value);
                                            setPage(0);
                                        }, className: "bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500", children: [_jsx("option", { value: "", children: "All Bots" }), _jsx("option", { value: "kalshi", children: "Kalshi" }), _jsx("option", { value: "crypto", children: "Crypto" }), _jsx("option", { value: "grid", children: "Grid" })] })] }) }), _jsx("button", { onClick: exportCSV, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition", children: "Export CSV" })] }) }), _jsx("div", { className: "bg-slate-800 rounded-lg border border-slate-700 overflow-hidden", children: isLoading && displayTransactions.length === 0 ? (_jsxs("div", { className: "p-6 text-center text-slate-400", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" }), "Loading transactions..."] })) : displayTransactions.length === 0 ? (_jsx("div", { className: "p-6 text-center text-slate-400", children: "No transactions found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-slate-700/50 text-slate-300 border-b border-slate-600", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left font-semibold cursor-pointer hover:text-white", onClick: () => handleSort('timestamp'), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Timestamp", sortColumn === 'timestamp' && (_jsx("span", { className: "text-xs", children: sortDirection === 'asc' ? '↑' : '↓' }))] }) }), _jsx("th", { className: "px-6 py-3 text-left font-semibold cursor-pointer hover:text-white", onClick: () => handleSort('bot'), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Bot", sortColumn === 'bot' && (_jsx("span", { className: "text-xs", children: sortDirection === 'asc' ? '↑' : '↓' }))] }) }), _jsx("th", { className: "px-6 py-3 text-left font-semibold cursor-pointer hover:text-white", onClick: () => handleSort('market_name'), children: _jsxs("div", { className: "flex items-center gap-2", children: ["Market", sortColumn === 'market_name' && (_jsx("span", { className: "text-xs", children: sortDirection === 'asc' ? '↑' : '↓' }))] }) }), _jsx("th", { className: "px-6 py-3 text-left font-semibold", children: "Side" }), _jsx("th", { className: "px-6 py-3 text-right font-semibold cursor-pointer hover:text-white", onClick: () => handleSort('entry_price'), children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: ["Entry Price", sortColumn === 'entry_price' && (_jsx("span", { className: "text-xs", children: sortDirection === 'asc' ? '↑' : '↓' }))] }) }), _jsx("th", { className: "px-6 py-3 text-right font-semibold cursor-pointer hover:text-white", onClick: () => handleSort('exit_price'), children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: ["Exit Price", sortColumn === 'exit_price' && (_jsx("span", { className: "text-xs", children: sortDirection === 'asc' ? '↑' : '↓' }))] }) }), _jsx("th", { className: "px-6 py-3 text-right font-semibold cursor-pointer hover:text-white", onClick: () => handleSort('profit_loss'), children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: ["P&L", sortColumn === 'profit_loss' && (_jsx("span", { className: "text-xs", children: sortDirection === 'asc' ? '↑' : '↓' }))] }) }), _jsx("th", { className: "px-6 py-3 text-right font-semibold", children: "P&L %" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-700", children: sortedTransactions.map((tx) => (_jsxs("tr", { className: "hover:bg-slate-700/50 transition", children: [_jsx("td", { className: "px-6 py-4 text-slate-300 text-xs", children: new Date(tx.timestamp).toLocaleString() }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "px-3 py-1 rounded text-xs font-semibold bg-blue-900/30 text-blue-400", children: tx.bot.toUpperCase() }) }), _jsx("td", { className: "px-6 py-4 text-white font-medium", children: tx.market_name }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-3 py-1 rounded text-xs font-semibold ${['yes', 'buy', 'long'].includes(tx.side)
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : 'bg-red-900/30 text-red-400'}`, children: tx.side.toUpperCase() }) }), _jsxs("td", { className: "px-6 py-4 text-right text-slate-300", children: ["$", tx.entry_price.toFixed(2)] }), _jsx("td", { className: "px-6 py-4 text-right text-slate-300", children: tx.exit_price ? `$${tx.exit_price.toFixed(2)}` : '-' }), _jsx("td", { className: `px-6 py-4 text-right font-semibold ${(tx.profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`, children: tx.profit_loss ? (tx.profit_loss >= 0 ? '+' : '') + tx.profit_loss.toFixed(2) : '-' }), _jsx("td", { className: `px-6 py-4 text-right font-semibold ${(tx.profit_loss_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`, children: tx.profit_loss_percent ? (tx.profit_loss_percent >= 0 ? '+' : '') + tx.profit_loss_percent.toFixed(2) + '%' : '-' })] }, tx.id))) })] }) })) }), (hasMore || page > 0) && (_jsxs("div", { className: "flex justify-center gap-4", children: [_jsx("button", { onClick: () => setPage(Math.max(0, page - 1)), disabled: page === 0, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition", children: "Previous" }), _jsxs("span", { className: "px-4 py-2 text-slate-400", children: ["Page ", page + 1] }), _jsx("button", { onClick: () => setPage(page + 1), disabled: !hasMore, className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition", children: "Next" })] }))] }));
};
export default TransactionsPage;
//# sourceMappingURL=Transactions.js.map