# SpendFlow Deployment Guide

Complete guide to deploy SpendFlow to Firebase Hosting.

## Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Note your Project ID

2. **Local Setup**
   - Node.js 18+ installed
   - Firebase CLI: `npm install -g firebase-tools`
   - Git (optional)

3. **Firebase Services Enabled**
   - Authentication (Email/Password + Google)
   - Firestore Database
   - Hosting

## Step 1: Configure Firebase

### 1.1 Update Firebase Config
Edit `src/firebase/config.ts` with your Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 1.2 Alternative: Use Environment Variables
Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 2: Set Up Firebase Authentication

1. Go to Firebase Console → Authentication
2. Enable **Email/Password** provider
3. Enable **Google** provider
4. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `https://your-project-id.web.app`

## Step 3: Create Firestore Collections

1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Create the following collections:
   - `users`
   - `cards`
   - `transactions`
   - `expenses`
   - `income`
   - `categories`

## Step 4: Deploy Firestore Rules

1. Login to Firebase CLI:
```bash
firebase login
```

2. Initialize Firebase in your project (if not done):
```bash
firebase init
```

3. Deploy security rules:
```bash
npm run firebase:deploy:rules
```

## Step 5: Build and Deploy

### 5.1 Install Dependencies
```bash
npm install
```

### 5.2 Build the Application
```bash
npm run build
```

### 5.3 Deploy to Firebase Hosting
```bash
npm run firebase:deploy
```

Or deploy specific components:
```bash
# Deploy only hosting
npm run firebase:deploy:hosting

# Deploy Firestore rules and indexes
npm run firebase:deploy:firestore

# Deploy only Firestore rules
npm run firebase:deploy:rules
```

### 5.4 Verify Deployment
Your app will be available at:
```
https://your-project-id.web.app
```

## Post-Deployment Setup

### 1. Create Admin User
1. Sign up a user account
2. Go to Firebase Console → Firestore
3. Find the user document in `users` collection
4. Add field: `isAdmin: true`

### 2. Initialize Categories
The app will auto-initialize categories on first access. If needed, manually add to `categories` collection:

```javascript
// Expense categories
{ name: "Housing", color: "#3B82F6", icon: "🏠", type: "expense" }
{ name: "Food", color: "#10B981", icon: "🍔", type: "expense" }
{ name: "Transportation", color: "#F59E0B", icon: "🚗", type: "expense" }
// ... more categories

// Income categories
{ name: "Salary", color: "#10B981", icon: "💰", type: "income" }
{ name: "Freelance", color: "#3B82F6", icon: "💼", type: "income" }
// ... more categories
```

### 3. Configure Custom Domain (Optional)
1. Go to Firebase Console → Hosting
2. Click "Connect domain"
3. Follow the domain verification steps

## Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase CLI Issues
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

### Firestore Rules Errors
- Check `firestore.rules` syntax
- Verify collections exist in Firestore
- Check user authentication status

### Deployment Fails
1. Ensure you're logged in: `firebase login`
2. Check project ID in `.firebaserc`
3. Verify all required services are enabled
4. Check build output for errors

## Environment-Specific Configuration

### Development
```bash
npm run dev
```
Uses local Firebase emulator (optional setup)

### Production
```bash
npm run build
npm run firebase:deploy
```

## Monitoring and Maintenance

### View Logs
```bash
firebase functions:log
```

### Monitor Firestore
- Firebase Console → Firestore Database
- Check storage usage and read/write operations

### Monitor Hosting
- Firebase Console → Hosting
- View traffic and performance metrics

## Security Checklist

- [ ] Firestore rules deployed
- [ ] Authentication providers configured
- [ ] Admin user created
- [ ] Environment variables secured
- [ ] CORS configured if needed
- [ ] Rate limiting enabled (if using functions)
- [ ] Data validation in place

## Rollback Procedure

If deployment has issues:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone <source-site> <target-site>
```

## Performance Optimization

1. **Enable Caching**
   - Firebase automatically caches static assets
   - Configure cache headers in `firebase.json`

2. **Optimize Images**
   - Use Next.js Image component
   - Compress images before upload

3. **Monitor Performance**
   - Use Firebase Performance Monitoring
   - Check Core Web Vitals in Firebase Console

## Scaling Considerations

- **Firestore**: Auto-scales, monitor costs
- **Hosting**: CDN automatically scales
- **Authentication**: Firebase handles scaling
- **Storage**: Monitor database size

## Support and Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## Next Steps

1. Test all features in production
2. Set up monitoring and alerts
3. Plan backup strategy
4. Document custom configurations
5. Train team on deployment process
