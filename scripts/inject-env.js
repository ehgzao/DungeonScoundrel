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

console.log('🔧 inject-env.js: Starting...');
console.log('   Current directory:', process.cwd());
console.log('   Node version:', process.version);

const configPath = path.join(__dirname, '..', 'public', 'src', 'config', 'firebase-config.js');
console.log('   Target config path:', configPath);

// Get environment variables with fallbacks for local development
const config = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'dungeon-scoundrel.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'dungeon-scoundrel',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'dungeon-scoundrel.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
};

// Log what we found (masking sensitive data)
console.log('   FIREBASE_API_KEY:', config.apiKey ? `${config.apiKey.substring(0, 10)}...` : '❌ NOT SET');
console.log('   FIREBASE_AUTH_DOMAIN:', config.authDomain);
console.log('   FIREBASE_PROJECT_ID:', config.projectId);
console.log('   FIREBASE_STORAGE_BUCKET:', config.storageBucket);
console.log('   FIREBASE_MESSAGING_SENDER_ID:', config.messagingSenderId || '❌ NOT SET');
console.log('   FIREBASE_APP_ID:', config.appId ? `${config.appId.substring(0, 15)}...` : '❌ NOT SET');

// Check if we have the API key
if (!config.apiKey) {
    console.log('');
    console.log('⚠️  FIREBASE_API_KEY not set in environment!');
    console.log('   Make sure you imported the variables in Netlify:');
    console.log('   Site settings > Build & deploy > Environment variables');
    console.log('');
    console.log('   Skipping config generation - using existing file.');
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
