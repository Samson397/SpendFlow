import { db } from '@/firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Activity } from '@/types/activity';

const ACTIVITIES_COLLECTION = 'activities';

export const logActivity = async (activity: Omit<Activity, 'timestamp' | 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      ...activity,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getRecentActivities = async (count: number = 10): Promise<Activity[]> => {
  try {
    const q = query(
      collection(db, ACTIVITIES_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as Activity[];
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

// Helper functions for common activities
export const ActivityLogger = {
  userSignedUp: (userId: string, userEmail: string) =>
    logActivity({
      type: 'user',
      action: 'user_signed_up',
      userId,
      userEmail,
      metadata: { action: 'New user registration' }
    }),
    
  userLoggedIn: (userId: string, userEmail: string) =>
    logActivity({
      type: 'user',
      action: 'user_logged_in',
      userId,
      userEmail,
      metadata: { action: 'User logged in' }
    }),
    
  transactionCreated: (userId: string, transactionId: string, amount: number) =>
    logActivity({
      type: 'transaction',
      action: 'transaction_created',
      userId,
      metadata: {
        transactionId,
        amount,
        action: 'New transaction created'
      }
    }),
    
  securityEvent: (event: string, details: Record<string, unknown>) =>
    logActivity({
      type: 'security',
      action: 'security_event',
      metadata: {
        event,
        details,
        action: 'Security event occurred'
      }
    })
};
