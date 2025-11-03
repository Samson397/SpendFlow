import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

import { setGlobalOptions } from 'firebase-functions/v2';
import { sendContactEmail } from './email';
import {
  getMessages,
  getMessage,
  sendMessage,
  updateMessage,
  deleteMessage
} from './messages';
import { upgradeSubscription } from './subscription';
import {
  createTeam,
  getUserTeam,
  getTeamMembers,
  inviteTeamMember,
  createSharedExpense,
  getSharedExpenses
} from './team';

// // Initialize Firebase Admin
// admin.initializeApp();

// Set the global options for all functions
setGlobalOptions({
  region: 'us-central1', // Or your preferred region
  maxInstances: 10,
  timeoutSeconds: 540, // Maximum allowed timeout
  memory: '256MiB',
});

// Export the Cloud Functions
export {
  sendContactEmail,
  getMessages,
  getMessage,
  sendMessage,
  updateMessage,
  deleteMessage,
  upgradeSubscription,
  createTeam,
  getUserTeam,
  getTeamMembers,
  inviteTeamMember,
  createSharedExpense,
  getSharedExpenses
};
