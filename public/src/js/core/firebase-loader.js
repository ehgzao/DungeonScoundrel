// ============================================
// FIREBASE CONDITIONAL LOADER
// Loads Firebase only when needed
// ============================================

const CLOUD_SYNC_FLAG = 'scoundrel_has_cloud_sync';

/**
 * Check if user has previously used cloud sync
 */
function hasUsedCloudSync() {
    return localStorage.getItem(CLOUD_SYNC_FLAG) === 'true';
}

/**
 * Mark that user has used cloud sync
 */
function markCloudSyncUsed() {
    localStorage.setItem(CLOUD_SYNC_FLAG, 'true');
}

/**
 * Load Firebase module dynamically
 * Returns a promise that resolves when Firebase is ready
 */
let firebaseLoadPromise = null;

async function loadFirebase() {
    // Already loaded or loading
    if (firebaseLoadPromise) {
        return firebaseLoadPromise;
    }
    
    // Already initialized
    if (window._firebaseReady) {
        return Promise.resolve(true);
    }
    
    firebaseLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'src/js/core/firebase-auth.js?v=1.4.3';
        
        script.onload = () => {
            // Wait for module to initialize (check every 100ms for up to 30s)
            let attempts = 0;
            const maxAttempts = 300;
            const checkReady = setInterval(() => {
                attempts++;
                if (window._firebaseReady) {
                    clearInterval(checkReady);
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkReady);
                    resolve(false); // Resolve with false instead of rejecting
                }
            }, 100);
        };
        
        script.onerror = () => {
            firebaseLoadPromise = null;
            reject(new Error('Failed to load Firebase'));
        };
        
        document.body.appendChild(script);
    });
    
    return firebaseLoadPromise;
}

/**
 * Initialize Firebase based on user's cloud sync history
 * - If user has used cloud sync before: load immediately
 * - If not: wait until they click Cloud Sync button
 */
function initFirebaseConditional() {
    if (hasUsedCloudSync()) {
        // User has used cloud sync - load Firebase now
        loadFirebase().catch(() => {});
    } else {
        // User hasn't used cloud sync - defer loading
        setupLazyCloudSyncButton();
    }
}

/**
 * Setup the Cloud Sync button to load Firebase on click
 */
function setupLazyCloudSyncButton() {
    const btn = document.getElementById('btnGoogleLogin');
    if (!btn) return;
    
    // Store original onclick (if any)
    const originalOnClick = btn.onclick;
    
    btn.onclick = async (e) => {
        e.preventDefault();
        
        // Show loading state
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span style="font-size: 1.1em;">⏳</span> Loading...';
        btn.disabled = true;
        
        try {
            // Load Firebase
            await loadFirebase();
            
            // Mark as used
            markCloudSyncUsed();
            
            // Restore button and trigger sign in
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            
            // Now Firebase is loaded, trigger the actual sign in
            if (typeof window.signInWithGoogle === 'function') {
                window.signInWithGoogle();
            }
        } catch (err) {
            btn.innerHTML = '<span style="font-size: 1.1em;">❌</span> Error';
            btn.disabled = false;
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }
    };
}

// Expose functions globally
window.hasUsedCloudSync = hasUsedCloudSync;
window.markCloudSyncUsed = markCloudSyncUsed;
window.loadFirebase = loadFirebase;
window.initFirebaseConditional = initFirebaseConditional;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebaseConditional);
} else {
    initFirebaseConditional();
}
