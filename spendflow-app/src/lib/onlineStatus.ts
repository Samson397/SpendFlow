import { db, auth } from './firebase/firebase';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface UserStatus {
  status: 'online' | 'offline';
  lastChanged: Date;
  userId: string;
  email?: string;
}

export const trackUserStatus = () => {
  const user = auth.currentUser;
  if (!user) return () => {};

  console.log('Setting up online status tracking for user:', user.email);

  const userRef = doc(db, 'users', user.uid);
  const userStatusRef = doc(db, 'status', user.uid);
  
  // Set user as online
  const setOnline = async () => {
    try {
      console.log('Setting user online:', user.email);
      // Update user document
      await setDoc(userRef, {
        online: true,
        lastSeen: serverTimestamp(),
        email: user.email,
        // Include other user fields that should be set on first login
        uid: user.uid,
        // Add any other default fields you want to set
      }, { merge: true });
      
      // Set or update status document
      await setDoc(userStatusRef, {
        status: 'online',
        lastChanged: serverTimestamp(),
        userId: user.uid,
        email: user.email
      }, { merge: true });
    } catch (error) {
      console.error('Error setting online status:', error);
    }
  };

  // Set user as offline
  const setOffline = async () => {
    try {
      // Update user document
      await setDoc(userRef, {
        online: false,
        lastSeen: serverTimestamp(),
        email: user.email,
        uid: user.uid
      }, { merge: true });
      
      // Set or update status document
      await setDoc(userStatusRef, {
        status: 'offline',
        lastChanged: serverTimestamp(),
        userId: user.uid,
        email: user.email
      }, { merge: true });
    } catch (error) {
      console.error('Error setting offline status:', error);
    }
  };

  // Set up the listener for auth state changes
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      setOnline();
      // Set up beforeunload listener
      window.addEventListener('beforeunload', setOffline);
    } else {
      setOffline();
      window.removeEventListener('beforeunload', setOffline);
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeAuth();
    window.removeEventListener('beforeunload', setOffline);
    setOffline();
  };
};

// Subscribe to online users
export const subscribeToOnlineUsers = (callback: (users: UserStatus[]) => void) => {
  const statusRef = collection(db, 'status');
  
  return onSnapshot(statusRef, (snapshot) => {
    const users: UserStatus[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        userId: data.userId,
        status: data.status,
        lastChanged: data.lastChanged?.toDate(),
        email: data.email
      });
    });
    callback(users);
  });
};

// Get all users with their online status
export const getAllUsersWithStatus = async (): Promise<UserStatus[]> => {
  const statusRef = collection(db, 'status');
  const querySnapshot = await getDocs(statusRef);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      userId: data.userId,
      status: data.status,
      lastChanged: data.lastChanged?.toDate(),
      email: data.email
    };
  });
};
