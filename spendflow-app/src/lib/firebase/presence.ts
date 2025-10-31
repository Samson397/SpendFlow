import { ref, onValue, onDisconnect, set, getDatabase, get } from 'firebase/database';
import { app } from '@/firebase/config';

type UserStatus = {
  state: 'online' | 'offline';
  last_changed: number;
};

// Track user's online/offline status
export const setupPresence = (userId: string) => {
  console.log('🟢 [Presence] Setting up for user:', userId);
  if (!userId) {
    console.warn('⚠️ [Presence] No user ID provided');
    return () => {}; // Return empty cleanup function
  }

  const db = getDatabase(app);
  const userStatusRef = ref(db, `status/${userId}`);
  
  const isOfflineData: UserStatus = {
    state: 'offline',
    last_changed: Date.now(),
  };

  const isOnlineData: UserStatus = {
    state: 'online',
    last_changed: Date.now(),
  };

  // Set up the presence system
  const connectedRef = ref(db, '.info/connected');
  
  // This will be our cleanup function
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      // We're connected (or reconnected)! Set up onDisconnect first
      onDisconnect(userStatusRef)
        .set(isOfflineData)
        .then(() => {
          // When we disconnect, update the database
          console.log('✅ [Presence] OnDisconnect handler set for user:', userId);
          // Now set the user to online
          return set(userStatusRef, isOnlineData);
        })
        .then(() => {
          console.log('✅ [Presence] Online status set for user:', userId);
        })
        .catch((error) => {
          console.error('❌ [Presence] Error setting up presence:', error);
        });
    }
  });

  // Return cleanup function
  return () => {
    console.log('🧹 [Presence] Cleaning up presence for user:', userId);
    unsubscribe();
  };
};

// Get user status from the database
export const getUserStatus = async (userId: string): Promise<UserStatus | null> => {
  try {
    const db = getDatabase(app);
    const statusRef = ref(db, `status/${userId}`);
    const snapshot = await get(statusRef);
    return snapshot.val();
  } catch (error) {
    console.error(' [Presence] Error getting user status:', error);
    return null;
  }
};
