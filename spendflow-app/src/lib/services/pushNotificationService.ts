import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { doc, setDoc, updateDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

export class PushNotificationService {
  private static messaging: Messaging | null = null;

  // Initialize push notifications
  static async initialize(): Promise<boolean> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.log('Push notifications not supported');
        return false;
      }

      // Get Firebase messaging instance
      this.messaging = getMessaging();

      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      }

      // Listen for messages when app is in foreground
      if (this.messaging) {
        onMessage(this.messaging, (payload) => {
          console.log('Message received in foreground:', payload);

          // Show notification manually since we're in foreground
          if (Notification.permission === 'granted') {
            const { title, body } = payload.notification || {};
            if (title && body) {
              new Notification(title, {
                body,
                icon: '/icon-192.png',
                badge: '/icon-96.png',
              });
            }
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Request permission for notifications
  static async requestPermission(): Promise<NotificationPermission> {
    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Get FCM token for push notifications
  static async getFCMToken(): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.error('Messaging not initialized');
        return null;
      }

      const token = await getToken(this.messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
      });

      console.log('FCM token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Subscribe user to push notifications
  static async subscribeUser(userId: string): Promise<boolean> {
    try {
      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Get FCM token
      const token = await this.getFCMToken();
      if (!token) {
        console.log('Failed to get FCM token');
        return false;
      }

      // Save token to user's document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pushNotifications: {
          enabled: true,
          token: token,
          subscribedAt: new Date(),
          userAgent: navigator.userAgent
        }
      });

      console.log('User subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Error subscribing user to push notifications:', error);
      return false;
    }
  }

  // Unsubscribe user from push notifications
  static async unsubscribeUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        pushNotifications: {
          enabled: false,
          token: null,
          unsubscribedAt: new Date()
        }
      });

      console.log('User unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing user from push notifications:', error);
    }
  }

  // Send push notification (server-side function, called from backend)
  static async sendNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      // Get user's FCM token
      const userQuery = query(collection(db, 'users'), where('__name__', '==', userId));
      const userDoc = await getDocs(userQuery);

      if (userDoc.empty) {
        console.error('User not found');
        return;
      }

      const userData = userDoc.docs[0].data() as { pushNotifications?: { token?: string } };
      const token = userData.pushNotifications?.token;

      if (!token) {
        console.log('User not subscribed to push notifications');
        return;
      }

      // In a real implementation, this would be done server-side
      // For now, we'll log the notification that would be sent
      console.log('Push notification would be sent:', {
        token,
        title,
        body,
        data
      });

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
