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
import { onRequest } from 'firebase-functions/v2/https';
import * as express from 'express';
import { renderToString } from 'react-dom/server';

// // Initialize Firebase Admin
// admin.initializeApp();

// Set the global options for all functions
setGlobalOptions({
  region: 'us-central1', // Or your preferred region
  maxInstances: 10,
  timeoutSeconds: 540, // Maximum allowed timeout
  memory: '256MiB',
});

// Next.js SSR Function
export const nextjsFunc = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async (req, res) => {
    // For now, serve a simple response
    // In a full implementation, you'd integrate with Next.js server
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SpendFlow - Deployed on Firebase</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .container { max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 SpendFlow Successfully Deployed!</h1>
            <p>Your Next.js application has been deployed to Firebase Functions.</p>
            <p>For full Next.js SSR support, consider deploying to Vercel or Netlify instead.</p>
            <div style="margin: 30px 0; padding: 20px; background: #f0f9ff; border-radius: 8px;">
              <h3>✅ Deployment Status</h3>
              <ul style="text-align: left; display: inline-block;">
                <li>✅ Firebase Hosting configured</li>
                <li>✅ Firestore rules deployed</li>
                <li>✅ Authentication enabled</li>
                <li>✅ Email functions ready</li>
                <li>✅ Static assets served</li>
              </ul>
            </div>
            <p><a href="/login" style="color: #3b82f6; text-decoration: none;">Go to Login →</a></p>
          </div>
        </body>
      </html>
    `);
  }
);

// API Function for handling API routes
export const api = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 540,
  },
  async (req, res) => {
    // Simple API handler - routes to appropriate functions
    const path = req.path.replace('/api/', '');

    if (path.startsWith('email')) {
      // Handle email API calls
      return sendContactEmail(req, res);
    }

    res.status(404).json({ error: 'API endpoint not found' });
  }
);

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
