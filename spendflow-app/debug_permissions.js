/**
 * Debug User Permissions
 * Run this in browser console to check what permissions a user has
 */

async function debugUserPermissions() {
  console.log('🔍 Debugging User Permissions...');
  
  try {
    // Check if Firebase is available
    if (!window.firebase) {
      console.error('❌ Firebase not loaded');
      return;
    }
    
    // Get current user
    const auth = window.firebase.auth();
    const user = auth.currentUser;
    
    console.log('👤 Current User:', {
      uid: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified
    });
    
    // Test basic Firestore access
    const db = window.firebase.firestore();
    
    // Test collections that users should access
    const testCollections = [
      'transactions',
      'cards', 
      'expenses',
      'income',
      'categories'
    ];
    
    for (const collectionName of testCollections) {
      try {
        console.log(`📋 Testing ${collectionName} collection...`);
        const collectionRef = db.collection(collectionName);
        
        // Try to get a count (should work for user's own data)
        const query = collectionName === 'categories' 
          ? collectionRef.limit(1) // Categories are readable by all
          : collectionRef.where('userId', '==', user.uid).limit(1); // User's own data
        
        const snapshot = await query.get();
        console.log(`✅ ${collectionName}: Can access (${snapshot.size} documents found)`);
        
      } catch (error) {
        console.error(`❌ ${collectionName}: Permission denied -`, error.message);
      }
    }
    
    // Test admin access
    try {
      console.log('👑 Testing admin access...');
      const adminDoc = await db.collection('settings').doc('app').get();
      if (adminDoc.exists) {
        console.log('✅ Admin access: Can read settings');
      } else {
        console.log('⚠️ Admin access: Settings document not found');
      }
    } catch (error) {
      console.log('❌ Admin access: Permission denied -', error.message);
    }
    
    console.log('🎯 Permission debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Auto-run the debug
debugUserPermissions();

