// Team-related types and interfaces
export interface Team {
  id?: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  isActive: boolean;
}

export interface TeamMember {
  id?: string;
  teamId: string;
  userId: string;
  email: string;
  displayName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
  invitedBy: string;
  invitationAcceptedAt?: Date;
}

export interface TeamInvitation {
  id?: string;
  teamId: string;
  teamName: string;
  invitedEmail: string;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  token: string; // For secure acceptance
}

export interface SharedExpense {
  id?: string;
  teamId: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paidBy: string; // user ID
  paidByName: string;
  splitBetween: string[]; // user IDs
  splitAmounts?: { [userId: string]: number }; // Optional custom split amounts
  date: Date;
  description?: string;
  receipts?: string[]; // URLs to receipt images
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface ExpenseSplit {
  id?: string;
  expenseId: string;
  userId: string;
  amount: number;
  isPaid: boolean;
  paidAt?: Date;
  notes?: string;
}
