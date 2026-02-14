/**
 * Settings Page
 * User preferences, API configuration, and account management
 */
import React from 'react';
import { User } from '../types/api';
interface SettingsPageProps {
    user: User | null;
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
export declare const SettingsPage: React.FC<SettingsPageProps>;
export default SettingsPage;
//# sourceMappingURL=Settings.d.ts.map