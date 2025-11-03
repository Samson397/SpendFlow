/**
 * Data Cleanup Service for Firebase
 *
 * WARNING: This service permanently deletes ALL user data from Firebase.
 * Use with extreme caution - this operation cannot be undone.
 */

import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
  query,
  limit,
  orderBy
} from 'firebase/firestore';

// Collections to clean (user-generated data)
const USER_DATA_COLLECTIONS = [
  'users',
  'transactions',
  'cards',
  'expenses',
  'income',
  'categories',
  'messages',
  'contactMessages',
  'activities',
  'alerts',
  'announcements',
  'creditCardPayments',
  'recurringExpenses',
  'recurringExpenseErrors',
  'securityEvents',
  'limitIncreaseRequests',
  'userSubscriptions',        // User subscription records
  'subscriptionPayments',     // User payment records
  'subscriptionChanges',      // User subscription changes
  'subscriptionNotifications' // User-specific notifications
];

// Collections to preserve (system data)
const SYSTEM_COLLECTIONS = [
  'subscriptionPlans' // Keep plan definitions
];

export interface CleanupResult {
  success: boolean;
  collectionsProcessed: number;
  totalDocumentsDeleted: number;
  errors: string[];
  collectionResults: {
    collection: string;
    documentsDeleted: number;
    error?: string;
  }[];
}

export class DataCleanupService {
  /**
   * 🚨 DANGER: Completely wipes ALL user data from Firebase
   * This will delete all user accounts, transactions, cards, etc.
   *
   * @param adminConfirmation - Must be exactly "YES_I_WANT_TO_DELETE_EVERYTHING"
   */
  static async wipeAllUserData(adminConfirmation: string): Promise<CleanupResult> {
    const result: CleanupResult = {
      success: false,
      collectionsProcessed: 0,
      totalDocumentsDeleted: 0,
      errors: [],
      collectionResults: []
    };

    // Safety check
    if (adminConfirmation !== "YES_I_WANT_TO_DELETE_EVERYTHING") {
      result.errors.push("❌ Incorrect confirmation phrase. Data cleanup aborted.");
      return result;
    }

    console.log("🗑️ Starting complete Firebase data cleanup...");
    console.log("⚠️ This will delete ALL user data permanently!");

    try {
      for (const collectionName of USER_DATA_COLLECTIONS) {
        console.log(`🧹 Cleaning collection: ${collectionName}`);

        try {
          const deletedCount = await this.deleteCollectionData(collectionName);
          result.collectionResults.push({
            collection: collectionName,
            documentsDeleted: deletedCount
          });

          result.totalDocumentsDeleted += deletedCount;
          result.collectionsProcessed++;

          console.log(`✅ ${collectionName}: ${deletedCount} documents deleted`);

        } catch (error) {
          const errorMsg = `Failed to clean ${collectionName}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.collectionResults.push({
            collection: collectionName,
            documentsDeleted: 0,
            error: errorMsg
          });
        }
      }

      // Verify system collections are intact
      console.log("🔍 Verifying system collections are preserved...");
      for (const collectionName of SYSTEM_COLLECTIONS) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(query(collectionRef, limit(1)));

          if (snapshot.empty) {
            console.warn(`⚠️ System collection ${collectionName} appears to be empty`);
          } else {
            console.log(`✅ System collection ${collectionName} preserved`);
          }
        } catch (error) {
          console.error(`❌ Error checking system collection ${collectionName}:`, error);
        }
      }

      result.success = result.errors.length === 0;
      console.log(`🎯 Cleanup ${result.success ? 'completed successfully' : 'completed with errors'}`);
      console.log(`📊 Total: ${result.totalDocumentsDeleted} documents deleted from ${result.collectionsProcessed} collections`);

    } catch (error) {
      result.errors.push(`Critical error during cleanup: ${error}`);
      console.error("💥 Critical cleanup error:", error);
    }

    return result;
  }

  /**
   * Delete all documents in a collection using batch operations
   */
  private static async deleteCollectionData(collectionName: string): Promise<number> {
    const collectionRef = collection(db, collectionName);
    let deletedCount = 0;

    // Get all documents in batches to avoid memory issues
    const BATCH_SIZE = 500; // Firestore batch limit

    while (true) {
      try {
        // Get next batch of documents
        const q = query(collectionRef, orderBy('__name__'), limit(BATCH_SIZE));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          break; // No more documents
        }

        // Delete documents in batch
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += snapshot.docs.length;

        console.log(`  📄 Deleted batch of ${snapshot.docs.length} documents from ${collectionName}`);

      } catch (error) {
        console.error(`Error deleting batch from ${collectionName}:`, error);
        throw error;
      }
    }

    return deletedCount;
  }

  /**
   * Get a summary of all collections and their document counts
   */
  static async getCollectionsSummary(): Promise<{
    collection: string;
    documentCount: number;
    type: 'user_data' | 'system_data';
  }[]> {
    const summary = [];

    const allCollections = [...USER_DATA_COLLECTIONS, ...SYSTEM_COLLECTIONS];

    for (const collectionName of allCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        summary.push({
          collection: collectionName,
          documentCount: snapshot.size,
          type: USER_DATA_COLLECTIONS.includes(collectionName) ? 'user_data' : 'system_data'
        });

      } catch (error) {
        console.error(`Error counting documents in ${collectionName}:`, error);
        summary.push({
          collection: collectionName,
          documentCount: -1, // Error indicator
          type: USER_DATA_COLLECTIONS.includes(collectionName) ? 'user_data' : 'system_data'
        });
      }
    }

    return summary;
  }

  /**
   * Test function to verify cleanup would work (dry run)
   */
  static async dryRunCleanup(): Promise<{
    collectionsToClean: string[];
    estimatedDocuments: number;
    systemCollectionsSafe: string[];
  }> {
    console.log("🧪 Running cleanup dry run...");

    const summary = await this.getCollectionsSummary();

    const userDataCollections = summary.filter(s => s.type === 'user_data');
    const systemCollections = summary.filter(s => s.type === 'system_data');

    const estimatedDocuments = userDataCollections.reduce((sum, col) => sum + col.documentCount, 0);

    console.log("📊 Dry run results:");
    console.log(`  User data collections: ${userDataCollections.length}`);
    console.log(`  Estimated documents to delete: ${estimatedDocuments}`);
    console.log(`  System collections (preserved): ${systemCollections.length}`);

    return {
      collectionsToClean: userDataCollections.map(c => c.collection),
      estimatedDocuments,
      systemCollectionsSafe: systemCollections.map(c => c.collection)
    };
  }
}
