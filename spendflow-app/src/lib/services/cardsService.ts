import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  increment
} from 'firebase/firestore';
import { Card, LimitIncreaseRequest } from '@/types';
import { accessControlService } from './accessControlService';

export const cardsService = {
  // Get a single card by ID
  async getCard(cardId: string): Promise<Card | null> {
    const docRef = doc(db, 'cards', cardId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Card;
  },
  
  // Get all cards for a user
  async getUserCards(userId: string): Promise<Card[]> {
    const q = query(
      collection(db, 'cards'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Card));
  },
  
  // Create a new card
  async createCard(cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    // Check subscription limits before creating card
    const canAddCard = await accessControlService.canAddCard(cardData.userId);

    if (!canAddCard.allowed) {
      throw new Error(canAddCard.reason || 'Card limit exceeded. Please upgrade your plan.');
    }

    const cardRef = doc(collection(db, 'cards'));
    const now = new Date();
    const newCard: Card = {
      ...cardData,
      id: cardRef.id,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(cardRef, newCard);
    return newCard;
  },
  
  // Update a card
  async updateCard(
    cardId: string, 
    updates: Partial<Omit<Card, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, {
      ...updates,
      updatedAt: new Date(),
    });
  },
  
  // Delete a card
  async deleteCard(cardId: string): Promise<void> {
    const cardRef = doc(db, 'cards', cardId);
    await deleteDoc(cardRef);
  },
  
  // Update card balance
  async updateCardBalance(cardId: string, amount: number): Promise<void> {
    const cardRef = doc(db, 'cards', cardId);
    await updateDoc(cardRef, {
      balance: increment(amount),
      updatedAt: new Date(),
    });
  },
  
  // Request credit limit increase
  async requestLimitIncrease(
    cardId: string,
    userId: string,
    currentLimit: number,
    requestedLimit: number,
    reason?: string
  ): Promise<LimitIncreaseRequest> {
    const requestId = `${cardId}_${Date.now()}`;
    const request: LimitIncreaseRequest = {
      id: requestId,
      cardId,
      userId,
      currentLimit,
      requestedLimit,
      status: 'pending',
      requestDate: new Date().toISOString(),
      reason,
    };
    
    await setDoc(doc(db, 'limitIncreaseRequests', requestId), request);
    return request;
  },
  
  // Get limit increase requests for a card
  async getLimitIncreaseRequests(cardId: string): Promise<LimitIncreaseRequest[]> {
    const q = query(
      collection(db, 'limitIncreaseRequests'),
      where('cardId', '==', cardId),
      orderBy('requestDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      requestDate: doc.data().requestDate,
      processedDate: doc.data().processedDate,
    } as LimitIncreaseRequest));
  },
};

export default cardsService;
