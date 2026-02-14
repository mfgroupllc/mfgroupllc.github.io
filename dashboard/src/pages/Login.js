import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Login Page
 * GitHub OAuth authentication flow with beautiful UI
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
/**
 * LoginPage Component
 * Displays login interface and handles GitHub OAuth redirect
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
    const handleLogin = async () => {
        try {
            // With Cloudflare Access, authentication happens automatically
            // Just redirect to the protected route
            window.location.href = '/dashboard/portfolio';
        }
        catch (err) {
            console.error('Login failed:', err);
        }
    };
    if (isRedirecting) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto" }), _jsx("p", { className: "text-white text-lg", children: "Redirecting to portfolio..." })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) }) }), _jsx("h1", { className: "text-3xl font-bold text-white mb-2", children: "Trading Portfolio" }), _jsx("p", { className: "text-slate-400", children: "Real-time multi-bot trading dashboard" })] }), _jsxs("div", { className: "mb-8 space-y-3", children: [_jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Real-time portfolio P&L tracking"] }), _jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Bot control and monitoring"] }), _jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Transaction history & analytics"] }), _jsxs("div", { className: "flex items-center text-slate-300 text-sm", children: [_jsx("svg", { className: "w-5 h-5 text-green-500 mr-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }), "Real-time log streaming"] })] }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg", children: _jsxs("p", { className: "text-red-400 text-sm font-medium", children: [_jsx("span", { className: "font-bold", children: "Error:" }), " ", error] }) })), _jsx("button", { onClick: handleLogin, disabled: isLoading, className: "w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4 shadow-lg", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }), "Logging in..."] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-5 h-5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { d: "M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.545 2.91 1.184.092-.923.35-1.545.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.268.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.192 20 14.436 20 10.017 20 4.484 15.522 0 10 0z" }) }), "Login with GitHub"] })) }), _jsxs("div", { className: "pt-6 border-t border-slate-700", children: [_jsx("p", { className: "text-slate-500 text-xs text-center", children: "Secure authentication via GitHub OAuth" }), _jsx("p", { className: "text-slate-600 text-xs text-center mt-2", children: "Your API key is securely stored and never shared" })] })] }), _jsxs("div", { className: "mt-8 text-center", children: [_jsx("p", { className: "text-slate-500 text-sm", children: "Protected by industry-standard security practices" }), _jsxs("div", { className: "mt-3 flex justify-center gap-6 text-slate-600 text-xs", children: [_jsx("a", { href: "#", className: "hover:text-slate-400 transition", children: "Privacy" }), _jsx("a", { href: "#", className: "hover:text-slate-400 transition", children: "Security" }), _jsx("a", { href: "#", className: "hover:text-slate-400 transition", children: "Support" })] })] })] }) }));
};
export default LoginPage;
//# sourceMappingURL=Login.js.map