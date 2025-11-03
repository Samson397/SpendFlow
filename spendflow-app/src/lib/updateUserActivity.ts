import { doc, updateDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase/config';

const db = getFirestore(app);
const auth = getAuth(app);

// Global flag to prevent activity updates when quota is exceeded
let quotaExceeded = false;

/**
 * Sets the quota exceeded flag to prevent activity updates
 */
export const setQuotaExceeded = (exceeded: boolean) => {
  quotaExceeded = exceeded;
  if (exceeded) {
    console.warn('🚫 Activity tracking disabled due to Firebase quota exceeded');
  } else {
    console.log('✅ Activity tracking re-enabled');
  }
};

/**
 * Updates the lastActive timestamp for the current user
 * This should be called when the user performs an action that indicates they are active
 */
export const updateUserActivity = async () => {
  // Skip activity updates if quota is exceeded
  if (quotaExceeded) {
    console.log('⏭️ Skipping activity update due to quota exceeded');
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      lastActive: serverTimestamp(),
    });
    
    console.log('User activity updated');
  } catch (error: any) {
    console.error('Error updating user activity:', error);
    
    // Check for quota exceeded errors
    if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota exceeded')) {
      console.warn('🚫 Firebase quota exceeded during activity update, disabling activity tracking');
      setQuotaExceeded(true);
    }
  }
};

/**
 * Sets up activity tracking for the current user
 * This should be called when the app initializes
 */
export const setupActivityTracking = () => {
  // Update activity on initial load
  updateUserActivity();
  
  // Update activity on user interaction
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  const updateActivity = () => updateUserActivity();
  
  events.forEach(event => {
    window.addEventListener(event, updateActivity, { passive: true });
  });
  
  // Cleanup function
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, updateActivity);
    });
  };
};
