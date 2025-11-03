import { db } from '@/firebase/config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';

export interface Alert {
  id?: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'system' | 'security' | 'performance' | 'database' | 'api' | 'user';
  status: 'active' | 'resolved' | 'acknowledged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date | FieldValue; // FieldValue for creation, Date for display
  resolvedAt?: Date | FieldValue;
  acknowledgedAt?: Date | FieldValue;
  updatedAt?: FieldValue;
  acknowledgedBy?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// Alert service for generating and managing system alerts
export const alertsService = {
  // Generate alert for new user registration
  async userRegistered(userId: string, email: string, userType: 'free' | 'pro' | 'enterprise' = 'free') {
    const alert: Omit<Alert, 'id'> = {
      title: 'New User Registration',
      message: `User ${email} has registered for a ${userType} account and is awaiting email verification.`,
      type: 'info',
      category: 'user',
      status: 'active',
      priority: 'low',
      createdAt: serverTimestamp(),
      userId,
      metadata: { email, userType, action: 'registration' }
    };
    return await this.create(alert);
  },

  // Generate alert for failed login attempts
  async failedLogin(email: string, ipAddress?: string, attemptCount: number = 1) {
    const priority = attemptCount >= 5 ? 'high' : attemptCount >= 3 ? 'medium' : 'low';
    const type = attemptCount >= 5 ? 'warning' : 'info';

    const alert: Omit<Alert, 'id'> = {
      title: `Failed Login Attempts`,
      message: `Multiple failed login attempts detected for ${email}${ipAddress ? ` from IP ${ipAddress}` : ''}. ${attemptCount} failed attempts in the last hour.`,
      type: type as Alert['type'],
      category: 'security',
      status: 'active',
      priority: priority as Alert['priority'],
      createdAt: serverTimestamp(),
      metadata: { email, ipAddress, attemptCount, action: 'failed_login' }
    };
    return await this.create(alert);
  },

  // Generate alert for successful admin actions
  async adminAction(adminEmail: string, action: string, target?: string) {
    const alert: Omit<Alert, 'id'> = {
      title: 'Admin Action Performed',
      message: `Administrator ${adminEmail} performed: ${action}${target ? ` on ${target}` : ''}`,
      type: 'info',
      category: 'system',
      status: 'resolved', // Admin actions are typically successful
      priority: 'low',
      createdAt: serverTimestamp(),
      resolvedAt: serverTimestamp() as unknown as Date,
      metadata: { 
        adminEmail, 
        action,
        target, 
        actionType: 'admin_action' // Renamed to avoid duplicate property
      }
    };
    return await this.create(alert);
  },

  // Generate alert for system performance issues
  async performanceIssue(metric: string, value: number, threshold: number, unit: string = '%') {
    const priority = value > 90 ? 'critical' : value > 80 ? 'high' : 'medium';

    const alert: Omit<Alert, 'id'> = {
      title: 'Performance Alert',
      message: `${metric} has reached ${value}${unit}, exceeding threshold of ${threshold}${unit}. System performance may be impacted.`,
      type: value > 90 ? 'critical' : 'warning',
      category: 'performance',
      status: 'active',
      priority: priority as Alert['priority'],
      createdAt: serverTimestamp(),
      metadata: { metric, value, threshold, unit, action: 'performance' }
    };
    return await this.create(alert);
  },

  // Generate alert for database issues
  async databaseError(operation: string, error: string, collection?: string) {
    const alert: Omit<Alert, 'id'> = {
      title: 'Database Error',
      message: `Database operation failed: ${operation}${collection ? ` on collection ${collection}` : ''}. Error: ${error}`,
      type: 'critical',
      category: 'database',
      status: 'active',
      priority: 'critical',
      createdAt: serverTimestamp(),
      metadata: { operation, error, collection, action: 'database_error' }
    };
    return await this.create(alert);
  },

  // Generate alert for successful backups
  async backupCompleted(size: string, duration: number) {
    const alert: Omit<Alert, 'id'> = {
      title: 'Backup Completed Successfully',
      message: `System backup completed successfully. Size: ${size}, Duration: ${duration} seconds.`,
      type: 'success',
      category: 'system',
      status: 'resolved',
      priority: 'low',
      createdAt: serverTimestamp(),
      resolvedAt: serverTimestamp() as unknown as Date,
      metadata: { 
        size, 
        duration, 
        action: 'backup_complete' 
      }
    };
    return await this.create(alert);
  },

  // Generate alert for security events
  async securityEvent(event: string, details: Record<string, unknown>) {
    const priority = event.includes('brute_force') || event.includes('suspicious') ? 'high' : 'medium';

    const alert: Omit<Alert, 'id'> = {
      title: 'Security Event Detected',
      message: `${event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${JSON.stringify(details)}`,
      type: 'warning',
      category: 'security',
      status: 'active',
      priority: priority as Alert['priority'],
      createdAt: serverTimestamp(),
      metadata: { 
        event, 
        ...details, 
        action: 'security_event' 
      }
    };
    return await this.create(alert);
  },

  // Create a new alert
  async create(alertData: Omit<Alert, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'alerts'), alertData);
      console.log('Alert created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  // Get all alerts with optional filtering
  async getAll(options: {
    status?: Alert['status'];
    type?: Alert['type'];
    category?: Alert['category'];
    limit?: number;
    userId?: string; // Add userId filter for non-admin users
  } = {}) {
    try {
      let q = query(collection(db, 'alerts'));
      
      // Only apply admin filters if userId is not provided (admin view)
      if (!options.userId) {
        q = query(q, orderBy('createdAt', 'desc'));
      } else {
        // For non-admin users, only show their own alerts
        q = query(
          q,
          where('userId', '==', options.userId),
          orderBy('createdAt', 'desc')
        );
      }

      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }
      if (options.type) {
        q = query(q, where('type', '==', options.type));
      }
      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Alert[];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Don't throw here, just return empty array and let the UI handle it
      return [];
    }
  },

  // Update alert status
  async updateStatus(alertId: string, status: Alert['status'], acknowledgedBy?: string) {
    try {
      const updateData: Partial<Alert> = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'acknowledged' && acknowledgedBy) {
        updateData.acknowledgedAt = serverTimestamp();
        updateData.acknowledgedBy = acknowledgedBy;
      } else if (status === 'resolved') {
        updateData.resolvedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'alerts', alertId), updateData);
      console.log(`Alert ${alertId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating alert status:', error);
      throw error;
    }
  },

  // Delete an alert
  async delete(alertId: string) {
    try {
      await deleteDoc(doc(db, 'alerts', alertId));
      console.log('Alert deleted:', alertId);
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  },

  // Clean up old resolved alerts (older than 30 days)
  async cleanupOldAlerts() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get resolved alerts older than 30 days
      const q = query(
        collection(db, 'alerts'),
        where('status', '==', 'resolved'),
        where('resolvedAt', '<', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('resolvedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} old alerts`);
      return deletePromises.length;
    } catch (error) {
      console.error('Error cleaning up old alerts:', error);
      return 0;
    }
  }
};
