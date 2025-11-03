/**
 * Emergency Maintenance Mode Fix
 * Run this in browser console to disable maintenance mode
 */

import { doc, updateDoc } from "firebase/firestore";
import { db } from "./lib/firebase/firebase.js";

async function disableMaintenanceMode() {
  try {
    console.log("🔧 Attempting to disable maintenance mode...");
    
    const settingsRef = doc(db, "settings", "app");
    await updateDoc(settingsRef, { 
      maintenanceMode: false,
      updatedAt: new Date().toISOString(),
      updatedBy: "emergency_fix"
    });
    
    console.log("✅ Maintenance mode disabled successfully!");
    console.log("🔄 Refreshing page...");
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error("❌ Failed to disable maintenance mode:", error);
    console.log("Alternative: Go to Firebase Console > Firestore > settings/app > set maintenanceMode: false");
  }
}

// Auto-run the fix
disableMaintenanceMode();

