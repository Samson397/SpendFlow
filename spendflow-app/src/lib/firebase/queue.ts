import { FirebaseError } from 'firebase/app';

type Operation<T> = () => Promise<T>;

class FirestoreQueue {
  private static instance: FirestoreQueue;
  private queue: Array<() => void> = [];
  private activeRequests = 0;
  private readonly MAX_CONCURRENT = 5; // Maximum concurrent requests
  private readonly BASE_DELAY = 1000; // Base delay in ms
  private readonly MAX_RETRIES = 3;

  private constructor() {}

  public static getInstance(): FirestoreQueue {
    if (!FirestoreQueue.instance) {
      FirestoreQueue.instance = new FirestoreQueue();
    }
    return FirestoreQueue.instance;
  }

  private async processQueue() {
    if (this.activeRequests >= this.MAX_CONCURRENT || this.queue.length === 0) {
      return;
    }

    this.activeRequests++;
    const operation = this.queue.shift();
    
    try {
      await operation?.();
    } finally {
      this.activeRequests--;
      this.processQueue(); // Process next operation in queue
    }
  }

  private async withRetry<T>(
    operation: Operation<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.isQuotaError(error) && retries > 0) {
        const delay = this.calculateBackoff(retries);
        console.warn(`Quota exceeded, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private isQuotaError(error: unknown): boolean {
    return error instanceof FirebaseError && error.code === 'resource-exhausted';
  }

  private calculateBackoff(retryCount: number): number {
    return Math.min(this.BASE_DELAY * Math.pow(2, this.MAX_RETRIES - retryCount), 10000);
  }

  public async enqueue<T>(operation: Operation<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        try {
          const result = await this.withRetry(operation);
          resolve(result);
        } catch (error) {
          if (this.isQuotaError(error)) {
            console.error('Firestore quota exceeded. Please try again later.');
          }
          reject(error);
        }
      };

      this.queue.push(execute);
      this.processQueue();
    });
  }

  public clear() {
    this.queue = [];
    this.activeRequests = 0;
  }
}

export const firestoreQueue = FirestoreQueue.getInstance();
