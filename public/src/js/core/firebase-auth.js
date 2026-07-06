/* ============================================
   FIREBASE & AUTHENTICATION MODULE
   Firebase initialization, Google Auth, Cloud Save
   Extracted from game.js

   LAZY-LOADED: the ~280KB Firebase SDK (app/auth/firestore from gstatic) is
   NOT fetched on first paint. Instead window.loadFirebase() dynamic-import()s
   it on first demand (leaderboard open, score submit, Cloud Sync click). This
   removes Firebase from the critical path (Lighthouse TBT/LCP win) while
   keeping every consumer's API identical once loaded.
   ============================================ */

// ============================================
// STATE (populated after loadFirebase() resolves)
// ============================================
let db, auth, appId, userId;
let currentUser = null;
let googleProvider = null;

// Firebase SDK function refs, captured by loadFirebase().
let _fb = null;

// Cached load promise so the SDK is fetched/initialized exactly once.
let _loadPromise = null;
let isLoadingCloudProgress = false;

// ============================================
// LAZY FIREBASE LOADER
// ============================================
async function _doLoadFirebase() {
    // Dynamic import — only hits the network when first called.
    const [appMod, authMod, fsMod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"),
    ]);

    const { initializeApp } = appMod;
    const {
        getAuth, signInAnonymously, signInWithCustomToken, signInWithPopup,
        GoogleAuthProvider, signOut, onAuthStateChanged
    } = authMod;
    const {
        getFirestore, doc, addDoc, collection, query, getDocs, getDoc,
        setDoc, limit, orderBy
    } = fsMod;

    // Stash the fns the rest of this module needs after load.
    _fb = { signInWithPopup, signOut, onAuthStateChanged, doc, addDoc, collection, query, getDocs, getDoc, setDoc, limit, orderBy };

    // __firebase_config and __app_id are injected by the environment.
    const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};

    const app = initializeApp(firebaseConfig);

    // App Check (reCAPTCHA v3): only when a site key is configured — and never
    // fatal: if the provider fails to load, the game still runs (Firestore
    // requests only get rejected once enforcement is turned on server-side).
    if (window.__appcheck_site_key) {
        try {
            const acMod = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js");
            acMod.initializeAppCheck(app, {
                provider: new acMod.ReCaptchaV3Provider(window.__appcheck_site_key),
                isTokenAutoRefreshEnabled: true,
            });
        } catch (e) {
            (window.silentError || console.error)('App Check init failed:', e);
        }
    }

    db = getFirestore(app);
    auth = getAuth(app);
    appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
    googleProvider = new GoogleAuthProvider();

    // Expose Firebase globals for leaderboard.js and other classic scripts.
    window.db = db;
    window.auth = auth;
    window.appId = appId;
    window.collection = collection;
    window.addDoc = addDoc;
    window.getDocs = getDocs;
    window.query = query;
    window.limit = limit;
    window.orderBy = orderBy;

    // Anonymous auth for leaderboard — handled separately from Google Auth.
    onAuthStateChanged(auth, async (user) => {
        if (user && !user.isAnonymous) {
            userId = user.uid;
        } else if (!user) {
            try {
                const token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
                if (token) {
                    await signInWithCustomToken(auth, token);
                } else {
                    await signInAnonymously(auth);
                }
                userId = auth.currentUser?.uid || crypto.randomUUID();
            } catch (error) {
                (window.silentError || console.error)("Firebase Auth Error:", error);
                userId = crypto.randomUUID(); // Fallback
            }
        }
    });

    // Google auth state changes (separate from anonymous auth).
    onAuthStateChanged(auth, async (user) => {
        try {
            if (user && !user.isAnonymous) {
                currentUser = user;
                updateAuthUI(user);
                if (!isLoadingCloudProgress) {
                    isLoadingCloudProgress = true;
                    try {
                        await loadCloudProgress();
                    } finally {
                        isLoadingCloudProgress = false;
                    }
                }
            } else if (!user || user.isAnonymous) {
                currentUser = null;
                updateAuthUI(null);
            }
        } catch (error) {
            (window.silentError || console.error)('Auth state change error:', error);
            isLoadingCloudProgress = false;
        }
    });

    return { db, auth, appId };
}

function loadFirebase() {
    if (_loadPromise) return _loadPromise;
    _loadPromise = _doLoadFirebase().catch((e) => {
        (window.silentError || console.error)("Firebase initialization failed:", e);
        _loadPromise = null; // allow a later retry (e.g. user back online)
        throw e;
    });
    return _loadPromise;
}
window.loadFirebase = loadFirebase;

// ============================================
// GOOGLE AUTH & CLOUD SAVE SYSTEM
// ============================================

