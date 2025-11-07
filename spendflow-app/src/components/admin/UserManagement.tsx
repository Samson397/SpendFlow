'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersService } from '@/lib/firebase/firestore';
import { monitorAllUsersStatus } from '@/lib/firebase/presence';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/types';
import { alertsService } from '@/lib/alerts';

// Helper function to format time ago
const getTimeAgo = (dateString?: string | Date) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Never';
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean | undefined>>({});
  const [presenceInitialized, setPresenceInitialized] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Set up status monitoring (presence is now handled globally in AuthContext)
  useEffect(() => {
    console.log('🔄 [UserManagement] Setting up status monitoring...');

    // Now that RTDB is enabled, try RTDB presence monitoring
    const setupPresenceMonitoring = async () => {
      try {
        console.log('🔍 [UserManagement] Starting RTDB presence monitoring setup...');
        
        // First try RTDB presence
        const cleanupMonitor = monitorAllUsersStatus(
          (userId, status) => {
            console.log(`👥 [UserManagement] RTDB Status update received - User ${userId}:`, status);
            const isOnline = status.state === 'online' && (Date.now() - status.last_changed) < (30 * 60 * 1000); // 30 min threshold
            
            console.log(`👥 [UserManagement] User ${userId} online status:`, isOnline, `(time diff: ${(Date.now() - status.last_changed) / 1000}s)`);
            
            setOnlineStatus(_prev => ({
              ..._prev,
              [userId]: isOnline
            }));
          },
          (error) => {
            console.error('❌ [UserManagement] RTDB presence monitoring ERROR:', error);
            console.warn('⚠️ [UserManagement] RTDB presence failed, showing all users as unknown:', error);
            // Set all users to unknown status
            setOnlineStatus(prev => {
              const unknownStatus: Record<string, boolean | undefined> = {};
              users.forEach(user => {
                unknownStatus[user.uid] = undefined;
              });
              return unknownStatus;
            });
          }
        );

        console.log('✅ [UserManagement] RTDB presence monitoring setup completed');
        return cleanupMonitor;
      } catch (error) {
        console.error('❌ [UserManagement] RTDB presence setup failed:', error);
        console.warn('⚠️ [UserManagement] RTDB not available, showing unknown status:', error);
        // Set all users to unknown status
        setOnlineStatus(_prev => {
          const unknownStatus: Record<string, boolean | undefined> = {};
          users.forEach(user => {
            unknownStatus[user.uid] = undefined;
          });
          return unknownStatus;
        });
        return () => {};
      }
    };

    const initializePresence = async () => {
      const cleanup = await setupPresenceMonitoring();
      setPresenceInitialized(true);
      return cleanup;
    };

    const cleanupPromise = initializePresence();

    // Cleanup function - handle the promise
    return () => {
      cleanupPromise.then(cleanup => {
        console.log('🧹 [UserManagement] Cleaning up status monitor');
        cleanup();
      });
    };
  }, [users]); // Include users in dependencies
  
  // Load users when component mounts and when presence is initialized
  useEffect(() => {
    if (presenceInitialized) {
      console.log('🔄 [UserManagement] Presence initialized, loading users...');
      loadUsers();
    }
  }, [presenceInitialized]);
  
  // Add this to help with debugging
  useEffect(() => {
    console.log('👀 [UserManagement] Online status updated:', Object.keys(onlineStatus).length, 'users');
  }, [onlineStatus]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 [UserManagement] Loading users...');
      const allUsers = await usersService.getAll();
      console.log('👥 [UserManagement] Loaded users:', allUsers.map(u => ({
        id: u.id,
        uid: u.uid,
        email: u.email,
        displayName: u.displayName
      })));

      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(user => 
      statusFilter === 'all' || 
      (statusFilter === 'active' && !user.disabled) ||
      (statusFilter === 'inactive' && user.disabled)
    )
    .filter(user => 
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && user.emailVerified) ||
      (verificationFilter === 'unverified' && !user.emailVerified)
    )
    .filter(user => 
      roleFilter === 'all' ||
      (roleFilter === 'admin' && user.isAdmin) ||
      (roleFilter === 'user' && !user.isAdmin)
    );

  const toggleUserRole = async (userId: string, isAdmin: boolean) => {
    try {
      await usersService.update(userId, { isAdmin: !isAdmin });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !isAdmin } : user
      ));
      
      const action = !isAdmin ? 'Promoted user to admin' : 'Demoted user to regular user';
      toast.success(`${action} successfully`);
      
      // Generate admin action alert
      try {
        await alertsService.adminAction(currentUser?.email || 'Unknown Admin', action, userId);
      } catch (alertError) {
        console.warn('Failed to create role change alert:', alertError);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersService.update(userId, { disabled: !isActive });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, disabled: !isActive } : user
      ));
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      
      // Generate admin action alert
      try {
        const action = isActive ? 'Deactivated user account' : 'Activated user account';
        await alertsService.adminAction(currentUser?.email || 'Unknown Admin', action, userId);
      } catch (alertError) {
        console.warn('Failed to create status change alert:', alertError);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const updateUserSubscription = async (userId: string, tier: 'free' | 'pro' | 'enterprise') => {
    try {
      await usersService.update(userId, { subscriptionTier: tier });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, subscriptionTier: tier } : user
      ));
      toast.success(`User subscription updated to ${tier}`);
      
      // Generate admin action alert
      try {
        await alertsService.adminAction(currentUser?.email || 'Unknown Admin', `Updated user subscription to ${tier}`, userId);
      } catch (alertError) {
        console.warn('Failed to create subscription change alert:', alertError);
      }
    } catch (error) {
      console.error('Error updating user subscription:', error);
      toast.error('Failed to update user subscription');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-slate-100">User Management</h2>
          <p className="text-slate-400 text-sm">Manage all registered users and their permissions</p>
          <div className="mt-2 text-xs text-slate-500">
            Presence: ✅ RTDB Active (Real-time presence monitoring) |
            Online: {Object.values(onlineStatus).filter(status => status === true).length} |
            Offline: {Object.values(onlineStatus).filter(status => status === false).length} |
            Unknown: {Object.keys(onlineStatus).length - Object.values(onlineStatus).filter(status => status !== undefined).length}
          </div>
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              console.log('🔄 [UserManagement] Manual presence refresh triggered');
              // Force a re-render by updating presenceInitialized
              setPresenceInitialized(false);
              setTimeout(() => setPresenceInitialized(true), 100);
            }}
            className="px-3 py-2 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh presence status"
          >
            🔄 Refresh Status
          </button>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`px-3 py-2 rounded-md text-slate-300 flex items-center gap-2 transition-colors ${
              showFilter ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span className="text-sm">🔧</span>
            <span className="hidden sm:inline">Filter</span>
            {(statusFilter !== 'all' || verificationFilter !== 'all' || roleFilter !== 'all') && (
              <span className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-600 text-xs">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Account Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Verification
              </label>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value as 'all' | 'verified' | 'unverified')}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                User Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins Only</option>
                <option value="user">Users Only</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-slate-400">
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setVerificationFilter('all');
                setRoleFilter('all');
              }}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800">
              <thead className="bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className={`hover:bg-slate-800/50 ${onlineStatus[user.uid] ? 'ring-1 ring-green-500/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="relative shrink-0">
                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                              <span className="text-lg">👤</span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-800 ${
                              onlineStatus[user.uid] === undefined ? 'bg-gray-500' : onlineStatus[user.uid] ? 'bg-green-500' : 'bg-slate-500'
                            }`}></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-slate-200">
                              {user.displayName || 'No Name'}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              onlineStatus[user.uid] === undefined
                                ? 'bg-gray-900/30 text-gray-400'
                                : onlineStatus[user.uid] 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-slate-700/50 text-slate-400'
                            }`}>
                              {onlineStatus[user.uid] === undefined ? 'Unknown' : onlineStatus[user.uid] ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {/* Online Status */}
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              onlineStatus[user.uid] === undefined ? 'bg-gray-500' : onlineStatus[user.uid] ? 'bg-green-400' : 'bg-slate-500'
                            }`}></div>
                            <span className="text-sm text-slate-300">
                              {onlineStatus[user.uid] === undefined ? 'Unknown' : onlineStatus[user.uid] ? 'Online' : 'Offline'}
                            </span>
                          </div>
                          
                          {/* Email Verification Status */}
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              user.emailVerified ? 'bg-green-400' : 'bg-yellow-400'
                            }`}></div>
                            <span className="text-sm text-slate-300">
                              {user.emailVerified ? 'Email Verified' : 'Email Pending'}
                            </span>
                          </div>
                          
                          {/* Account Status */}
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              user.disabled ? 'bg-red-400' : 'bg-blue-400'
                            }`}></div>
                            <span className="text-sm text-slate-300">
                              {user.disabled ? 'Account Inactive' : 'Account Active'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {/* User role */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isAdmin 
                            ? 'bg-blue-900/30 text-blue-400' 
                            : 'bg-slate-800/50 text-slate-400'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          {user.lastActive ? (
                            <div className="flex flex-col space-y-0.5">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-slate-200">
                                  {new Date(user.lastActive).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span className="mx-1 text-slate-500">•</span>
                                <span className="text-sm text-slate-400">
                                  {new Date(user.lastActive).toLocaleTimeString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-slate-500" title={`Last active: ${new Date(user.lastActive).toLocaleString()}`}>
                                <span className="text-xs">⏰</span>
                                {getTimeAgo(user.lastActive)}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-start">
                              <span className="text-sm text-slate-400">Never</span>
                              <span className="text-xs text-slate-500">No activity recorded</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-amber-400 hover:text-amber-300"
                            title="View Details"
                          >
                            <span className="text-sm">👁️</span>
                          </button>
                          <button
                            onClick={() => toggleUserRole(user.id, user.isAdmin || false)}
                            className={user.isAdmin ? "text-blue-400 hover:text-slate-400" : "text-slate-400 hover:text-blue-400"}
                            title={user.isAdmin ? "Demote to User" : "Promote to Admin"}
                          >
                            <span className="text-sm">🛡️</span>
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id, !user.disabled)}
                            className={user.disabled ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}
                            title={user.disabled ? "Activate User" : "Deactivate User"}
                          >
                            {user.disabled ? <span className="text-sm">✅</span> : <span className="text-sm">❌</span>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <span className="text-4xl">👤</span>
                      <p>No users found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-slate-100">User Details</h3>
                  <p className="text-sm text-slate-400">Manage user account and permissions</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-4xl">👤</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-100">{selectedUser.displayName || 'No Name'}</h4>
                    <p className="text-slate-400">{selectedUser.email}</p>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        selectedUser.emailVerified 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {selectedUser.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                      </span>
                      {selectedUser.isAdmin && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-900/30 text-blue-400 flex items-center">
                          <span className="text-xs mr-1">🛡️</span>
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Account Information</h5>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-slate-500">Status:</span>{' '}
                        <span className="text-slate-300">
                          {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-500">Member Since</p>
                          <p className="text-slate-200">
                            {selectedUser.createdAt 
                              ? new Date(selectedUser.createdAt).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Last Active</p>
                          <p className="text-slate-200">
                            {selectedUser.lastActive 
                              ? new Date(selectedUser.lastActive).toLocaleString() 
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-slate-400 mb-2">Subscription Management</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-300">Current Tier:</span>
                        <div className="flex items-center gap-2">
                          {(selectedUser.subscriptionTier === 'free' || !selectedUser.subscriptionTier) && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-900/30 text-gray-400">
                              <span className="text-xs mr-1">👤</span>
                              Free
                            </span>
                          )}
                          {selectedUser.subscriptionTier === 'pro' && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                              <span className="text-xs mr-1">⭐</span>
                              Pro
                            </span>
                          )}
                          {selectedUser.subscriptionTier === 'enterprise' && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-900/30 text-amber-400">
                              <span className="text-xs mr-1">👑</span>
                              Enterprise
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            if (selectedUser) {
                              updateUserSubscription(selectedUser.id, 'free');
                            }
                          }}
                          className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                            (selectedUser?.subscriptionTier === 'free' || !selectedUser?.subscriptionTier)
                              ? 'bg-gray-600 text-white border-gray-600'
                              : 'border-gray-600 text-gray-400 hover:bg-gray-600/20'
                          }`}
                        >
                          <span className="text-sm">👤</span>
                          <span className="hidden xs:inline">Free</span>
                        </button>
                        <button
                          onClick={() => {
                            if (selectedUser) {
                              updateUserSubscription(selectedUser.id, 'pro');
                            }
                          }}
                          className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                            selectedUser?.subscriptionTier === 'pro'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-blue-600 text-blue-400 hover:bg-blue-600/20'
                          }`}
                        >
                          <span className="text-sm">⭐</span>
                          <span className="hidden xs:inline">Pro</span>
                        </button>
                        <button
                          onClick={() => {
                            if (selectedUser) {
                              updateUserSubscription(selectedUser.id, 'enterprise');
                            }
                          }}
                          className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                            selectedUser?.subscriptionTier === 'enterprise'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'border-amber-600 text-amber-400 hover:bg-amber-600/20'
                          }`}
                        >
                          <span className="text-sm">👑</span>
                          <span className="hidden xs:inline">Enterprise</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 px-6 py-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
