import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Login Page
 * Cloudflare Access Gateway Entry Point
 *
 * Since authentication is handled at the network edge by Cloudflare,
 * this page serves as a bridge to trigger the Cloudflare SSO flow.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
/**
 * LoginPage Component
 * Redirects users to API to trigger Cloudflare Access authentication
 */
export const LoginPage = () => {
    const { isLoading, error, isAuthenticated } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);
    /**
     * Redirect to portfolio if already authenticated
     */
    useEffect(() => {
        if (isAuthenticated) {
            setIsRedirecting(true);
            setTimeout(() => {
                window.location.href = '/dashboard/portfolio';
            }, 500);
        }
    }, [isAuthenticated]);
    const handleLogin = () => {
        // Redirect to API's auth endpoint which triggers Cloudflare Access login
        // After authentication, the API redirects back to the dashboard
        const returnUrl = encodeURIComponent(window.location.origin + '/dashboard/portfolio');
        window.location.href = `${API_URL}/auth/login?redirect=${returnUrl}`;
    };
    if (isRedirecting) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4 mx-auto" }), _jsx("p", { className: "text-white text-lg", children: "Authenticating with Gateway..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }) }) }), _jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Secure Access" }), _jsx("p", { className: "text-slate-400", children: "Cloudflare Zero Trust Gateway" })] }), _jsxs("div", { className: "mb-8 space-y-3", children: [_jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Real-time portfolio P&L tracking"] }), _jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Bot control and monitoring"] }), _jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Transaction history & analytics"] }), _jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Real-time log streaming"] })] }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg", children: _jsxs("p", { className: "text-red-400 text-sm font-medium", children: [_jsx("span", { className: "font-bold", children: "Error:" }), " ", error] }) })), _jsx("div", { className: "mb-8 bg-slate-900/50 p-4 rounded-md border border-slate-700", children: _jsx("p", { className: "text-slate-300 text-sm text-center", children: "This dashboard is protected by Cloudflare Access. You must authenticate via the secure gateway to view portfolio data." }) }), _jsx("button", { onClick: handleLogin, disabled: isLoading, className: "w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4 shadow-lg", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Checking Access..."] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" }) }), "Log In via Cloudflare"] })) }), _jsx("div", { className: "pt-6 border-t border-slate-700", children: _jsx("p", { className: "text-slate-500 text-xs text-center", children: "You will be redirected to the API gateway for authentication." }) })] }), _jsxs("div", { className: "mt-8 text-center", children: [_jsx("p", { className: "text-slate-500 text-sm", children: "Protected by industry-standard security practices" }), _jsxs("div", { className: "mt-3 flex justify-center gap-6 text-slate-600 text-xs", children: [_jsx("a", { href: "#", className: "hover:text-slate-400 transition", children: "Privacy" }), _jsx("a", { href: "#", className: "hover:text-slate-400 transition", children: "Security" }), _jsx("a", { href: "#", className: "hover:text-slate-400 transition", children: "Support" })] })] })] }) }));
};
export default LoginPage;
//# sourceMappingURL=Login.js.map