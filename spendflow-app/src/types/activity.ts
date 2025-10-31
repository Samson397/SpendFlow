export interface Activity {
  id?: string;
  type: 'user' | 'system' | 'transaction' | 'security';
  action: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export const ActivityTypes = {
  USER_SIGNUP: 'user',
  USER_LOGIN: 'user',
  TRANSACTION_CREATED: 'transaction',
  TRANSACTION_UPDATED: 'transaction',
  SECURITY_EVENT: 'security',
  SYSTEM_EVENT: 'system'
} as const;
