# Admin Setup Instructions

## ⚠️ IMPORTANT: Delete /setup-admin Page After Use

The `/setup-admin` page should be **deleted after initial setup** for security reasons.

---

## Option 1: Use Firebase Console (RECOMMENDED)

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **chat-76d96**
3. Navigate to **Firestore Database**
4. Go to the `users` collection
5. Find your user document (ID: `DVkvsnVe52h6DeiRTA4P2V74Mjs2`)
6. Click on the document
7. Add a new field:
   - **Field name:** `isAdmin`
   - **Type:** boolean
   - **Value:** `true`
8. Click **Update**

✅ You're now an admin!

---

## Option 2: Use Setup Page (Then Delete It)

### Steps:
1. Login to your app
2. Visit: http://localhost:3000/setup-admin
3. Click "Make Admin"
4. **Immediately delete the page:**
   ```bash
   rm -rf /Users/samson/Desktop/SpendFlow/spendflow-app/src/app/setup-admin
   ```

---

## Security Best Practices

### ✅ DO:
- Set admin via Firebase Console
- Delete setup-admin page after use
- Keep admin UIDs in environment variables
- Limit admin access to trusted users only

### ❌ DON'T:
- Leave setup-admin page in production
- Share admin setup URLs
- Hardcode admin credentials in code
- Give admin access to untrusted users

---

## Verifying Admin Access

After setting admin:

1. **Check Sidebar** - You should see "Admin" menu item
2. **Visit /admin** - Should show system statistics
3. **Check Firestore** - Verify `isAdmin: true` exists

---

## Removing Admin Access

To remove admin privileges:

1. Go to Firebase Console → Firestore
2. Find the user document
3. Delete the `isAdmin` field or set it to `false`

---

## Current Admin User

**User ID:** DVkvsnVe52h6DeiRTA4P2V74Mjs2

This user has been designated as the initial admin.
