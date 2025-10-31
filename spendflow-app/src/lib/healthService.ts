import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getMetadata } from 'firebase/storage';

export interface HealthCheckResult {
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime: number;
  lastChecked: Date;
  error?: string;
}

export class HealthService {
  private static instance: HealthService;
  private db = getFirestore();
  private auth = getAuth();
  private storage = getStorage();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private subscribers: ((status: HealthCheckResult[]) => void)[] = [];
  private statusHistory: HealthCheckResult[] = [];
  private readonly MAX_HISTORY = 100; // Keep last 100 status checks

  private constructor() {}

  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  public async checkAllServices(): Promise<HealthCheckResult[]> {
    const checks = [
      this.checkDatabase(),
      this.checkAuth(),
      this.checkStorage(),
    ];

    const results = await Promise.all(checks);
    
    // Store in history
    this.statusHistory = [...results, ...this.statusHistory].slice(0, this.MAX_HISTORY);
    
    // Notify subscribers
    this.notifySubscribers(results);
    
    return results;
  }

  public subscribe(callback: (status: HealthCheckResult[]) => void): () => void {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  public startMonitoring(intervalMs = 5 * 60 * 1000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Initial check
    this.checkAllServices().catch(console.error);
    
    // Set up interval
    this.healthCheckInterval = setInterval(() => {
      this.checkAllServices().catch(console.error);
    }, intervalMs);
  }

  public stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  public getStatusHistory(): HealthCheckResult[] {
    return [...this.statusHistory];
  }

  private notifySubscribers(results: HealthCheckResult[]): void {
    this.subscribers.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        console.error('Error in health check subscriber:', error);
      }
    });
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const result: Omit<HealthCheckResult, 'responseTime'> = {
      service: 'database',
      status: 'operational',
      lastChecked: new Date(),
    };

    try {
      await getDoc(doc(this.db, 'system/health'));
    } catch (error) {
      result.status = 'degraded';
      result.error = error instanceof Error ? error.message : 'Database check failed';
    }

    return {
      ...result,
      responseTime: Date.now() - startTime,
    };
  }

  private async checkAuth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const result: Omit<HealthCheckResult, 'responseTime'> = {
      service: 'authentication',
      status: 'operational',
      lastChecked: new Date(),
    };

    try {
      // Just check if auth is initialized
      if (!this.auth.app) {
        throw new Error('Auth not initialized');
      }
    } catch (error) {
      result.status = 'degraded';
      result.error = error instanceof Error ? error.message : 'Auth check failed';
    }

    return {
      ...result,
      responseTime: Date.now() - startTime,
    };
  }

  private async checkStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const result: Omit<HealthCheckResult, 'responseTime'> = {
      service: 'storage',
      status: 'operational',
      lastChecked: new Date(),
    };

    try {
      // Try to list files in the root
      await getMetadata(ref(this.storage, '/'));
    } catch (error) {
      result.status = 'degraded';
      result.error = error instanceof Error ? error.message : 'Storage check failed';
    }

    return {
      ...result,
      responseTime: Date.now() - startTime,
    };
  }
}

// Export a singleton instance
export const healthService = HealthService.getInstance();

// Initialize monitoring when imported
if (typeof window !== 'undefined') {
  healthService.startMonitoring();
}
