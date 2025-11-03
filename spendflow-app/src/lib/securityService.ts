import { collection, serverTimestamp, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { ActivityLogger } from './activityService';
import { firestoreQueue } from './firebase/queue';

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number, resetTime: number }>();

export interface SecurityEvent {
  userId: string;
  userEmail: string;
  type: 'login' | 'logout' | 'failed_attempt' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity' | 'account_locked' | 'account_unlocked';
  ip?: string;
  location?: string;
  device?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
  timestamp: Date;
}

export class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Check rate limit
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = requestCounts.get(userId);

    if (!userLimit) {
      requestCounts.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }

    // Reset counter if window has passed
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + RATE_LIMIT_WINDOW;
      return true;
    }

    // Check if under rate limit
    if (userLimit.count < MAX_REQUESTS_PER_WINDOW) {
      userLimit.count++;
      return true;
    }

    return false;
  }

  // Log a security event with rate limiting and queue management
  public async logEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<boolean> {
    try {
      // Skip rate limiting for certain critical events
      const isCritical = ['login', 'failed_attempt', 'suspicious_activity'].includes(event.type);
      
      if (!isCritical && !this.checkRateLimit(event.userId)) {
        console.warn('Rate limit exceeded for user:', event.userId);
        return false;
      }

      const eventData = {
        ...event,
        timestamp: serverTimestamp(),
      };

      // Use the queue for all Firestore operations
      await firestoreQueue.enqueue(async () => {
        const batch = writeBatch(db);
        const eventRef = doc(collection(db, 'securityEvents'));
        batch.set(eventRef, eventData);
        await batch.commit();
      });
      
      console.log('Security event logged:', event.type);
      return true;
    } catch (error) {
      console.error('Failed to log security event:', error);
      return false;
    }
  }


  // Log successful login
  public async logLogin(userId: string, userEmail: string): Promise<boolean> {
    try {
      // First check if we've already logged this login recently
      const loginCheckRef = doc(db, 'userSessions', userId);
      const loginCheck = await getDoc(loginCheckRef);
      
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (loginCheck.exists()) {
        const lastLogin = loginCheck.data()?.lastLogin?.toDate?.();
        if (lastLogin && lastLogin > fiveMinutesAgo) {
          console.log('Login already logged recently, skipping');
          return false;
        }
      }
      
      // Log the login event
      const logged = await this.logEvent({
        userId,
        userEmail,
        type: 'login',
        success: true,
        device: this.getDeviceInfo(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
      });
      
      // Also log as activity if in browser environment
      if (typeof window !== 'undefined') {
        try {
          await ActivityLogger.userLoggedIn(userId, userEmail);
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
      }
      
      return logged;
    } catch (error) {
      console.error('Error in logLogin:', error);
      return false;
    }
  }

  // Log failed login attempt
  public async logFailedLogin(email: string, reason?: string): Promise<void> {
    await this.logEvent({
      userId: 'unknown',
      userEmail: email,
      type: 'failed_attempt',
      success: false,
      details: reason,
      device: this.getDeviceInfo(),
      userAgent: navigator.userAgent,
    });
  }

  // Log password change
  public async logPasswordChange(userId: string, userEmail: string): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      type: 'password_change',
      success: true,
      device: this.getDeviceInfo(),
    });
  }

  // Log suspicious activity
  public async logSuspiciousActivity(userId: string, userEmail: string, activity: string): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      type: 'suspicious_activity',
      success: false,
      details: activity,
      device: this.getDeviceInfo(),
      userAgent: navigator.userAgent,
    });
  }

  // Get device information with server-side rendering support
  private getDeviceInfo(): string {
    try {
      // Handle server-side rendering
      if (typeof navigator === 'undefined') return 'Server';
      
      const ua = navigator.userAgent;
      if (ua.match(/Android/i)) return 'Android';
      if (ua.match(/iPhone|iPad|iPod/i)) return 'iOS';
      if (ua.match(/Windows/i)) return 'Windows';
      if (ua.match(/Mac/i)) return 'Mac';
      if (ua.match(/Linux/i)) return 'Linux';
      if (ua.includes('Mobile')) return 'Mobile';
      if (ua.includes('Tablet')) return 'Tablet';
      return 'Desktop';
    } catch (error) {
      console.error('Error detecting device:', error);
      return 'Unknown';
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance();
