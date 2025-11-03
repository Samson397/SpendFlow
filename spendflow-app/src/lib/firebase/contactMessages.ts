import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp, 
  deleteDoc,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CONTACT_MESSAGES_COLLECTION = 'contactMessages';

export const contactMessagesService = {
  // Create a new contact message
  async create(message: Omit<ContactMessage, 'id' | 'read' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, CONTACT_MESSAGES_COLLECTION), {
        ...message,
        read: false,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });
      return { id: docRef.id, ...message };
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw error;
    }
  },

  // Get all contact messages
  async getAll() {
    try {
      const q = query(
        collection(db, CONTACT_MESSAGES_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: DocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        if (!data) return null;
        
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          message: data.message,
          read: data.read || false,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as ContactMessage;
      }).filter(Boolean) as ContactMessage[];
    } catch (error) {
      console.error('Error getting contact messages:', error);
      throw error;
    }
  },

  // Update a message
  async update(id: string, data: Partial<Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt'>>) {
    try {
      const messageRef = doc(db, CONTACT_MESSAGES_COLLECTION, id);
      await updateDoc(messageRef, {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      });
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  // Mark a message as read
  async markAsRead(id: string) {
    return this.update(id, { read: true });
  },

  // Delete a message
  async delete(id: string) {
    try {
      await deleteDoc(doc(db, CONTACT_MESSAGES_COLLECTION, id));
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Get unread messages count
  async getUnreadCount() {
    try {
      const q = query(
        collection(db, CONTACT_MESSAGES_COLLECTION),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread messages count:', error);
      throw error;
    }
  },

  // Set up real-time listener for messages
  onMessagesUpdate(callback: (messages: ContactMessage[]) => void): Unsubscribe {
    const q = query(
      collection(db, CONTACT_MESSAGES_COLLECTION), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const messages = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          message: data.message,
          read: data.read || false,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as ContactMessage;
      });
      callback(messages);
    });
    
    return unsubscribe;
  },
};