// Sign in with Google (lazy-loads Firebase on first use)
async function signInWithGoogle() {
    try {
        await loadFirebase();
        const result = await _fb.signInWithPopup(auth, googleProvider);
        const user = result.user;
        // displayName is attacker-controllable (Google profile) and showAuthFeedback
        // injects the message via innerHTML — escape it (the other sinks already do).
        const safeName = window.escapeHtml ? window.escapeHtml(user.displayName || 'Adventurer') : (user.displayName || 'Adventurer');
        showAuthFeedback('success', `Welcome, ${safeName}!`);
        return user;
    } catch (error) {
        (window.silentError || console.error)('Google sign-in error:', error);

        // Handle specific error cases
        let errorMessage = 'Failed to sign in';

        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled';
            return; // Don't show error for user cancellation
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup blocked by browser. Please allow popups for this site.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            return; // Don't show error
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'This domain is not authorized. Contact support.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Google sign-in is not enabled. Contact support.';
        }

        showAuthFeedback('error', errorMessage);
    }
}

// Sign out
async function signOutUser() {
    try {
        await loadFirebase();
        await _fb.signOut(auth);
        showAuthFeedback('success', 'Signed out successfully');
    } catch (error) {
        (window.silentError || console.error)('Sign out error:', error);
        showAuthFeedback('error', 'Failed to sign out');
    }
}

// Save progress to cloud
async function saveProgressToCloud() {
    if (!currentUser || !db || !_fb) {
        return false;
    }

    try {
        // Read directly from localStorage (more reliable than window functions)
        let permanentStats = {};
        let unlocks = [];
        let achievements = [];

        try {
            const statsRaw = localStorage.getItem('scoundrel_permanent_stats');
            if (statsRaw) permanentStats = JSON.parse(statsRaw);
        } catch (e) {}

        try {
            const unlocksRaw = localStorage.getItem('scoundrel_unlocks');
            if (unlocksRaw) unlocks = JSON.parse(unlocksRaw);
        } catch (e) {}

        try {
            const achievementsRaw = localStorage.getItem('dungeon_scoundrel_achievements');
            if (achievementsRaw) achievements = JSON.parse(achievementsRaw);
        } catch (e) {}

        const progressData = {
            permanentStats: permanentStats,
            unlocks: unlocks,
            achievements: achievements,
            lastSaved: new Date().toISOString(),
            gameVersion: 'v1.3.0'
        };

        const userDocRef = _fb.doc(db, 'users', currentUser.uid);
        await _fb.setDoc(userDocRef, {
            displayName: currentUser.displayName || 'Player',
            email: currentUser.email || '',
            progress: progressData,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return true;
    } catch (error) {
        (window.silentError || console.error)('Cloud save error:', error);
        showAuthFeedback('error', 'Cloud save failed: ' + error.message);
        return false;
    }
}

// Load progress from cloud
async function loadCloudProgress() {
    if (!currentUser || !db || !_fb) {
        return false;
    }

    // Check if we already asked in this session
    const askedKey = `cloudSaveAsked_${currentUser.uid}`;
    if (sessionStorage.getItem(askedKey)) {
        return false;
    }

    try {
        const userDocRef = _fb.doc(db, 'users', currentUser.uid);
        const docSnap = await _fb.getDoc(userDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const progress = data.progress;

            if (progress) {
                // Mark as asked in this session
                sessionStorage.setItem(askedKey, 'true');

                // Ask user if they want to load cloud save
                const shouldLoad = await confirmCloudLoad(progress.lastSaved);
                if (shouldLoad) {
                    // Save to localStorage (use correct keys)
                    if (progress.permanentStats) {
                        localStorage.setItem('scoundrel_permanent_stats', JSON.stringify(progress.permanentStats));
                    }
                    if (progress.unlocks) {
                        localStorage.setItem('scoundrel_unlocks', JSON.stringify(progress.unlocks));
                    }
                    if (progress.achievements) {
                        localStorage.setItem('dungeon_scoundrel_achievements', JSON.stringify(progress.achievements));
                    }

                    // Reload page to apply changes
                    location.reload();
                }
            } else {
                // No cloud save found, mark as asked
                sessionStorage.setItem(askedKey, 'true');
            }
        } else {
            // No document found, mark as asked
            sessionStorage.setItem(askedKey, 'true');
        }
        return true;
    } catch (error) {
        (window.silentError || console.error)('Cloud load error:', error);
        // Mark as asked even on error to prevent loop
        sessionStorage.setItem(askedKey, 'true');
        return false;
    }
}

// Confirm cloud load with user
function confirmCloudLoad(lastSaved) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '10000';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 500px; border: 3px solid #c9a961;">
                <h2 style="color: #c9a961; margin-top: 0;">☁️ Cloud Save Found</h2>
                <p style="color: #ddd; line-height: 1.6;">
                    A saved game was found in the cloud.<br>
                    <strong>Last saved:</strong> ${new Date(lastSaved).toLocaleString()}
                </p>
                <p style="color: #aaa; font-size: 0.9em;">
                    Loading this will replace your current local progress.
                </p>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button class="close-modal-btn" id="btnLoadCloud" style="background: linear-gradient(135deg, #c9a961, #a68948); border: none; color: #102015;">
                        Load Cloud Save
                    </button>
                    <button class="close-modal-btn" id="btnKeepLocal">
                        Keep Local
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btnLoadCloud').onclick = () => {
            overlay.remove();
            resolve(true);
        };
        document.getElementById('btnKeepLocal').onclick = () => {
            overlay.remove();
            resolve(false);
        };
    });
}

