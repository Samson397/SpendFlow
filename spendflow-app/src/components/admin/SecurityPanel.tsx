'use client';

import { useState, useEffect } from 'react';
import { Shield, User, ShieldAlert, Check, X, AlertTriangle, Activity, Settings, Globe, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { securityService } from '@/lib/securityService';

interface SecurityEvent {
  id: string;
  userId: string;
  userEmail: string;
  type: 'login' | 'logout' | 'failed_attempt' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity' | 'account_locked' | 'account_unlocked';
  ip?: string;
  location?: string;
  device?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
  timestamp: { toDate: () => Date } | Date;
}

export default function SecurityPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPasswordPolicyModal, setShowPasswordPolicyModal] = useState(false);
  const [showIpWhitelistModal, setShowIpWhitelistModal] = useState(false);
  const [showSuspiciousActivity, setShowSuspiciousActivity] = useState(true);
  const [showRecentActivity, setShowRecentActivity] = useState(true);
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);
  
  // Debug log for modal state (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Modal state changed:', { showAllActivityModal });
    }
  }, [showAllActivityModal]);

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Calculate derived state
  const failedLoginAttempts = securityEvents.filter(e => e.type === 'failed_attempt').length;
  const securityAlerts = securityEvents.filter(e => e.status === 'warning' || e.status === 'error').length;
  
  // Calculate security score (0-100)
  const securityScore = Math.max(0, Math.min(100, 
    100 - 
    (failedLoginAttempts * 5) - 
    (securityAlerts * 10) - 
    (securityEvents.length < 10 ? 20 : 0) // Penalize low activity
  ));

  // Fetch security events from Firestore
  useEffect(() => {
    let isMounted = true;
    
    const fetchSecurityEvents = async () => {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'securityEvents'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, 
          (querySnapshot) => {
            if (!isMounted) return;
            
            const events = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                userId: data.userId,
                userEmail: data.userEmail,
                type: data.type || 'login',
                ip: data.ip,
                location: data.location,
                device: data.device || 'Unknown',
                userAgent: data.userAgent,
                success: data.success ?? true,
                details: data.details,
                timestamp: data.timestamp?.toDate() || new Date(),
              } as SecurityEvent;
            });
            
            setSecurityEvents(events);
            setLoading(false);
          },
          (error) => {
            if (!isMounted) return;
            console.error('Error fetching security events:', error);
            setError('Failed to load security events');
            setLoading(false);
          }
        );

        return () => {
          isMounted = false;
          unsubscribe();
        };
      } catch (err) {
        if (!isMounted) return;
        console.error('Error setting up security events listener:', err);
        setError('Failed to set up security events listener');
        setLoading(false);
      }
    };

    fetchSecurityEvents();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const generateSampleEvents = async () => {
    if (!user) return;

    try {
      // Generate some sample security events
      await securityService.logLogin(user.uid, user.email || 'unknown');
      await securityService.logFailedLogin('test@example.com', 'Invalid password');
      await securityService.logSuspiciousActivity(user.uid, user.email || 'unknown', 'Multiple failed login attempts');
      
      toast.success('Sample security events generated');
    } catch (error) {
      console.error('Error generating sample events:', error);
      toast.error('Failed to generate sample events');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" aria-hidden={true} />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden={true} />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" aria-hidden={true} />;
      default:
        return null;
    }
  };

  const getEventTypeIcon = (type: string) => {
    const baseClass = 'h-4 w-4';
    
    switch (type) {
      case 'login':
        return <User className={`${baseClass} text-blue-500`} aria-hidden="true" />;
      case 'failed_attempt':
        return <X className={`${baseClass} text-red-500`} aria-hidden="true" />;
      case 'password_change':
        return <Shield className={`${baseClass} text-purple-500`} aria-hidden="true" />;
      case '2fa_enabled':
        return <Shield className={`${baseClass} text-green-500`} aria-hidden="true" />;
      case 'suspicious_activity':
        return <ShieldAlert className={`${baseClass} text-amber-500`} aria-hidden="true" />;
      default:
        return <Shield className={`${baseClass} text-slate-400`} aria-hidden="true" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-200">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-serif text-slate-100">Security Center</h2>
      
      {/* Security Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Security Score</p>
              <div className="flex items-center mt-1">
                <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full ${
                      securityScore >= 80 ? 'bg-green-500' : 
                      securityScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${securityScore}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-slate-300">{securityScore}%</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/50">
              <Shield className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {securityScore >= 80 
              ? 'Your security is strong. Keep it up!' 
              : securityScore >= 50 
                ? 'Your security could be improved.' 
                : 'Your security needs attention.'}
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Sessions</p>
              <div className="flex items-center mt-1">
                <div className="text-3xl font-bold text-amber-400">
                  {securityEvents.filter(e => e.status === 'warning' || e.status === 'error').length}
                </div>
                <div className="ml-2 text-sm text-slate-400">
                  <div>Active Alerts</div>
                  <button 
                    onClick={() => toast('Alerts feature coming soon!')}
                    className="text-amber-400 hover:underline text-xs focus:outline-none"
                  >
                    View all alerts
                  </button>
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-blue-900/20">
              <User className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Failed Logins</p>
              <div className="flex items-center mt-1">
                <span className={`text-2xl font-bold ${
                  failedLoginAttempts > 0 ? 'text-red-400' : 'text-slate-100'
                }`}>
                  {failedLoginAttempts}
                </span>
                <span className="ml-2 text-sm text-slate-500">
                  {failedLoginAttempts === 1 ? 'failed attempt' : 'failed attempts'}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-red-900/20">
              <X className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Security Alerts</p>
              <div className="flex items-center mt-1">
                <span className={`text-2xl font-bold ${
                  securityAlerts > 0 ? 'text-amber-400' : 'text-slate-100'
                }`}>
                  {securityAlerts}
                </span>
                <span className="ml-2 text-sm text-slate-500">
                  {securityAlerts === 1 ? 'alert' : 'alerts'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-slate-500">
                  {securityAlerts > 0 ? `${securityAlerts} to review` : 'No alerts'}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-amber-900/20">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-slate-800">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                <Shield className="h-4 w-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'activity'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                <Activity className="h-4 w-4" />
                Activity Log
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </nav>
          </div>

          {/* Active Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Suspicious Activity Alert */}
                {showSuspiciousActivity && (
                  <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div className="flex">
                        <div className="shrink-0">
                          <ShieldAlert className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-amber-300">Suspicious Activity Detected</h3>
                          <div className="mt-2 text-sm text-amber-200">
                            <p>
                              Multiple failed login attempts detected from a new device. We recommend reviewing your security settings.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowSuspiciousActivity(false)}
                        className="text-amber-400 hover:text-amber-300 focus:outline-none"
                        aria-label="Dismiss"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAllActivityModal(true);
                            // Show a toast notification about the filter
                            toast('Showing all suspicious activities');
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-amber-800 bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          Review Activity
                        </button>
                        <button
                          type="button"
                          onClick={generateSampleEvents}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-800 bg-blue-400 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Generate Test Events
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSuspiciousActivity(false)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-amber-200 bg-amber-900/30 hover:bg-amber-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Recommendations */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-100 mb-4">Security Recommendations</h3>
                  <div className="space-y-4">
                    <SecurityCheckItem 
                      title="Enable Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      status="not_started"
                      onAction={() => setShow2FAModal(true)}
                    />
                    <SecurityCheckItem 
                      title="Update Password Policy"
                      description="Require strong passwords for all users"
                      status="in_progress"
                      onAction={() => setShowPasswordPolicyModal(true)}
                    />
                    <SecurityCheckItem 
                      title="IP Whitelisting"
                      description="Restrict access to specific IP addresses"
                      status="not_started"
                      onAction={() => setShowIpWhitelistModal(true)}
                    />
                    <SecurityCheckItem 
                      title="Session Timeout"
                      description="Set automatic logout after 30 minutes of inactivity"
                      status="completed"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'activity' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-100">Security Events</h3>
                    <div className="flex items-center">
                      <select className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
                  {securityEvents.map((event) => (
                    <div key={event.id} className="p-4 hover:bg-slate-800/50">
                      <div className="flex items-start">
                        <div className="shrink-0 pt-0.5">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-slate-100">
                              {event.type === 'login' && 'Successful login'}
                              {event.type === 'logout' && 'User logout'}
                              {event.type === 'failed_attempt' && 'Failed login attempt'}
                              {event.type === 'password_change' && 'Password changed'}
                              {event.type === '2fa_enabled' && 'Two-factor authentication enabled'}
                              {event.type === '2fa_disabled' && 'Two-factor authentication disabled'}
                              {event.type === 'suspicious_activity' && 'Suspicious activity detected'}
                              {event.type === 'account_locked' && 'Account locked'}
                              {event.type === 'account_unlocked' && 'Account unlocked'}
                            </p>
                            <div className="flex items-center">
                              <span className="text-xs text-slate-500">
                                {formatDate(event.timestamp)}
                              </span>
                              <span className="ml-2">
                                {getStatusIcon(event.success ? 'success' : event.type === 'failed_attempt' ? 'error' : 'warning')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            <span className="font-medium">{event.userEmail}</span> • {event.device}
                          </p>
                          {event.details && (
                            <p className="text-xs text-slate-500 mt-1">
                              {event.details}
                            </p>
                          )}
                          <div className="mt-1 flex items-center text-xs text-slate-500">
                            <Globe className="h-3 w-3 mr-1" />
                            {event.ip || 'Unknown IP'} • {event.location || 'Unknown location'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-100 mb-4">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="shrink-0 pt-0.5">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-900/30">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-100">SSL/TLS Encryption</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                            Active
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          All data is encrypted in transit using industry-standard TLS 1.3
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                      <div className="flex items-start">
                        <div className="shrink-0 pt-0.5">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-900/30">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-100">Password Policy</h4>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-amber-500 bg-amber-900/30 hover:bg-amber-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                              onClick={() => setShowPasswordPolicyModal(true)}
                            >
                              Configure
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">
                            Current: Minimum 8 characters, at least one number and one special character
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                      <div className="flex items-start">
                        <div className="shrink-0 pt-0.5">
                          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-900/30">
                            <X className="h-4 w-4 text-red-500" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-slate-100">IP Whitelisting</h4>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-500 bg-red-900/30 hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              onClick={() => setShowIpWhitelistModal(true)}
                            >
                              Enable
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-slate-400">
                            Restrict access to specific IP addresses for enhanced security
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-slate-100 mb-4">Advanced Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-100">API Access</h4>
                        <p className="text-sm text-slate-400">
                          Manage API keys and permissions
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                      >
                        Manage
                      </button>
                    </div>
                    <div className="border-t border-slate-800 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-slate-100">Audit Logs</h4>
                          <p className="text-sm text-slate-400">
                            View all security-related events
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                        >
                          View Logs
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-100">Recent Activity</h3>
              <button
                type="button"
                className="text-xs text-amber-400 hover:text-amber-300"
                onClick={() => setShowRecentActivity(!showRecentActivity)}
              >
                {showRecentActivity ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showRecentActivity && (
              <div className="space-y-4">
                {securityEvents.length > 0 ? (
                  <>
                    {securityEvents.slice(0, 3).map((event) => (
                      <div key={`recent-${event.id}`} className="flex items-start">
                        <div className="shrink-0 pt-0.5">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-100">
                            {event.type === 'login' && 'Successful login'}
                            {event.type === 'logout' && 'User logout'}
                            {event.type === 'failed_attempt' && 'Failed login attempt'}
                            {event.type === 'password_change' && 'Password changed'}
                            {event.type === '2fa_enabled' && '2FA enabled'}
                            {event.type === 'suspicious_activity' && 'Suspicious activity'}
                            {event.type === 'account_locked' && 'Account locked'}
                            {event.type === 'account_unlocked' && 'Account unlocked'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(event.timestamp)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {event.ip || 'Unknown IP'} • {event.device}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Button clicked, setting modal to true');
                          setShowAllActivityModal(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 focus:outline-none"
                      >
                        View all activity →
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No recent activity</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-100 mb-4">Security Tips</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-green-900/30">
                    <Check className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <p className="ml-3 text-sm text-slate-300">
                  <span className="font-medium">Enable Two-Factor Authentication</span> for all admin accounts
                </p>
              </li>
              <li className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-900/30">
                    <Info className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
                <p className="ml-3 text-sm text-slate-300">
                  <span className="font-medium">Review login attempts</span> regularly for any suspicious activity
                </p>
              </li>
              <li className="flex items-start">
                <div className="shrink-0">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-amber-900/30">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  </div>
                </div>
                <p className="ml-3 text-sm text-slate-300">
                  <span className="font-medium">Update passwords</span> every 90 days for all admin accounts
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-100">Enable Two-Factor Authentication</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300"
                onClick={() => setShow2FAModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Scan the QR code below with your authenticator app to enable two-factor authentication.
              </p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <div className="h-40 w-40 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code Placeholder</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm text-slate-400">Or enter this code manually:</p>
                <p className="font-mono text-slate-200 mt-1">JBSWY3DPEHPK3PXP</p>
              </div>
              <div className="mt-4">
                <label htmlFor="verification-code" className="block text-sm font-medium text-slate-300 mb-1">
                  Enter verification code
                </label>
                <input
                  type="text"
                  id="verification-code"
                  className="block w-full rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="000000"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-700 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => setShow2FAModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Verify and Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-100">Password Policy</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300"
                onClick={() => setShowPasswordPolicyModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  defaultValue="12"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>8</span>
                  <span>12</span>
                  <span>16</span>
                  <span>24</span>
                  <span>32+</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password Requirements
                </label>
                <div className="flex items-center">
                  <input
                    id="require-uppercase"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="require-uppercase" className="ml-2 block text-sm text-slate-300">
                    Require uppercase letters (A-Z)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="require-lowercase"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="require-lowercase" className="ml-2 block text-sm text-slate-300">
                    Require lowercase letters (a-z)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="require-numbers"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="require-numbers" className="ml-2 block text-sm text-slate-300">
                    Require numbers (0-9)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="require-symbols"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="require-symbols" className="ml-2 block text-sm text-slate-300">
                    Require symbols (!@#$%^&*)
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-700 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => setShowPasswordPolicyModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => setShowPasswordPolicyModal(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IP Whitelist Modal */}
      {showIpWhitelistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-100">IP Whitelist</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300"
                onClick={() => setShowIpWhitelistModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Add IP addresses that are allowed to access the admin panel. All other IPs will be blocked.
              </p>
              
              <div className="space-y-2">
                <label htmlFor="ip-address" className="block text-sm font-medium text-slate-300">
                  Add IP Address
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="ip-address"
                    className="block w-full rounded-l-md border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="192.168.1.1"
                  />
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-slate-700 bg-slate-800 text-slate-300 rounded-r-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Allowed IP Addresses</h4>
                <div className="bg-slate-800/50 border border-slate-700 rounded-md divide-y divide-slate-700">
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-slate-200">192.168.1.1</p>
                      <p className="text-xs text-slate-500">Added on Jun 10, 2023</p>
                    </div>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-slate-200">10.0.0.1</p>
                      <p className="text-xs text-slate-500">Added on Jun 5, 2023</p>
                    </div>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-700 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => setShowIpWhitelistModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  onClick={() => setShowIpWhitelistModal(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityCheckItem({ title, description, status, onAction }: { 
  title: string; 
  description: string; 
  status: 'not_started' | 'in_progress' | 'completed';
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start">
      <div className="shrink-0">
        {status === 'completed' ? (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-900/30">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        ) : status === 'in_progress' ? (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-900/30">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-800">
            <div className="h-2 w-2 rounded-full bg-slate-600"></div>
          </div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium text-slate-100">{title}</h4>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {onAction && (
        <button
          type="button"
          className="text-sm font-medium text-amber-500 hover:text-amber-400"
          onClick={onAction}
        >
          {status === 'completed' ? 'Manage' : status === 'in_progress' ? 'Continue' : 'Get Started'}
        </button>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, trend, trendPositive }: { 
  icon: React.ReactNode; 
  title: string; 
  value: number | string;
  trend: string;
  trendPositive: boolean;
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-100">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/50">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendPositive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
