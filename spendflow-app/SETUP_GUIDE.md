# SpendFlow Setup Guide

## ✅ Completed Steps

1. ✅ Cloned repository from GitHub
2. ✅ Removed Stripe integration and subscription features
3. ✅ Removed ads-related files
4. ✅ Updated dependencies
5. ✅ Installed all packages
6. ✅ Pushed changes to GitHub

## 🚀 Next Steps to Get Started

### 1. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Copy the `firebaseConfig` values

### 2. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NEXT_PUBLIC_ADMIN_EMAIL=your_email@example.com
   ```

### 3. Deploy Firestore Rules

```bash
npm run firebase:login
npm run firebase:deploy:rules
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Initial Database Setup (Optional)

If you need to seed the database:

1. Set `NEXT_PUBLIC_SETUP_MODE=true` in `.env.local`
2. Restart the dev server
3. Navigate to `http://localhost:3000/setup`
4. Follow the seeding instructions
5. Set `NEXT_PUBLIC_SETUP_MODE=false` after setup

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🔒 Firebase Security Rules

Make sure to deploy your Firestore security rules:

```bash
npm run firebase:deploy:firestore
```

## 📱 Features Available

- ✅ Expense tracking
- ✅ Income management
- ✅ Multi-currency support
- ✅ Card management
- ✅ Budget planning
- ✅ Advanced analytics
- ✅ Admin dashboard
- ✅ Real-time presence
- ✅ Audit logging
- ❌ Stripe payments (removed)
- ❌ Subscriptions (removed)
- ❌ Ads (removed)

## 🆘 Troubleshooting

### Firebase Connection Issues
- Verify all environment variables are set correctly
- Check Firebase project settings
- Ensure Authentication and Firestore are enabled

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

### Port Already in Use
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill`
- Or use a different port: `npm run dev -- -p 3001`

## 📚 Documentation

Check the following files for more information:
- `README.md` - Full project documentation
- `env.example` - Environment variable reference
- `firestore.rules` - Database security rules

---

**Ready to start building!** 🎉
