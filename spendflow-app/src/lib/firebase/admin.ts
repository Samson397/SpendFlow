// import { initializeApp, getApps, cert } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth';

// const firebaseAdminConfig = {
//   credential: cert({
//     projectId: process.env.FIREBASE_PROJECT_ID,
//     clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//     privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//   }),
// };

// // Initialize Firebase Admin only once
// const adminApp = getApps().length === 0
//   ? initializeApp(firebaseAdminConfig)
//   : getApps()[0];

// export const adminAuth = getAuth(adminApp);

export async function verifyIdToken(token: string) {
  // TODO: Implement proper token verification
  // For now, return a mock decoded token
  return {
    uid: 'demo-user',
    email: 'demo@example.com'
  };
}
