'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { alertsService, Alert } from '@/lib/alerts';
import { useAuth } from '@/contexts/AuthContext';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  // Load alerts from Firestore
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const realAlerts = await alertsService.getAll();
        // Convert Firestore timestamps to Date objects
        const processedAlerts = realAlerts.map(alert => ({
          ...alert,
          createdAt: alert.createdAt instanceof Date ? alert.createdAt : (alert.createdAt as any)?.toDate?.() || new Date(),
          resolvedAt: alert.resolvedAt instanceof Date ? alert.resolvedAt : (alert.resolvedAt as any)?.toDate?.(),
          acknowledgedAt: alert.acknowledgedAt instanceof Date ? alert.acknowledgedAt : (alert.acknowledgedAt as any)?.toDate?.(),
        }));
        setAlerts(processedAlerts);
      } catch (error) {
        console.error('Error loading alerts:', error);
        toast.error('Failed to load alerts - you may not have admin permissions');
      }
    };

    loadAlerts();
  }, []);

  // Check if user is admin
  const adminEmails = process.env['NEXT_PUBLIC_ADMIN_EMAILS']?.split(',') || [];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  // Filter alerts based on search and filters using useMemo
  const filteredAlerts = useMemo(() => {
    let filtered = alerts.filter(alert =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(alert => alert.category === categoryFilter);
    }

    return filtered;
  }, [alerts, searchQuery, statusFilter, typeFilter, categoryFilter]);

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
            <span className="text-lg">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Admin Access Required</h3>
          <p className="text-slate-500 text-sm">
            You need administrator privileges to view and manage system alerts.
          </p>
        </div>
      </div>
    );
  }

  const updateAlertStatus = async (alertId: string, newStatus: Alert['status']) => {
    try {
      // Update in Firestore
      await alertsService.updateStatus(alertId, newStatus, 'admin@example.com');

      // Update local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: newStatus,
              resolvedAt: newStatus === 'resolved' ? new Date() : alert.resolvedAt,
              acknowledgedBy: newStatus === 'acknowledged' ? 'admin@example.com' : alert.acknowledgedBy
            }
          : alert
      ));

      toast.success(`Alert ${newStatus === 'resolved' ? 'resolved' : newStatus === 'acknowledged' ? 'acknowledged' : 'marked as active'}`);
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast.error('Failed to update alert status');
    }
  };

  const clearAllAlerts = async () => {
    if (!window.confirm('Are you sure you want to clear all alerts? This action cannot be undone.')) {
      return;
    }

    const alertCount = alerts.length;
    console.log(`🗑️ Admin clearing ${alertCount} alerts`);

    try {
      // Delete all alerts from Firestore
      const deletePromises = alerts.map(alert => {
        console.log(`Deleting alert: ${alert.id} - ${alert.title}`);
        return alertsService.delete(alert.id!); // Add non-null assertion since we know alerts have IDs
      });

      await Promise.all(deletePromises);

      // Clear local state
      setAlerts([]);

      console.log(`✅ Successfully cleared ${alertCount} alerts`);
      toast.success(`Successfully cleared ${alertCount} alerts`);
    } catch (error) {
      console.error('❌ Error clearing alerts:', error);
      toast.error('Failed to clear alerts. Please try again.');
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <span className="text-lg">❌</span>;
      case 'warning':
        return <span className="text-lg">⚠️</span>;
      case 'info':
        return <span className="text-lg">ℹ️</span>;
      case 'success':
        return <span className="text-lg">✅</span>;
      default:
        return <span className="text-lg">🔔</span>;
    }
  };

  const getTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-900/10';
      case 'warning':
        return 'border-amber-500 bg-amber-900/10';
      case 'info':
        return 'border-blue-500 bg-blue-900/10';
      case 'success':
        return 'border-green-500 bg-green-900/10';
      default:
        return 'border-slate-500 bg-slate-900/10';
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'active':
        return (
          <span className={`${baseClasses} bg-red-900/30 text-red-400`}>
            Active
          </span>
        );
      case 'acknowledged':
        return (
          <span className={`${baseClasses} bg-amber-900/30 text-amber-400`}>
            Acknowledged
          </span>
        );
      case 'resolved':
        return (
          <span className={`${baseClasses} bg-green-900/30 text-green-400`}>
            Resolved
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-slate-800/50 text-slate-400`}>
            {status}
          </span>
        );
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-amber-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-slate-400';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-slate-100">Alert Management</h2>
          <p className="text-slate-400 text-sm">Search, filter, and manage system notifications</p>
        </div>

        {/* Search and Filter */}
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search alerts..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-md text-slate-300 flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span className="text-sm">🔧</span>
            <span className="hidden sm:inline">Filters</span>
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-700/50 flex items-center gap-2 transition-colors"
              title="Clear all alerts"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="security">Security</option>
                <option value="performance">Performance</option>
                <option value="database">Database</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-slate-400">
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">✅</span>
            <h3 className="text-lg font-medium text-slate-300">No alerts found</h3>
            <p className="text-slate-500 text-sm">All systems are running smoothly</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 border-l-4 ${getTypeColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="shrink-0 mt-0.5">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-slate-100">{alert.title}</h3>
                        {getStatusBadge(alert.status)}
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{alert.message}</p>

                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className="flex items-center">
                          <span className="text-xs">⏰</span>
                          {getTimeAgo(alert.createdAt instanceof Date ? alert.createdAt : new Date())}
                        </span>
                        <span className={`font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
                        </span>
                        <span className="text-slate-400 capitalize">{alert.category}</span>
                        {alert.acknowledgedBy && alert.acknowledgedBy.trim() && (
                          <span className="text-slate-400">
                            Acknowledged by {alert.acknowledgedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => updateAlertStatus(alert.id!, 'acknowledged')}
                          className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => updateAlertStatus(alert.id!, 'resolved')}
                          className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button
                        onClick={() => updateAlertStatus(alert.id!, 'resolved')}
                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-lg">❌</span>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {alerts.filter(a => a.type === 'critical' && a.status === 'active').length}
              </p>
              <p className="text-sm text-slate-400">Critical Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {alerts.filter(a => a.status === 'active').length}
              </p>
              <p className="text-sm text-slate-400">Active Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-2xl font-bold text-slate-100">
                {alerts.filter(a => a.status === 'resolved').length}
              </p>
              <p className="text-sm text-slate-400">Resolved Today</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-lg">🔔</span>
            <div>
              <p className="text-2xl font-bold text-slate-100">{alerts.length}</p>
              <p className="text-sm text-slate-400">Total Alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
