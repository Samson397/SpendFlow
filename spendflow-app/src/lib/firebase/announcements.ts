import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  isActive: boolean;
  type: 'info' | 'warning' | 'critical' | 'success';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const ANNOUNCEMENTS_COLLECTION = 'announcements';

export const announcementsService = {
  // Create a new announcement
  async create(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
        ...announcement,
        startDate: Timestamp.fromDate(new Date(announcement.startDate)),
        endDate: Timestamp.fromDate(new Date(announcement.endDate)),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      return { id: docRef.id, ...announcement };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Get all announcements
  async getAll() {
    try {
      const q = query(collection(db, ANNOUNCEMENTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Announcement;
      });
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  },

  // Get active announcements
  async getActive() {
    try {
      const now = new Date();
      const q = query(
        collection(db, ANNOUNCEMENTS_COLLECTION),
        where('isActive', '==', true),
        where('startDate', '<=', Timestamp.fromDate(now)),
        where('endDate', '>=', Timestamp.fromDate(now))
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Announcement;
      });
    } catch (error) {
      console.error('Error getting active announcements:', error);
      throw error;
    }
  },

  // Update an announcement
  async update(id: string, updates: Partial<Announcement>) {
    try {
      const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Convert dates to Firestore timestamps if they exist
      if (updates.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      if (updates.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }

      await updateDoc(announcementRef, updateData);
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  // Delete an announcement
  async delete(id: string) {
    try {
      await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, id));
      return true;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  },

  // Toggle announcement active status
  async toggleActive(id: string, isActive: boolean) {
    try {
      const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
      await updateDoc(announcementRef, {
        isActive,
        updatedAt: Timestamp.fromDate(new Date()),
      });
      return true;
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      throw error;
    }
  },
};