// Update UI based on auth state
function updateAuthUI(user) {
    const loginBtn = document.getElementById('btnGoogleLogin');
    if (!loginBtn) return;

    if (user) {
        // User is logged in - show checkmark and name
        loginBtn.innerHTML = `
            <span style="font-size: 1.1em;">☁️</span>
            <span style="color: #6bcf7f;">✔</span>
            ${user.displayName ? window.escapeHtml(user.displayName.split(' ')[0]) : 'Synced'}
        `;
        loginBtn.style.borderColor = '#6bcf7f';
        loginBtn.style.boxShadow = 'inset 0 1px 0 rgba(107, 207, 127, 0.1), 0 2px 8px rgba(107, 207, 127, 0.3)';
        loginBtn.onclick = () => showUserMenu(user);
    } else {
        // User is logged out - show cloud icon only
        loginBtn.innerHTML = `
            <span style="font-size: 1.1em;">☁️</span> Cloud Sync
        `;
        loginBtn.style.borderColor = '#5a4a38';
        loginBtn.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 8px rgba(0, 0, 0, 0.5)';
        loginBtn.onclick = signInWithGoogle;
    }
}

// Show user menu
function showUserMenu(user) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove();">×</button>
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3em; margin-bottom: 10px;">👤</div>
                <h2 style="margin: 0 0 5px 0;">${window.escapeHtml(user.displayName || 'Player')}</h2>
                <p style="color: #aaa; font-size: 0.9em; margin: 0 0 20px 0;">${window.escapeHtml(user.email)}</p>

                <button class="close-modal-btn" id="btnSaveToCloud" style="width: 100%; margin-bottom: 10px; background: linear-gradient(135deg, #c9a961, #a68948); border: none; color: #102015;">
                    ☁️ Save to Cloud
                </button>
                <button class="close-modal-btn" id="btnSignOut" style="width: 100%; background: linear-gradient(135deg, #ff6b6b, #ee5a52); border: none; color: #fff;">
                    🚪 Sign Out
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btnSaveToCloud').onclick = async () => {
        const success = await saveProgressToCloud();
        if (success) {
            showAuthFeedback('success', 'Progress saved to cloud!');
        } else {
            showAuthFeedback('error', 'Failed to save to cloud');
        }
        overlay.remove();
    };

    document.getElementById('btnSignOut').onclick = async () => {
        await signOutUser();
        overlay.remove();
    };
}

// Show auth feedback
function showAuthFeedback(type, message) {
    const isSuccess = type === 'success';
    const color = isSuccess ? '#6bcf7f' : '#ff6b6b';
    const icon = isSuccess ? '✅' : '⚠️'; // Changed X to warning icon
    const duration = isSuccess ? 2000 : 3000; // Error stays longer

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = `
        <div class="modal-content" style="
            max-width: 420px;
            border: 2px solid ${color};
            background: linear-gradient(180deg, #2a2318 0%, #1a1410 100%);
            box-shadow: 0 8px 32px rgba(0,0,0,0.8);
            animation: modalSlideIn 0.3s ease;
        ">
            <div style="text-align: center; padding: 30px 20px;">
                <div style="font-size: 3.5em; margin-bottom: 15px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">${icon}</div>
                <p style="
                    color: ${color};
                    font-size: 1.15em;
                    font-weight: 600;
                    margin: 0 0 10px 0;
                    font-family: 'Cinzel', serif;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">${isSuccess ? 'Success' : 'Notice'}</p>
                <p style="
                    color: #ddd;
                    font-size: 1em;
                    margin: 0;
                    line-height: 1.5;
                ">${message}</p>
                ${!isSuccess ? `
                    <button onclick="this.closest('.modal-overlay').remove()" style="
                        margin-top: 20px;
                        padding: 10px 24px;
                        background: linear-gradient(135deg, #c9a961, #a68948);
                        border: 2px solid #d4af37;
                        color: #1a1410;
                        font-family: 'Cinzel', serif;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        cursor: pointer;
                        border-radius: 4px;
                        font-size: 0.9em;
                    ">OK</button>
                ` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Auto-close for success, manual close for errors
    if (isSuccess) {
        setTimeout(() => overlay.remove(), duration);
    }
}

// ============================================
// GLOBAL EXPOSURE (available immediately, pre-load)
// ============================================
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.saveProgressToCloud = saveProgressToCloud;
window.loadCloudProgress = loadCloudProgress;

// Expose currentUser for auto-save checks (null until Google login).
Object.defineProperty(window, 'currentUser', {
    get: () => currentUser,
    set: (val) => { currentUser = val; }
});

// Expose userId via getter to handle async auth timing (undefined pre-load).
Object.defineProperty(window, 'userId', {
    get: () => userId,
    set: (val) => { userId = val; }
});

// Wire the Cloud Sync button now so a click lazy-loads Firebase on demand.
// (Deferred module → DOM is already parsed, so the button exists.)
const _loginBtn = document.getElementById('btnGoogleLogin');
if (_loginBtn) _loginBtn.onclick = signInWithGoogle;
