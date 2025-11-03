'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { securityService } from '@/lib/securityService';
import { firestoreQueue } from '@/lib/firebase/queue';
import { setupActivityTracking } from '@/lib/updateUserActivity';
import { setupPresence } from '@/lib/firebase/presence';
import { DeviceManagementService, PersistentAuthService } from '@/lib/services/deviceManagementService';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Refs for cleanup and state management
  const activityCleanupRef = useRef<(() => void) | null>(null);
  const presenceCleanupRef = useRef<(() => void) | null>(null);
  const loginLogInProgress = useRef(false);
  const loginLogTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const previousUid = useRef<string | null>(null);
  const isInitialLoad = useRef(true);

  // Cleanup function for the effect
  const cleanup = useCallback(() => {
    // Clear any pending timeouts
    if (loginLogTimeoutRef.current) {
      clearTimeout(loginLogTimeoutRef.current);
      loginLogTimeoutRef.current = null;
    }
    
    // Clean up activity tracking
    if (activityCleanupRef.current) {
      activityCleanupRef.current();
      activityCleanupRef.current = null;
    }
    
    // Clean up presence tracking
    if (presenceCleanupRef.current) {
      presenceCleanupRef.current();
      presenceCleanupRef.current = null;
    }
  }, []);

  // Handle authentication state changes
  const handleAuthStateChange = useCallback(async (currentUser: User | null) => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      
      if (currentUser) {
        // Only log login if this is a new user session and not the initial load
        if (currentUser.uid !== previousUid.current && !isInitialLoad.current) {
          // Clear any pending login log
          if (loginLogTimeoutRef.current) {
            clearTimeout(loginLogTimeoutRef.current);
            loginLogTimeoutRef.current = null;
          }
          
          // Use a ref to prevent multiple concurrent login logs
          if (!loginLogInProgress.current) {
            loginLogInProgress.current = true;
            
            // Use a small debounce to catch rapid auth state changes
            loginLogTimeoutRef.current = setTimeout(async () => {
              try {
                // Use the queue for login logging
                await firestoreQueue.enqueue(async () => {
                  try {
                    await securityService.logLogin(
                      currentUser.uid, 
                      currentUser.email || 'unknown'
                    );
                  } catch (error) {
                    console.error('Failed to log login event:', error);
                  } finally {
                    if (isMounted.current) {
                      loginLogInProgress.current = false;
                    }
                  }
                });
              } catch (error) {
                console.error('Error queueing login log:', error);
                if (isMounted.current) {
                  loginLogInProgress.current = false;
                }
              }
            }, 500); // 500ms debounce
          }
        } else if (isInitialLoad.current) {
          // Mark initial load as complete after first successful auth state change
          isInitialLoad.current = false;
        }
        
        // Check if user is admin
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
        const userIsAdmin = currentUser.email ? adminEmails.includes(currentUser.email) : false;
        setIsAdmin(userIsAdmin);
        
        // Register device and create persistent session if needed
        try {
          const deviceName = `${navigator.platform} ${navigator.userAgent.split(' ').pop()}`;
          await DeviceManagementService.registerDevice(currentUser.uid, deviceName, true);
          
          // Create persistent session for future logins
          await PersistentAuthService.createPersistentSession(currentUser.uid, await DeviceManagementService.generateDeviceId(await DeviceManagementService.generateDeviceFingerprint()));
        } catch (error) {
          console.error('Error registering device:', error);
        }
        
        // Set up activity tracking
        if (activityCleanupRef.current) {
          activityCleanupRef.current();
        }
        activityCleanupRef.current = setupActivityTracking();
        
        // Set up presence tracking for all users
        console.log('🔄 [Auth] Setting up presence tracking for user:', currentUser.uid);
        if (presenceCleanupRef.current) {
          presenceCleanupRef.current();
        }
        presenceCleanupRef.current = setupPresence(currentUser.uid);
        
        // Update the previous UID
        previousUid.current = currentUser.uid;
      } else {
        // Clean up when user logs out
        cleanup();
        setIsAdmin(false);
        previousUid.current = null;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error('Error in auth state change handler:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [cleanup]);

  // Set up auth state listener
  useEffect(() => {
    // Check for persistent session on app load
    const checkPersistentSession = async () => {
      try {
        const userId = await PersistentAuthService.validatePersistentSession();
        if (userId) {
          console.log('🔄 [Auth] Found valid persistent session for user:', userId);
          // The auth state listener will handle the user setup
        }
      } catch (error) {
        console.error('Error checking persistent session:', error);
      }
    };

    checkPersistentSession();

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    
    return () => {
      isMounted.current = false;
      unsubscribe();
      cleanup();
    };
  }, [handleAuthStateChange, cleanup]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
