/* ============================================
   FIREBASE & AUTHENTICATION MODULE
   Firebase initialization, Google Auth, Cloud Save
   Extracted from game.js
   ============================================ */

// ============================================
// FIREBASE IMPORTS
// ============================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, collection, query, getDocs, getDoc, setDoc, limit, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ============================================
// FIREBASE INITIALIZATION
// ============================================
let db, auth, appId, userId;

try {
            // __firebase_config and __app_id are injected by the environment
            // CRITICAL: Must use window.* in ES6 modules to access global variables
            const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};

            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
            
            // setLogLevel('debug'); // Useful for debugging
            
            // Anonymous auth for leaderboard - handled separately from Google Auth
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
                        console.error("Firebase Auth Error:", error);
                        userId = crypto.randomUUID(); // Fallback
                    }
                }
            });
        } catch (e) {
            console.error("Firebase initialization failed:", e);
            // The game continues offline if Firebase fails
        }
        
        // ============================================
        // GOOGLE AUTH & CLOUD SAVE SYSTEM
        // ============================================
        let currentUser = null;
        const googleProvider = new GoogleAuthProvider();
        
        // Listen to Google auth state changes (separate from anonymous auth)
        let isLoadingCloudProgress = false;
        try {
            onAuthStateChanged(auth, async (user) => {
                try {
                    // Only handle non-anonymous users for cloud sync
                    if (user && !user.isAnonymous) {
                        currentUser = user;
                        updateAuthUI(user);
                        
                        // Prevent race condition
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
                    console.error('Auth state change error:', error);
                    isLoadingCloudProgress = false;
                }
            });
        } catch (error) {
            console.error('Failed to set up auth listener:', error);
        }
        
        // Sign in with Google
        async function signInWithGoogle() {
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                showAuthFeedback('success', `Welcome, ${user.displayName}!`);
                return user;
            } catch (error) {
                console.error('Google sign-in error:', error);
                
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
                await signOut(auth);
                showAuthFeedback('success', 'Signed out successfully');
            } catch (error) {
                console.error('Sign out error:', error);
                showAuthFeedback('error', 'Failed to sign out');
            }
        }
        
        // Save progress to cloud
        async function saveProgressToCloud() {
            if (!currentUser || !db) {
                return false;
            }
            
            try {
                // Get data safely with fallbacks
                const permanentStats = loadPermanentStats() || {};
                const unlocks = loadUnlocks() || [];
                const achievements = loadAchievements() || [];
                
                const progressData = {
                    permanentStats: permanentStats,
                    unlocks: unlocks,
                    achievements: achievements,
                    lastSaved: new Date().toISOString(),
                    gameVersion: 'v1.3.0'
                };
                
                const userDocRef = doc(db, 'users', currentUser.uid);
                await setDoc(userDocRef, {
                    displayName: currentUser.displayName || 'Player',
                    email: currentUser.email || '',
                    progress: progressData,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                
                return true;
            } catch (error) {
                console.error('Cloud save error:', error);
                showAuthFeedback('error', 'Cloud save failed: ' + error.message);
                return false;
            }
        }
        
        // Load progress from cloud
        async function loadCloudProgress() {
            if (!currentUser || !db) {
                return false;
            }
            
            // Check if we already asked in this session
            const askedKey = `cloudSaveAsked_${currentUser.uid}`;
            if (sessionStorage.getItem(askedKey)) {
                return false;
            }
            
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userDocRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const progress = data.progress;
                    
                    if (progress) {
                        // Mark as asked in this session
                        sessionStorage.setItem(askedKey, 'true');
                        
                        // Ask user if they want to load cloud save
                        const shouldLoad = await confirmCloudLoad(progress.lastSaved);
                        if (shouldLoad) {
                            // Save to localStorage
                            if (progress.permanentStats) {
                                localStorage.setItem('permanentStats', JSON.stringify(progress.permanentStats));
                            }
                            if (progress.unlocks) {
                                localStorage.setItem('unlockedCards', JSON.stringify(progress.unlocks));
                            }
                            if (progress.achievements) {
                                localStorage.setItem('achievements', JSON.stringify(progress.achievements));
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
                console.error('Cloud load error:', error);
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
                    <div class="modal-content" style="max-width: 500px; border: 3px solid #4ecdc4;">
                        <h2 style="color: #4ecdc4; margin-top: 0;">â˜ï¸ Cloud Save Found</h2>
                        <p style="color: #ddd; line-height: 1.6;">
                            A saved game was found in the cloud.<br>
                            <strong>Last saved:</strong> ${new Date(lastSaved).toLocaleString()}
                        </p>
                        <p style="color: #aaa; font-size: 0.9em;">
                            Loading this will replace your current local progress.
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                            <button class="close-modal-btn" id="btnLoadCloud" style="background: linear-gradient(135deg, #4ecdc4, #2fb3b1); border: none; color: #102015;">
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
                    <span style="font-size: 1.1em;">â˜ï¸</span> 
                    <span style="color: #6bcf7f;">âœ“</span> 
                    ${user.displayName ? user.displayName.split(' ')[0] : 'Synced'}
                `;
                loginBtn.style.borderColor = '#6bcf7f';
                loginBtn.style.boxShadow = 'inset 0 1px 0 rgba(107, 207, 127, 0.1), 0 2px 8px rgba(107, 207, 127, 0.3)';
                loginBtn.onclick = () => showUserMenu(user);
            } else {
                // User is logged out - show cloud icon only
                loginBtn.innerHTML = `
                    <span style="font-size: 1.1em;">â˜ï¸</span> Cloud Sync
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
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove();">âœ•</button>
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 3em; margin-bottom: 10px;">ðŸ‘¤</div>
                        <h2 style="margin: 0 0 5px 0;">${user.displayName || 'Player'}</h2>
                        <p style="color: #aaa; font-size: 0.9em; margin: 0 0 20px 0;">${user.email}</p>
                        
                        <button class="close-modal-btn" id="btnSaveToCloud" style="width: 100%; margin-bottom: 10px; background: linear-gradient(135deg, #4ecdc4, #2fb3b1); border: none; color: #102015;">
                            â˜ï¸ Save to Cloud
                        </button>
                        <button class="close-modal-btn" id="btnSignOut" style="width: 100%; background: linear-gradient(135deg, #ff6b6b, #ee5a52); border: none; color: #fff;">
                            ðŸšª Sign Out
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
            const icon = isSuccess ? 'âœ…' : 'âš ï¸'; // Changed X to warning icon
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
        
        // Make functions globally accessible
        window.signInWithGoogle = signInWithGoogle;
        window.signOutUser = signOutUser;
        window.saveProgressToCloud = saveProgressToCloud;
        
        // CRITICAL: Expose Firebase globals for leaderboard.js and other modules
        window.db = db;
        window.appId = appId;
        window.userId = userId;
        window.auth = auth;
        
        // CRITICAL: Expose Firestore functions for leaderboard.js (non-module script)
        window.collection = collection;
        window.addDoc = addDoc;
        window.getDocs = getDocs;
        window.query = query;
        window.limit = limit;
        window.doc = doc;
        window.getDoc = getDoc;
        window.setDoc = setDoc;