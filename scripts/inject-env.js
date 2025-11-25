#!/usr/bin/env node
/**
 * Inject Environment Variables into Firebase Config
 * 
 * This script runs during Netlify build to inject environment variables
 * into the firebase-config.js file, avoiding hardcoded secrets in the repo.
 * 
 * Required Netlify Environment Variables:
 * - FIREBASE_API_KEY
 * - FIREBASE_AUTH_DOMAIN
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_STORAGE_BUCKET
 * - FIREBASE_MESSAGING_SENDER_ID
 * - FIREBASE_APP_ID
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'public', 'src', 'config', 'firebase-config.js');

// Get environment variables with fallbacks for local development
const config = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'dungeon-scoundrel.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'dungeon-scoundrel',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'dungeon-scoundrel.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
};

// Only proceed if we have the API key (production build)
if (!config.apiKey) {
    console.log('⚠️  FIREBASE_API_KEY not set. Using existing config or template.');
    console.log('   For local development, use firebase-config.local.js');
    process.exit(0);
}

const configContent = `// ============================================
// FIREBASE CONFIGURATION (Auto-generated)
// ============================================
// This file is generated during build from environment variables.
// DO NOT commit actual keys - use Netlify environment variables.

window.__firebase_config = JSON.stringify({
    apiKey: "${config.apiKey}",
    authDomain: "${config.authDomain}",
    projectId: "${config.projectId}",
    storageBucket: "${config.storageBucket}",
    messagingSenderId: "${config.messagingSenderId}",
    appId: "${config.appId}"
});

window.__app_id = "dungeon_scoundrel_v1";
`;

try {
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log('✅ Firebase config generated successfully from environment variables');
} catch (error) {
    console.error('❌ Error writing firebase config:', error.message);
    process.exit(1);
}
