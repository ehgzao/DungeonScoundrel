// ============================================
// FIREBASE CONFIGURATION TEMPLATE
// ============================================
// Copy this file to firebase-config.js and fill in your Firebase credentials
// Get them from: Firebase Console > Project Settings > Your Web App

window.__firebase_config = JSON.stringify({
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
});

window.__app_id = "dungeon_scoundrel_v1";

// ============================================
// INSTRUCTIONS:
// ============================================
// 1. Go to: https://console.firebase.google.com/
// 2. Select your project
// 3. Click the gear icon ⚙️ > Project settings
// 4. Scroll to "Your apps" > Click </> (Web)
// 5. Copy the firebaseConfig values
// 6. Replace "YOUR_API_KEY_HERE", etc. with your actual values
// 7. Save as firebase-config.js (without .template)
// 8. Open index.html in browser
