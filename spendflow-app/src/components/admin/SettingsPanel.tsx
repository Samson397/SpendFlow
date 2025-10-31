'client';

import { useState } from 'react';
import { Settings, Mail, Shield, Database, Clock, Bell, Users, CreditCard, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    appName: 'SpendFlow',
    adminEmail: 'admin@spendflow.com',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    dataRetentionDays: 90,
    sessionTimeout: 30, // in minutes
    maxLoginAttempts: 5,
    enable2FA: true,
    enableAuditLogs: true,
    enableAPIAccess: false,
    backupFrequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Here you would typically make an API call to save the settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Admin Settings</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : (
            <>
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg shadow">
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-400'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="appName" className="block text-sm font-medium text-slate-300">
                      Application Name
                    </label>
                    <input
                      type="text"
                      name="appName"
                      id="appName"
                      value={settings.appName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-300">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      id="adminEmail"
                      value={settings.adminEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="registrationEnabled"
                        name="registrationEnabled"
                        type="checkbox"
                        checked={settings.registrationEnabled}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="registrationEnabled" className="font-medium text-slate-300">
                        Allow New User Registrations
                      </label>
                      <p className="text-slate-400">Enable or disable user registration on the platform</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="maintenanceMode"
                        name="maintenanceMode"
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="maintenanceMode" className="font-medium text-slate-300">
                        Maintenance Mode
                      </label>
                      <p className="text-slate-400">Put the application in maintenance mode</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Security Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sessionTimeout" className="block text-sm font-medium text-slate-300">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    id="sessionTimeout"
                    min="1"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-slate-300">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    name="maxLoginAttempts"
                    id="maxLoginAttempts"
                    min="1"
                    value={settings.maxLoginAttempts}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enable2FA"
                      name="enable2FA"
                      type="checkbox"
                      checked={settings.enable2FA}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enable2FA" className="font-medium text-slate-300">
                      Enable Two-Factor Authentication (2FA)
                    </label>
                    <p className="text-slate-400">Require users to enable 2FA for their accounts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableAuditLogs"
                      name="enableAuditLogs"
                      type="checkbox"
                      checked={settings.enableAuditLogs}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableAuditLogs" className="font-medium text-slate-300">
                      Enable Audit Logs
                    </label>
                    <p className="text-slate-400">Log all administrative actions for security and compliance</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="emailNotifications" className="font-medium text-slate-300">
                      Email Notifications
                    </label>
                    <p className="text-slate-400">Enable or disable email notifications for system events</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Email Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Email Server Status
                  </label>
                  <div className="mt-2 px-4 py-3 bg-slate-900 rounded-md text-sm">
                    <span className="inline-flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-slate-300">Connected to SMTP server</span>
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor="fromEmail" className="block text-sm font-medium text-slate-300">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    name="fromEmail"
                    id="fromEmail"
                    value="noreply@spendflow.com"
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Backup & Restore</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="backupFrequency" className="block text-sm font-medium text-slate-300">
                    Backup Frequency
                  </label>
                  <select
                    id="backupFrequency"
                    name="backupFrequency"
                    value={settings.backupFrequency}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dataRetentionDays" className="block text-sm font-medium text-slate-300">
                    Data Retention (days)
                  </label>
                  <input
                    type="number"
                    name="dataRetentionDays"
                    id="dataRetentionDays"
                    min="1"
                    value={settings.dataRetentionDays}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-slate-700 bg-slate-900 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Database className="-ml-1 mr-2 h-4 w-4" />
                  Create Manual Backup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
