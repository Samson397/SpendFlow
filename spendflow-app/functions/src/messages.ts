import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

const db = admin.firestore();

interface Message {
  id?: string;
  from: string;
  to?: string;
  subject: string;
  body: string;
  read: boolean;
  hasAttachment: boolean;
  labels: string[];
  createdAt: admin.firestore.FieldValue | Date;
  updatedAt: admin.firestore.FieldValue | Date;
}

// Get all messages (for admin)
export const getMessages = onCall(
  {
    cors: [
      {
        origin: true,
        methods: ['POST'],
      },
    ],
    region: 'us-central1',
  },
  async (request) => {
  // Check if user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const userDoc = await db.collection('users').doc(request.auth.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const snapshot = await db
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: messages };
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new HttpsError('internal', 'Error retrieving messages');
  }
});

// Get a single message
export const getMessage = onCall(
  {
    cors: [
      {
        origin: true,
        methods: ['POST'],
      },
    ],
    region: 'us-central1',
  },
  async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId } = request.data;
  if (!messageId) {
    throw new HttpsError('invalid-argument', 'Message ID is required');
  }

  try {
    const messageRef = db.collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      throw new HttpsError('not-found', 'Message not found');
    }

    // Check if user has permission to view this message
    const messageData = messageDoc.data() as Message;
    if (messageData.to !== request.auth.uid && request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Not authorized to view this message');
    }

    // Mark as read if it's the recipient
    if (messageData.to === request.auth.uid && !messageData.read) {
      await messageRef.update({
        read: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return { 
      success: true, 
      data: {
        id: messageDoc.id,
        ...messageData
      } 
    };
  } catch (error) {
    console.error('Error getting message:', error);
    throw new HttpsError('internal', 'Error retrieving message');
  }
});

// Send a new message
export const sendMessage = onCall(
  {
    cors: [
      {
        origin: true,
        methods: ['POST'],
      },
    ],
    region: 'us-central1',
  },
  async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, subject, body, hasAttachment = false, labels = [] } = request.data;

  if (!to || !subject || !body) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    const messageData: Omit<Message, 'id'> = {
      from: request.auth.uid,
      to,
      subject,
      body,
      read: false,
      hasAttachment,
      labels,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('messages').add(messageData);
    
    return { 
      success: true, 
      messageId: docRef.id 
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw new HttpsError('internal', 'Error sending message');
  }
});

// Update message (mark as read, add/remove labels, etc.)
export const updateMessage = onCall(
  {
    cors: [
      {
        origin: true,
        methods: ['POST'],
      },
    ],
    region: 'us-central1',
  },
  async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId, updates } = request.data;
  
  if (!messageId || !updates) {
    throw new HttpsError('invalid-argument', 'Message ID and updates are required');
  }

  try {
    const messageRef = db.collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      throw new HttpsError('not-found', 'Message not found');
    }

    const messageData = messageDoc.data() as Message;
    
    // Check if user has permission to update this message
    if (messageData.to !== request.auth.uid && request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Not authorized to update this message');
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['read', 'labels', 'hasAttachment'];
    const validUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as Record<string, any>);

    // Add updatedAt timestamp
    validUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await messageRef.update(validUpdates);

    return { 
      success: true, 
      message: 'Message updated successfully' 
    };
  } catch (error) {
    console.error('Error updating message:', error);
    throw new HttpsError('internal', 'Error updating message');
  }
});

// Delete a message
export const deleteMessage = onCall(
  {
    cors: [
      {
        origin: true,
        methods: ['POST'],
      },
    ],
    region: 'us-central1',
  },
  async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { messageId } = request.data;
  
  if (!messageId) {
    throw new HttpsError('invalid-argument', 'Message ID is required');
  }

  try {
    const messageRef = db.collection('messages').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      throw new HttpsError('not-found', 'Message not found');
    }

    const messageData = messageDoc.data() as Message;
    
    // Only allow sender, recipient, or admin to delete
    if (messageData.from !== request.auth.uid && 
        messageData.to !== request.auth.uid && 
        request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Not authorized to delete this message');
    }

    await messageRef.delete();

    return { 
      success: true, 
      message: 'Message deleted successfully' 
    };
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new HttpsError('internal', 'Error deleting message');
  }
});
