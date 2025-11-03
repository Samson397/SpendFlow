import * as admin from 'firebase-admin';
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

// Initialize Firebase Admin
admin.initializeApp();

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
  upgradeSubscription
};
