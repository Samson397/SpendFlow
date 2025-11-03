import { ref, onValue, onDisconnect, set, get, off, onChildAdded, onChildRemoved, onChildChanged } from 'firebase/database';
import { rtdb } from '../../firebase/config';

type UserStatus = {
  state: 'online' | 'offline';
  last_changed: number;
};

// Track user's online/offline status
export const setupPresence = (userId: string) => {
  console.log('🟢 [Presence] Setting up for user:', userId);
  console.log('🔗 [Presence] RTDB instance available:', !!rtdb);

  if (!userId) {
    console.warn('⚠️ [Presence] No user ID provided');
    return () => {}; // Return empty cleanup function
  }

  const userStatusRef = ref(rtdb, `status/${userId}`);

  const isOfflineData: UserStatus = {
    state: 'offline',
    last_changed: Date.now(),
  };

  const isOnlineData: UserStatus = {
    state: 'online',
    last_changed: Date.now(),
  };

  // Set up the presence system
  const connectedRef = ref(rtdb, '.info/connected');

  // This will be our cleanup function
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    console.log('🔌 [Presence] Connection state changed:', snapshot.val() ? 'CONNECTED' : 'DISCONNECTED');

    if (snapshot.val() === true) {
      // We're connected (or reconnected)! Set up onDisconnect first
      console.log('🔗 [Presence] Setting up onDisconnect handler for user:', userId);

      onDisconnect(userStatusRef)
        .set(isOfflineData)
        .then(() => {
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
    } else {
      console.log('⚠️ [Presence] Not connected to Firebase RTDB');
    }
  }, {
    // Add error handler for the connection listener
    onlyOnce: false
  });

  // Return cleanup function
  return () => {
    console.log('🧹 [Presence] Cleaning up presence for user:', userId);
    try {
      // Set user as offline when cleaning up
      set(userStatusRef, isOfflineData).catch(console.error);
      // Remove the listener
      unsubscribe();
    } catch (error) {
      console.error('❌ [Presence] Error during cleanup:', error);
    }
  };
};

// Get user status from the database
export const getUserStatus = async (userId: string): Promise<UserStatus | null> => {
  try {
    const statusRef = ref(rtdb, `status/${userId}`);
    const snapshot = await get(statusRef);
    console.log(`[Presence] Fetched status for ${userId}:`, snapshot.val());
    return snapshot.val();
  } catch (error) {
    console.error('❌ [Presence] Error getting user status:', error);
    return null;
  }
};

// Monitor all users' status changes
export const monitorAllUsersStatus = (
  onStatusChange: (userId: string, status: UserStatus) => void,
  onError?: (error: Error) => void
) => {
  console.log('👀 [Presence] Setting up status monitor for all users');

  try {
    const statusRef = ref(rtdb, 'status');

    // Handle new users coming online
    const childAddedUnsubscribe = onChildAdded(statusRef, (snapshot) => {
      const userId = snapshot.key;
      const status = snapshot.val();
      console.log(`➕ [Presence] New user status detected - ${userId}:`, status);
      if (userId && status) {
        onStatusChange(userId, status);
      }
    }, (error) => {
      console.error('❌ [Presence] Error in onChildAdded:', error);
      onError?.(error);
    });

    // Handle status changes
    const childChangedUnsubscribe = onChildChanged(statusRef, (snapshot) => {
      const userId = snapshot.key;
      const status = snapshot.val();
      console.log(`🔄 [Presence] Status changed - ${userId}:`, status);
      if (userId && status) {
        onStatusChange(userId, status);
      }
    }, (error) => {
      console.error('❌ [Presence] Error in onChildChanged:', error);
      onError?.(error);
    });

    // Handle users going offline
    const childRemovedUnsubscribe = onChildRemoved(statusRef, (snapshot) => {
      const userId = snapshot.key;
      console.log(`➖ [Presence] User removed - ${userId}`);
      if (userId) {
        onStatusChange(userId, { state: 'offline', last_changed: Date.now() });
      }
    }, (error) => {
      console.error('❌ [Presence] Error in onChildRemoved:', error);
      onError?.(error);
    });

    console.log('✅ [Presence] All status monitors set up');

    // Return cleanup function
    return () => {
      console.log('🧹 [Presence] Cleaning up status monitor');
      try {
        childAddedUnsubscribe();
        childChangedUnsubscribe();
        childRemovedUnsubscribe();
      } catch (error) {
        console.error('❌ [Presence] Error during monitor cleanup:', error);
      }
    };
  } catch (error) {
    console.error('❌ [Presence] Error setting up status monitor:', error);
    onError?.(error as Error);
    return () => {}; // Return empty cleanup function
  }
};
