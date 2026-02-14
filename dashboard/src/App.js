import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Main App Component
 * React Router setup with protected routes, navigation, and error handling
 */
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
// Pages
import LoginPage from './pages/Login';
import PortfolioPage from './pages/Portfolio';
import TransactionsPage from './pages/Transactions';
import LogsPage from './pages/Logs';
import BotControlPage from './pages/BotControl';
import SettingsPage from './pages/Settings';
const ProtectedRoute = ({ element, isAuthenticated }) => {
    return isAuthenticated ? element : _jsx(Navigate, { to: "/dashboard/", replace: true });
};
const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
    const location = useLocation();
    const navItems = [
        { label: 'Portfolio', path: '/dashboard/portfolio', icon: '📊' },
        { label: 'Transactions', path: '/dashboard/transactions', icon: '💰' },
        { label: 'Logs', path: '/dashboard/logs', icon: '📋' },
        { label: 'Bot Control', path: '/dashboard/bot-control', icon: '🤖' },
        { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];
    const isActive = (path) => location.pathname === path;
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 lg:hidden z-30", onClick: onClose })), _jsxs("aside", { className: `fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 z-40 lg:static lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`, children: [_jsxs("div", { className: "p-6 border-b border-slate-700", children: [_jsx("h1", { className: "text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent", children: "Trading Hub" }), _jsx("p", { className: "text-slate-500 text-xs mt-1", children: "Portfolio Dashboard" })] }), user && (_jsxs("div", { className: "p-4 border-b border-slate-700 mx-4 my-4 bg-slate-800 rounded-lg", children: [user.github_avatar_url && (_jsx("img", { src: user.github_avatar_url, alt: user.github_username, className: "w-10 h-10 rounded-lg mb-2" })), _jsx("p", { className: "text-white font-semibold text-sm", children: user.github_username }), _jsxs("p", { className: "text-slate-500 text-xs", children: ["User ID: ", user.id.substring(0, 8)] })] })), _jsx("nav", { className: "p-4 space-y-2", children: navItems.map((item) => (_jsxs(Link, { to: item.path, className: `block px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-blue-700 text-white'
                                : 'text-slate-300 hover:bg-slate-800'}`, onClick: onClose, children: [_jsx("span", { className: "mr-2", children: item.icon }), item.label] }, item.path))) }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 space-y-2", children: [_jsx("button", { onClick: onLogout, className: "w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition", children: "Logout" }), _jsx("p", { className: "text-slate-600 text-xs text-center", children: "Dashboard v1.0.0" })] })] })] }));
};
const TopNav = ({ user, onMenuClick }) => {
    return (_jsx("header", { className: "bg-slate-800 border-b border-slate-700 sticky top-0 z-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: onMenuClick, className: "lg:hidden p-2 hover:bg-slate-700 rounded-lg transition", children: _jsx("svg", { className: "w-6 h-6 text-slate-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-white font-semibold", children: "Trading Dashboard" }), _jsx("p", { className: "text-slate-400 text-xs", children: "Real-time portfolio management" })] })] }), user && (_jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "hidden sm:flex items-center gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: user.github_username }), _jsx("p", { className: "text-slate-400 text-xs", children: "Authenticated" })] }), user.github_avatar_url && (_jsx("img", { src: user.github_avatar_url, alt: user.github_username, className: "w-8 h-8 rounded-full border border-slate-600" }))] }) }))] }) }));
};
const Layout = ({ children, user, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex h-screen bg-slate-900", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onClose: () => setSidebarOpen(false), user: user, onLogout: onLogout }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(TopNav, { user: user, onMenuClick: () => setSidebarOpen(!sidebarOpen) }), _jsx("main", { className: "flex-1 overflow-auto", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: children }) })] })] }));
};
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-slate-800 rounded-lg border border-red-800 p-8 max-w-md", children: [_jsx("h1", { className: "text-2xl font-bold text-white mb-2", children: "Something went wrong" }), _jsx("p", { className: "text-red-400 mb-4", children: this.state.error?.message }), _jsx("button", { onClick: () => window.location.reload(), className: "w-full px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition", children: "Reload Page" })] }) }));
        }
        return this.props.children;
    }
}
/**
 * Main App Component
 */
export const App = () => {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto" }), _jsx("p", { className: "text-slate-300", children: "Loading dashboard..." })] }) }));
    }
    return (_jsx(ErrorBoundary, { children: _jsx(BrowserRouter, { basename: "/dashboard", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: isAuthenticated ? (_jsx(Navigate, { to: "/portfolio", replace: true })) : (_jsx(LoginPage, {})) }), _jsx(Route, { path: "/portfolio", element: _jsx(ProtectedRoute, { isAuthenticated: isAuthenticated, element: _jsx(Layout, { user: user, onLogout: logout, children: _jsx(PortfolioPage, {}) }) }) }), _jsx(Route, { path: "/transactions", element: _jsx(ProtectedRoute, { isAuthenticated: isAuthenticated, element: _jsx(Layout, { user: user, onLogout: logout, children: _jsx(TransactionsPage, {}) }) }) }), _jsx(Route, { path: "/logs", element: _jsx(ProtectedRoute, { isAuthenticated: isAuthenticated, element: _jsx(Layout, { user: user, onLogout: logout, children: _jsx(LogsPage, {}) }) }) }), _jsx(Route, { path: "/bot-control", element: _jsx(ProtectedRoute, { isAuthenticated: isAuthenticated, element: _jsx(Layout, { user: user, onLogout: logout, children: _jsx(BotControlPage, {}) }) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { isAuthenticated: isAuthenticated, element: _jsx(Layout, { user: user, onLogout: logout, children: _jsx(SettingsPage, { user: user, onLogout: logout }) }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: isAuthenticated ? '/portfolio' : '/', replace: true }) })] }) }) }));
};
export default App;
//# sourceMappingURL=App.js.map