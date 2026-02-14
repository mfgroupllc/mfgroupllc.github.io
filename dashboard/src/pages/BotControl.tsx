/**
 * Bot Control Page
 * Control panel for managing bot operations (pause, resume, restart, git pull)
 */

import React, { useState } from 'react';
import { useBots, useApiCall } from '../hooks/useApi';
import { BotStatus } from '../types/api';


/**
 * Confirmation Dialog Component
 */
interface ConfirmDialogProps {
  title: string;
  message: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  danger,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-300 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition text-white ${
              danger
                ? 'bg-red-700 hover:bg-red-600'
                : 'bg-blue-700 hover:bg-blue-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * BotControlPage Component
 * Features:
 * - Status display for all bots
 * - Pause/Resume/Restart controls
 * - Git pull with deployment
 * - Manual cycle trigger
 * - Last cycle result display
 */
export const BotControlPage: React.FC = () => {
  const { bots, isLoading, error, refresh } = useBots();
  const { call: apiCall, isLoading: isApiLoading } = useApiCall();
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    action: string;
    botName?: string;
  } | null>(null);
  const [operationResult, setOperationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Mock bots for demo
  const mockBots: BotStatus[] = [
    {
      name: 'kalshi',
      is_running: true,
      is_paused: false,
      last_cycle_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      last_cycle_duration_ms: 1250,
      last_trades_count: 2,
      total_trades_today: 8,
      next_cycle_time: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      capital: 105.32,
      positions_count: 3,
    },
    {
      name: 'crypto',
      is_running: true,
      is_paused: false,
      last_cycle_time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      last_cycle_duration_ms: 890,
      last_trades_count: 0,
      total_trades_today: 1,
      next_cycle_time: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
      capital: 324.15,
      positions_count: 2,
    },
    {
      name: 'grid',
      is_running: true,
      is_paused: false,
      last_cycle_time: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      last_cycle_duration_ms: 650,
      last_trades_count: 1,
      total_trades_today: 5,
      next_cycle_time: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
      capital: 175.50,
      positions_count: 1,
    },
  ];

  const displayBots = bots.length > 0 ? bots : mockBots;

  const handleBotAction = async (action: string, botName?: string) => {
    if (action === 'pause') {
      setDialog({
        title: `Pause ${botName?.toUpperCase()}?`,
        message: `The ${botName} bot will stop trading. You can resume it at any time.`,
        action: 'pause',
        botName,
      });
    } else if (action === 'resume') {
      setDialog({
        title: `Resume ${botName?.toUpperCase()}?`,
        message: `The ${botName} bot will resume trading immediately.`,
        action: 'resume',
        botName,
      });
    } else if (action === 'restart') {
      setDialog({
        title: `Restart ${botName?.toUpperCase()}?`,
        message: `The ${botName} bot will be restarted. This may take a few seconds.`,
        danger: true,
        action: 'restart',
        botName,
      });
    } else if (action === 'git-pull') {
      setDialog({
        title: 'Deploy Latest Code',
        message: 'This will pull the latest changes from GitHub and restart all bots.',
        danger: true,
        action: 'git-pull',
      });
    } else if (action === 'scan') {
      setDialog({
        title: `Trigger Manual Scan`,
        message: `The ${botName} bot will perform an immediate scan cycle.`,
        action: 'scan',
        botName,
      });
    }
  };

  const executeAction = async () => {
    if (!dialog) return;

    try {
      if (dialog.action === 'pause' && dialog.botName) {
        await apiCall(`/api/bots/${dialog.botName}/pause`, 'POST');
      } else if (dialog.action === 'resume' && dialog.botName) {
        await apiCall(`/api/bots/${dialog.botName}/resume`, 'POST');
      } else if (dialog.action === 'restart' && dialog.botName) {
        await apiCall(`/api/bots/${dialog.botName}/restart`, 'POST');
      } else if (dialog.action === 'git-pull') {
        await apiCall('/api/deploy/git-pull', 'POST');
      } else if (dialog.action === 'scan' && dialog.botName) {
        await apiCall(`/api/bots/${dialog.botName}/scan`, 'POST');
      }

      setOperationResult({
        success: true,
        message: `${dialog.action.replace('-', ' ')} completed successfully`,
      });

      setTimeout(() => {
        setDialog(null);
        setOperationResult(null);
        refresh();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      setOperationResult({
        success: false,
        message,
      });
    }
  };

  if (error && displayBots.length === 0) {
    return (
      <div className="p-6 bg-red-900/10 border border-red-800 rounded-lg">
        <p className="text-red-400 font-semibold">Failed to load bot status</p>
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

  return (
    <div className="space-y-6">
      {/* Global Actions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Global Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleBotAction('git-pull')}
            disabled={isApiLoading}
            className="flex-1 px-4 py-3 bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Git Pull & Deploy
          </button>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-900 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Status
          </button>
        </div>
      </div>

      {/* Operation Result */}
      {operationResult && (
        <div className={`rounded-lg border p-4 ${
          operationResult.success
            ? 'bg-green-900/10 border-green-800 text-green-400'
            : 'bg-red-900/10 border-red-800 text-red-400'
        }`}>
          <p className="font-semibold">{operationResult.message}</p>
        </div>
      )}

      {/* Bot Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayBots.map((bot) => (
          <div key={bot.name} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white capitalize">{bot.name} Bot</h3>
              <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full ${bot.is_running ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {bot.is_paused && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-700">
              <p className="text-sm text-slate-400">
                Status: <span className="text-slate-300 font-medium">
                  {bot.is_running
                    ? bot.is_paused
                      ? 'PAUSED'
                      : 'RUNNING'
                    : 'STOPPED'}
                </span>
              </p>
              <p className="text-sm text-slate-400">
                Last Cycle: <span className="text-slate-300 font-mono text-xs">
                  {new Date(bot.last_cycle_time).toLocaleTimeString()}
                </span>
              </p>
              <p className="text-sm text-slate-400">
                Duration: <span className="text-slate-300 font-medium">{bot.last_cycle_duration_ms}ms</span>
              </p>
            </div>

            {/* Metrics */}
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-700">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Last Cycle Trades:</span>
                <span className="text-slate-300 font-medium">{bot.last_trades_count}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Today Total:</span>
                <span className="text-slate-300 font-medium">{bot.total_trades_today}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Capital:</span>
                <span className="text-slate-300 font-medium">${bot.capital.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Positions:</span>
                <span className="text-slate-300 font-medium">{bot.positions_count}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              {bot.is_running && !bot.is_paused && (
                <button
                  onClick={() => handleBotAction('pause', bot.name)}
                  disabled={isApiLoading}
                  className="w-full px-3 py-2 bg-yellow-700 hover:bg-yellow-600 disabled:bg-yellow-900 text-white rounded text-sm font-medium transition"
                >
                  Pause
                </button>
              )}

              {(bot.is_paused || !bot.is_running) && (
                <button
                  onClick={() => handleBotAction('resume', bot.name)}
                  disabled={isApiLoading}
                  className="w-full px-3 py-2 bg-green-700 hover:bg-green-600 disabled:bg-green-900 text-white rounded text-sm font-medium transition"
                >
                  Resume
                </button>
              )}

              <button
                onClick={() => handleBotAction('restart', bot.name)}
                disabled={isApiLoading}
                className="w-full px-3 py-2 bg-orange-700 hover:bg-orange-600 disabled:bg-orange-900 text-white rounded text-sm font-medium transition"
              >
                Restart
              </button>

              <button
                onClick={() => handleBotAction('scan', bot.name)}
                disabled={isApiLoading || !bot.is_running}
                className="w-full px-3 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-900 text-white rounded text-sm font-medium transition"
              >
                Manual Scan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          danger={dialog.danger}
          confirmText={dialog.danger ? 'Yes, proceed' : 'Confirm'}
          onConfirm={executeAction}
          onCancel={() => {
            setDialog(null);
            setOperationResult(null);
          }}
        />
      )}
    </div>
  );
};

export default BotControlPage;
