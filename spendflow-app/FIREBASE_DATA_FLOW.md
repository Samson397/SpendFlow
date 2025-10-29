# 🔥 Firebase Data Flow - Complete Guide

## 🎩 How Your Data is Saved & Retrieved

---

## ✅ Firebase Collections (Your Database):

### **1. Users Collection** 👤
```
users/
  └─ {userId}/
      ├─ email: string
      ├─ displayName: string
      ├─ isAdmin: boolean
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

**When it's used:**
- ✅ User signs up → Creates user document
- ✅ User logs in → Retrieves user data
- ✅ Profile updates → Updates user document

---

### **2. Cards Collection** 💳
```
cards/
  └─ {cardId}/
      ├─ userId: string (links to user)
      ├─ name: string
      ├─ lastFour: string
      ├─ type: 'credit' | 'debit'
      ├─ balance: number
      ├─ color: string
      ├─ isActive: boolean
      ├─ creditLimit: number (for credit cards)
      ├─ statementDay: number (for credit cards)
      ├─ paymentDueDay: number (for credit cards)
      ├─ paymentDebitCardId: string (for credit cards)
      ├─ autoPayEnabled: boolean (for credit cards)
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

**When it's used:**
- ✅ User adds card → Creates card document
- ✅ User views cards → Retrieves all user's cards
- ✅ User edits card → Updates card document
- ✅ Transaction created → Updates card balance
- ✅ Auto-payment runs → Updates balances

**Code Example:**
```typescript
// Create card
await cardsService.create({
  userId: user.uid,
  name: 'Visa Platinum',
  lastFour: '1234',
  type: 'credit',
  balance: 1500,
  creditLimit: 5000,
  statementDay: 25,
  paymentDueDay: 15
});

// Get user's cards
const cards = await cardsService.getByUserId(user.uid);

// Update card
await cardsService.update(cardId, { balance: 2000 });
```

---

### **3. Transactions Collection** 📊
```
transactions/
  └─ {transactionId}/
      ├─ userId: string
      ├─ cardId: string (links to card)
      ├─ amount: number
      ├─ type: 'income' | 'expense'
      ├─ category: string
      ├─ description: string
      ├─ date: timestamp
      ├─ isRecurring: boolean
      ├─ recurringExpenseId: string (if recurring)
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

**When it's used:**
- ✅ User adds transaction → Creates transaction document
- ✅ User views transactions → Retrieves user's transactions
- ✅ User edits transaction → Updates transaction document
- ✅ Auto-payment runs → Creates payment transactions
- ✅ Recurring expense runs → Creates monthly transactions

**Code Example:**
```typescript
// Create transaction
await transactionsService.create({
  userId: user.uid,
  cardId: selectedCard.id,
  amount: 50.00,
  type: 'expense',
  category: 'Food',
  description: 'Grocery shopping',
  date: new Date()
});

// Get recent transactions
const transactions = await transactionsService.getRecentByUserId(user.uid, 100);

// Get by date range
const monthTransactions = await transactionsService.getByDateRange(
  user.uid,
  startOfMonth,
  endOfMonth
);
```

---

### **4. Recurring Expenses Collection** 🔄
```
recurringExpenses/
  └─ {expenseId}/
      ├─ userId: string
      ├─ name: string
      ├─ amount: number
      ├─ category: string
      ├─ cardId: string
      ├─ frequency: 'monthly'
      ├─ dayOfMonth: number (1-31)
      ├─ isActive: boolean
      ├─ startDate: string
      ├─ endDate: string (optional)
      ├─ lastProcessed: string (ISO date)
      ├─ createdAt: string
      └─ updatedAt: string
```

**When it's used:**
- ✅ User adds recurring expense → Creates expense document
- ✅ Daily cron job → Processes due expenses
- ✅ User views recurring expenses → Retrieves active expenses
- ✅ User edits/cancels → Updates expense document

**Code Example:**
```typescript
// Create recurring expense
await recurringExpensesService.create({
  userId: user.uid,
  name: 'Netflix',
  amount: 15.99,
  category: 'Subscription',
  cardId: creditCard.id,
  frequency: 'monthly',
  dayOfMonth: 1,
  isActive: true,
  startDate: new Date().toISOString()
});

// Get user's recurring expenses
const expenses = await recurringExpensesService.getByUserId(user.uid);

// Process due expenses (runs daily)
await recurringExpensePaymentService.processDueExpenses(user.uid);
```

---

### **5. Credit Card Payments Collection** 💰
```
creditCardPayments/
  └─ {paymentId}/
      ├─ creditCardId: string
      ├─ debitCardId: string
      ├─ amount: number
      ├─ paymentDate: string
      ├─ status: 'pending' | 'completed' | 'failed'
      ├─ error: string (if failed)
      └─ createdAt: string
```

**When it's used:**
- ✅ Auto-payment runs → Creates payment record
- ✅ User views payment history → Retrieves payments
- ✅ Failed payments → Logs error

**Code Example:**
```typescript
// Process credit card payment (runs daily)
await creditCardPaymentService.processDuePayments(user.uid);

