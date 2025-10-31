'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersService } from '@/lib/firebase/firestore';
import { onValue, ref, getDatabase } from 'firebase/database';
import { setupPresence } from '@/lib/firebase/presence';
import { toast } from 'react-hot-toast';
import { Search, Filter, Clock, Eye, Edit, User, UserCheck, UserX, Shield, Trash2 } from 'lucide-react';
import { UserProfile } from '@/types';

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
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log('🔄 [UserManagement] Initializing...');
    loadUsers();
    
    let presenceCleanup: (() => void) | undefined;
    let statusUnsubscribe: (() => void) | undefined = undefined;
    
    // Set up presence for current user
    if (currentUser?.uid) {
      console.log('👤 [UserManagement] Setting up presence for current user:', currentUser.uid);
      presenceCleanup = setupPresence(currentUser.uid);
    } else {
      console.warn('⚠️ [UserManagement] No current user found');
    }
    
    // Set up real-time status listener
    const db = getDatabase();
    const statusRef = ref(db, 'status');
    
    console.log('👂 [UserManagement] Setting up status listener');
    statusUnsubscribe = onValue(statusRef, (snapshot) => {
      console.log('📡 [UserManagement] Status update received');
      if (snapshot.exists()) {
        const statusData = snapshot.val();
        const statusMap: Record<string, boolean> = {};
        
        console.log('📊 [UserManagement] Raw status data:', statusData);
        
        Object.entries(statusData).forEach(([userId, status]) => {
          if (status && typeof status === 'object' && 'state' in status) {
            statusMap[userId] = status.state === 'online';
            console.log(`👤 [UserManagement] User ${userId} is ${status.state}`);
          }
        });
        
        console.log('🔄 [UserManagement] Updating online status state');
        setOnlineStatus(statusMap);
      } else {
        console.log('ℹ️ [UserManagement] No status data available');
      }
    }, (error) => {
      console.error('❌ [UserManagement] Error in status listener:', error);
      console.error(' [UserManagement] Error in status listener:', error);
    });
    
    return () => {
      console.log('🧹 [UserManagement] Cleaning up...');
      if (presenceCleanup) {
        console.log('🧹 [UserManagement] Cleaning up presence');
        presenceCleanup();
      }
      if (statusUnsubscribe) {
        console.log('🧹 [UserManagement] Cleaning up status listener');
        statusUnsubscribe();
      }
    };
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await usersService.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersService.update(userId, { disabled: !isActive });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, disabled: !isActive } : user
      ));
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-slate-100">User Management</h2>
          <p className="text-slate-400 text-sm">Manage all registered users and their permissions</p>
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

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
                    <tr key={user.uid} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-slate-800 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-amber-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-100">
                              {user.displayName || 'No Name'}
                            </div>
                            <div className="text-sm text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          {/* Online Status */}
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${
                              onlineStatus[user.uid] ? 'bg-green-400' : 'bg-slate-500'
                            }`}></div>
                            <span className="text-sm text-slate-300">
                              {onlineStatus[user.uid] ? 'Online' : 'Offline'}
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
                        {/* User role would come from your user object */}
                        User
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
                                <Clock className="h-3 w-3 mr-1" />
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
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id, !user.disabled)}
                            className={user.disabled ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}
                            title={user.disabled ? "Activate User" : "Deactivate User"}
                          >
                            {user.disabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <User className="h-12 w-12 mx-auto text-slate-600 mb-2" />
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
                    <User className="h-8 w-8 text-amber-400" />
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
                          <Shield className="h-3 w-3 mr-1" />
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
                    <h5 className="text-sm font-medium text-slate-400 mb-2">User Actions</h5>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Roles
                      </button>
                      <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
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
