'use client';

import { useEffect, useState } from 'react';
import { monitorAllUsersStatus } from '@/lib/firebase/presence';
import { usersService } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types';

interface OnlineUser {
  uid: string;
  email?: string;
  displayName?: string;
  online: boolean;
}

export default function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true); // Start as true since we need to load profiles first
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  // First, load user profiles
  useEffect(() => {
    const loadUserProfiles = async () => {
      try {
        console.log('👥 [OnlineUsers] Loading user profiles...');
        const profiles = await usersService.getAll();
        const profileMap: Record<string, UserProfile> = {};
        profiles.forEach(profile => {
          profileMap[profile.uid] = profile;
        });
        setUserProfiles(profileMap);
        console.log('✅ [OnlineUsers] Loaded user profiles:', Object.keys(profileMap).length, 'users');
      } catch (error) {
        console.error('❌ [OnlineUsers] Error loading user profiles:', error);
        setUserProfiles({}); // Set empty object on error
        setLoading(false);
      }
    };

    loadUserProfiles();
  }, []); // Only run once on mount

  // Set up presence monitoring after user profiles are loaded
  useEffect(() => {
    // Set up RTDB presence monitoring (now that RTDB is enabled)
    const setupPresenceMonitoring = () => {
      try {
        const cleanupMonitor = monitorAllUsersStatus(
          (userId, status) => {
            const isOnline = status.state === 'online' && (Date.now() - status.last_changed) < (30 * 60 * 1000); // 30 min threshold
            
            console.log(`👥 [OnlineUsers] RTDB Status update - User ${userId}:`, status.state, `(time diff: ${(Date.now() - status.last_changed) / 1000}s)`, `online: ${isOnline}`);
            
            setOnlineUsers(prev => {
              const existingIndex = prev.findIndex(u => u.uid === userId);
              const userProfile = userProfiles[userId];
              
              if (existingIndex >= 0) {
                // Update existing user
                const updated = [...prev];
                updated[existingIndex] = {
                  uid: userId,
                  email: userProfile?.email,
                  displayName: userProfile?.displayName,
                  online: isOnline
                };
                return updated;
              } else {
                // Add new user
                return [...prev, {
                  uid: userId,
                  email: userProfile?.email,
                  displayName: userProfile?.displayName,
                  online: isOnline
                }];
              }
            });
          },
          (error) => {
            console.warn('⚠️ [OnlineUsers] RTDB presence failed, falling back to empty list:', error);
            setOnlineUsers([]);
          }
        );

        console.log('✅ [OnlineUsers] RTDB presence monitoring active');
        return cleanupMonitor;
      } catch (error) {
        console.warn('⚠️ [OnlineUsers] RTDB not available, showing no online users:', error);
        setOnlineUsers([]);
        return () => {};
      }
    };

    // Mock presence system for testing without RTDB
    const setupMockPresence = () => {
      console.log('🎭 [OnlineUsers] Using comprehensive mock presence system for ALL users');
      
      // Only run if userProfiles are loaded
      if (Object.keys(userProfiles).length === 0) {
        console.log('🎭 [OnlineUsers] Waiting for user profiles to load...');
        return;
      }
      
      // Create mock online users from user profiles with realistic distribution
      const mockOnlineUsers: OnlineUser[] = [];
      Object.entries(userProfiles).forEach(([uid, profile], index) => {
        // Simulate realistic online patterns:
        // - First user (likely admin) is always online
        // - 30% of remaining users are randomly online
        const isOnline = index === 0 || Math.random() < 0.3;
        
        if (isOnline) {
          mockOnlineUsers.push({
            uid,
            email: profile.email,
            displayName: profile.displayName,
            online: true
          });
        }
      });
      
      setOnlineUsers(mockOnlineUsers);
    };

    // Initialize everything - only after userProfiles are loaded
    const initialize = async () => {
      // Wait for user profiles to be loaded
      if (Object.keys(userProfiles).length === 0) {
        console.log('👥 [OnlineUsers] Waiting for user profiles before setting up presence...');
        return () => {};
      }

      console.log('👥 [OnlineUsers] User profiles loaded, setting up presence monitoring...');
      const cleanup = setupPresenceMonitoring();

      // Set loading to false after initial setup
      setLoading(false);

      return cleanup;
    };

    const cleanupPromise = initialize();

    return () => {
      cleanupPromise.then(cleanup => {
        cleanup();
      });
    };
  }, [userProfiles]); // Re-run when userProfiles change

  const onlineCount = onlineUsers.filter(u => u.online).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">👥</span>
        <h3 className="text-lg font-medium">Online Users ({onlineCount})</h3>
      </div>
      
      <div className="space-y-2">
        {onlineUsers.filter(u => u.online).length === 0 ? (
          <p className="text-slate-400 text-sm">No users currently online</p>
        ) : (
          onlineUsers.filter(u => u.online).map((user) => (
            <div 
              key={user.uid} 
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 bg-green-500"></div>
                </div>
                <div>
                  <p className="font-medium text-slate-100">{user.displayName || user.email || 'Unknown User'}</p>
                  <p className="text-xs text-slate-400">Online now</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-xs">🟢</span>
                <span className="text-xs text-slate-400">Active</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