// Get payment history
const history = await creditCardPaymentService.getPaymentHistory(cardId);
```

---

## 🔄 Complete Data Flow Examples:

### **Example 1: User Adds a Card**

```
1. User fills form in AddCardModal
   ↓
2. Click "Add Card"
   ↓
3. cardsService.create() called
   ↓
4. Firebase creates document in 'cards' collection
   ↓
5. Document saved with userId, name, balance, etc.
   ↓
6. Page refreshes → cardsService.getByUserId()
   ↓
7. Firebase returns all user's cards
   ↓
8. Cards displayed on page
```

**Firebase Document Created:**
```json
{
  "userId": "abc123",
  "name": "Visa Platinum",
  "lastFour": "1234",
  "type": "credit",
  "balance": 1500,
  "creditLimit": 5000,
  "statementDay": 25,
  "paymentDueDay": 15,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

---

### **Example 2: User Adds Transaction**

```
1. User fills form in AddTransactionModal
   ↓
2. Click "Add Transaction"
   ↓
3. transactionsService.create() called
   ↓
4. Firebase creates document in 'transactions' collection
   ↓
5. cardsService.updateBalance() called
   ↓
6. Firebase updates card balance
   ↓
7. Page refreshes
   ↓
8. Both transaction and updated balance displayed
```

**Firebase Documents:**

Transaction Created:
```json
{
  "userId": "abc123",
  "cardId": "card456",
  "amount": 50.00,
  "type": "expense",
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2025-01-15T14:00:00Z",
  "createdAt": "2025-01-15T14:00:00Z"
}
```

Card Updated:
```json
{
  "balance": 1450.00,  // Was 1500, now 1450
  "updatedAt": "2025-01-15T14:00:00Z"
}
```

---

### **Example 3: Auto-Payment Runs**

```
Daily at Midnight:
1. Cron job triggers
   ↓
2. creditCardPaymentService.processDuePayments()
   ↓
3. Firebase queries cards where paymentDueDay = today
   ↓
4. For each card:
   - Get debit card
   - Check balance
   - Deduct from debit
   - Pay credit card
   - Create transactions
   - Create payment record
   ↓
5. All documents updated in Firebase
   ↓
6. User sees updated balances when they log in
```

**Firebase Updates:**

Debit Card:
```json
{
  "balance": 1500.00,  // Was 3000, paid 1500
  "updatedAt": "2025-02-15T00:00:00Z"
}
```

Credit Card:
```json
{
  "balance": 0.00,  // Was 1500, now paid off
  "updatedAt": "2025-02-15T00:00:00Z"
}
```

Transactions Created (2):
```json
// Debit transaction
{
  "userId": "abc123",
  "cardId": "debit789",
  "amount": 1500,
  "type": "expense",
  "category": "Credit Card Payment",
  "description": "Payment for Visa ••1234"
}

// Credit transaction
{
  "userId": "abc123",
  "cardId": "credit456",
  "amount": 1500,
  "type": "income",
  "category": "Payment",
  "description": "Payment from Chase ••5678"
}
```

Payment Record:
```json
{
  "creditCardId": "credit456",
  "debitCardId": "debit789",
  "amount": 1500,
  "status": "completed",
  "paymentDate": "2025-02-15T00:00:00Z"
}
```

---

## 🔐 Security Rules (Recommended):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Cards - users can only access their own
    match /cards/{cardId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Transactions - users can only access their own
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Recurring expenses - users can only access their own
    match /recurringExpenses/{expenseId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Payment records - users can only read their own
    match /creditCardPayments/{paymentId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 📱 Real-Time Updates (Optional):

You can also use real-time listeners to update the UI automatically:

```typescript
// Subscribe to cards changes
const unsubscribe = cardsService.subscribe(
  (cards) => {
    setCards(cards);
  },
  where('userId', '==', user.uid)
);

// Cleanup on unmount
return () => unsubscribe();
```

---

## 🎯 Summary:

### **When User Logs In:**
1. ✅ Firebase Auth verifies credentials
2. ✅ User ID retrieved
3. ✅ All data queried by userId:
   - Cards: `cardsService.getByUserId(userId)`
   - Transactions: `transactionsService.getRecentByUserId(userId)`
   - Recurring Expenses: `recurringExpensesService.getByUserId(userId)`
4. ✅ Data displayed on dashboard

### **When User Makes Changes:**
1. ✅ Form submitted
2. ✅ Firebase service called (create/update/delete)
3. ✅ Document created/updated in Firebase
4. ✅ Page refreshes data
5. ✅ User sees updated information

### **When Auto-Payments Run:**
1. ✅ Daily cron job triggers
2. ✅ Services process due payments/expenses
3. ✅ Multiple documents updated atomically
4. ✅ User sees changes next time they log in

---

## 💎 Your Data is Safe & Persistent:

- ✅ **All data saved to Firebase Cloud Firestore**
- ✅ **Automatically synced across devices**
- ✅ **Persists even if user closes browser**
- ✅ **Backed up by Google's infrastructure**
- ✅ **Accessible from anywhere**
- ✅ **Real-time updates available**
- ✅ **Secure with authentication**

---

**Your complete financial data is safely stored in Firebase and loads automatically when users log in!** 🔥💎✨
