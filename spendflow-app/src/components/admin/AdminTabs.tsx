'use client';

import { useState } from 'react';
import { Users, BarChart3, Shield, Bell, Settings, MessageSquare, Activity, Database, AlertCircle, Mail, CreditCard } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import components for better performance
const UserManagement = dynamic(() => import('./UserManagement'), { ssr: false });
const MessagesPanel = dynamic(() => import('./MessagesPanel'), { ssr: false });
const SecurityPanel = dynamic(() => import('./SecurityPanel'), { ssr: false });
const AnnouncementsPanel = dynamic(() => import('./AnnouncementsPanel'), { ssr: false });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false });

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalTransactions: number;
  totalMessages: number;
  newMessages: number;
  systemHealth: 'operational' | 'degraded' | 'maintenance';
  activeUsers: number;
  storageUsed: string;
}

interface AdminTabsProps {
  stats: AdminStats;
  onRefresh: () => Promise<void>;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'announcements', label: 'Announcements', icon: <Bell className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export default function AdminTabs({ stats, onRefresh }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif text-slate-100">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Manage your application's users, security, and settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 flex items-center gap-2 transition-colors"
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'messages' && stats.newMessages > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-xs text-white">
                    {stats.newMessages > 9 ? '9+' : stats.newMessages}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-4">
        {activeTab === 'dashboard' && <DashboardPanel stats={stats} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'messages' && <MessagesPanel />}
        {activeTab === 'security' && <SecurityPanel />}
        {activeTab === 'announcements' && <AnnouncementsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

// Dashboard Panel Component
function DashboardPanel({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
          trend={`${stats.newUsers} new this week`}
          trendPositive={stats.newUsers > 0}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          icon={<Activity className="h-5 w-5 text-green-500" />} 
          trend={`${Math.round((stats.activeUsers / Math.max(1, stats.totalUsers)) * 100)}% of total`}
          trendPositive={true}
        />
        <StatCard 
          title="Total Transactions" 
          value={stats.totalTransactions} 
          icon={<CreditCard className="h-5 w-5 text-amber-500" />} 
          trend={`${stats.totalTransactions > 0 ? Math.round((stats.totalTransactions / 1000) * 100) / 100 : 0}K total`}
          trendPositive={stats.totalTransactions > 0}
        />
        <StatCard 
          title="Messages" 
          value={stats.totalMessages} 
          icon={<Mail className="h-5 w-5 text-purple-500" />} 
          trend={`${stats.newMessages} new`}
          trendPositive={stats.newMessages > 0}
        />
      </div>

      {/* System Health */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-100">System Health</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              stats.systemHealth === 'operational' 
                ? 'bg-green-900/30 text-green-400' 
                : stats.systemHealth === 'degraded'
                ? 'bg-yellow-900/30 text-yellow-400'
                : 'bg-red-900/30 text-red-400'
            }`}>
              {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
            </span>
            <span className="text-sm text-slate-400">Last updated: Just now</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Database</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <Database className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">MongoDB</p>
                  <p className="text-sm text-slate-500">Connected</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                  <span>Storage</span>
                  <span>{stats.storageUsed} / 10GB</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(parseInt(stats.storageUsed) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">API</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg h-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">API Status</p>
                  <p className="text-sm text-slate-500">All systems operational</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Response Time</span>
                  <span className="text-green-400 font-mono">142ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Uptime</span>
                  <span className="text-slate-300">99.99%</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-2">Alerts</h4>
            <div className="bg-slate-800/50 p-4 rounded-lg h-full">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-900/30 rounded-lg mt-0.5">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 font-medium">No critical issues</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {stats.systemHealth === 'operational' 
                      ? 'All systems are running smoothly.' 
                      : stats.systemHealth === 'degraded'
                      ? 'Some non-critical issues detected.'
                      : 'Critical issues require attention.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <a href="#" className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  View all alerts
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-100 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-start pb-4 border-b border-slate-800 last:border-0 last:pb-0">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center mr-3 mt-0.5">
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-slate-100">New user</span> registered
                </p>
                <p className="text-xs text-slate-500 mt-0.5">2 minutes ago</p>
              </div>
              <button className="text-slate-500 hover:text-slate-300">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, trend, trendPositive }: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  trend: string;
  trendPositive: boolean;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-slate-800/50">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trendPositive 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-slate-800/50 text-slate-400'
        }`}>
          {trend}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-slate-100">{value}</h3>
      <p className="mt-1 text-sm text-slate-400">{title}</p>
    </div>
  );
}
