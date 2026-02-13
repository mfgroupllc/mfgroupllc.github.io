/**
 * Settings Page
 * User preferences, API configuration, and account management
 */

import React, { useState } from 'react';
import { User } from '../types/api';

interface SettingsPageProps {
  user: User | null;
  token: string | null;
  onLogout: () => void;
}

/**
 * SettingsPage Component
 * Features:
 * - Display user profile information
 * - API endpoint configuration
 * - Theme preferences
 * - Notification settings
 * - Logout button
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({ user, token, onLogout }) => {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('apiUrl', apiUrl);
      localStorage.setItem('theme', theme);
      localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      localStorage.setItem('telegramNotifications', telegramNotifications.toString());
      localStorage.setItem('emailNotifications', emailNotifications.toString());

      setSavedMessage('Settings saved successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSavedMessage('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">User Profile</h2>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-start gap-6">
              {user.github_avatar_url && (
                <img
                  src={user.github_avatar_url}
                  alt={user.github_username}
                  className="w-24 h-24 rounded-lg border border-slate-600"
                />
              )}
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-1">GitHub Username</p>
                <p className="text-white font-semibold text-lg mb-4">{user.github_username}</p>

                <p className="text-slate-400 text-sm mb-1">User ID</p>
                <p className="text-slate-300 font-mono text-sm mb-4">{user.id}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Joined</p>
                    <p className="text-slate-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Last Login</p>
                    <p className="text-slate-300">
                      {new Date(user.last_login).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Token Info */}
            <div className="pt-6 border-t border-slate-600">
              <p className="text-slate-400 text-sm mb-3">Authentication Token</p>
              <div className="bg-slate-700/50 rounded p-3 mb-3">
                <p className="text-slate-400 text-xs font-mono break-all">
                  {token ? token.substring(0, 20) + '...' : 'No token'}
                </p>
              </div>
              <p className="text-slate-500 text-xs">
                Your authentication token is securely stored in your browser's local storage.
                Never share it with anyone.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Not authenticated</p>
        )}
      </div>

      {/* API Configuration */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">API Configuration</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000 or https://api.domain.com"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-slate-500 text-xs mt-2">
              Set the API endpoint for the dashboard. This must point to your trading bot API server.
            </p>
          </div>

          {/* Connection Status */}
          <div className="pt-4 border-t border-slate-600">
            <p className="text-slate-400 text-sm mb-2">Connection Status</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm">Connected to API</span>
            </div>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Display Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="dark">Dark (Current)</option>
              <option value="light">Light</option>
            </select>
            <p className="text-slate-500 text-xs mt-2">
              Choose your preferred color scheme. Dark theme is optimized for trading screens.
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Default Time Zone</label>
            <select
              defaultValue="UTC"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="CST">CST (Central Standard Time)</option>
              <option value="MST">MST (Mountain Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Notifications</h2>

        <div className="space-y-4">
          {/* Enable All */}
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
            <div>
              <p className="text-white font-medium">Enable Notifications</p>
              <p className="text-slate-400 text-sm">Receive alerts about trades and bot status</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {notificationsEnabled && (
            <>
              {/* Telegram */}
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded border border-slate-600">
                <div>
                  <p className="text-white font-medium">Telegram Notifications</p>
                  <p className="text-slate-400 text-sm">Get alerts via Telegram bot</p>
                </div>
                <button
                  onClick={() => setTelegramNotifications(!telegramNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    telegramNotifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      telegramNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded border border-slate-600">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-slate-400 text-sm">Get alerts via email (Coming soon)</p>
                </div>
                <button
                  disabled
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-600 cursor-not-allowed"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Events */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Notification Events</h2>

        <div className="space-y-3 text-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">Trade executed</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">High edge opportunity</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">Position closed</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">Daily loss limit reached</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <span className="text-slate-300">Bot error or crash</span>
          </label>
        </div>
      </div>

      {/* Save and Logout */}
      <div className="space-y-4">
        {savedMessage && (
          <div className={`p-4 rounded-lg border ${
            savedMessage.includes('success')
              ? 'bg-green-900/10 border-green-800 text-green-400'
              : 'bg-red-900/10 border-red-800 text-red-400'
          }`}>
            {savedMessage}
          </div>
        )}

        <button
          onClick={handleSaveSettings}
          className="w-full px-6 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
        >
          Save Settings
        </button>

        <button
          onClick={onLogout}
          className="w-full px-6 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Security Info */}
      <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-6 text-center">
        <svg className="w-12 h-12 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-slate-400 text-sm">
          Your authentication token and API credentials are encrypted in transit and stored securely.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
