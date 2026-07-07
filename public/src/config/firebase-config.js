// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Firebase Web API Keys are PUBLIC by design.
// Security comes from Firebase Security Rules, not from hiding the key.
// See: https://firebase.google.com/docs/projects/api-keys

window.__firebase_config = JSON.stringify({
    apiKey: "AIzaSyAXQOgiVFS04xU196ANWLu9wHrDRWfpjHw",
    authDomain: "dungeon-scoundrel.firebaseapp.com",
    projectId: "dungeon-scoundrel",
    storageBucket: "dungeon-scoundrel.firebasestorage.app",
    messagingSenderId: "13386790249",
    appId: "1:13386790249:web:87cc9a44a310b2e86a79f8"
});

window.__app_id = "dungeon_scoundrel_v1";

// Firebase App Check (anti-abuse): paste the reCAPTCHA v3 SITE key here after
// registering the app in Firebase Console -> App Check. Empty = App Check off
// (the game works normally). Enforce in the console ONLY after this ships and
// the App Check metrics show verified traffic.
window.__appcheck_site_key = "6Lf6MkgtAAAAADH3fclbYb1xP-EjUtVxjtcU4BxL"; // reCAPTCHA v3 SITE key (public by design)
