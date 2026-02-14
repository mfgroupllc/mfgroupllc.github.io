/**
 * Main App Component
 * React Router setup with protected routes, navigation, and error handling
 */

import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import LoginPage from './pages/Login';
import PortfolioPage from './pages/Portfolio';
import TransactionsPage from './pages/Transactions';
import LogsPage from './pages/Logs';
import BotControlPage from './pages/BotControl';
import SettingsPage from './pages/Settings';

/**
 * Protected Route Wrapper
 * Redirects to login if not authenticated
 */
interface ProtectedRouteProps {
  element: React.ReactElement;
  isAuthenticated: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/dashboard/" replace />;
};

/**
 * Sidebar Navigation Component
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Portfolio', path: '/dashboard/portfolio', icon: '📊' },
    { label: 'Transactions', path: '/dashboard/transactions', icon: '💰' },
    { label: 'Logs', path: '/dashboard/logs', icon: '📋' },
    { label: 'Bot Control', path: '/dashboard/bot-control', icon: '🤖' },
    { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 transform transition-transform duration-300 z-40 lg:static lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Trading Hub
          </h1>
          <p className="text-slate-500 text-xs mt-1">Portfolio Dashboard</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-700 mx-4 my-4 bg-slate-800 rounded-lg">
            {user.github_avatar_url && (
              <img
                src={user.github_avatar_url}
                alt={user.github_username}
                className="w-10 h-10 rounded-lg mb-2"
              />
            )}
            <p className="text-white font-semibold text-sm">{user.github_username}</p>
            <p className="text-slate-500 text-xs">User ID: {user.id.substring(0, 8)}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              onClick={onClose}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 space-y-2">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
          <p className="text-slate-600 text-xs text-center">
            Dashboard v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

/**
 * Top Navigation Bar Component
 */
interface TopNavProps {
  user: any;
  onMenuClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ user, onMenuClick }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <h2 className="text-white font-semibold">Trading Dashboard</h2>
            <p className="text-slate-400 text-xs">Real-time portfolio management</p>
          </div>
        </div>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div>
                <p className="text-white text-sm font-medium">{user.github_username}</p>
                <p className="text-slate-400 text-xs">Authenticated</p>
              </div>
              {user.github_avatar_url && (
                <img
                  src={user.github_avatar_url}
                  alt={user.github_username}
                  className="w-8 h-8 rounded-full border border-slate-600"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Main Layout Component
 */
interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Error Boundary Component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg border border-red-800 p-8 max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-red-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App Component
 */
export const App: React.FC = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter basename="/dashboard">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/portfolio" replace />
              ) : (
                <LoginPage />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <Layout user={user} onLogout={logout}>
                    <PortfolioPage />
                  </Layout>
                }
              />
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <Layout user={user} onLogout={logout}>
                    <TransactionsPage />
                  </Layout>
                }
              />
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <Layout user={user} onLogout={logout}>
                    <LogsPage />
                  </Layout>
                }
              />
            }
          />

          <Route
            path="/bot-control"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <Layout user={user} onLogout={logout}>
                    <BotControlPage />
                  </Layout>
                }
              />
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                element={
                  <Layout user={user} onLogout={logout}>
                    <SettingsPage user={user} onLogout={logout} />
                  </Layout>
                }
              />
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? '/portfolio' : '/'}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
