// ============================================
        // GLOBAL ERROR HANDLER (Prevent White Screen)
        // ============================================
        window.addEventListener('error', function(e) {
            console.error('Global error caught:', e.error);
            // Show user-friendly error instead of white screen
            if (!document.querySelector('.error-overlay')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-overlay';
                errorDiv.style.cssText = `
                    position: fixed; inset: 0; z-index: 99999;
                    background: linear-gradient(180deg, #1a1410 0%, #0d0a08 100%);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px; font-family: 'Cinzel', serif;
                `;
                errorDiv.innerHTML = `
                    <div style="max-width: 500px; text-align: center; color: #ddd;">
                        <div style="font-size: 4em; margin-bottom: 20px;">⚠️</div>
                        <h2 style="color: #ff6b6b; margin: 0 0 15px 0;">Game Error</h2>
                        <p style="line-height: 1.6; margin-bottom: 20px;">
                            Something went wrong. Please try refreshing the page.
                        </p>
                        <button onclick="location.reload()" style="
                            padding: 12px 32px; font-size: 1.1em;
                            background: linear-gradient(135deg, #c9a961, #a68948);
                            border: 2px solid #d4af37; color: #1a1410;
                            cursor: pointer; font-family: 'Cinzel', serif;
                            text-transform: uppercase; letter-spacing: 0.1em;
                        ">Reload Game</button>
                        <p style="margin-top: 20px; font-size: 0.85em; color: #888;">
                            Error: ${e.message || 'Unknown error'}
                        </p>
                    </div>
                `;
                document.body.appendChild(errorDiv);
            }
            return true; // Prevent default error handling
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
        
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
            const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);
            appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            // setLogLevel('debug'); // Useful for debugging
            
            // Anonymous auth for leaderboard - handled separately from Google Auth
            onAuthStateChanged(auth, async (user) => {
                if (user && !user.isAnonymous) {
                    userId = user.uid;
                    console.log("Firebase Auth: User signed in:", userId);
                } else if (!user) {
                    try {
                        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                        if (token) {
                            await signInWithCustomToken(auth, token);
                        } else {
                            await signInAnonymously(auth);
                        }
                        userId = auth.currentUser?.uid || crypto.randomUUID();
                        console.log("Firebase Auth: New user session:", userId);
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
                        console.log('User logged in:', user.displayName || user.email);
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
                        console.log('User logged out or anonymous');
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
                console.log('Google sign-in successful:', user.displayName);
                showAuthFeedback('success', `Welcome, ${user.displayName}!`);
                return user;
            } catch (error) {
                console.error('Google sign-in error:', error);
                
                // Handle specific error cases
                let errorMessage = 'Failed to sign in';
                
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'Sign in cancelled';
                    console.log('User closed the popup');
                    return; // Don't show error for user cancellation
                } else if (error.code === 'auth/popup-blocked') {
                    errorMessage = 'Popup blocked by browser. Please allow popups for this site.';
                } else if (error.code === 'auth/cancelled-popup-request') {
                    console.log('Popup request cancelled');
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
                console.log('Cloud save skipped: no user or db');
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
                
                console.log('Progress saved to cloud');
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
                console.log('Cloud load skipped: no user or db');
                return false;
            }
            
            // Check if we already asked in this session
            const askedKey = `cloudSaveAsked_${currentUser.uid}`;
            if (sessionStorage.getItem(askedKey)) {
                console.log('Cloud save already checked this session');
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
                        <h2 style="color: #4ecdc4; margin-top: 0;">☁️ Cloud Save Found</h2>
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
                    <span style="font-size: 1.1em;">☁️</span> 
                    <span style="color: #6bcf7f;">✓</span> 
                    ${user.displayName ? user.displayName.split(' ')[0] : 'Synced'}
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
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove();">✕</button>
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 3em; margin-bottom: 10px;">👤</div>
                        <h2 style="margin: 0 0 5px 0;">${user.displayName || 'Player'}</h2>
                        <p style="color: #aaa; font-size: 0.9em; margin: 0 0 20px 0;">${user.email}</p>
                        
                        <button class="close-modal-btn" id="btnSaveToCloud" style="width: 100%; margin-bottom: 10px; background: linear-gradient(135deg, #4ecdc4, #2fb3b1); border: none; color: #102015;">
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
        
        // Make functions globally accessible
        window.signInWithGoogle = signInWithGoogle;
        window.signOutUser = signOutUser;
        window.saveProgressToCloud = saveProgressToCloud;
        
        // ============================================
        // OPTIMIZATION HELPERS
        // ============================================
        
        // Storage Cache - Optimizes localStorage operations with error handling
        class StorageCache {
            constructor() {
                this.cache = {};
                this.storageAvailable = this.checkStorageAvailability();
            }
            
            checkStorageAvailability() {
                try {
                    const test = '__storage_test__';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch(e) {
                    console.warn('LocalStorage not available:', e);
                    return false;
                }
            }
            
            get(key, defaultValue = {}) {
                if (!this.storageAvailable) return defaultValue;
                
                if (this.cache[key] === undefined) {
                    try {
                        const data = localStorage.getItem(key);
                        this.cache[key] = data ? JSON.parse(data) : defaultValue;
                    } catch(e) {
                        console.error(`Error reading ${key}:`, e);
                        this.cache[key] = defaultValue;
                    }
                }
                return this.cache[key];
            }
            
            set(key, value) {
                if (!this.storageAvailable) {
                    console.warn('Storage not available, using cache only');
                    this.cache[key] = value;
                    return false;
                }
                
                this.cache[key] = value;
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch(e) {
                    if (e.name === 'QuotaExceededError') {
                        console.error('Storage quota exceeded');
                        // Try to clear old data
                        this.clearOldData();
                    } else {
                        console.error(`Error saving ${key}:`, e);
                    }
                    return false;
                }
            }
            
            update(key, updater) {
                const current = this.get(key);
                const updated = updater(current);
                this.set(key, updated);
                return updated;
            }
            
            invalidate(key) {
                delete this.cache[key];
            }
            
            clearCache() {
                this.cache = {};
            }
            
            clearOldData() {
                // Clear non-essential data if quota exceeded
                try {
                    const keysToPreserve = ['scoundrel_lifetime_stats', 'scoundrel_unlocks'];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && !keysToPreserve.includes(key)) {
                            localStorage.removeItem(key);
                            delete this.cache[key];
                        }
                    }
                } catch(e) {
                    console.error('Error clearing old data:', e);
                }
            }
        }
        
        const storage = new StorageCache();
        
        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        
        // Debounce function - Prevents excessive function calls
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Haptic Feedback for mobile devices
        function hapticFeedback(type = 'light') {
            if ('vibrate' in navigator) {
                const patterns = {
                    light: 10,
                    medium: 25,
                    heavy: 50,
                    success: [10, 50, 10],
                    error: [50, 25, 50],
                    impact: 30
                };
                navigator.vibrate(patterns[type] || 10);
            }
        }
        
        // Tooltip System (Global scope for inline HTML handlers)
        let activeTooltip = null;
        
        window.showTooltip = function(element, text, position = 'top') {
            hideTooltip(); // Hide any existing tooltip
            
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = text;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.95);
                color: #c9a961;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85em;
                max-width: 250px;
                z-index: 10001;
                pointer-events: none;
                border: 1px solid #5a4a38;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
                font-family: 'Cinzel', serif;
                white-space: normal;
                word-wrap: break-word;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            if (position === 'top') {
                tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
                tooltip.style.top = (rect.top - tooltipRect.height - 10) + 'px';
            } else if (position === 'bottom') {
                tooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + 'px';
                tooltip.style.top = (rect.bottom + 10) + 'px';
            }
            
            activeTooltip = tooltip;
        };
        
        window.hideTooltip = function() {
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }
        };
        
        // Focus Management for modals
        function trapFocus(element) {
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            element.addEventListener('keydown', function(e) {
                if (e.key !== 'Tab') return;
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            });
            
            // Focus first element when modal opens
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 100);
            }
        }
        
        // Loading State Helper
        function setButtonLoading(button, loading, originalText = '') {
            if (loading) {
                button.dataset.originalText = button.innerHTML;
                button.disabled = true;
                button.innerHTML = '<span style="opacity: 0.7;">⏳</span> Loading...';
                button.style.cursor = 'wait';
            } else {
                button.disabled = false;
                button.innerHTML = button.dataset.originalText || originalText;
                button.style.cursor = 'pointer';
            }
        }
        
        // Screen Transition Helper
        function transitionScreen(fromElement, toElement, callback) {
            if (fromElement) {
                fromElement.style.opacity = '1';
                fromElement.style.transition = 'opacity 0.3s ease';
                fromElement.style.opacity = '0';
                
                setTimeout(() => {
                    fromElement.style.display = 'none';
                    if (toElement) {
                        toElement.style.display = 'flex';
                        toElement.style.opacity = '0';
                        setTimeout(() => {
                            toElement.style.transition = 'opacity 0.3s ease';
                            toElement.style.opacity = '1';
                        }, 10);
                    }
                    if (callback) callback();
                }, 300);
            }
        }
        
        // Mobile Orientation Warning
        function checkMobileOrientation() {
            if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
                const orientationWarning = document.getElementById('orientationWarning');
                if (orientationWarning) {
                    orientationWarning.style.display = 'flex';
                }
            } else {
                const orientationWarning = document.getElementById('orientationWarning');
                if (orientationWarning) {
                    orientationWarning.style.display = 'none';
                }
            }
        }
        
        // Add shake animation to element
        function shakeElement(element) {
            element.style.animation = 'shake 0.4s ease';
            setTimeout(() => {
                element.style.animation = '';
            }, 400);
        }
        
        // Add pulse animation to element  
        function pulseElement(element, color = '#6bcf7f') {
            const originalBorder = element.style.border;
            element.style.animation = `pulse 0.6s ease`;
            element.style.border = `2px solid ${color}`;
            setTimeout(() => {
                element.style.animation = '';
                element.style.border = originalBorder;
            }, 600);
        }
        
        // DOM Helpers - Optimizes DOM manipulations
        function createElementFromHTML(html) {
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstChild;
        }
        
        function createElementsFragment(items, createItemHTML, attachHandlers = null) {
            const fragment = document.createDocumentFragment();
            
            items.forEach(item => {
                const html = createItemHTML(item);
                const element = createElementFromHTML(html);
                
                if (attachHandlers) {
                    attachHandlers(element, item);
                }
                
                fragment.appendChild(element);
            });
            
            return fragment;
        }
        
        function updateList(container, items, createItemHTML, attachHandlers = null) {
            const fragment = createElementsFragment(items, createItemHTML, attachHandlers);
            container.innerHTML = '';
            container.appendChild(fragment);
        }
        
        // Modal Manager - Simplified modal management
        const modalManager = {
            open(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.add('active');
            },
            close(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.remove('active');
            },
            toggle(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) modal.classList.toggle('active');
            }
        };
        
        console.log('✅ Optimization helpers loaded!');
        
        // ============================================
        // DOM ELEMENTS (NEW STRUCTURE)
        // ============================================
        
        // Screens
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameWrapper = document.getElementById('gameWrapper');
        
        // Welcome Buttons
        const btnWelcomeStart = document.getElementById('btnWelcomeStart');
        const btnLearnToPlay = document.getElementById('btnLearnToPlay');
        const btnWelcomeLeaderboard = document.getElementById('btnWelcomeLeaderboard');
        // btnWelcomeUnlocks removed - replaced by btnCodex in CODEX system
        
        // Learn to Play Modal Elements
        const learnToPlayModal = document.getElementById('learnToPlayModal');
        const btnStartInteractiveTutorial = document.getElementById('btnStartInteractiveTutorial');
        const btnOpenRulesReference = document.getElementById('btnOpenRulesReference');
        
        // Interactive Tutorial Elements
        const interactiveTutorialModal = document.getElementById('interactiveTutorialModal');
        const tutorialStepTitle = document.getElementById('tutorialStepTitle');
        const tutorialStepContent = document.getElementById('tutorialStepContent');
        const btnTutorialPrev = document.getElementById('btnTutorialPrev');
        const btnTutorialNext = document.getElementById('btnTutorialNext');
        const btnTutorialSkip = document.getElementById('btnTutorialSkip');
        const tutorialCurrentStep = document.getElementById('tutorialCurrentStep');
        const tutorialTotalSteps = document.getElementById('tutorialTotalSteps');
        
        // New Game Modal
        const newGameModal = document.getElementById('newGameModal');
        const playerNameInput = document.getElementById('playerNameInput');
        const difficultySelector = document.getElementById('difficultySelector');
        const btnStartGameModal = document.getElementById('btnStartGameModal');
        const btnCancelStart = document.getElementById('btnCancelStart');

        // Game Bars
        const topBar = document.querySelector('.top-bar');
        const centerArea = document.querySelector('.center-area');
        const bottomBar = document.getElementById('room'); // Bottom bar is the room
        
        // Side Panels
        const relicsPanel = document.getElementById('relicsPanel');
        const relicsList = document.getElementById('relicsList');
        const btnOpenShop = document.getElementById('btnOpenShop');
        const holdAreaContainer = document.getElementById('holdAreaContainer');
        const discardPilePreview = document.getElementById('discardPilePreview');
        const gameTimer = document.getElementById('gameTimer');
        
        // Center Stage
        const messageArea = document.getElementById('messageArea');
        const equippedWeaponEl = document.getElementById('equippedWeapon');
        const btnDrawRoom = document.getElementById('btnDrawRoom');
        const btnAvoidRoom = document.getElementById('btnAvoidRoom');
        const mainScoreValue = document.getElementById('mainScoreValue'); // New Score Element
        
        // Top Bar Stats
        const healthEl = document.getElementById('health');
        const goldEl = document.getElementById('goldAmount');
        // scoreEl removed
        const dungeonCountEl = document.getElementById('dungeonCount');
        const statRoomsEl = document.getElementById('statRooms');
        
        // Achievements
        const achievementsCompact = document.getElementById('achievementsCompact');
        const achievementCounter = document.getElementById('achievementCounter');
        const achievementsModal = document.getElementById('achievementsModal');
        const achievementsList = document.getElementById('achievementsList');
        
        // Top Bar Buttons
        // btnTopSound removed - redundant with music controls
        const btnMusicPrev = document.getElementById('btnMusicPrev');
        const btnMusicToggle = document.getElementById('btnMusicToggle');
        const btnMusicNext = document.getElementById('btnMusicNext');
        // btnTopTutorial removed - only in main menu
        // btnTopLeaderboard removed - only in main menu
        // btnTopCodex removed - redundant with Relics button
        const btnTopGiveUp = document.getElementById('btnTopGiveUp'); // Give Up Button

        // Modals
        const tutorialModal = document.getElementById('tutorialModal');
        const leaderboardModal = document.getElementById('leaderboardModal');
        const shopModal = document.getElementById('shopModal');
        const eventModal = document.getElementById('eventModal');
        const unlocksModal = document.getElementById('unlocksModal');
        const giveUpModal = document.getElementById('giveUpModal'); // Give Up Modal
        
        // Modal Elements
        const shopGoldAmount = document.getElementById('shopGoldAmount');
        const shopItems = document.getElementById('shopItems');
        const eventTitle = document.getElementById('eventTitle');
        const eventText = document.getElementById('eventText');
        const eventChoices = document.getElementById('eventChoices');
        const btnCancelGiveUp = document.getElementById('btnCancelGiveUp'); // Give Up Modal Buttons
        const btnConfirmGiveUp = document.getElementById('btnConfirmGiveUp');
        
        // Close Modals
        document.getElementById('btnCloseTutorial').onclick = () => tutorialModal.classList.remove('active');
        document.getElementById('btnCloseLeaderboard').onclick = () => leaderboardModal.classList.remove('active');
        document.getElementById('btnCloseShop').onclick = () => closeShop(); // Use wrapper
        document.getElementById('btnCloseUnlocks').onclick = () => unlocksModal.classList.remove('active');
        document.getElementById('btnCloseAchievements').onclick = () => achievementsModal.classList.remove('active');
        
        // Open Achievements in CODEX (unified)
        achievementsCompact.onclick = () => {
            openCodex('achievements');
        };
        
        // ============================================
        // INTERACTIVE TUTORIAL SYSTEM
        // ============================================
        let tutorialStep = 0;
        const tutorialSteps = [
            {
                title: "🎴 Welcome to Dungeon Scoundrel!",
                content: `
                    <div style="text-align: center; padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px;">Your Quest Begins!</h3>
                        <p style="font-size: 1.1em; line-height: 1.8; margin-bottom: 20px;">
                            You are a <strong>scoundrel</strong> exploring dark medieval dungeons filled with monsters, treasures, and ancient relics.
                        </p>
                        <div style="background: rgba(0,0,0,0.4); padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="font-size: 1.2em; color: #6bcf7f;"><strong>🎯 Goal:</strong> Clear all 50 cards from the dungeon deck without dying!</p>
                        </div>
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Crect fill='%232c2416' width='200' height='100'/%3E%3Ctext x='100' y='55' text-anchor='middle' fill='%23d4af37' font-size='40' font-family='serif'%3E%3C/text%3E%3C/svg%3E" alt="Game Preview" style="width: 100%; max-width: 300px; margin: 20px auto; border-radius: 8px;">
                    </div>
                `
            },
            {
                title: "🃏 Card Types",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Learn the Cards</h3>
                        <div style="display: grid; gap: 20px;">
                            <div style="background: rgba(0,0,0,0.4); padding: 20px; border-left: 4px solid #ff6b6b; border-radius: 8px;">
                                <h4 style="color: #ff6b6b; margin-bottom: 10px;">♠️ ♣️ MONSTERS (Spades & Clubs)</h4>
                                <p><strong>Click to fight!</strong> Damage = Monster Value - Your Weapon Value</p>
                                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">💡 Tip: Always have a weapon equipped before fighting!</p>
                            </div>
                            <div style="background: rgba(0,0,0,0.4); padding: 20px; border-left: 4px solid #ffd93d; border-radius: 8px;">
                                <h4 style="color: #ffd93d; margin-bottom: 10px;">♦️ WEAPONS (Diamonds)</h4>
                                <p><strong>Click to equip!</strong> Replaces your current weapon</p>
                                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">⚠️ Warning: Equipping breaks your combo!</p>
                            </div>
                            <div style="background: rgba(0,0,0,0.4); padding: 20px; border-left: 4px solid #6bcf7f; border-radius: 8px;">
                                <h4 style="color: #6bcf7f; margin-bottom: 10px;">♥️ POTIONS (Hearts)</h4>
                                <p><strong>Click to heal!</strong> Limit: 1 per room</p>
                                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">💊 Potions DON'T break combo!</p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "📌 Hold System",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Save Cards for Later</h3>
                        <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px; text-align: center;">
                            <p style="font-size: 1.2em; margin-bottom: 20px;"><strong>Right-click</strong> or <strong>tap & hold</strong> cards to save them!</p>
                            <div style="margin: 20px 0; padding: 20px; background: rgba(255, 215, 0, 0.1); border: 2px solid #ffd700; border-radius: 8px;">
                                <p style="color: #ffd700; font-size: 1.1em; margin-bottom: 10px;"><strong>✅ CAN HOLD:</strong></p>
                                <p>Weapons ⚔️ | Potions 💊 | Specials ✨</p>
                            </div>
                            <div style="margin: 20px 0; padding: 20px; background: rgba(255, 107, 107, 0.1); border: 2px solid #ff6b6b; border-radius: 8px;">
                                <p style="color: #ff6b6b; font-size: 1.1em; margin-bottom: 10px;"><strong>❌ CANNOT HOLD:</strong></p>
                                <p>Monsters 👹 (must fight immediately!)</p>
                            </div>
                            <p style="margin-top: 20px; color: #aaa;">💡 Strategy: Hold potions for emergencies or weapons for later!</p>
                        </div>
                    </div>
                `
            },
            {
                title: "🔥 Combo System",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Build Epic Combos!</h3>
                        <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                            <p style="font-size: 1.1em; text-align: center; margin-bottom: 20px;">Kill monsters without taking damage to build combos!</p>
                            <div style="display: grid; gap: 15px; margin: 20px 0;">
                                <div style="padding: 15px; background: rgba(107, 207, 127, 0.1); border-left: 4px solid #6bcf7f; border-radius: 8px;">
                                    <strong style="color: #6bcf7f;">✅ COMBO INCREASES:</strong>
                                    <p style="margin-top: 8px;">Perfect kills (no damage taken)</p>
                                </div>
                                <div style="padding: 15px; background: rgba(255, 107, 107, 0.1); border-left: 4px solid #ff6b6b; border-radius: 8px;">
                                    <strong style="color: #ff6b6b;">❌ COMBO BREAKS:</strong>
                                    <p style="margin-top: 8px;">Taking damage OR equipping a weapon</p>
                                </div>
                            </div>
                            <div style="text-align: center; margin-top: 20px; padding: 20px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
                                <p style="font-size: 0.9em; color: #ffd93d;"><strong>Rewards:</strong></p>
                                <p style="margin-top: 10px;">5x = GREAT! | 7x = AMAZING! | 10x = LEGENDARY!</p>
                                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">Max combo × 10 = bonus points!</p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "👹 Boss Battles",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Face the Bosses!</h3>
                        <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                            <p style="font-size: 1.2em; text-align: center; margin-bottom: 20px; color: #ff6b6b;"><strong>Every 10th room = BOSS ROOM!</strong></p>
                            <div style="margin: 20px 0;">
                                <p style="margin-bottom: 10px;">• Bosses have <strong>15 HP</strong></p>
                                <p style="margin-bottom: 10px;">• Requires multiple hits to defeat</p>
                                <p style="margin-bottom: 10px;">• HP bar shows boss health</p>
                            </div>
                            <div style="margin: 30px 0; padding: 20px; background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; border-radius: 8px;">
                                <h4 style="color: #ff6b6b; margin-bottom: 15px; text-align: center;">⚠️ CRITICAL WARNING!</h4>
                                <p style="text-align: center; font-size: 1.1em;"><strong>Fight boss WITHOUT weapon:</strong></p>
                                <p style="text-align: center; margin-top: 10px;">• Boss attacks once (15 HP damage!)</p>
                                <p style="text-align: center;">• Boss FLEES immediately</p>
                                <p style="text-align: center;">• <strong style="color: #ff6b6b;">NO GOLD REWARD!</strong></p>
                            </div>
                            <p style="text-align: center; color: #ffd93d; font-size: 1.1em; margin-top: 20px;">💡 Always have a weapon before room 10, 20, 30...</p>
                        </div>
                    </div>
                `
            },
            {
                title: "💰 Shop & Economy",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Spend Wisely!</h3>
                        <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                            <p style="text-align: center; font-size: 1.1em; margin-bottom: 20px;">Click 🏺 MERCHANT button to open shop</p>
                            <div style="margin: 20px 0; padding: 20px; background: rgba(78, 205, 196, 0.1); border: 2px solid #4ecdc4; border-radius: 8px;">
                                <h4 style="color: #4ecdc4; margin-bottom: 15px; text-align: center;">💎 Shop Features:</h4>
                                <p>• Buy healing potions</p>
                                <p>• Upgrade weapons</p>
                                <p>• Purchase relics (4 rarities)</p>
                                <p>• Increase max HP</p>
                            </div>
                            <div style="margin: 20px 0; padding: 20px; background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; border-radius: 8px;">
                                <h4 style="color: #ff6b6b; margin-bottom: 15px; text-align: center;">⚠️ Shop Penalties:</h4>
                                <p style="text-align: center;">• Each visit = <strong>-50 score points</strong></p>
                                <p style="text-align: center; margin-top: 10px;">• Prices increase <strong>15%</strong> per purchase (anti-exploit!)</p>
                            </div>
                            <p style="text-align: center; color: #ffd93d; margin-top: 20px;">💡 Use shop strategically to maximize score!</p>
                        </div>
                    </div>
                `
            },
            {
                title: "🏆 Score System",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">How Scoring Works</h3>
                        <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px; font-size: 0.95em;">
                            <div style="margin-bottom: 20px; padding: 15px; background: rgba(107, 207, 127, 0.1); border-radius: 8px;">
                                <h4 style="color: #6bcf7f; margin-bottom: 10px;">✅ BONUSES:</h4>
                                <p>🎯 Win: +1000</p>
                                <p>❤️ Health: HP × 20</p>
                                <p>💰 Gold: Total × 5</p>
                                <p>🔥 Combo: Max × 10</p>
                                <p>⚔️ Monsters: Slain × 2</p>
                                <p style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(107, 207, 127, 0.3);">
                                    ⚡ <strong>Speedrun:</strong> +1000 (&lt;1min) or +500 (1-5min)<br>
                                    🏆 <strong>Perfect Run:</strong> +1000 (no damage!)
                                </p>
                            </div>
                            <div style="margin-bottom: 20px; padding: 15px; background: rgba(255, 107, 107, 0.1); border-radius: 8px;">
                                <h4 style="color: #ff6b6b; margin-bottom: 10px;">❌ PENALTIES:</h4>
                                <p>⏱️ Time: -2 per second</p>
                                <p>🏺 Shop: -50 per visit</p>
                            </div>
                            <div style="text-align: center; padding: 15px; background: rgba(255, 215, 0, 0.1); border-radius: 8px;">
                                <p style="color: #ffd93d;"><strong>Difficulty Multiplier:</strong></p>
                                <p>Easy × 1 | Normal × 1.5 | Hard × 2.5</p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "⌨️ Keyboard Shortcuts",
                content: `
                    <div style="padding: 20px;">
                        <h3 style="color: #ffd700; margin-bottom: 20px; text-align: center;">Master the Keyboard!</h3>
                        <div style="background: rgba(0,0,0,0.4); padding: 25px; border-radius: 8px;">
                            <p style="text-align: center; font-size: 1.1em; margin-bottom: 25px; color: #6bcf7f;">
                                <strong>🖥️ Desktop players can use keyboard shortcuts for faster gameplay!</strong>
                            </p>
                            
                            <div style="display: grid; gap: 12px; margin: 20px 0;">
                                <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>Space</strong> or <strong>D</strong></span>
                                    <span style="color: #ddd;">→ Draw Room</span>
                                </div>
                                
                                <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>A</strong></span>
                                    <span style="color: #ddd;">→ Avoid Room</span>
                                </div>
                                
                                <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>Q</strong></span>
                                    <span style="color: #ddd;">→ Use Class Ability</span>
                                </div>
                                
                                <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>U</strong></span>
                                    <span style="color: #ddd;">→ Undo Last Move</span>
                                </div>
                                
                                <div style="padding: 12px 20px; background: rgba(102, 126, 234, 0.15); border-left: 4px solid #667eea; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>S</strong></span>
                                    <span style="color: #ddd;">→ Open Shop</span>
                                </div>
                                
                                <div style="padding: 12px 20px; background: rgba(107, 207, 127, 0.15); border-left: 4px solid #6bcf7f; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>1, 2, 3, 4, 5</strong></span>
                                    <span style="color: #ddd;">→ Click cards in room</span>
                                </div>
                                
                                <div style="padding: 12px 20px; background: rgba(255, 107, 107, 0.15); border-left: 4px solid #ff6b6b; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #ffd93d;"><strong>ESC</strong></span>
                                    <span style="color: #ddd;">→ Close any modal</span>
                                </div>
                            </div>
                            
                            <div style="margin-top: 25px; padding: 20px; background: rgba(255, 215, 0, 0.1); border: 2px solid #ffd700; border-radius: 8px; text-align: center;">
                                <p style="color: #ffd93d; font-size: 1.1em; margin-bottom: 10px;"><strong>⚡ Pro Tip:</strong></p>
                                <p style="color: #ddd;">Use keyboard shortcuts to play 3x faster!</p>
                                <p style="color: #aaa; font-size: 0.9em; margin-top: 10px;">No need to move your mouse constantly!</p>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: "🎮 Ready to Play!",
                content: `
                    <div style="text-align: center; padding: 40px 20px;">
                        <h3 style="color: #ffd700; font-size: 2em; margin-bottom: 20px;">You're Ready!</h3>
                        <p style="font-size: 1.2em; margin-bottom: 30px;">You now know everything to become a legendary scoundrel!</p>
                        <div style="background: rgba(0,0,0,0.4); padding: 30px; border-radius: 8px; margin: 30px 0;">
                            <p style="font-size: 1.1em; color: #6bcf7f; margin-bottom: 15px;"><strong>Quick Recap:</strong></p>
                            <p style="margin: 10px 0;">⚔️ Fight monsters with weapons</p>
                            <p style="margin: 10px 0;">💊 Use potions wisely</p>
                            <p style="margin: 10px 0;">🔥 Build combos for bonus points</p>
                            <p style="margin: 10px 0;">👹 Always bring weapons to bosses</p>
                            <p style="margin: 10px 0;">💰 Use shop strategically</p>
                            <p style="margin: 10px 0;">⌨️ Use keyboard shortcuts for speed</p>
                        </div>
                        <p style="font-size: 1.3em; color: #ffd93d; margin-top: 30px;"><strong>Close this tutorial and click "⚔️ Start Quest" to begin!</strong></p>
                        <p style="margin-top: 20px; color: #aaa; font-size: 0.9em;">You can always re-read the guide from the main menu.</p>
                    </div>
                `
            }
        ];
        
        function startInteractiveTutorial() {
            tutorialStep = 0;
            updateTutorialStep();
            interactiveTutorialModal.classList.add('active');
        }
        
        function updateTutorialStep() {
            const step = tutorialSteps[tutorialStep];
            tutorialStepTitle.textContent = step.title;
            tutorialStepContent.innerHTML = step.content;
            tutorialCurrentStep.textContent = tutorialStep + 1;
            tutorialTotalSteps.textContent = tutorialSteps.length;
            
            // Update buttons
            btnTutorialPrev.disabled = tutorialStep === 0;
            btnTutorialNext.textContent = tutorialStep === tutorialSteps.length - 1 ? '✅ Finish' : '➡️ Next';
        }
        
        btnTutorialNext.onclick = () => {
            if (tutorialStep < tutorialSteps.length - 1) {
                tutorialStep++;
                updateTutorialStep();
            } else {
                // Finish tutorial
                interactiveTutorialModal.classList.remove('active');
            }
        };
        
        btnTutorialPrev.onclick = () => {
            if (tutorialStep > 0) {
                tutorialStep--;
                updateTutorialStep();
            }
        };
        
        btnTutorialSkip.onclick = () => {
            interactiveTutorialModal.classList.remove('active');
        };

        // ============================================
        // GAME STATE
        // ============================================
        const game = {
            deck: [],
            relics: [],
            heldCard: null,
            discardPile: [],
            lastActionWasAvoid: false,
            gameOver: false,
            gameTimerInterval: null,
            gameStartTime: 0,
            undoAvailable: false,
            lastGameState: null,
            potionsUsed: 0,
            difficulty: 'normal',
            combo: 0,
            score: 0,
            health: 20,
            maxHealth: 20,
            equippedWeapon: null,
            dungeon: [],
            room: [],
            gold: 0,
            totalGoldEarned: 0,
            stats: {},
            settings: {
                soundEnabled: true,
                musicEnabled: true
            },
            dodgeActive: false,
            doubleDamage: false,
            berserkStacks: 0,
            mirrorShield: 0,
            obliterateMode: false
        };

        // Permanent Stats (LocalStorage)
        let permanentStats = {};
        
        // ============================================
        // INITIALIZATION AND SCREEN FLOW LOGIC
        // ============================================

        function showWelcomeScreen() {
            welcomeScreen.style.display = 'flex';
            gameWrapper.classList.remove('active');
            newGameModal.classList.remove('active');
        }

        function showNewGameModal() {
            newGameModal.classList.add('active');
            
            // First-time player: Suggest Easy difficulty
            const hasPlayedBefore = localStorage.getItem('dungeon_scoundrel_played_before');
            
            if (!hasPlayedBefore) {
                // Remove previous suggestions
                const oldSuggestion = document.querySelector('.difficulty-suggestion');
                if (oldSuggestion) oldSuggestion.remove();
                
                // Select Easy by default
                difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                const easyBtn = difficultySelector.querySelector('.difficulty-btn[data-difficulty="easy"]');
                if (easyBtn) {
                    easyBtn.classList.add('selected');
                    
                    // Add pulsing highlight animation
                    easyBtn.style.animation = 'pulse 1.5s ease-in-out 3';
                    easyBtn.style.boxShadow = '0 0 20px rgba(107, 207, 127, 0.8)';
                }
                
                // Add suggestion message
                const suggestionMsg = document.createElement('div');
                suggestionMsg.className = 'difficulty-suggestion';
                suggestionMsg.style.cssText = 'position: relative; z-index: 10000; text-align: center; color: #6bcf7f; font-size: 0.95em; margin-top: 10px; padding: 8px; background: rgba(107, 207, 127, 0.1); border-radius: 8px; border: 1px solid rgba(107, 207, 127, 0.3);';
                suggestionMsg.innerHTML = '<strong>First time?</strong> We recommend starting on <strong>Easy</strong> to learn the mechanics!<br><small style="color: #aaa;">(You can choose any difficulty)</small>';
                
                difficultySelector.parentElement.appendChild(suggestionMsg);
            }
        }
        
        function showGameUI() {
            welcomeScreen.style.display = 'none';
            newGameModal.classList.remove('active');
            gameWrapper.classList.add('active');
        }
        
        // Welcome Screen Hooks
        btnWelcomeStart.onclick = showNewGameModal;
        btnLearnToPlay.onclick = () => learnToPlayModal.classList.add('active');
        btnWelcomeLeaderboard.onclick = showLeaderboard;
        // btnWelcomeUnlocks.onclick removed - now handled by codex.js
        
        // Learn to Play Modal Hooks
        btnStartInteractiveTutorial.onclick = () => {
            learnToPlayModal.classList.remove('active');
            startInteractiveTutorial();
        };
        btnOpenRulesReference.onclick = () => {
            learnToPlayModal.classList.remove('active');
            showTutorial();
        };
        
        // Soundboard will be hooked later after music is created
        
        // New Game Modal Hooks
        const nameError = document.getElementById('nameError');
        
        // Sanitize player name input (XSS prevention)
        function sanitizePlayerName(input) {
            return input
                .trim()
                .replace(/[<>'"&]/g, '') // Remove dangerous chars
                .replace(/\s+/g, ' ')     // Collapse multiple spaces
                .substring(0, 10);         // Max 10 chars
        }
        
        // Clear error on input
        playerNameInput.oninput = () => {
            nameError.style.display = 'none';
            playerNameInput.style.borderColor = '#667eea';
        };
        
        btnStartGameModal.onclick = () => {
            const name = sanitizePlayerName(playerNameInput.value);
            
            if (name.length < 3) {
                nameError.textContent = '❌ Name must have at least 3 characters!';
                nameError.style.display = 'block';
                playerNameInput.style.borderColor = '#ff6b6b';
                playerNameInput.focus();
                return;
            }
            if (name.length > 10) {
                nameError.textContent = '❌ Name must have maximum 10 characters!';
                nameError.style.display = 'block';
                playerNameInput.style.borderColor = '#ff6b6b';
                playerNameInput.focus();
                return;
            }
            
            // Update input with sanitized value
            playerNameInput.value = name;
            
            // Open class selection instead of starting game directly
            showClassSelection();
        };
        btnCancelStart.onclick = () => {
            newGameModal.classList.remove('active');
            nameError.style.display = 'none';
            playerNameInput.style.borderColor = '#667eea';
        };
        
        // ============================================
        // CLASS SELECTION SYSTEM
        // ============================================
        const classSelectionModal = document.getElementById('classSelectionModal');
        const classCards = document.querySelectorAll('.class-card');
        const classDescription = document.getElementById('classDescription');
        const classDescTitle = document.getElementById('classDescTitle');
        const classDescMotivation = document.getElementById('classDescMotivation');
        const classDescMechanics = document.getElementById('classDescMechanics');
        const btnConfirmClass = document.getElementById('btnConfirmClass');
        const btnCancelClass = document.getElementById('btnCancelClass');
        const classSelectionTitle = document.getElementById('classSelectionTitle');
        const classSelectionSubtitle = document.getElementById('classSelectionSubtitle');
        
        let selectedClass = null;
        
        // Class definitions
        const CLASSES = {
            scoundrel: {
                name: 'SCOUNDREL',
                motivation: '"I have no honor, no glory, only survival in the dark."',
                mechanics: '<strong>⚔️ Passive:</strong> None - Pure skill and luck<br><br><strong>✨ Active:</strong> None - Just you and your wits<br><br><em style="color: #8b7355; font-size: 0.9em;">This is the baseline class. Master the basics before seeking power.</em>',
                icon: '🎭',
                unlocked: true,
                unlockRequirement: 'Always available',
                passive: {},
                active: null
            },
            knight: {
                name: 'KNIGHT',
                motivation: '"Honor and steel shall guide my path through the darkness."',
                mechanics: '<strong>🛡️ Passive:</strong> +5 Max HP | Weapons have +1 durability<br><br><strong>⚔️ Active (Shield Bash):</strong> Deal damage equal to your weapon value to the first monster in the room. Cooldown: 3 rooms.',
                icon: '🛡️',
                unlocked: false,
                unlockRequirement: 'Win on Easy difficulty',
                passive: { maxHpBonus: 5, weaponDurabilityBonus: 1 },
                active: {
                    name: 'Shield Bash',
                    description: 'Deal weapon damage to first monster',
                    cooldown: 3,
                    icon: '🛡️'
                }
            },
            rogue: {
                name: 'ROGUE',
                motivation: '"In shadows I thrive, through cunning I survive."',
                mechanics: '<strong>🗡️ Passive:</strong> Can hold 2 cards instead of 1 | Start with 1 extra gold per room<br><br><strong>🔪 Active (Shadow Strike):</strong> Next monster takes double weapon damage and doesn\'t break combo. Cooldown: 4 rooms.',
                icon: '🗡️',
                unlocked: false,
                unlockRequirement: 'Win on Normal difficulty',
                passive: { maxHoldCards: 2, bonusGoldPerRoom: 1 },
                active: {
                    name: 'Shadow Strike',
                    description: 'Next monster: 2x damage, combo safe',
                    cooldown: 4,
                    icon: '🔪'
                }
            },
            dancer: {
                name: 'DANCER',
                motivation: '"Grace in motion, life in every step, death in every turn."',
                mechanics: '<strong>💃 Passive:</strong> Potions heal +3 HP | Can use 2 potions per room | Higher event chance (luck)<br><br><strong>✨ Active (Healing Dance):</strong> Heal 5 HP and gain +2 weapon damage for next 2 monsters. Cooldown: 5 rooms.',
                icon: '💃',
                unlocked: false,
                unlockRequirement: 'Win on Hard difficulty',
                passive: { potionHealBonus: 3, maxPotionsPerRoom: 2, eventChanceBonus: 15 },
                active: {
                    name: 'Healing Dance',
                    description: 'Heal 5 HP + damage buff',
                    cooldown: 5,
                    icon: '✨'
                }
            },
            berserker: {
                name: 'BERSERKER',
                motivation: '"Through pain I find power. Through fury I find victory."',
                mechanics: '<strong>💢 Passive (Bloodlust):</strong> Damage increases as HP decreases<br>• +1 damage at ≤70% HP<br>• +2 damage at ≤50% HP<br>• +3 damage at ≤30% HP<br><br><strong>⚔️ Active (Rage Strike):</strong> Sacrifice 5 HP for triple damage (3x) on next 3 attacks. Breaks combo. Cooldown: 4 rooms.<br><em style="color: #ff6b6b; font-size: 0.9em;">⚠️ Cannot use if HP ≤ 5</em>',
                icon: '💢',
                unlocked: false,
                unlockRequirement: 'Win on Hard + Kill 5 bosses total',
                passive: { bloodlust: true },
                active: {
                    name: 'Rage Strike',
                    description: 'Sacrifice 5 HP: 3x damage for 3 attacks, breaks combo',
                    cooldown: 4,
                    icon: '⚔️'
                }
            },
            priest: {
                name: 'PRIEST',
                motivation: '"The light protects me. The divine guides me. Chaos shall be purified."',
                mechanics: '<strong>🕊️ Passive (Divine Blessing):</strong> 15% chance to negate damage completely | Potions heal +2 HP | Start with +2 Max HP<br><br><strong>📿 Active (Purification):</strong> Permanently remove the strongest monster from current dungeon OR transform a monster into a potion. Cooldown: 6 rooms.<br><em style="color: #ffd700; font-size: 0.9em;">✨ Strategic: Eliminate threats before facing them</em>',
                icon: '📿',
                unlocked: false,
                unlockRequirement: 'Collect 20 relics + 10 events + 5 wins total',
                passive: { divineBlessing: true, potionHealBonus: 2, startMaxHpBonus: 2 },
                active: {
                    name: 'Purification',
                    description: 'Remove strongest monster or convert to potion',
                    cooldown: 6,
                    icon: '📿'
                }
            }
        };
        
        // Function to check class unlocks based on wins
        function checkClassUnlocks() {
            const stats = storage.get('scoundrel_lifetime_stats', {});
            
            // Knight unlocks after Easy win
            if (stats.easyWins >= 1) {
                CLASSES.knight.unlocked = true;
            }
            
            // Rogue unlocks after Normal win
            if (stats.normalWins >= 1) {
                CLASSES.rogue.unlocked = true;
            }
            
            // Dancer unlocks after Hard win
            if (stats.hardWins >= 1) {
                CLASSES.dancer.unlocked = true;
            }
            
            // Berserker unlocks after Hard win + 5 bosses killed
            if (stats.hardWins >= 1 && (stats.bossesKilled || 0) >= 5) {
                CLASSES.berserker.unlocked = true;
            }
            
            // Priest unlocks after 20 relics + 10 events + 5 wins
            const totalRelics = stats.totalRelicsCollected || 0;
            const totalEvents = stats.eventsTriggered || 0;
            const totalWins = stats.gamesWon || 0;
            
            if (totalRelics >= 20 && totalEvents >= 10 && totalWins >= 5) {
                CLASSES.priest.unlocked = true;
            }
        }
        
        function showClassSelection() {
            newGameModal.classList.remove('active');
            classSelectionModal.classList.add('active');
            selectedClass = null;
            btnConfirmClass.disabled = true;
            classDescription.style.display = 'none';
            classSelectionTitle.textContent = 'SELECT YOUR HERO';
            classSelectionSubtitle.textContent = '';
            
            // Check unlocks before showing
            checkClassUnlocks();
            
            // Reset all class cards and apply lock states
            classCards.forEach(card => {
                const className = card.dataset.class;
                const classData = CLASSES[className];
                const isLocked = !classData.unlocked;
                
                card.classList.remove('selected');
                card.style.borderColor = '#5a4a38';
                card.style.transform = 'translateY(0)';
                
                // Apply locked visual state
                if (isLocked) {
                    card.style.opacity = '0.4';
                    card.style.filter = 'grayscale(80%)';
                    card.style.cursor = 'not-allowed';
                    
                    // Add lock icon overlay
                    if (!card.querySelector('.lock-overlay')) {
                        const lockOverlay = document.createElement('div');
                        lockOverlay.className = 'lock-overlay';
                        lockOverlay.style.cssText = `
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            font-size: 3em;
                            z-index: 10;
                            pointer-events: none;
                        `;
                        lockOverlay.textContent = '🔒';
                        card.style.position = 'relative';
                        card.appendChild(lockOverlay);
                    }
                } else {
                    card.style.opacity = '1';
                    card.style.filter = 'none';
                    card.style.cursor = 'pointer';
                    
                    // Remove lock overlay if exists
                    const lockOverlay = card.querySelector('.lock-overlay');
                    if (lockOverlay) {
                        lockOverlay.remove();
                    }
                }
            });
        }
        
        // Class card click handlers
        classCards.forEach(card => {
            card.onclick = () => {
                const className = card.dataset.class;
                const classData = CLASSES[className];
                
                // Check if locked
                if (!classData.unlocked) {
                    // Show lock message
                    classSelectionTitle.textContent = classData.name + ' 🔒';
                    classSelectionSubtitle.textContent = 'LOCKED';
                    classDescTitle.textContent = classData.name + ' (LOCKED)';
                    classDescMotivation.textContent = '';
                    classDescMechanics.innerHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <div style="font-size: 3em; margin-bottom: 15px;">🔒</div>
                            <div style="color: #ff6b6b; font-weight: bold; font-size: 1.2em; margin-bottom: 10px;">
                                CLASS LOCKED
                            </div>
                            <div style="color: #ffd93d; font-size: 1.1em;">
                                ${classData.unlockRequirement}
                            </div>
                        </div>
                    `;
                    classDescription.style.display = 'block';
                    btnConfirmClass.disabled = true;
                    playSound('error');
                    return;
                }
                
                selectedClass = className;
                
                // Update UI
                classCards.forEach(c => {
                    c.classList.remove('selected');
                    if (CLASSES[c.dataset.class].unlocked) {
                        c.style.borderColor = '#5a4a38';
                    }
                });
                card.classList.add('selected');
                card.style.borderColor = '#c9a961';
                card.style.transform = 'translateY(-5px)';
                
                // Show description
                classSelectionTitle.textContent = classData.name;
                classSelectionSubtitle.textContent = 'Your chosen hero';
                classDescTitle.textContent = classData.name;
                classDescMotivation.textContent = classData.motivation;
                classDescMechanics.innerHTML = classData.mechanics;
                classDescription.style.display = 'block';
                
                btnConfirmClass.disabled = false;
                playSound('cardFlip');
            };
        });
        
        btnConfirmClass.onclick = () => {
            if (!selectedClass) return;
            classSelectionModal.classList.remove('active');
            startGameWithClass(selectedClass);
        };
        
        btnCancelClass.onclick = () => {
            classSelectionModal.classList.remove('active');
            newGameModal.classList.add('active');
        };
        
        // Store class in game object
        function startGameWithClass(className) {
            game.playerClass = className;
            game.classData = CLASSES[className];
            game.classAbilityCooldown = 0; // Tracks rooms until ability is ready
            game.classAbilityActive = false; // For buffs like Shadow Strike
            game.classAbilityCounter = 0; // For counting buff duration
            startGame();
        }
        
        // FIXED HOOK: Difficulty Selector
        difficultySelector.addEventListener('click', (e) => {
            const target = e.target.closest('.difficulty-btn');
            if (!target) return;
            
            // Remove 'selected' class from all
            difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add 'selected' class to the clicked one
            target.classList.add('selected');
        });

        // Top Bar Hooks
        // btnTopTutorial removed - only in main menu
        // btnTopLeaderboard removed - only in main menu
        // btnTopUnlocks removed - replaced by CODEX system
        btnOpenShop.onclick = openShop;
        
        // Give Up Hooks (ROBUST VERSION)
        if (btnTopGiveUp && giveUpModal && btnCancelGiveUp && btnConfirmGiveUp) {
            btnTopGiveUp.addEventListener('click', function() {
                console.log('Give Up clicked', {gameOver: game.gameOver, gameStartTime: game.gameStartTime});
                if (game.gameOver || game.gameStartTime === 0) {
                    console.log('Give Up blocked - game not running');
                    showMessage('⚠️ Start a game first!', 'warning');
                    return;
                }
                console.log('Opening Give Up modal');
                giveUpModal.classList.add('active');
            });
            
            btnCancelGiveUp.addEventListener('click', function() {
                console.log('Give Up cancelled');
                giveUpModal.classList.remove('active');
            });
            
            btnConfirmGiveUp.addEventListener('click', function() {
                console.log('Give Up confirmed');
                giveUpModal.classList.remove('active');
                endGame('death', true); // true = gave up
            });
            
            console.log('✅ Give Up system initialized');
        } else {
            console.error('❌ Give Up elements not found:', {
                btnTopGiveUp: !!btnTopGiveUp,
                giveUpModal: !!giveUpModal,
                btnCancelGiveUp: !!btnCancelGiveUp,
                btnConfirmGiveUp: !!btnConfirmGiveUp
            });
        }
        
        // FIXED HOOKS: Action Buttons
        btnDrawRoom.onclick = drawRoom;
        btnAvoidRoom.onclick = avoidRoom;
        
        // Undo Button Hook
        const btnUndo = document.getElementById('btnUndo');
        if (btnUndo) {
            btnUndo.onclick = undoLastMove;
        }
        
        // Class Ability Button Hook
        const btnClassAbility = document.getElementById('btnClassAbility');
        if (btnClassAbility) {
            btnClassAbility.onclick = useClassAbility;
        }
        
        // ============================================
        // KEYBOARD SHORTCUTS (Desktop Optimization)
        // ============================================
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            // Ignore if modal is open (except ESC)
            const modalOpen = document.querySelector('.modal-overlay.active');
            if (modalOpen && e.key !== 'Escape') return;
            
            // ESC - Close modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal-overlay.active');
                if (modal) {
                    modal.classList.remove('active');
                    playSound('cardFlip');
                    return;
                }
            }
            
            // Only in-game shortcuts below
            if (!gameWrapper.classList.contains('active') || game.gameOver) return;
            
            switch(e.key.toLowerCase()) {
                case ' ': // Space - Draw Room
                case 'd':
                    e.preventDefault();
                    if (!btnDrawRoom.disabled) {
                        btnDrawRoom.click();
                    }
                    break;
                    
                case 'a': // A - Avoid Room
                    e.preventDefault();
                    if (!btnAvoidRoom.disabled) {
                        btnAvoidRoom.click();
                    }
                    break;
                    
                case 'q': // Q - Class Ability
                    e.preventDefault();
                    if (btnClassAbility && !btnClassAbility.disabled) {
                        btnClassAbility.click();
                    }
                    break;
                    
                case 'u': // U - Undo
                    e.preventDefault();
                    const btnUndo = document.getElementById('btnUndo');
                    if (btnUndo && !btnUndo.disabled) {
                        btnUndo.click();
                    }
                    break;
                    
                case 's': // S - Shop
                    e.preventDefault();
                    if (btnOpenShop && !btnOpenShop.disabled) {
                        btnOpenShop.click();
                    }
                    break;
                    
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const cardIndex = parseInt(e.key) - 1;
                    const cards = bottomBar.querySelectorAll('.card');
                    if (cards[cardIndex]) {
                        cards[cardIndex].click();
                    }
                    break;
            }
        });
        
        console.log('✅ Keyboard shortcuts loaded! D=Draw | A=Avoid | Q=Ability | 1-5=Cards | U=Undo | S=Shop | ESC=Close');
        
        // ============================================
        // ALL GAME CODE (STARTGAME, HANDLECLICK, ETC)
        // ============================================
        
        // Game State (minimum re-declaration)
        game.stats = {
            monstersSlain: 0,
            totalDamage: 0,
            totalHealing: 0,
            roomsCleared: 0,
            weaponsEquipped: 0,
            potionsUsed: 0,
            maxCombo: 0,
            specialsUsed: 0,
            cardsHeld: 0,
            roomsAvoided: 0,
            gamesWon: 0,
            hardWins: 0,
            minimalistWin: false,
            onePunch: false,
            musicWasOn: false
        };
        
        // Special Cards Types
        const specialCards = [
            { id: 'dodge', name: '🛡️ Dodge', description: 'Avoid next damage', effect: () => { game.dodgeActive = true; showMessage('🛡️ Dodge active!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#4ecdc4', 20); } },
            { id: 'double_damage', name: '⚡ Power', description: 'Weapon 2x stronger', effect: () => { game.doubleDamage = true; showMessage('⚡ Power Strike!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 25); } },
            { id: 'super_heal', name: '💊 Super Potion', description: 'Heal to full HP', effect: () => { const healed = game.maxHealth - game.health; game.health = game.maxHealth; showDamageNumber(healed, 'heal'); showMessage('💊 HP Full!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#6bcf7f', 30); } },
            { id: 'treasure', name: '💰 Treasure', description: '+5 Max HP', effect: () => { game.maxHealth += 5; game.health += 5; showDamageNumber('+5 MAX', 'heal'); showMessage('💰 Max HP increased!', 'success'); createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 35); } },
            
            // 🆕 NOVAS CARTAS ESPECIAIS
            { id: 'berserk_card', name: '🔥 Berserk', description: 'Next 3 attacks +5 damage', effect: () => { 
                // Hourglass: +1 extra berserk turn
                game.berserkStacks = game.relics.some(r => r.id === 'hourglass') ? 4 : 3; 
                showMessage('🔥 BERSERK MODE! Next 3 attacks +5 damage!', 'success'); 
                playSound('special');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 40);
                
                // Track berserk use for achievement
                const saved = localStorage.getItem('scoundrel_lifetime_stats');
                let lifetimeStats = saved ? JSON.parse(saved) : {};
                lifetimeStats.berserkUses = (lifetimeStats.berserkUses || 0) + 1;
                localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            } },
            { id: 'time_warp', name: '⏰ Time Warp', description: 'Draw 2 extra cards this room', effect: () => {
                if (game.dungeon.length >= 2) {
                    const extraCards = game.dungeon.splice(0, 2);
                    game.room.push(...extraCards);
                    showMessage('⏰ Time Warp! +2 cards drawn!', 'success');
                    playSound('cardDraw');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
                    updateUI();
                    
                    // Track time warp use for achievement
                    const saved = localStorage.getItem('scoundrel_lifetime_stats');
                    let lifetimeStats = saved ? JSON.parse(saved) : {};
                    lifetimeStats.timeWarps = (lifetimeStats.timeWarps || 0) + 1;
                    localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
                } else {
                    showMessage('⏰ Time Warp! Not enough cards in deck!', 'warning');
                }
            } },
            { id: 'card_destroy', name: '💥 Obliterate', description: 'Remove a card permanently', effect: () => {
                if (game.room.length > 0) {
                    showMessage('💥 Choose a card to OBLITERATE (left-click)!', 'warning');
                    game.obliterateMode = true;
                    playSound('special');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 35);
                } else {
                    showMessage('💥 No cards to obliterate!', 'warning');
                }
            } },
            { id: 'gamble', name: '🎰 Gamble', description: '50% chance: +15 HP or -10 HP', effect: () => {
                const win = Math.random() < 0.5;
                if (win) {
                    const heal = Math.min(15, game.maxHealth - game.health);
                    game.health = Math.min(game.maxHealth, game.health + 15);
                    showDamageNumber(heal, 'heal');
                    showMessage('🎰 JACKPOT! +15 HP!', 'success');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#6bcf7f', 50);
                } else {
                    game.health -= 10;
                    showDamageNumber(10, 'damage');
                    showMessage('🎰 Bad luck... -10 HP!', 'danger');
                    screenShake();
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 30);
                }
                playSound('special');
                updateUI();
                
                // Track gamble use for achievement
                const saved = localStorage.getItem('scoundrel_lifetime_stats');
                let lifetimeStats = saved ? JSON.parse(saved) : {};
                lifetimeStats.gambleCards = (lifetimeStats.gambleCards || 0) + 1;
                localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            } },
            { id: 'lucky_draw', name: '🎲 Lucky Draw', description: 'Draw 3 cards with favorable odds', effect: () => {
                // BALANCED: Draw exactly 3 cards with controlled probabilities
                // 40% potion, 40% weapon, 20% monster (much better than random!)
                const drawnCards = [];
                const cardsToDraw = Math.min(3, game.dungeon.length);
                
                for (let i = 0; i < cardsToDraw; i++) {
                    if (game.dungeon.length === 0) break;
                    
                    // Find cards by type in dungeon
                    const potions = game.dungeon.filter(c => c.suitName === 'hearts');
                    const weapons = game.dungeon.filter(c => c.suitName === 'diamonds');
                    const monsters = game.dungeon.filter(c => c.suitName === 'clubs' || c.suitName === 'spades');
                    
                    let selectedCard = null;
                    const roll = Math.random();
                    
                    // 40% chance for potion
                    if (roll < 0.40 && potions.length > 0) {
                        selectedCard = potions[Math.floor(Math.random() * potions.length)];
                    }
                    // 40% chance for weapon (cumulative 0.40-0.80)
                    else if (roll < 0.80 && weapons.length > 0) {
                        selectedCard = weapons[Math.floor(Math.random() * weapons.length)];
                    }
                    // 20% chance for monster OR fallback if preferred types unavailable
                    else if (monsters.length > 0) {
                        selectedCard = monsters[Math.floor(Math.random() * monsters.length)];
                    }
                    // Fallback: draw any card if specific type unavailable
                    else {
                        selectedCard = game.dungeon[Math.floor(Math.random() * game.dungeon.length)];
                    }
                    
                    if (selectedCard) {
                        const index = game.dungeon.indexOf(selectedCard);
                        game.dungeon.splice(index, 1);
                        drawnCards.push(selectedCard);
                    }
                }
                
                game.room.push(...drawnCards);
                
                const weaponCount = drawnCards.filter(c => c.suitName === 'diamonds').length;
                const potionCount = drawnCards.filter(c => c.suitName === 'hearts').length;
                
                showMessage(`🎲 Lucky Draw! Drew ${drawnCards.length} cards (${weaponCount}⚔️ ${potionCount}❤️)`, 'success');
                earnGold(5);
                
                playSound('cardDraw');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 25);
                updateUI();
            } }
        ];
        
        // Card suits and values
        const suits = {'♠': 'spades', '♣': 'clubs', '♥': 'hearts', '♦': 'diamonds'};
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];

        // ===== 50 ACHIEVEMENTS SYSTEM =====
        const ACHIEVEMENTS = [
            // 🥉 BRONZE (25) - Fáceis
            { id: 'first_blood', tier: 'bronze', icon: '⚔️', title: 'First Blood', description: 'Defeat your first monster', check: () => getLifetimeStat('monstersSlain') >= 1 },
            { id: 'baby_steps', tier: 'bronze', icon: '👶', title: 'Baby Steps', description: 'Clear your first room', check: () => getLifetimeStat('roomsCleared') >= 1 },
            { id: 'armed', tier: 'bronze', icon: '🗡️', title: 'Armed & Ready', description: 'Equip your first weapon', check: () => getLifetimeStat('weaponsEquipped') >= 1 },
            { id: 'healer', tier: 'bronze', icon: '💊', title: 'Healer', description: 'Use your first potion', check: () => getLifetimeStat('potionsUsed') >= 1 },
            { id: 'gold_digger', tier: 'bronze', icon: '💰', title: 'Gold Digger', description: 'Earn 100 gold (lifetime)', check: () => getLifetimeStat('totalGoldEarned') >= 100 },
            { id: 'shopper', tier: 'bronze', icon: '🛒', title: 'Window Shopper', description: 'Open the shop for the first time', check: () => getLifetimeStat('shopsVisited') >= 1 },
            { id: 'combo_starter', tier: 'bronze', icon: '🔥', title: 'Combo Starter', description: 'Get a 3x combo', check: () => getLifetimeStat('maxCombo') >= 3 },
            { id: 'monster_slayer', tier: 'bronze', icon: '⚔️', title: 'Monster Slayer', description: 'Defeat 10 monsters', check: () => getLifetimeStat('monstersSlain') >= 10 },
            { id: 'room_clearer', tier: 'bronze', icon: '🏰', title: 'Room Clearer', description: 'Clear 5 rooms', check: () => getLifetimeStat('roomsCleared') >= 5 },
            { id: 'warrior', tier: 'bronze', icon: '⚔️', title: 'Warrior', description: 'Equip 5 different weapons', check: () => getLifetimeStat('weaponsEquipped') >= 5 },
            { id: 'healthy', tier: 'bronze', icon: '💚', title: 'Healthy', description: 'Use 5 potions (lifetime)', check: () => getLifetimeStat('potionsUsed') >= 5 },
            { id: 'rich', tier: 'bronze', icon: '💎', title: 'Getting Rich', description: 'Earn 500 gold (lifetime)', check: () => getLifetimeStat('totalGoldEarned') >= 500 },
            { id: 'special_user', tier: 'bronze', icon: '✨', title: 'Special Forces', description: 'Use 3 special cards', check: () => getLifetimeStat('specialsUsed') >= 3 },
            { id: 'survivor', tier: 'bronze', icon: '❤️', title: 'Survivor', description: 'Complete a run with less than 5 HP', check: () => false }, // Checked during game
            { id: 'avoidance', tier: 'bronze', icon: '🚪', title: 'Avoidance', description: 'Avoid 3 dungeons (lifetime)', check: () => getLifetimeStat('roomsAvoided') >= 3 },
            { id: 'collector', tier: 'bronze', icon: '🔮', title: 'Collector', description: 'Have 3 relics in a single run', check: () => false }, // Checked during game
            { id: 'hoarder', tier: 'bronze', icon: '📌', title: 'Card Hoarder', description: 'Use hold mechanic 10 times', check: () => getLifetimeStat('cardsHeld') >= 10 },
            { id: 'easy_win', tier: 'bronze', icon: '🟢', title: 'Easy Victory', description: 'Win a game on Easy difficulty', check: () => getLifetimeStat('easyWins') >= 1 },
            { id: 'first_win', tier: 'bronze', icon: '🏆', title: 'First Victory', description: 'Win your first game', check: () => getLifetimeStat('gamesWon') >= 1 },
            { id: 'adventurer', tier: 'bronze', icon: '🗺️', title: 'Adventurer', description: 'Clear 20 rooms (lifetime)', check: () => getLifetimeStat('roomsCleared') >= 20 },
            { id: 'music_lover', tier: 'bronze', icon: '🎵', title: 'Music Lover', description: 'Win a game with music ON', check: () => false }, // Checked during game
            { id: 'gambler', tier: 'bronze', icon: '🎰', title: 'Gambler', description: 'Use the Gamble card 5 times', check: () => getLifetimeStat('gambleCards') >= 5 },
            { id: 'destroyer', tier: 'bronze', icon: '💥', title: 'Destroyer', description: 'Obliterate 3 cards (lifetime)', check: () => getLifetimeStat('cardsObliterated') >= 3 },
            { id: 'time_traveler', tier: 'bronze', icon: '⏰', title: 'Time Traveler', description: 'Use Time Warp card', check: () => getLifetimeStat('timeWarps') >= 1 },
            { id: 'berserker_ach', tier: 'bronze', icon: '🔥', title: 'Berserker', description: 'Use Berserk mode 3 times', check: () => getLifetimeStat('berserkUses') >= 3 },
            
            // 🥈 SILVER (15) - Médias
            { id: 'veteran', tier: 'silver', icon: '🎖️', title: 'Veteran', description: 'Win 5 games', check: () => getLifetimeStat('gamesWon') >= 5 },
            { id: 'massacre', tier: 'silver', icon: '⚔️', title: 'Massacre', description: 'Defeat 50 monsters', check: () => getLifetimeStat('monstersSlain') >= 50 },
            { id: 'dungeon_master', tier: 'silver', icon: '🏰', title: 'Dungeon Master', description: 'Clear 50 rooms', check: () => getLifetimeStat('roomsCleared') >= 50 },
            { id: 'normal_win', tier: 'silver', icon: '🟡', title: 'Normal Victory', description: 'Win on Normal difficulty', check: () => getLifetimeStat('normalWins') >= 1 },
            { id: 'combo_master', tier: 'silver', icon: '🔥', title: 'Combo Master', description: 'Get a 7x combo', check: () => getLifetimeStat('maxCombo') >= 7 },
            { id: 'wealthy', tier: 'silver', icon: '💰', title: 'Wealthy', description: 'Earn 2000 gold (lifetime)', check: () => getLifetimeStat('totalGoldEarned') >= 2000 },
            { id: 'relic_hunter', tier: 'silver', icon: '🔮', title: 'Relic Hunter', description: 'Have 5 relics in a single run', check: () => false }, // Checked during game
            { id: 'arsenal', tier: 'silver', icon: '⚔️', title: 'Arsenal', description: 'Equip 25 weapons (lifetime)', check: () => getLifetimeStat('weaponsEquipped') >= 25 },
            { id: 'pharmacist', tier: 'silver', icon: '💊', title: 'Pharmacist', description: 'Use 25 potions (lifetime)', check: () => getLifetimeStat('potionsUsed') >= 25 },
            { id: 'special_ops', tier: 'silver', icon: '✨', title: 'Special Ops', description: 'Use 15 special cards', check: () => getLifetimeStat('specialsUsed') >= 15 },
            { id: 'speedrun', tier: 'silver', icon: '⏱️', title: 'Speedrunner', description: 'Win a game in under 1 minute', check: () => false }, // Checked during game
            { id: 'iron_will', tier: 'silver', icon: '💪', title: 'Iron Will', description: 'Win with exactly 1 HP', check: () => false }, // Checked during game
            { id: 'perfect_run', tier: 'silver', icon: '✨', title: 'Perfect Run', description: 'Clear 10 rooms with 10x combo', check: () => false }, // Checked during game
            { id: 'shopaholic', tier: 'silver', icon: '🛍️', title: 'Shopaholic', description: 'Buy 30 items from shop (lifetime)', check: () => getLifetimeStat('itemsBought') >= 30 },
            { id: 'event_master', tier: 'silver', icon: '🎲', title: 'Event Master', description: 'Complete 20 events', check: () => getLifetimeStat('eventsCompleted') >= 20 },
            
            // 🥇 GOLD (9) - Difíceis (5 secretas)
            { id: 'legend', tier: 'gold', icon: '👑', title: 'Legend', description: 'Win 10 games', check: () => getLifetimeStat('gamesWon') >= 10 },
            { id: 'hard_win', tier: 'gold', icon: '🔴', title: 'Hard Victory', description: 'Win on Hard difficulty', check: () => getLifetimeStat('hardWins') >= 1 },
            { id: 'genocide', tier: 'gold', icon: '☠️', title: 'Genocide', description: 'Defeat 200 monsters', check: () => getLifetimeStat('monstersSlain') >= 200 },
            { id: 'conqueror', tier: 'gold', icon: '🏆', title: 'Conqueror', description: 'Clear 100 rooms', check: () => getLifetimeStat('roomsCleared') >= 100 },
            
            // 🔒 SECRET GOLDS (5)
            { id: 'secret_1', tier: 'gold', icon: '🎯', title: 'One Shot Wonder', description: 'Defeat a 10-value monster with a 2-value weapon', check: () => false, secret: true },
            { id: 'secret_2', tier: 'gold', icon: '🍀', title: 'Lucky 7', description: 'Win with exactly 7 HP, 7 cards left, and 777 score', check: () => false, secret: true },
            { id: 'secret_3', tier: 'gold', icon: '🎰', title: 'High Roller', description: 'Win 10 Gamble cards in a row', check: () => false, secret: true },
            { id: 'secret_4', tier: 'gold', icon: '💎', title: 'Minimalist', description: 'Win with only 1 relic', check: () => false, secret: true },
            { id: 'secret_5', tier: 'gold', icon: '🌟', title: 'Untouchable', description: 'Win without taking any damage', check: () => false, secret: true },
            
            // 💎 PLATINUM (1) - Todas as outras
            { id: 'platinum', tier: 'platinum', icon: '💎', title: 'Master Scoundrel', description: 'Unlock ALL other achievements', check: () => {
                const unlockedAchs = JSON.parse(localStorage.getItem('dungeon_scoundrel_achievements') || '[]');
                return unlockedAchs.length >= 49; // All except platinum itself
            }}
        ];

        // ===== ADVANCED SOUND EFFECTS SYSTEM =====
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain for all sound effects
        const sfxMasterGain = audioContext.createGain();
        sfxMasterGain.connect(audioContext.destination);
        sfxMasterGain.gain.value = 0.3;

        const soundEffects = {
            cardDraw: (ctx, time) => {
                for (let i = 0; i < 8; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.value = 200 + Math.random() * 400;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + (i * 0.03);
                    gain.gain.setValueAtTime(0.03, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
                    osc.start(startTime);
                    osc.stop(startTime + 0.05);
                }
            },
            cardFlip: (ctx, time) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, time);
                osc.frequency.exponentialRampToValueAtTime(800, time + 0.1);
                osc.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.15, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                osc.start(time);
                osc.stop(time + 0.15);
            },
            attack: (ctx, time) => {
                const noise = ctx.createBufferSource();
                const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) { data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); }
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 1000;
                const gain = ctx.createGain();
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.2, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
                const clang = ctx.createOscillator();
                const clangGain = ctx.createGain();
                clang.type = 'square';
                clang.frequency.value = 800;
                clang.connect(clangGain);
                clangGain.connect(sfxMasterGain);
                clangGain.gain.setValueAtTime(0.15, time + 0.1);
                clangGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
                noise.start(time);
                clang.start(time + 0.1);
                clang.stop(time + 0.25);
            },
            damage: (ctx, time) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, time);
                osc.frequency.exponentialRampToValueAtTime(50, time + 0.4);
                osc.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.3, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                osc.start(time);
                osc.stop(time + 0.4);
                const crack = ctx.createOscillator();
                const crackGain = ctx.createGain();
                crack.type = 'square';
                crack.frequency.value = 200;
                crack.connect(crackGain);
                crackGain.connect(sfxMasterGain);
                crackGain.gain.setValueAtTime(0.1, time + 0.05);
                crackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                crack.start(time + 0.05);
                crack.stop(time + 0.15);
            },
            heal: (ctx, time) => {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + (i * 0.08);
                    gain.gain.setValueAtTime(0.1, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
                    osc.start(startTime);
                    osc.stop(startTime + 0.3);
                });
            },
            equip: (ctx, time) => {
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc1.type = 'square';
                osc2.type = 'square';
                osc1.frequency.value = 400;
                osc2.frequency.value = 600;
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.15, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
                osc1.start(time);
                osc2.start(time);
                osc1.stop(time + 0.2);
                osc2.stop(time + 0.2);
            },
            hold: (ctx, time) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, time);
                osc.frequency.exponentialRampToValueAtTime(600, time + 0.1);
                osc.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.2, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                osc.start(time);
                osc.stop(time + 0.15);
            },
            special: (ctx, time) => {
                for (let i = 0; i < 6; i++) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = 800 + (i * 200) + (Math.random() * 100);
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + (i * 0.05);
                    gain.gain.setValueAtTime(0.08, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
                    osc.start(startTime);
                    osc.stop(startTime + 0.3);
                }
            },
            combo: (ctx, time) => {
                const chord = [659.25, 783.99, 987.77]; // E5, G5, B5
                chord.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    gain.gain.setValueAtTime(0.12, time);
                    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                    osc.start(time);
                    osc.stop(time + 0.4);
                });
            },
            roomClear: (ctx, time) => {
                const melody = [523.25, 659.25, 783.99]; // C5, E5, G5
                melody.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + (i * 0.12);
                    gain.gain.setValueAtTime(0.15, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
                    osc.start(startTime);
                    osc.stop(startTime + 0.3);
                });
            },
            avoid: (ctx, time) => {
                const noise = ctx.createBufferSource();
                const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) { data[i] = (Math.random() * 2 - 1) * (1 - i / data.length); }
                noise.buffer = buffer;
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, time);
                filter.frequency.exponentialRampToValueAtTime(200, time + 0.4);
                const gain = ctx.createGain();
                noise.connect(filter);
                filter.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.2, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                noise.start(time);
            },
            victory: (ctx, time) => {
                const fanfare = [{freq: 523.25, start: 0}, {freq: 659.25, start: 0.15}, {freq: 783.99, start: 0.3}, {freq: 1046.50, start: 0.45}];
                fanfare.forEach(note => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = note.freq;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + note.start;
                    gain.gain.setValueAtTime(0.2, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
                    osc.start(startTime);
                    osc.stop(startTime + 0.5);
                });
            },
            defeat: (ctx, time) => {
                const descent = [{freq: 493.88, start: 0}, {freq: 440.00, start: 0.2}, {freq: 392.00, start: 0.4}, {freq: 293.66, start: 0.6}];
                descent.forEach(note => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = note.freq;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + note.start;
                    gain.gain.setValueAtTime(0.15, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
                    osc.start(startTime);
                    osc.stop(startTime + 0.6);
                });
            },
            start: (ctx, time) => {
                const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
                notes.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    osc.connect(gain);
                    gain.connect(sfxMasterGain);
                    const startTime = time + (i * 0.1);
                    gain.gain.setValueAtTime(0.12, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
                    osc.start(startTime);
                    osc.stop(startTime + 0.5);
                });
            },
            error: (ctx, time) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = 150;
                osc.connect(gain);
                gain.connect(sfxMasterGain);
                gain.gain.setValueAtTime(0.2, time);
                gain.gain.setValueAtTime(0, time + 0.1);
                gain.gain.setValueAtTime(0.2, time + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
                osc.start(time);
                osc.stop(time + 0.3);
            }
        };

        // Unified playSound function
        function playSound(soundName) {
            if (!game.settings.soundEnabled || !audioContext) return;
            const soundFn = soundEffects[soundName];
            if (!soundFn) {
                console.warn('Sound not found:', soundName);
                return;
            }
            try {
                const time = audioContext.currentTime;
                soundFn(audioContext, time);
            } catch (e) {
                // console.warn("Audio context error", e);
            }
        }
        
        // ============================================
// DARK ATMOSPHERIC MUSIC SYSTEM
// ============================================
// Substitui Epic8BitMusic por atmosfera dark medieval
// Inspirado em Heretic, Zelda, Diablo

class DarkAtmosphericMusic {
    constructor() {
        this.context = audioContext;
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.70; // Volume inicial 70%
        
        this.isPlaying = false;
        this.currentContext = 'menu'; // menu, gameplay, shop, victory, defeat
        this.oscillators = [];
        this.intervals = [];
        this.timeouts = []; // Track timeouts too!
        this.gainNodes = [];
        
        // Create reverb buffer ONCE to save memory
        this.reverbBuffer = this.createReverbBuffer();
        
        this.contextNames = {
            menu: '🏰 Dark Awakening',
            gameplay: '⚔️ Into the Depths',
            shop: '🛍️ Merchant\'s Shadow',
            victory: '👑 Triumph in Darkness',
            defeat: '💀 The Final Darkness'
        };
    }
    
    createReverbBuffer() {
        const reverbTime = 2.0;
        const reverbDecay = 2.0;
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * reverbTime;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, reverbDecay);
            }
        }
        return impulse;
    }
    
    getCurrentTrackName() {
        return this.contextNames[this.currentContext];
    }
    
    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.playContext(this.currentContext);
        this.updateNowPlayingDisplay();
    }
    
    stop() {
        this.isPlaying = false;
        this.stopAll();
        this.updateNowPlayingDisplay();
    }
    
    stopAll() {
        console.log('[MUSIC] Stopping all audio...');
        
        // Clear all oscillators
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch(e) {
                console.warn('[MUSIC] Error stopping oscillator:', e);
            }
        });
        
        // Clear all gain nodes (CRITICAL FIX!)
        this.gainNodes.forEach(gain => {
            try {
                gain.disconnect();
            } catch(e) {
                console.warn('[MUSIC] Error disconnecting gain:', e);
            }
        });
        
        // Clear all intervals
        this.intervals.forEach(id => clearInterval(id));
        
        // Clear all timeouts
        this.timeouts.forEach(id => clearTimeout(id));
        
        // Clear arrays
        this.oscillators = [];
        this.intervals = [];
        this.timeouts = [];
        this.gainNodes = [];
        
        console.log('[MUSIC] All audio stopped.');
    }
    
    // Sistema de troca automática de contexto
    switchContext(newContext) {
        if (this.currentContext === newContext) return;
        console.log(`🎵 Music: ${this.currentContext} → ${newContext}`);
        
        this.currentContext = newContext;
        
        if (this.isPlaying) {
            this.fadeOut(0.5, () => {
                this.stopAll();
                this.playContext(newContext);
                this.fadeIn(0.5);
            });
        }
        
        this.updateNowPlayingDisplay();
    }
    
    fadeOut(duration, callback) {
        this.masterGain.gain.exponentialRampToValueAtTime(
            0.001,
            this.context.currentTime + duration
        );
        const timeoutId = setTimeout(callback, duration * 1000);
        this.timeouts.push(timeoutId);
    }
    
    fadeIn(duration) {
        this.masterGain.gain.setValueAtTime(0.001, this.context.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(
            0.70,
            this.context.currentTime + duration
        );
    }
    
    playContext(context) {
        switch(context) {
            case 'menu': this.playMenuTheme(); break;
            case 'gameplay': this.playGameplayTheme(); break;
            case 'shop': this.playShopTheme(); break;
            case 'victory': this.playVictoryTheme(); break;
            case 'defeat': this.playDefeatTheme(); break;
        }
    }
    
    updateNowPlayingDisplay() {
        const display = document.getElementById('nowPlayingDisplay');
        if (display) {
            display.textContent = this.isPlaying ? 
                this.getCurrentTrackName() : 
                '🎵 Music Paused';
        }
    }
    
    // ============================================
    // TRACK 1: MENU THEME - Dark Awakening
    // ============================================
    playMenuTheme() {
        // Drone grave contínuo (80 Hz)
        this.playDrone(80, 0.20, 'sine');
        this.playDrone(120, 0.15, 'triangle'); // Harmônico
        
        // Pad atmosférico dark
        this.playAtmosphericPad([196, 246.94, 293.66], 0.08); // G3, B3, D4 (menor)
        
        // Bells medievais espaçados (a cada 4 segundos)
        const bellPattern = [523.25, 392, 493.88, 440]; // C5, G4, B4, A4
        let bellIndex = 0;
        const bellTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playBell(bellPattern[bellIndex % bellPattern.length], 0.08, 2.0);
            bellIndex++;
        }, 4000);
        this.intervals.push(bellTimer);
    }
    
    // ============================================
    // TRACK 2: GAMEPLAY THEME - Into the Depths
    // ============================================
    playGameplayTheme() {
        // Drone + Bass pulsante (90 Hz, 2 batidas por segundo)
        this.playDrone(90, 0.18, 'sine');
        
        const bassInterval = 500; // 120 BPM = 500ms
        const bassPattern = [90, 90, 135, 90]; // Tônica, tônica, quinta, tônica
        let bassIndex = 0;
        const bassTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playPercussiveBass(bassPattern[bassIndex % bassPattern.length], 0.22, 0.15);
            bassIndex++;
        }, bassInterval);
        this.intervals.push(bassTimer);
        
        // Melodia menor misteriosa (escala frígia de E)
        const melody = [164.81, 174.61, 196, 220, 246.94, 261.63, 293.66]; // E, F, G, A, B, C, D
        const melPattern = [4, 3, 2, 0, 2, 3, 4, 2]; // Padrão misterioso
        let melIndex = 0;
        const melInterval = 1000;
        const melTimer = setInterval(() => {
            if (!this.isPlaying) return;
            const freq = melody[melPattern[melIndex % melPattern.length]];
            this.playNote(freq * 2, 0.10, 0.8, 'triangle');
            melIndex++;
        }, melInterval);
        this.intervals.push(melTimer);
        
        // Percussão dark sutil
        this.playDarkPercussion(bassInterval * 2);
    }
    
    // ============================================
    // TRACK 3: SHOP THEME - Merchant's Shadow
    // ============================================
    playShopTheme() {
        // Drone mais enérgico
        this.playDrone(110, 0.14, 'sine');
        
        // Bass rítmico (dá movimento)
        const bassPattern = [110, 110, 165, 110]; // Root, root, fifth, root
        let bassIndex = 0;
        const bassInterval = 400; // Mais rápido
        const bassTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playPercussiveBass(bassPattern[bassIndex % bassPattern.length], 0.16, 0.12);
            bassIndex++;
        }, bassInterval);
        this.intervals.push(bassTimer);
        
        // Arpejos medievais com ritmo
        const arpNotes = [261.63, 329.63, 392, 493.88]; // C4, E4, G4, B4
        let arpIndex = 0;
        const arpInterval = 400; // Mais rápido (sincronizado com bass)
        const arpTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playNote(arpNotes[arpIndex % arpNotes.length] * 2, 0.10, 0.35, 'triangle');
            arpIndex++;
        }, arpInterval);
        this.intervals.push(arpTimer);
        
        // Bells com mais presença e ritmo
        const bellPattern = [523.25, 659.25, 783.99, 659.25]; // C5, E5, G5, E5
        let bellIndex = 0;
        const bellTimer = setInterval(() => {
            if (!this.isPlaying) return;
            this.playBell(bellPattern[bellIndex % bellPattern.length], 0.12, 1.2);
            bellIndex++;
        }, 1600); // Mais frequente
        this.intervals.push(bellTimer);
        
        // REMOVED: Percussão interval removido - causava chiado após vitória
        // A música dark já tem atmosfera suficiente sem percussão contínua
    }
    
    // ============================================
    // TRACK 4: VICTORY THEME - Triumph in Darkness (REBUILT)
    // ============================================
    playVictoryTheme() {
        // REDESIGNED FROM SCRATCH: All notes have explicit duration, NO continuous drones!
        
        // Fanfarra épica ascendente (0-3s)
        const fanfare = [
            {freq: 261.63, time: 0, duration: 0.3},      // C4
            {freq: 329.63, time: 0.3, duration: 0.3},    // E4
            {freq: 392, time: 0.6, duration: 0.3},       // G4
            {freq: 523.25, time: 0.9, duration: 0.5},    // C5
            {freq: 659.25, time: 1.5, duration: 0.4},    // E5
            {freq: 783.99, time: 2.0, duration: 0.8},    // G5 - REDUCED duration (was 1.0)
        ];
        
        fanfare.forEach(note => {
            const timeoutId = setTimeout(() => {
                if (!this.isPlaying) return;
                this.playNote(note.freq, 0.20, note.duration, 'square');
                this.playNote(note.freq * 2, 0.12, note.duration, 'triangle');
                this.playBell(note.freq, 0.08, note.duration * 1.5); // Reduced from *2
            }, note.time * 1000);
            this.timeouts.push(timeoutId);
        });
        
        // Percussão triunfante (0-2.4s)
        for (let i = 0; i < 4; i++) {
            const hitTimeout = setTimeout(() => {
                if (!this.isPlaying) return;
                this.playPercussiveBass(60, 0.15, 0.1);
            }, i * 600);
            this.timeouts.push(hitTimeout);
        }
        
        // Arpejo final celebratório (3-3.6s)
        const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        arpeggio.forEach((freq, index) => {
            const timeoutId = setTimeout(() => {
                if (!this.isPlaying) return;
                this.playNote(freq, 0.15, 0.25, 'sine'); // Reduced duration
            }, (3000 + index * 150));
            this.timeouts.push(timeoutId);
        });
        
        // FINAL NOTE: Note sustentada que PARA automaticamente (3.6-5.1s)
        const finalNoteTimeout = setTimeout(() => {
            if (!this.isPlaying) return;
            // Nota final C5 com fade out gradual - duração DEFINIDA
            this.playNote(523.25, 0.18, 1.5, 'sine'); // 1.5s duration - STOPS at 5.1s
        }, 3600);
        this.timeouts.push(finalNoteTimeout);
        
        // REMOVED: Drone contínuo eliminado! Era o culpado do chiado!
        // Victory theme agora termina completamente em ~5.1 segundos
    }
    
    // ============================================
    // TRACK 5: DEFEAT THEME - The Final Darkness
    // ============================================
    playDefeatTheme() {
        // Descida cromática sombria
        const descent = [
            {freq: 293.66, time: 0},    // D4
            {freq: 277.18, time: 0.6},  // C#4
            {freq: 261.63, time: 1.2},  // C4
            {freq: 246.94, time: 1.8},  // B3
            {freq: 220, time: 2.4},     // A3
        ];
        
        descent.forEach(note => {
            const timeoutId = setTimeout(() => {
                if (!this.isPlaying) return;
                this.playNote(note.freq, 0.15, 0.8, 'sine');
            }, note.time * 1000);
            this.timeouts.push(timeoutId);
        });
        
        // Bells fúnebres
        const bell1TimeoutId = setTimeout(() => {
            if (!this.isPlaying) return;
            this.playBell(523.25, 0.08, 3.0); // C5
        }, 1000);
        this.timeouts.push(bell1TimeoutId);
        
        const bell2TimeoutId = setTimeout(() => {
            if (!this.isPlaying) return;
            this.playBell(392, 0.08, 3.0); // G4
        }, 2000);
        this.timeouts.push(bell2TimeoutId);
        
        // Fade to silence
        const fadeTimeoutId = setTimeout(() => {
            this.fadeOut(2.0, () => {});
        }, 3000);
        this.timeouts.push(fadeTimeoutId);
    }
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    playDrone(freq, volume, waveType = 'sine') {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        osc.type = waveType;
        osc.frequency.value = freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = freq * 4; // Filtro suave
        filter.Q.value = 1;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, this.context.currentTime + 1.0);
        
        osc.start(this.context.currentTime);
        
        this.oscillators.push(osc);
        this.gainNodes.push(gain);
    }
    
    playNote(freq, volume, duration, waveType = 'sine') {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const reverb = this.context.createConvolver();
        
        // Reuse pre-created reverb buffer (CRITICAL FIX for memory leak)
        reverb.buffer = this.reverbBuffer;
        
        osc.type = waveType;
        osc.frequency.value = freq;
        
        osc.connect(gain);
        gain.connect(reverb);
        reverb.connect(this.masterGain);
        
        const now = this.context.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
        
        // REMOVED: Não rastreamos notes temporárias (param automaticamente)
    }
    
    playBell(freq, volume, duration) {
        // Bell com harmônicos
        const harmonics = [1, 2.76, 5.4, 8.93]; // Proporções de sino
        
        harmonics.forEach((harmonic, index) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq * harmonic;
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            const now = this.context.currentTime;
            const vol = volume / (index + 1); // Harmônicos mais baixos
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.start(now);
            osc.stop(now + duration);
            
            // REMOVED: Não rastreamos bells temporários (param automaticamente)
        });
    }
    
    playPercussiveBass(freq, volume, duration) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.context.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        const now = this.context.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
        
        // REMOVED: Não rastreamos bass temporário (para automaticamente)
    }
    
    playAtmosphericPad(freqs, volume) {
        freqs.forEach(freq => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            const filter = this.context.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            
            filter.type = 'lowpass';
            filter.frequency.value = freq * 2;
            filter.Q.value = 0.7;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            gain.gain.setValueAtTime(0, this.context.currentTime);
            gain.gain.linearRampToValueAtTime(volume, this.context.currentTime + 2.0);
            
            osc.start(this.context.currentTime);
            
            this.oscillators.push(osc);
        });
    }
    
    playDarkPercussion(interval) {
        const percTimer = setInterval(() => {
            if (!this.isPlaying) return;
            
            // Kick drum grave
            const kick = this.context.createOscillator();
            const kickGain = this.context.createGain();
            
            kick.frequency.setValueAtTime(150, this.context.currentTime);
            kick.frequency.exponentialRampToValueAtTime(40, this.context.currentTime + 0.1);
            
            kick.connect(kickGain);
            kickGain.connect(this.masterGain);
            
            kickGain.gain.setValueAtTime(0.15, this.context.currentTime);
            kickGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
            
            const startTime = this.context.currentTime;
            kick.start(startTime);
            kick.stop(startTime + 0.1);
            
            // REMOVED: Não rastreamos oscillators temporários!
            // Eles param automaticamente em 0.1s
            // Rastrear causa conflitos com stopAll()
        }, interval);
        
        this.intervals.push(percTimer);
    }
    
    // Métodos de compatibilidade com código existente
    nextTrack() {
        // No sistema novo, não há "next track" manual
        // Mas mantém compatibilidade
        playSound('cardFlip');
    }
    
    prevTrack() {
        // Compatibilidade
        playSound('cardFlip');
    }
}
        const music = new DarkAtmosphericMusic();

        // Sound/Music Hooks
        // btnTopSound removed - redundant with Play/Pause + Volume
        btnMusicToggle.onclick = function() {
            game.settings.musicEnabled = !game.settings.musicEnabled;
            this.classList.toggle('active', game.settings.musicEnabled);
            this.textContent = game.settings.musicEnabled ? '⏸️' : '⏯️';

            if (game.settings.musicEnabled) {
                music.start();
            } else {
                music.stop();
            }
        };
        
        // Music Volume Control (Gameplay)
        const musicVolumeSlider = document.getElementById('musicVolume');
        if (musicVolumeSlider) {
            // Initialize slider background with current value
            const initialVolume = musicVolumeSlider.value || 40;
            musicVolumeSlider.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${initialVolume}%, #2a2318 ${initialVolume}%, #2a2318 100%)`;
            
            // Set initial volume to 40%
            music.masterGain.gain.value = initialVolume / 100;
            
            // Apply debounce to reduce excessive calls
            musicVolumeSlider.oninput = debounce((e) => {
                const volume = e.target.value / 100;
                const volumePercent = e.target.value;
                music.masterGain.gain.value = volume;
                
                // Update slider background dynamically
                e.target.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${volumePercent}%, #2a2318 ${volumePercent}%, #2a2318 100%)`;
                
                // Haptic feedback on volume change
                hapticFeedback('light');
            }, 50);
        }

        // Welcome Screen Music Controls (AFTER music is created)
        const btnWelcomeMusicToggle = document.getElementById('btnWelcomeMusicToggle');
        const btnWelcomeSoundboard = document.getElementById('btnWelcomeSoundboard');
        
        // Update music button visual
        function updateWelcomeMusicButton() {
            if (btnWelcomeMusicToggle) {
                btnWelcomeMusicToggle.textContent = music.isPlaying ? '⏸️' : '⏯️';
                btnWelcomeMusicToggle.style.opacity = music.isPlaying ? '1' : '0.7';
            }
            
            // Update now playing display
            music.updateNowPlayingDisplay();
        }
        
        if (btnWelcomeMusicToggle) {
            btnWelcomeMusicToggle.onclick = () => {
                game.settings.musicEnabled = !game.settings.musicEnabled;
                if (game.settings.musicEnabled) {
                    music.start();
                } else {
                    music.stop();
                }
                updateWelcomeMusicButton();
                playSound('click');
            };
        }
        
        // Music Volume Control (Welcome Screen)
        const welcomeMusicVolumeSlider = document.getElementById('welcomeMusicVolume');
        if (welcomeMusicVolumeSlider) {
            // Initialize slider background with current value
            const initialVolume = welcomeMusicVolumeSlider.value;
            welcomeMusicVolumeSlider.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${initialVolume}%, #2a2318 ${initialVolume}%, #2a2318 100%)`;
            
            // Apply debounce to reduce excessive calls
            welcomeMusicVolumeSlider.oninput = debounce((e) => {
                const volume = e.target.value / 100;
                const volumePercent = e.target.value;
                music.masterGain.gain.value = volume;
                
                // Update slider background dynamically
                e.target.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${volumePercent}%, #2a2318 ${volumePercent}%, #2a2318 100%)`;
                
                // Sync with gameplay slider
                if (musicVolumeSlider) {
                    musicVolumeSlider.value = e.target.value;
                    musicVolumeSlider.style.background = `linear-gradient(to right, #c9a961 0%, #c9a961 ${volumePercent}%, #2a2318 ${volumePercent}%, #2a2318 100%)`;
                }
                
                // Haptic feedback
                hapticFeedback('light');
            }, 50);
        }
        
        // Soundboard Modal
        const soundboardModal = document.getElementById('soundboardModal');
        const btnCloseSoundboard = document.getElementById('btnCloseSoundboard');
        
        if (btnWelcomeSoundboard) {
            btnWelcomeSoundboard.onclick = () => {
                soundboardModal.classList.add('active');
                playSound('click');
            };
        }
        
        // Helper: Update all soundboard buttons to PLAY state
        function updateSoundboardButtons() {
            ['Menu', 'Gameplay', 'Shop', 'Victory', 'Defeat'].forEach(theme => {
                const btn = document.getElementById(`btnPlay${theme}`);
                if (btn) {
                    const isCurrentTheme = music.currentContext === theme.toLowerCase();
                    const isPlaying = music.isPlaying && isCurrentTheme;
                    btn.innerHTML = isPlaying ? '⏸️ PAUSE' : '▶️ PLAY';
                }
            });
        }
        
        if (btnCloseSoundboard) {
            btnCloseSoundboard.onclick = () => {
                soundboardModal.classList.remove('active');
                
                // COMPLETE FIX: Stop music AND return to menu theme
                music.stop();
                music.switchContext('menu');
                music.start();
                
                // Update all buttons to PLAY state
                updateSoundboardButtons();
                updateWelcomeMusicButton();
                
                console.log('[MUSIC] Soundboard closed, returned to menu theme.');
            };
        }
        
        // Soundboard Buttons - REWRITTEN with toggle functionality
        const setupSoundboardButton = (btnId, context) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            
            btn.addEventListener('click', () => {
                const isCurrentContext = music.currentContext === context;
                const isPlaying = music.isPlaying;
                
                if (isPlaying && isCurrentContext) {
                    // PAUSE current theme
                    music.stop();
                    btn.innerHTML = '▶️ PLAY';
                } else {
                    // PLAY this theme
                    game.settings.musicEnabled = true;
                    music.switchContext(context);
                    music.start();
                    updateSoundboardButtons(); // Update ALL buttons
                }
                
                playSound('cardFlip');
                updateWelcomeMusicButton();
            });
        };
        
        // Setup all soundboard buttons
        setupSoundboardButton('btnPlayMenu', 'menu');
        setupSoundboardButton('btnPlayGameplay', 'gameplay');
        setupSoundboardButton('btnPlayShop', 'shop');
        setupSoundboardButton('btnPlayVictory', 'victory');
        setupSoundboardButton('btnPlayDefeat', 'defeat');
        
        // Initialize button states
        updateSoundboardButtons();
        
        // Initialize welcome music button state
        updateWelcomeMusicButton();

        // Particles System with performance limit
        let activeParticles = 0;
        const MAX_PARTICLES = 150; // Prevent performance issues
        
        function createParticles(x, y, color, count = 10) {
            // Limit number of particles for performance
            const actualCount = Math.min(count, MAX_PARTICLES - activeParticles);
            if (actualCount <= 0) return; // Skip if at limit
            
            for (let i = 0; i < actualCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    left: ${x}px;
                    top: ${y}px;
                    width: ${Math.random() * 8 + 4}px;
                    height: ${Math.random() * 8 + 4}px;
                    background: ${color};
                    border-radius: 50%;
                    animation: particleFade ${Math.random() * 0.5 + 0.5}s ease-out forwards;
                    transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px);
                `;
                activeParticles++;
                document.body.appendChild(particle);
                setTimeout(() => {
                    particle.remove();
                    activeParticles--;
                }, 1000);
            }
        }
        
        // Add particle animation CSS
        if (!document.getElementById('particleStyles')) {
            const style = document.createElement('style');
            style.id = 'particleStyles';
            style.textContent = `
                .particle {
                    position: fixed;
                    pointer-events: none;
                    z-index: 9999;
                }
                @keyframes particleFade {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-100px) scale(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .shake { animation: shake 0.4s ease; }
                
                @keyframes slideInRight {
                    0% { 
                        opacity: 0; 
                        transform: translateX(400px) scale(0.8); 
                    }
                    50% { 
                        transform: translateX(-20px) scale(1.05); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateX(0) scale(1); 
                    }
                }
                
                .achievement-toast {
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                
                .damage-number {
                    position: fixed;
                    font-size: 2.5em;
                    font-weight: bold;
                    pointer-events: none;
                    z-index: 9999;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                    animation: damageFloat 1.5s ease-out forwards;
                }
                @keyframes damageFloat {
                    0% { opacity: 1; transform: translateY(0) scale(0.5); }
                    50% { transform: translateY(-60px) scale(1.2); }
                    100% { opacity: 0; transform: translateY(-120px) scale(0.8); }
                }
                .damage-number.damage { color: #ff6b6b; }
                .damage-number.heal { color: #6bcf7f; }
                .damage-number.combo { color: #ffd93d; }
                .damage-number.score { color: #ffd700; font-size: 3em; }
                
                .combo-counter {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    font-size: 5em;
                    font-weight: bold;
                    color: #ffd93d;
                    text-shadow: 0 0 30px rgba(255, 217, 61, 0.8);
                    pointer-events: none;
                    z-index: 9998;
                    animation: comboPopup 1s ease-out forwards;
                }
                @keyframes comboPopup {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0.8) rotate(0deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Damage Numbers System
        function showDamageNumber(amount, type = 'damage') {
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
            
            const damageEl = document.createElement('div');
            damageEl.className = `damage-number ${type}`;
            damageEl.textContent = typeof amount === 'number' ? (type === 'heal' ? `+${amount}` : `-${amount}`) : amount;
            damageEl.style.left = x + 'px';
            damageEl.style.top = y + 'px';
            
            document.body.appendChild(damageEl);
            setTimeout(() => damageEl.remove(), 1500);
            
            // Particles
            const color = type === 'heal' ? '#6bcf7f' : (type === 'damage' ? '#ff6b6b' : '#ffd93d');
            createParticles(x, y, color, 15);
            
            // Haptic feedback based on type
            if (type === 'damage') {
                hapticFeedback('heavy');
            } else if (type === 'heal') {
                hapticFeedback('success');
            } else {
                hapticFeedback('medium');
            }
        }
        
        function showCombo(count) {
            const comboEl = document.createElement('div');
            comboEl.className = 'combo-counter';
            
            // Different messages and colors based on combo count
            let message = `${count}x COMBO!`;
            let color = '#ffd93d'; // Default yellow
            
            if (count >= 10) {
                message = `${count}x LEGENDARY!`;
                color = '#ff6b6b'; // Red for legendary
            } else if (count >= 7) {
                message = `${count}x AMAZING!`;
                color = '#a8edea'; // Blue for amazing
            } else if (count >= 5) {
                message = `${count}x GREAT!`;
                color = '#6bcf7f'; // Green for great
            }
            
            comboEl.textContent = message;
            comboEl.style.color = color;
            comboEl.style.textShadow = `0 0 30px ${color}`;
            
            document.body.appendChild(comboEl);
            setTimeout(() => comboEl.remove(), 1000);
            
            // Haptic feedback for combos
            if (count >= 10) {
                hapticFeedback('success');
            } else if (count >= 5) {
                hapticFeedback('medium');
            } else {
                hapticFeedback('light');
            }
            
            // Extra particles for high combos
            if (count >= 5) {
                createParticles(window.innerWidth / 2, window.innerHeight / 2, color, count * 3);
            }
        }
        
        function screenShake() {
            const gameWrapper = document.getElementById('gameWrapper');
            if (gameWrapper) {
                gameWrapper.classList.add('shake');
                hapticFeedback('heavy');
                setTimeout(() => gameWrapper.classList.remove('shake'), 400);
            }
        }

        // Hold System
        function holdCard(card, sourceIndex) {
            // Check max hold cards (Rogue can hold 2, Feather +1)
            let maxHold = (game.classData && game.classData.passive.maxHoldCards) || 1;
            
            // Feather relic: +1 hold slot
            if (game.relics.some(r => r.id === 'feather')) maxHold += 1;
            
            // Count current held cards
            const currentHeldCount = game.heldCard ? (Array.isArray(game.heldCard) ? game.heldCard.length : 1) : 0;
            
            if (currentHeldCount >= maxHold) {
                showMessage(`❌ Hold slots full! (Max: ${maxHold})`, 'warning');
                playSound('error');
                return;
            }
            
            // Monsters cannot be held!
            const cardType = getCardType(card);
            if (cardType === 'monster') {
                showMessage('❌ Monsters cannot be held! You must fight them.', 'danger');
                playSound('error');
                return;
            }
            
            // Initialize heldCard as array for Rogue, single for others
            if (!game.heldCard) {
                game.heldCard = maxHold > 1 ? [] : null;
            }
            
            // Add to hold
            const cardToHold = { ...card, sourceIndex };
            if (maxHold > 1) {
                if (!Array.isArray(game.heldCard)) game.heldCard = [];
                game.heldCard.push(cardToHold);
            } else {
                game.heldCard = cardToHold;
            }
            
            game.room.splice(sourceIndex, 1);
            game.stats.cardsHeld++;
            
            const typeEmoji = {
                'weapon': '⚔️',
                'potion': '💊',
                'special': '✨'
            };
            
            playSound('hold');
            addLog(`Held ${card.value}${card.suit}`, 'info');
            showMessage(`📌 ${typeEmoji[cardType]} Held for later use! (${currentHeldCount + 1}/${maxHold})`, 'info');
            createParticles(window.innerWidth / 2, window.innerHeight / 3, '#ffd93d', 20);
            updateUI();
            checkGameState(); // Check if room is now cleared after holding card
        }

        function useHeldCard() {
            if (!game.heldCard) return;
            
            const card = game.heldCard;
            game.heldCard = null;
            
            game.room.unshift(card); // Adds back to the start of the room
            
            updateUI();
            
            // Simulates clicking the card that just returned
            setTimeout(() => {
                const firstCardEl = bottomBar.querySelector('.card');
                if (firstCardEl) {
                    firstCardEl.click();
                }
            }, 100);
        }
        
        // ============================================
        // CLASS ABILITIES
        // ============================================
        
        function useClassAbility() {
            if (!game.classData) return;
            
            // Scoundrel has no ability
            if (!game.classData.active) {
                showMessage('❌ Scoundrel has no special abilities!', 'warning');
                playSound('error');
                return;
            }
            
            // Check cooldown
            if (game.classAbilityCooldown > 0) {
                showMessage(`⏳ Ability on cooldown! ${game.classAbilityCooldown} rooms remaining.`, 'warning');
                playSound('error');
                return;
            }
            
            // Execute ability based on class
            if (game.playerClass === 'knight') {
                useKnightAbility();
            } else if (game.playerClass === 'rogue') {
                useRogueAbility();
            } else if (game.playerClass === 'dancer') {
                useDancerAbility();
            } else if (game.playerClass === 'berserker') {
                useBerserkerAbility();
            } else if (game.playerClass === 'priest') {
                usePriestAbility();
            }
            
            updateAbilityUI();
        }
        
        function useKnightAbility() {
            // Shield Bash: Deal weapon damage to first monster
            if (!game.equippedWeapon) {
                showMessage('⚠️ Need a weapon equipped to use Shield Bash!', 'warning');
                playSound('error');
                return;
            }
            
            const firstMonster = game.room.find(c => getCardType(c) === 'monster');
            if (!firstMonster) {
                showMessage('⚠️ No monsters in room!', 'warning');
                playSound('error');
                return;
            }
            
            const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
            const damage = game.equippedWeapon.numValue + powerBonus;
            firstMonster.numValue -= damage;
            
            if (firstMonster.numValue <= 0) {
                const index = game.room.indexOf(firstMonster);
                game.room.splice(index, 1);
                game.discardPile.push(firstMonster);
                game.stats.monstersSlain++;
                showMessage(`🛡️ Shield Bash! Monster defeated!`, 'success');
            } else {
                showMessage(`🛡️ Shield Bash! Dealt ${damage} damage! (${firstMonster.numValue} HP left)`, 'success');
            }
            
            game.classAbilityCooldown = game.classData.active.cooldown;
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#c9a961', 40);
            updateUI();
            checkGameState();
        }
        
        function useRogueAbility() {
            // Shadow Strike: Next monster 2x damage, combo safe
            game.classAbilityActive = true;
            game.classAbilityCounter = 1; // Next monster only
            game.classAbilityCooldown = game.classData.active.cooldown;
            
            showMessage('🔪 Shadow Strike activated! Next kill: 2x damage, combo safe!', 'success');
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#667eea', 40);
            updateUI();
        }
        
        function useDancerAbility() {
            // Healing Dance: Heal 5 HP + damage buff
            game.health = Math.min(game.maxHealth, game.health + 5);
            game.classAbilityActive = true;
            game.classAbilityCounter = 2; // Next 2 monsters
            game.classAbilityCooldown = game.classData.active.cooldown;
            
            showMessage('✨ Healing Dance! +5 HP and damage buff for 2 attacks!', 'success');
            playSound('heal');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 50);
            updateUI();
        }
        
        function useBerserkerAbility() {
            // Rage Strike: Sacrifice 5 HP for 3x damage
            if (game.health <= 5) {
                showMessage('⚠️ Not enough HP! Need more than 5 HP to use Rage Strike.', 'danger');
                playSound('error');
                return;
            }
            
            // Sacrifice HP
            game.health -= 5;
            
            // Activate 3x damage buff
            game.classAbilityActive = true;
            game.classAbilityCounter = 3; // 3 attacks (buffed for balance)
            game.rageStrikeActive = true; // Special flag for triple damage
            game.classAbilityCooldown = game.classData.active.cooldown;
            
            // Break combo (high risk)
            if (game.combo > 0) {
                showMessage(`💢 Rage Strike! -5 HP, next attack: 3x damage! ⚠️ Combo broken! (Lost ${game.combo}x)`, 'warning');
                game.combo = 0;
            } else {
                showMessage('💢 Rage Strike! -5 HP, next attack: 3x damage!', 'warning');
            }
            
            playSound('special');
            screenShake();
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 60);
            updateUI();
        }
        
        function usePriestAbility() {
            // Purification: Remove strongest monster or convert to potion
            const monsters = game.dungeon.filter(c => getCardType(c) === 'monster');
            
            if (monsters.length === 0) {
                showMessage('⚠️ No monsters in dungeon to purify!', 'warning');
                playSound('error');
                return;
            }
            
            // Find strongest monster
            const strongestMonster = monsters.reduce((max, card) => 
                card.numValue > max.numValue ? card : max
            );
            
            // Ask player what to do
            const choice = confirm(
                `📿 PURIFICATION\n\n` +
                `Strongest monster: ${strongestMonster.value}${strongestMonster.suit} (${strongestMonster.numValue} HP)\n\n` +
                `Choose:\n` +
                `• OK = Remove permanently\n` +
                `• Cancel = Transform into potion`
            );
            
            const index = game.dungeon.indexOf(strongestMonster);
            
            if (choice) {
                // Remove permanently
                game.dungeon.splice(index, 1);
                showMessage(`📿 Purification! ${strongestMonster.value}${strongestMonster.suit} removed from existence!`, 'success');
            } else {
                // Transform to potion (random value 2-10)
                const potionValue = Math.floor(Math.random() * 9) + 2;
                game.dungeon[index] = {
                    value: potionValue.toString(),
                    suit: '♥',
                    numValue: potionValue,
                    suitName: 'hearts'
                };
                showMessage(`📿 Purification! ${strongestMonster.value}${strongestMonster.suit} transformed into ${potionValue}♥ potion!`, 'success');
            }
            
            game.classAbilityCooldown = game.classData.active.cooldown;
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 70);
            updateUI();
        }
        
        function updateAbilityUI() {
            const btn = document.getElementById('btnClassAbility');
            const cooldownDisplay = document.getElementById('abilityCooldownDisplay');
            const desc = document.getElementById('abilityDescription');
            
            if (!game.classData) return;
            
            // Scoundrel has no ability - disable button
            if (!game.classData.active) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
                btn.style.display = 'none'; // Hide button for Scoundrel
                cooldownDisplay.style.display = 'none';
                if (desc) desc.textContent = 'No abilities available';
                return;
            }
            
            // Show button for classes with abilities
            btn.style.display = 'block';
            
            if (game.classAbilityCooldown > 0) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                cooldownDisplay.textContent = `${game.classAbilityCooldown} rooms`;
                cooldownDisplay.style.display = 'block';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                cooldownDisplay.style.display = 'none';
            }
            
            // Show active buff
            if (game.classAbilityActive && game.classAbilityCounter > 0) {
                desc.innerHTML = `<strong style="color: #6bcf7f;">✨ ACTIVE! ${game.classAbilityCounter} uses left</strong>`;
            } else {
                desc.textContent = game.classData.active.description;
            }
        }
        
        // Tooltip Generation
        function generateTooltip(card) {
            const type = getCardType(card);
            
            // Obliterate mode
            if (game.obliterateMode) {
                return `<span class="tooltip-negative">💥 OBLITERATE: Remove this card permanently!</span>`;
            }
            
            // Boss special tooltip
            if (card.isBoss) {
                const bossName = card.bossName || 'Boss';
                return `<span class="tooltip-negative">👹 <strong>${bossName}</strong> - ${card.numValue}/${card.maxHP || card.numValue} HP<br>${card.bossFlavor || 'Defeat this boss to continue!'}</span>`;
            }
            
            const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
            
            if (type === 'monster') {
                const baseWeapon = game.equippedWeapon?.numValue || 0;
                const berserkBonus = getBerserkBonus();
                
                // Add class ability bonuses
                let classBonus = 0;
                if (game.classAbilityActive && game.classAbilityCounter > 0) {
                    if (game.playerClass === 'dancer') {
                        classBonus = 2;
                    }
                }
                
                const bloodlustBonus = getBloodlustBonus();
                const comboBonus = getComboBonus();
                
                const totalWeapon = baseWeapon + powerBonus + berserkBonus + classBonus + bloodlustBonus + comboBonus;
                let effectiveWeapon = game.doubleDamage ? totalWeapon * 2 : totalWeapon;
                
                // Rogue Shadow Strike (2x)
                if (game.classAbilityActive && game.classAbilityCounter > 0 && game.playerClass === 'rogue') {
                    effectiveWeapon *= 2;
                }
                
                // Berserker Rage Strike (3x)
                if (game.rageStrikeActive && game.classAbilityCounter > 0) {
                    effectiveWeapon *= 3;
                }

                if (baseWeapon === 0) {
                    return `<span class="tooltip-negative">⚠️ No weapon! Damage: -${card.numValue} HP</span>`;
                }
                
                let actualDamage = card.numValue - effectiveWeapon;
                
                // Add info about active buffs
                let buffInfo = '';
                if (game.berserkStacks > 0) buffInfo += `🔥+${berserkBonus} `;
                if (comboBonus > 0) buffInfo += `🔥🔥+${comboBonus} `;
                if (game.doubleDamage) buffInfo += `⚡2x `;
                if (game.mirrorShield > 0) buffInfo += `🪞${game.mirrorShield} `;
                if (classBonus > 0) buffInfo += `💃+${classBonus} `;
                if (bloodlustBonus > 0) buffInfo += `💢+${bloodlustBonus} `;
                if (game.classAbilityActive && game.classAbilityCounter > 0 && game.playerClass === 'rogue') buffInfo += `🔪2x `;
                if (game.rageStrikeActive && game.classAbilityCounter > 0) buffInfo += `⚔️3x `;
                
                if (game.dodgeActive) return `<span class="tooltip-positive">🛡️ Dodge: No damage! ${buffInfo}</span>`;
                
                if (game.mirrorShield > 0 && actualDamage > 0) {
                    const reflected = Math.min(actualDamage, game.mirrorShield);
                    const remaining = actualDamage - reflected;
                    if (remaining <= 0) {
                        return `<span class="tooltip-positive">🪞 Mirror blocks all! ${buffInfo}</span>`;
                    } else {
                        return `<span class="tooltip-warning">🪞 Mirror -${reflected}, Take -${remaining} ${buffInfo}</span>`;
                    }
                }
                
                if (actualDamage > 0) return `<span class="tooltip-negative">⚔️ Fight: -${actualDamage} HP ${buffInfo}</span>`;
                else return `<span class="tooltip-positive">⚔️ Perfect! No damage! ${buffInfo}</span>`;
                
            } else if (type === 'weapon') {
                const current = (game.equippedWeapon?.numValue || 0) + powerBonus;
                const cardValue = card.numValue + powerBonus;

                if (cardValue > current) return `<span class="tooltip-positive">⬆️ Better Weapon! (${current} → ${cardValue})</span>`;
                else if (cardValue < current) return `<span class="tooltip-negative">⬇️ Worse Weapon (${current} → ${cardValue})</span>`;
                else return `<span class="tooltip-neutral">↔️ Same Weapon (${cardValue})</span>`;
                
            } else if (type === 'potion') {
                const maxPotions = (game.classData && game.classData.passive.maxPotionsPerRoom) || 1;
                if (game.potionsUsed >= maxPotions) {
                    return `<span class="tooltip-negative">❌ Potion limit reached (${maxPotions}/${maxPotions})</span>`;
                }
                
                const healBonus = getRelicBonus('healBonus');
                const classHealBonus = (game.classData && game.classData.passive.potionHealBonus) || 0;
                const totalHealBonus = healBonus + classHealBonus;
                const heal = Math.min(card.numValue + totalHealBonus, game.maxHealth - game.health);

                if (heal > 0) {
                    let bonusText = totalHealBonus > 0 ? ` (+${totalHealBonus} bonus)` : '';
                    return `<span class="tooltip-positive">💚 Heal: +${heal} HP${bonusText}</span>`;
                } else {
                    return `<span class="tooltip-neutral">💚 HP Full</span>`;
                }
                
            } else if (card.special) {
                return `<span class="tooltip-positive">✨ ${card.special.description}</span>`;
            }
            return '';
        }
        
        // ===== ACHIEVEMENT SYSTEM =====
        function checkAchievements() {
            // Check achievements in real-time during gameplay
            checkAllAchievements();
            
            // Check in-game achievements that can't be checked via lifetime stats
            const unlocked = loadAchievements();
            
            // Collector - 3 relics in single run
            if (game.relics.length >= 3 && !unlocked.includes('collector')) {
                unlockAchievement('collector');
            }
            
            // Relic Hunter - 5 relics in single run
            if (game.relics.length >= 5 && !unlocked.includes('relic_hunter')) {
                unlockAchievement('relic_hunter');
            }
        }

        // Game Log (now in a modal or sidebar? For now, no visible log)
        function addLog(message, type = 'info') {
            console.log(`LOG [${type}]: ${message}`);
            // (The log UI was removed for a cleaner layout)
        }
        
        // Helper: Reset combo with unlocks
        function resetCombo() {
            if (permanentUnlocks.comboGod) game.combo = 2;
            else if (permanentUnlocks.comboMaster) game.combo = 1;
            else game.combo = 0;
        }
        
        // Helper: Calculate berserk bonus
        function getBerserkBonus() {
            if (game.berserkStacks <= 0) return 0;
            return permanentUnlocks.berserkMaster ? 7 : 5;
        }
        
        // Helper: Calculate bloodlust bonus
        function getBloodlustBonus() {
            if (!game.classData || !game.classData.passive.bloodlust) return 0;
            const hpPercent = (game.health / game.maxHealth) * 100;
            if (hpPercent <= 30) return 3;
            if (hpPercent <= 50) return 2;
            if (hpPercent <= 70) return 1;
            return 0;
        }
        
        // Helper: Calculate combo bonus
        function getComboBonus() {
            if (game.combo === 0) return 0;
            
            // Combo God: +2 damage per combo level (stacks with base)
            // Base: 2 combo = +1, 3 combo = +2, etc.
            // With Combo God: 2 combo = +2, 3 combo = +4, etc.
            const comboMultiplier = permanentUnlocks.comboGod ? 2 : 1;
            let bonus = game.combo >= 2 ? (game.combo - 1) * comboMultiplier : 0;
            
            // Fire Ring: +1 damage per combo stack
            if (game.relics.some(r => r.id === 'ring_fire') && game.combo >= 1) {
                bonus += game.combo;
            }
            
            return bonus;
        }
        
        // Initialize deck
        function createDeck() {
            let deck = [];
            
            // SCOUNDREL ORIGINAL RULES:
            // Remove: Jokers, Red Face Cards (J♥,Q♥,K♥,J♦,Q♦,K♦), Red Aces (A♥,A♦)
            
            // 26 MONSTERS (♠ Spades + ♣ Clubs): A(14), 2-10, J(11), Q(12), K(13)
            const monsterSuits = [
                { suit: '♠', suitName: 'spades' },
                { suit: '♣', suitName: 'clubs' }
            ];
            const monsterValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            const monsterNumValues = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            
            for (let suit of monsterSuits) {
                for (let i = 0; i < monsterValues.length; i++) {
                    deck.push({ 
                        value: monsterValues[i], 
                        suit: suit.suit, 
                        numValue: monsterNumValues[i], 
                        suitName: suit.suitName 
                    });
                }
            }
            
            // 9 WEAPONS (♦ Diamonds): 2-10 only (NO face cards, NO Ace)
            const weaponValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
            const weaponNumValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            for (let i = 0; i < weaponValues.length; i++) {
                deck.push({ 
                    value: weaponValues[i], 
                    suit: '♦', 
                    numValue: weaponNumValues[i], 
                    suitName: 'diamonds' 
                });
            }
            
            // 9 POTIONS (♥ Hearts): 2-10 only (NO face cards, NO Ace)
            const potionValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
            const potionNumValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            for (let i = 0; i < potionValues.length; i++) {
                deck.push({ 
                    value: potionValues[i], 
                    suit: '♥', 
                    numValue: potionNumValues[i], 
                    suitName: 'hearts' 
                });
            }
            
            // SPECIAL CARDS (our addition for gamification)
            // Base: 6 special cards (deck = 50 cards total)
            let specialCount = 6;
            
            // Old Book: +10% more special cards (+1)
            if (game.relics.some(r => r.id === 'book')) specialCount += 1;
            
            // Magic Orb: +100% special cards (2x = +6)
            if (game.relics.some(r => r.id === 'orb')) specialCount += 6;
            for (let i = 0; i < specialCount; i++) {
                deck.push({ 
                    value: '✨', 
                    suit: '', 
                    numValue: 0, 
                    suitName: 'special', 
                    special: specialCards[Math.floor(Math.random() * specialCards.length)] 
                });
            }
            
            // TOTAL: 26 monsters + 9 weapons + 9 potions + 6 specials = 50 cards
            let finalDeck = shuffleDeck(deck);
            
            // EASY MODE BALANCING: First 10 rooms should be beginner-friendly
            if (game.difficulty === 'easy' && game.stats.roomsCleared < 10) {
                finalDeck = balanceEasyModeDeck(finalDeck);
            }
            
            return finalDeck;
        }
        
        function balanceEasyModeDeck(deck) {
            // EASY MODE: 70% monstros <5 damage, 70% armas 4-8 damage (first 10 rooms)
            let balanced = [...deck];
            
            // Find all monsters and weapons
            const monsters = balanced.filter(c => c.suitName === 'clubs' || c.suitName === 'spades');
            const weapons = balanced.filter(c => c.suitName === 'diamonds');
            
            // Balance monsters: 70% should be <5 damage
            const targetLowMonsters = Math.floor(monsters.length * 0.70);
            const lowMonsters = monsters.filter(c => c.numValue < 5);
            const highMonsters = monsters.filter(c => c.numValue >= 5);
            
            if (lowMonsters.length < targetLowMonsters && highMonsters.length > 0) {
                // Replace high monsters with low ones
                const toReplace = Math.min(targetLowMonsters - lowMonsters.length, highMonsters.length);
                for (let i = 0; i < toReplace; i++) {
                    const highMonster = highMonsters[i];
                    const index = balanced.indexOf(highMonster);
                    // Replace with random low monster (2, 3, 4)
                    const newValue = [2, 3, 4][Math.floor(Math.random() * 3)];
                    balanced[index] = {
                        ...highMonster,
                        value: newValue.toString(),
                        numValue: newValue
                    };
                }
            }
            
            // Balance weapons: 70% should be 4-8 damage
            const targetMidWeapons = Math.floor(weapons.length * 0.70);
            const midWeapons = weapons.filter(c => c.numValue >= 4 && c.numValue <= 8);
            const offWeapons = weapons.filter(c => c.numValue < 4 || c.numValue > 8);
            
            if (midWeapons.length < targetMidWeapons && offWeapons.length > 0) {
                // Replace off-range weapons with mid-range ones
                const toReplace = Math.min(targetMidWeapons - midWeapons.length, offWeapons.length);
                for (let i = 0; i < toReplace; i++) {
                    const offWeapon = offWeapons[i];
                    const index = balanced.indexOf(offWeapon);
                    // Replace with random mid weapon (4, 5, 6, 7, 8)
                    const newValue = [4, 5, 6, 7, 8][Math.floor(Math.random() * 5)];
                    balanced[index] = {
                        ...offWeapon,
                        value: newValue.toString(),
                        numValue: newValue
                    };
                }
            }
            
            return balanced;
        }

        function shuffleDeck(deck) {
            let shuffled = [...deck];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        function startGame() {
            // Mark that player has played before (for first-time Easy suggestion)
            localStorage.setItem('dungeon_scoundrel_played_before', 'true');
            
            // 1. Load Stats and Unlocks
            loadPermanentStats();
            loadUnlocks();
            
            // 2. Configure Game State
            game.difficulty = document.querySelector('.difficulty-btn.selected').dataset.difficulty;
            const healthMap = { easy: 20, normal: 15, hard: 10, endless: 15 };
            let startHealthBonus = permanentUnlocks.startHealth ? 5 : 0;

            game.maxHealth = healthMap[game.difficulty] + startHealthBonus;
            
            // Apply class passives
            if (game.classData && game.classData.passive) {
                // Knight: +5 Max HP
                if (game.classData.passive.maxHpBonus) {
                    game.maxHealth += game.classData.passive.maxHpBonus;
                }
                // Priest: +2 Max HP (starting bonus)
                if (game.classData.passive.startMaxHpBonus) {
                    game.maxHealth += game.classData.passive.startMaxHpBonus;
                }
            }
            
            // Rope relic: +1 starting HP
            if (game.relics.some(r => r.id === 'rope')) {
                game.maxHealth += 1;
            }
            
            game.health = game.maxHealth;
            
            // Update player info display
            if (game.playerClass) {
                document.getElementById('playerAvatar').src = `assets/images/avatar-${game.playerClass}.jpg`;
                document.getElementById('playerNameDisplay').textContent = sanitizePlayerName(playerNameInput.value);
                document.getElementById('playerClassDisplay').textContent = game.classData.name;
                
                // Update ability button (only if class has an active ability)
                if (game.classData.active) {
                    document.getElementById('abilityIcon').textContent = game.classData.active.icon;
                    document.getElementById('abilityName').textContent = game.classData.active.name;
                    document.getElementById('abilityDescription').textContent = game.classData.active.description;
                }
                
                // Show passive icons
                const passiveIconsDisplay = document.getElementById('passiveIconsDisplay');
                passiveIconsDisplay.innerHTML = '';
                
                // Create passive icons based on class
                const passiveIcons = {
                    knight: [
                        { icon: '❤️', text: '+5 HP', title: 'Start with +5 Max HP' },
                        { icon: '🔨', text: '+1 Dur', title: 'Weapons last +1 use' }
                    ],
                    rogue: [
                        { icon: '📌', text: 'x2 Hold', title: 'Can hold 2 cards' },
                        { icon: '💰', text: '+1 Gold', title: '+1 gold per room' }
                    ],
                    dancer: [
                        { icon: '💊', text: '+3 HP', title: 'Potions heal +3 HP' },
                        { icon: '💊', text: 'x2 Use', title: 'Use 2 potions per room' },
                        { icon: '🎲', text: '+15%', title: '+15% event chance' }
                    ],
                    berserker: [
                        { icon: '💢', text: 'Bloodlust', title: 'Damage increases as HP decreases' },
                        { icon: '⚔️', text: 'High Risk', title: '+1/+2/+3 damage at ≤70%/50%/30% HP' }
                    ],
                    priest: [
                        { icon: '🕊️', text: '15% Dodge', title: '15% chance to dodge damage' },
                        { icon: '💊', text: '+2 HP', title: 'Potions heal +2 HP' },
                        { icon: '❤️', text: '+2 HP', title: 'Start with +2 Max HP' }
                    ]
                };
                
                const icons = passiveIcons[game.playerClass] || [];
                icons.forEach(passive => {
                    const iconEl = document.createElement('div');
                    iconEl.style.cssText = 'background: rgba(0,0,0,0.5); border: 1px solid #5a4a38; border-radius: 6px; padding: 4px 8px; font-size: 0.7em; display: flex; align-items: center; gap: 4px; color: #ffd700;';
                    iconEl.title = passive.title;
                    iconEl.innerHTML = `<span>${passive.icon}</span><span style="color: #c9a961;">${passive.text}</span>`;
                    passiveIconsDisplay.appendChild(iconEl);
                });
            }
            
            game.deck = createDeck();
            game.dungeon = [...game.deck];
            game.room = [];
            game.discardPile = [];
            game.equippedWeapon = null;
            game.heldCard = null;
            game.potionsUsed = 0;
            game.gameOver = false;
            game.score = 0;
            resetCombo();
            game.dodgeActive = false;
            game.doubleDamage = false;
            game.berserkStacks = 0;
            game.mirrorShield = 0;
            game.obliterateMode = false;
            game.gameStartTime = Date.now();
            game.seenEvents = []; // Track events seen this run (no repeats)
            game.eventTriggeredThisRoom = false; // Max 1 event per room
            game.endlessLevel = 0; // Track endless mode progression
            game.finalBossDefeated = false; // Track if final boss was defeated
            game.heldCardIndex = 0; // Track which held card is currently displayed (for Rogue)
            
            // Per-room flags initialization
            game.firstAttackDone = false; // Power Gauntlet flag
            game.criticalWarningShown = false; // HP critical warning flag
            
            // Class abilities
            game.classAbilityCooldown = 0; // Cooldown in rooms
            game.classAbilityActive = false; // Is buff active?
            game.classAbilityCounter = 0; // Uses left for buff
            game.rageStrikeActive = false; // Berserker Rage Strike flag
            
            // Run Stats
            game.stats = {
                monstersSlain: 0, totalDamage: 0, totalHealing: 0, roomsCleared: 0,
                weaponsEquipped: 0, potionsUsed: 0, maxCombo: 0, specialsUsed: 0,
                cardsHeld: 0, roomsAvoided: 0, gamesWon: 0, hardWins: 0,
                shopsVisited: 0,  // Track for score penalty
                minimalistWin: false, onePunch: false, musicWasOn: game.settings.musicEnabled,
                bossesKilled: 0, relicsCollected: 0, eventsTriggered: 0  // For class unlocks
            };
            
            // Initial Gold and Relics
            const startingGoldMap = { easy: 30, normal: 15, hard: 0, endless: 15 };
            game.gold = startingGoldMap[game.difficulty] || 0;
            game.totalGoldEarned = 0;
            game.relics = [];
            game.shopPriceMultiplier = 1.0; // Shop price multiplier (increases with visits)
            applyPermanentUnlocks(); // Applies initial gold/relics

            // 3. Update UI
            addLog(`Game started on ${game.difficulty.toUpperCase()} difficulty!`, 'info');
            showMessage(`Game started! Enter a dungeon to begin.`, 'info');
            
            btnStartGameModal.disabled = true; // Prevent double click
            btnDrawRoom.disabled = false;
            btnAvoidRoom.disabled = false;
            
            // Start Timer
            if (game.gameTimerInterval) clearInterval(game.gameTimerInterval);
            game.gameTimerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - game.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                gameTimer.textContent = `⏱️ ${minutes}:${seconds}`;
            }, 1000);
            
            updateUI();
            updateRelicsDisplay();
            
            // 4. Change Screens
            showGameUI();
            
            playSound('start');
            
            // Switch to gameplay music
            music.switchContext('gameplay');
        }

        function drawRoom() {
            if (game.dungeon.length === 0) {
                // Endless mode: reload deck instead of ending
                if (game.difficulty === 'endless') {
                    // Progressive difficulty scaling
                    game.endlessLevel = (game.endlessLevel || 0) + 1;
                    const difficultyScaling = Math.min(game.endlessLevel * 0.15, 2); // Max 2x scaling
                    
                    game.dungeon = createDeck();
                    
                    // Make monsters progressively harder
                    game.dungeon.forEach(card => {
                        if (card.suitName === 'clubs' || card.suitName === 'spades') {
                            card.numValue = Math.floor(card.numValue * (1 + difficultyScaling));
                        }
                    });
                    
                    showMessage(`♾️ ENDLESS MODE: Deck ${game.endlessLevel} loaded! Monsters +${Math.floor(difficultyScaling * 100)}% HP!`, 'warning');
                    playSound('special');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 50);
                } else {
                    // Check if final boss already defeated
                    if (!game.finalBossDefeated) {
                        spawnFinalBoss();
                        return;
                    }
                    endGame('victory');
                    return;
                }
            }

            // Check if it's a boss room (every 10 rooms)
            const nextRoomNumber = game.stats.roomsCleared + 1;
            const isBossRoom = nextRoomNumber % 10 === 0;
            
            // Warn player about upcoming boss
            if (nextRoomNumber === 9) {
                showMessage('⚠️ BOSS APPROACHING! Prepare for battle in the next room!', 'warning');
            }
            
            if (isBossRoom) {
                // BOSS BATTLE!
                const bossNumber = Math.floor(nextRoomNumber / 10);
                const bossHP = 15; // Fixed boss HP
                
                // Boss names and flavor
                const bossNames = [
                    { name: 'The Forgotten Knight', flavor: 'A hollow warrior bound by ancient curses...' },
                    { name: 'The Crimson Warden', flavor: 'Guardian of the deeper dungeons, covered in blood of the fallen.' },
                    { name: 'The Shadow Lord', flavor: 'Darkness incarnate. Few have lived to speak of this encounter.' },
                    { name: 'The Abyss Keeper', flavor: 'The final horror. The one who devours all hope.' }
                ];
                
                const boss = bossNames[Math.min(bossNumber - 1, bossNames.length - 1)];
                
                const bossCard = {
                    suit: '👹',
                    value: '👹',
                    numValue: bossHP,
                    maxHP: bossHP, // Store max HP for HP bar
                    isBoss: true,
                    bossNumber: bossNumber,
                    bossName: boss.name,
                    bossFlavor: boss.flavor
                };
                
                // Deal 3 cards to room (or remaining if < 3)
                // Speed Boots: +1 extra card draw
                let baseCardsToDraw = 3;
                if (game.relics.some(r => r.id === 'boots')) baseCardsToDraw += 1;
                
                const cardsToDraw = Math.min(baseCardsToDraw, game.dungeon.length);
                const drawnCards = game.dungeon.splice(0, cardsToDraw);
                game.room.push(bossCard, ...drawnCards);
                game.lastActionWasAvoid = false;
                
                playSound('special');
                addLog(`⚠️ BOSS BATTLE! ${boss.name} has ${bossHP} HP!`, 'danger');
                showMessage(`👹 BOSS: ${boss.name}`, 'danger');
                
                // Show boss intro with flavor
                setTimeout(() => {
                    showMessage(boss.flavor, 'info');
                }, 1000);
                
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 60);
            } else {
                // Normal room
                const numToDraw = 4;
                
                // BEGINNER HELP: Guarantee weapon in first 5 rooms if player has none
                if (game.stats.roomsCleared < 5 && !game.equippedWeapon) {
                    // Find a weapon in dungeon
                    const weaponIndex = game.dungeon.findIndex(card => card.suitName === 'diamonds');
                    if (weaponIndex !== -1) {
                        // Draw weapon + 3 random cards
                        const weapon = game.dungeon.splice(weaponIndex, 1)[0];
                        const otherCards = game.dungeon.splice(0, Math.min(3, game.dungeon.length));
                        game.room.push(weapon, ...otherCards);
                        showMessage('🔰 Beginner help: Weapon included!', 'success');
                    } else {
                        // No weapons left, draw normally
                        const drawnCards = game.dungeon.splice(0, Math.min(numToDraw, game.dungeon.length));
                        game.room.push(...drawnCards);
                    }
                } else {
                    const drawnCards = game.dungeon.splice(0, Math.min(numToDraw, game.dungeon.length));
                    game.room.push(...drawnCards);
                }
                
                game.lastActionWasAvoid = false;
                
                playSound('cardDraw');
                addLog(`Entered dungeon with ${game.room.length} cards`, 'info');
                showMessage(`You entered a dungeon with ${game.room.length} cards!`, 'info');
            }
            
            updateUI();
            btnDrawRoom.disabled = true;
            btnAvoidRoom.disabled = true;
        }

        function avoidRoom() {
            // Four Leaf Clover: Can avoid 2x in a row
            const hasClover = game.relics.some(r => r.id === 'clover');
            
            if (game.lastActionWasAvoid && !hasClover) {
                showMessage('❌ You cannot avoid 2 dungeons in a row!', 'warning');
                playSound('error');
                return;
            }
            
            // Leather Boots: Avoid costs 2 cards instead of 3
            const avoidCost = game.relics.some(r => r.id === 'leather_boots') ? 2 : 3;
            
            if (game.dungeon.length < avoidCost) {
                showMessage('Not enough cards to avoid!', 'warning');
                return;
            }

            const discarded = game.dungeon.splice(0, avoidCost);
            game.discardPile.push(...discarded);
            game.stats.roomsAvoided++;
            game.lastActionWasAvoid = true;
            
            playSound('avoid');
            addLog(`Avoided dungeon, ${avoidCost} cards discarded`, 'info');
            showMessage(`You avoided the dungeon! ${avoidCost} cards discarded.`, 'info');
            updateUI();

            if (game.dungeon.length === 0) {
                endGame('victory');
            }
        }

        // Undo System - Save game state before action
        function saveGameState() {
            game.lastGameState = {
                health: game.health,
                gold: game.gold,
                room: [...game.room],
                dungeon: [...game.dungeon],
                discardPile: [...game.discardPile],
                equippedWeapon: game.equippedWeapon ? {...game.equippedWeapon} : null,
                potionsUsed: game.potionsUsed,
                combo: game.combo,
                heldCard: game.heldCard ? (Array.isArray(game.heldCard) ? [...game.heldCard] : {...game.heldCard}) : null
            };
            game.undoAvailable = true;
        }
        
        function undoLastMove() {
            if (!game.undoAvailable || !game.lastGameState) {
                showMessage('❌ No move to undo!', 'warning');
                return;
            }
            
            // Restore game state
            game.health = game.lastGameState.health;
            game.gold = game.lastGameState.gold;
            game.room = [...game.lastGameState.room];
            game.dungeon = [...game.lastGameState.dungeon];
            game.discardPile = [...game.lastGameState.discardPile];
            game.equippedWeapon = game.lastGameState.equippedWeapon ? {...game.lastGameState.equippedWeapon} : null;
            game.potionsUsed = game.lastGameState.potionsUsed;
            game.combo = game.lastGameState.combo;
            game.heldCard = game.lastGameState.heldCard ? (Array.isArray(game.lastGameState.heldCard) ? [...game.lastGameState.heldCard] : {...game.lastGameState.heldCard}) : null;
            
            game.undoAvailable = false;
            game.lastGameState = null;
            
            showMessage('↩️ Move undone!', 'info');
            playSound('cardFlip');
            updateUI();
        }

        function handleCardClick(card, index) {
            if (game.gameOver) return;
            
            // Save state for undo (Easy/Normal only)
            if (game.difficulty === 'easy' || game.difficulty === 'normal') {
                saveGameState();
            }

            // Obliterate mode - remove ANY card permanently
            if (game.obliterateMode) {
                game.room.splice(index, 1);
                // Don't add to discard - it's obliterated!
                game.obliterateMode = false;
                showMessage('💥 Card OBLITERATED from existence!', 'success');
                playSound('special');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 40);
                
                // Track obliteration for achievement
                const saved = localStorage.getItem('scoundrel_lifetime_stats');
                let lifetimeStats = saved ? JSON.parse(saved) : {};
                lifetimeStats.cardsObliterated = (lifetimeStats.cardsObliterated || 0) + 1;
                localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
                
                updateUI();
                checkGameState();
                checkAchievements();
                return;
            }

            const cardType = getCardType(card);

            if (cardType === 'monster') handleMonster(card, index);
            else if (cardType === 'weapon') handleWeapon(card, index);
            else if (cardType === 'potion') handlePotion(card, index);
            else if (cardType === 'special') handleSpecial(card, index);
        }

        function getCardType(card) {
            if (card.special) return 'special';
            if (card.isBoss) return 'monster'; // Boss is a monster!
            if (card.suitName === 'clubs' || card.suitName === 'spades') return 'monster';
            if (card.suitName === 'diamonds') return 'weapon';
            if (card.suitName === 'hearts') return 'potion';
        }
        
        function handleSpecial(card, index) {
            game.room.splice(index, 1);
            game.discardPile.push(card);
            game.stats.specialsUsed++;
            
            playSound('special');
            addLog(`Used special: ${card.special.name}`, 'heal');
            card.special.effect();
            
            updateUI();
            checkGameState();
            checkAchievements();
        }

        function handleMonster(monster, index) {
            const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
            const baseWeapon = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
            
            // Calculate all bonuses using helpers (DRY principle)
            const berserkBonus = getBerserkBonus();
            const bloodlustBonus = getBloodlustBonus();
            const comboBonus = getComboBonus();
            
            // Power Gauntlet: +3 damage on first attack each room
            let gauntletBonus = 0;
            if (game.relics.some(r => r.id === 'gauntlet') && !game.firstAttackDone) {
                gauntletBonus = 3;
                game.firstAttackDone = true; // Mark first attack as done
            }
            
            // Thunder Gauntlet: 20% chance to deal double damage (flag only)
            let thunderCrit = false;
            if (game.relics.some(r => r.id === 'warrior') && Math.random() < 0.2) {
                thunderCrit = true;
            }
            
            // Critical Strike permanent unlock: 10% chance to deal 3x damage (flag only)
            let criticalHit = false;
            if (permanentUnlocks.criticalStrike && Math.random() < 0.1) {
                criticalHit = true;
            }
            
            // Add class ability bonuses
            let classBonus = 0;
            let rogueDoubleActive = false;
            let berserkerTripleActive = false;
            if (game.classAbilityActive && game.classAbilityCounter > 0) {
                if (game.playerClass === 'rogue') {
                    // Rogue: 2x damage on next attack
                    rogueDoubleActive = true;
                } else if (game.playerClass === 'dancer') {
                    // Dancer: +2 damage for next 2 monsters
                    classBonus = 2;
                } else if (game.playerClass === 'berserker' && game.rageStrikeActive) {
                    // Berserker: 3x damage on next attack
                    berserkerTripleActive = true;
                }
            }
            
            const totalWeapon = baseWeapon + powerBonus + berserkBonus + classBonus + bloodlustBonus + comboBonus + gauntletBonus;
            let effectiveWeapon = game.doubleDamage ? totalWeapon * 2 : totalWeapon;
            
            // Thunder Gauntlet: 20% chance to deal double damage
            if (thunderCrit) {
                effectiveWeapon *= 2;
            }
            
            // Critical Strike permanent unlock: 10% chance to deal 3x damage
            if (criticalHit) {
                effectiveWeapon *= 3;
            }
            
            // Apply Rogue Shadow Strike (2x damage)
            if (rogueDoubleActive) {
                effectiveWeapon *= 2;
            }
            
            // Apply Berserker Rage Strike (3x damage)
            if (berserkerTripleActive) {
                effectiveWeapon *= 3;
            }
            
            // Boss battle: reduce HP instead of instant kill
            if (monster.isBoss) {
                // SPECIAL CASE: Boss without weapon - boss attacks once and flees!
                if (!game.equippedWeapon) {
                    const bossDamage = monster.numValue;
                    game.health -= bossDamage;
                    game.stats.totalDamage += bossDamage;
                    
                    // Remove boss from room
                    game.room.splice(index, 1);
                    game.discardPile.push(monster);
                    
                    showMessage(`👹 ${monster.bossName || 'Boss'} attacked and fled! -${bossDamage} HP (NO REWARD!)`, 'danger');
                    playSound('damage');
                    screenShake();
                    createParticles(window.innerWidth / 2, window.innerWidth / 2, '#ff6b6b', 60);
                    
                    // Additional warning message
                    setTimeout(() => {
                        showMessage(`⚠️ No weapon equipped = No gold! Always bring a weapon to boss fights!`, 'warning');
                    }, 1500);
                    
                    // Break combo
                    resetCombo();
                    
                    updateUI();
                    checkGameState();
                    return;
                }
                
                monster.numValue -= effectiveWeapon;
                
                // Weapon durability for boss attacks
                if (game.equippedWeapon && game.equippedWeapon.durability < 999) {
                    game.equippedWeapon.durability--;
                    
                    if (game.equippedWeapon.durability <= 0) {
                        // Weapon broke!
                        showMessage(`💔 Your weapon broke!`, 'danger');
                        playSound('error');
                        game.discardPile.push(game.equippedWeapon);
                        game.equippedWeapon = null;
                        
                        // Check if room is now cleared after weapon broke
                        updateUI();
                        checkGameState();
                    }
                }
                
                if (monster.numValue <= 0) {
                    // Boss defeated!
                    game.stats.monstersSlain++;
                    game.stats.bossesKilled++;  // Track for Berserker unlock
                    
                    // Check if this is the final boss
                    if (monster.bossNumber === 99) {
                        game.finalBossDefeated = true;
                    }
                    
                    game.room.splice(index, 1);
                    game.discardPile.push(monster);
                    
                    // Boss gold based on difficulty
                    const bossGoldByDifficulty = {
                        easy: Math.floor(Math.random() * 16) + 25,    // 25-40 gold
                        normal: Math.floor(Math.random() * 11) + 20,  // 20-30 gold
                        hard: Math.floor(Math.random() * 11) + 15,    // 15-25 gold
                        endless: Math.floor(Math.random() * 11) + 20  // 20-30 gold
                    };
                    const bossGold = bossGoldByDifficulty[game.difficulty] || 20;
                    earnGold(bossGold);
                    
                    // Victory messages based on boss
                    const victoryMessages = [
                        '⚔️ The Knight falls silent. The curse is broken...',
                        '💉 The Warden collapses. The path ahead is now open.',
                        '✨ The Shadow dissolves into nothingness. Light returns.',
                        '🌟 The Abyss Keeper is no more. You are the legend now.'
                    ];
                    
                    const victoryMsg = victoryMessages[Math.min(monster.bossNumber - 1, victoryMessages.length - 1)];
                    
                    showMessage(`👹 ${monster.bossName} DEFEATED! +${bossGold} GOLD!`, 'success');
                    setTimeout(() => showMessage(victoryMsg, 'success'), 800);
                    
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 80);
                    playSound('special');
                    
                    // Increment combo for boss kill
                    game.combo++;
                    game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                    
                    updateUI();
                    checkGameState();
                    checkAchievements();
                    return;
                } else {
                    // Boss still alive - show HP remaining
                    showMessage(`⚔️ Hit boss for ${effectiveWeapon} damage! Boss HP: ${monster.numValue}`, 'info');
                    playSound('attack');
                    updateUI();
                    // DON'T return - let player continue in same room with boss
                    return;
                }
            }
            
            let damage = Math.max(0, monster.numValue - effectiveWeapon);
            
            // === RELIC DEFENSE SYSTEM (BEFORE DAMAGE CALCULATION) ===
            
            // Mirror Shard: Reflect 2 damage once per room (BEFORE taking damage)
            const mirrorShardRelic = game.relics.find(r => r.id === 'mirror_shard');
            if (mirrorShardRelic && !mirrorShardRelic.usedThisRoom && damage > 0) {
                mirrorShardRelic.usedThisRoom = true;
                const reflectDamage = 2;
                monster.numValue -= reflectDamage;
                showMessage(`🪞 Mirror Shard reflected ${reflectDamage} damage!`, 'info');
                
                // Check if reflection killed the monster
                if (monster.numValue <= 0) {
                    game.room.splice(index, 1);
                    game.discardPile.push(monster);
                    game.stats.monstersSlain++;
                    game.combo++;
                    game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                    
                    // Monster Tooth bonus
                    if (game.relics.some(r => r.id === 'tooth')) {
                        earnGold(1);
                    }
                    
                    addLog(`Mirror Shard defeated ${monster.value}${monster.suit}!`, 'success');
                    showMessage('🪞 Mirror Shard killed the monster!', 'success');
                    playSound('special');
                    updateUI();
                    checkGameState();
                    return;
                }
            }
            
            // Thorns Armor permanent unlock: Reflect 2 damage (doesn't prevent damage to player)
            if (permanentUnlocks.thornsArmor && damage > 0) {
                monster.numValue -= 2;
                showMessage('🌵 Thorns Armor reflected 2 damage!', 'info');
                
                // Check if thorns killed the monster
                if (monster.numValue <= 0) {
                    game.room.splice(index, 1);
                    game.discardPile.push(monster);
                    game.stats.monstersSlain++;
                    
                    // Still take damage but monster is dead
                    game.health -= damage;
                    game.stats.totalDamage += damage;
                    showDamageNumber(damage, 'damage');
                    
                    // Monster Tooth bonus
                    if (game.relics.some(r => r.id === 'tooth')) {
                        earnGold(1);
                    }
                    
                    addLog(`Thorns Armor defeated ${monster.value}${monster.suit}!`, 'success');
                    showMessage('🌵 Thorns Armor killed the monster (after taking damage)!', 'warning');
                    resetCombo();
                    updateUI();
                    checkGameState();
                    return;
                }
            }
            
            // Weak Thorns: Reflect 1 damage (doesn't prevent damage to player) (stacks with thornsArmor)
            if (game.relics.some(r => r.id === 'weak_thorns') && damage > 0) {
                monster.numValue -= 1;
                showMessage('🌿 Weak Thorns reflected 1 damage!', 'info');
                
                // Check if thorns killed the monster
                if (monster.numValue <= 0) {
                    game.room.splice(index, 1);
                    game.discardPile.push(monster);
                    game.stats.monstersSlain++;
                    
                    // Still take damage but monster is dead
                    game.health -= damage;
                    game.stats.totalDamage += damage;
                    showDamageNumber(damage, 'damage');
                    
                    // Monster Tooth bonus
                    if (game.relics.some(r => r.id === 'tooth')) {
                        earnGold(1);
                    }
                    
                    addLog(`Weak Thorns defeated ${monster.value}${monster.suit}!`, 'success');
                    showMessage('🌿 Weak Thorns killed the monster (after taking damage)!', 'warning');
                    resetCombo();
                    updateUI();
                    checkGameState();
                    return;
                }
            }
            
            // Iron Armor: Reduce ALL damage by 1 (permanent effect)
            if (game.relics.some(r => r.id === 'armor') && damage > 0) {
                const originalDamage = damage;
                damage = Math.max(0, damage - 1);
                if (damage < originalDamage) {
                    if (damage === 0) {
                        showMessage(`🦾 Iron Armor absorbed all ${originalDamage} damage!`, 'success');
                    } else {
                        showMessage(`🦾 Iron Armor reduced damage! (${originalDamage} → ${damage})`, 'info');
                    }
                }
            }
            
            // Stone Relic - Reduce first damage by 1 each room (stacks with armor)
            let stoneRelic = game.relics.find(r => r.id === 'stone' && !r.stoneUsed);
            if (stoneRelic && damage > 0) {
                stoneRelic.stoneUsed = true;
                const originalDamage = damage;
                damage = Math.max(0, damage - 1);
                if (damage === 0) {
                    showMessage(`🪨 Stone absorbed all ${originalDamage} damage!`, 'success');
                } else {
                    showMessage(`🪨 Stone reduced damage by 1! (${originalDamage} → ${damage})`, 'info');
                }
            }
            
            // Consume berserk stack
            if (game.berserkStacks > 0 && berserkBonus > 0) {
                game.berserkStacks--;
                showMessage(`🔥 Berserk +5 damage! (${game.berserkStacks} left)`, 'info');
            }
            
            playSound('attack');
            
            // Dodge (dodgeMaster: avoids 2 attacks instead of 1)
            if (game.dodgeActive && damage > 0) {
                // dodgeMaster unlock: dodge lasts 2 attacks
                if (!permanentUnlocks.dodgeMaster) {
                    game.dodgeActive = false;
                } else {
                    // Track dodge counter for dodgeMaster
                    if (!game.dodgeCounter) game.dodgeCounter = 2;
                    game.dodgeCounter--;
                    if (game.dodgeCounter <= 0) {
                        game.dodgeActive = false;
                        game.dodgeCounter = 0;
                    }
                }
                playSound('special');
                addLog(`Dodged attack from ${monster.value}${monster.suit}!`, 'heal');
                showMessage('🛡️ Dodged! No damage!', 'success');
            }
            // Priest Divine Blessing - 15% chance to dodge
            else if (damage > 0 && game.classData && game.classData.passive.divineBlessing && Math.random() < 0.15) {
                playSound('special');
                addLog(`Divine Blessing! Dodged attack from ${monster.value}${monster.suit}!`, 'heal');
                showMessage('🕊️ Divine Blessing! No damage!', 'success');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 40);
                game.combo++;
                game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            } 
            // Mirror Shield - Reflect damage
            else if (damage > 0 && game.mirrorShield > 0) {
                const reflected = Math.min(damage, game.mirrorShield);
                game.mirrorShield -= reflected;
                const remaining = damage - reflected;
                
                if (remaining > 0) {
                    game.health -= remaining;
                    game.stats.totalDamage += remaining;
                    showDamageNumber(remaining, 'damage');
                    playSound('damage');
                }
                
                showMessage(`🪞 Mirror reflected ${reflected} damage! Shield: ${game.mirrorShield}`, 'success');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
                
                if (remaining <= 0) {
                    game.combo++;
                    game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                } else {
                    resetCombo();
                }
            }
            // Cloak Relic - First damage each room is 0 (PRIORITY)
            else if (damage > 0) {
                let cloakRelic = game.relics.find(r => r.id === 'cloak' && !r.usedThisRoom);
                if (cloakRelic) {
                    cloakRelic.usedThisRoom = true;
                    showMessage(`🧥 Cloak protected you! No damage this turn!`, 'success');
                    playSound('special');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
                    // Perfect dodge - keep combo!
                    game.combo++;
                    game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                    if (game.combo >= 2) {
                        showCombo(game.combo);
                    }
                } else {
                    // Tank Relic Shield - Reduces damage by 1
                    let shieldRelic = game.relics.find(r => r.id === 'tank' && !r.shieldUsed);
                    if (shieldRelic) {
                        shieldRelic.shieldUsed = true;
                        const actualDamage = Math.max(0, damage - 1);
                        showMessage(`🛡️ Shield absorbed 1 damage! Received ${actualDamage}.`, 'success');
                        if (actualDamage > 0) {
                            game.health -= actualDamage;
                            game.stats.totalDamage += actualDamage;
                            showDamageNumber(actualDamage, 'damage');
                            playSound('damage');
                            resetCombo();
                        } else {
                            // Shield absorbed all damage - keep combo
                            game.combo++;
                            game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                        }
                    } else {
                        // Normal Damage
                        game.health -= damage;
                        game.stats.totalDamage += damage;
                        resetCombo(); // Reset combo
                        showDamageNumber(damage, 'damage');
                        playSound('damage');
                        screenShake();
                        addLog(`Took ${damage} damage from ${monster.value}${monster.suit}`, 'damage');
                        showMessage(`⚔️ Took ${damage} damage!`, 'danger');
                    }
                }
            } 
            // Perfect Kill
            else {
                game.combo++;
                game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
                if (game.combo >= 2) {
                    showCombo(game.combo);
                    playSound('combo');
                }
                
                // Lifesteal (relic + permanent unlock)
                let lifesteal = game.relics.filter(r => r.id === 'vampire').length * 2;
                
                // Permanent unlock: lifeSteal (1 HP on perfect kill)
                if (permanentUnlocks.lifeSteal) {
                    lifesteal += 1;
                }
                
                if (lifesteal > 0) {
                    game.health = Math.min(game.maxHealth, game.health + lifesteal);
                    showMessage(`🧛 +${lifesteal} HP from Vampirism!`, 'success');
                }
                
                // Monster Tooth: +1 gold per monster
                if (game.relics.some(r => r.id === 'tooth')) {
                    earnGold(1);
                }
                
                addLog(`Defeated ${monster.value}${monster.suit}! (Combo: ${game.combo})`, 'info');
                if (criticalHit) {
                    showMessage(`💥 MEGA CRITICAL! ${game.combo}x COMBO!`, 'success');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 50);
                } else if (thunderCrit) {
                    showMessage(`⚡ CRITICAL HIT! ${game.combo}x COMBO!`, 'success');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 30);
                } else {
                    showMessage(`⚔️ Perfect kill! ${game.combo}x COMBO!`, 'success');
                }
            }
            
            if (game.doubleDamage) game.doubleDamage = false;
            
            // Weapon durability system
            if (game.equippedWeapon && game.equippedWeapon.durability < 999) {
                game.equippedWeapon.durability--;
                
                if (game.equippedWeapon.durability <= 0) {
                    // Weapon broke!
                    showMessage(`💔 Your weapon broke!`, 'danger');
                    playSound('error');
                    game.discardPile.push(game.equippedWeapon);
                    game.equippedWeapon = null;
                } else {
                    // Show remaining durability
                    const emoji = game.equippedWeapon.durability === 1 ? '⚠️' : '⚔️';
                    addLog(`${emoji} Weapon: ${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability} uses left`, 'info');
                }
            }
            
            // Decrement class ability counter
            if (game.classAbilityActive && game.classAbilityCounter > 0) {
                game.classAbilityCounter--;
                if (game.classAbilityCounter === 0) {
                    game.classAbilityActive = false;
                    game.rageStrikeActive = false; // Reset Berserker flag
                    showMessage('✨ Class ability buff expired!', 'info');
                }
            }
            
            // Rogue Shadow Strike: don't break combo
            const rogueComboSafe = (game.playerClass === 'rogue' && rogueDoubleActive);
            if (rogueComboSafe && damage > 0) {
                // Override combo break for Rogue ability
                game.combo++;
                game.stats.maxCombo = Math.max(game.stats.maxCombo, game.combo);
            }
            
            game.stats.monstersSlain++;
            game.room.splice(index, 1);
            game.discardPile.push(monster);
            
            // Monster gold (difficulty-based, with boss bonus)
            if (monster.isBoss) {
                // Boss gold rewards (much more generous!)
                const bossGoldByDifficulty = {
                    easy: Math.floor(Math.random() * 16) + 25,    // 25-40 gold
                    normal: Math.floor(Math.random() * 11) + 20,  // 20-30 gold
                    hard: Math.floor(Math.random() * 11) + 15,    // 15-25 gold
                    endless: Math.floor(Math.random() * 11) + 20  // 20-30 gold
                };
                const bossGold = bossGoldByDifficulty[game.difficulty] || 20;
                earnGold(bossGold);
                showMessage(`👹 BOSS DEFEATED! +${bossGold} gold!`, 'success');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#d4af37', 50);
            } else {
                // Normal monster gold
                const goldByDifficulty = {
                    easy: Math.floor(Math.random() * 4) + 3,    // 3-6 gold
                    normal: Math.floor(Math.random() * 3) + 2,  // 2-4 gold
                    hard: Math.floor(Math.random() * 3) + 2,    // 2-4 gold (buffed from 1-2)
                    endless: Math.floor(Math.random() * 3) + 2  // 2-4 gold
                };
                const baseGold = goldByDifficulty[game.difficulty] || 2;
                earnGold(baseGold);
            }
            
            // Revive
            if (game.health <= 0) {
                const phoenix = game.relics.find(r => r.id === 'phoenix' && !r.used);
                if (phoenix) {
                    phoenix.used = true;
                    game.health = 10;
                    showMessage('🐦 Phoenix Feather activated! Revived with 10 HP!', 'success');
                    playSound('special');
                    updateRelicsDisplay();
                }
            }
            
            updateRunningScore(); // Update score
            updateUI();
            checkGameState();
            checkAchievements();
        }

        function handleWeapon(weapon, index) {
            if (game.equippedWeapon) {
                game.discardPile.push(game.equippedWeapon);
            }
            
            // BREAKING COMBO: Equiping weapon breaks combo (strategic choice!)
            if (game.combo > 0) {
                const brokenCombo = game.combo;
                resetCombo();
                if (brokenCombo >= 3) {
                    showMessage(`💔 ${brokenCombo}x combo broken! (equipped weapon)`, 'warning');
                }
            }
            
            game.equippedWeapon = weapon;
            game.room.splice(index, 1);
            game.stats.weaponsEquipped++;
            
            // Set durability based on difficulty
            const durabilityMap = { easy: 3, normal: 2, hard: 1, endless: 2 };
            game.equippedWeapon.maxDurability = durabilityMap[game.difficulty] || 2;
            
            // Apply Knight bonus (+1 durability)
            if (game.classData && game.classData.passive.weaponDurabilityBonus) {
                game.equippedWeapon.maxDurability += game.classData.passive.weaponDurabilityBonus;
            }
            
            // Apply permanent unlock bonus (+1 durability)
            if (permanentUnlocks.durablePlus) {
                game.equippedWeapon.maxDurability += 1;
            }
            
            // Gloves relic: +1 durability
            if (game.relics.some(r => r.id === 'gloves')) {
                game.equippedWeapon.maxDurability += 1;
            }
            
            game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
            
            // Master Smith: +1 damage when equipping weapon
            if (game.relics.some(r => r.id === 'master_smith')) {
                game.equippedWeapon.numValue += 1;
                showMessage('🔨 Master Smith enhanced your weapon (+1 damage)!', 'success');
            }
            
            // Check for Durable Weapons relic
            if (game.relics.some(r => r.id === 'durable_weapons')) {
                game.equippedWeapon.maxDurability = 999; // Infinite durability
                game.equippedWeapon.durability = 999;
            }
            
            playSound('equip');
            const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
            addLog(`Equipped ${weapon.value}${weapon.suit}!`, 'equip');
            showMessage(`⚔️ Equipped weapon with value ${weapon.numValue + powerBonus}! (${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability} uses)`, 'success');
            
            updateUI();
            checkGameState();
            checkAchievements();
        }

        function handlePotion(potion, index) {
            // Max potions per dungeon (Herb relic: 2x instead of 1x)
            let maxPotionsPerDungeon = 1;
            if (game.relics.some(r => r.id === 'herb')) maxPotionsPerDungeon = 2;
            
            // Dancer can use 2 potions per ROOM (different from dungeon limit)
            const maxPotionsPerRoom = (game.classData && game.classData.passive.maxPotionsPerRoom) || 1;
            
            // Check if potion limit reached (per dungeon)
            if (game.potionsUsed >= maxPotionsPerDungeon) {
                showMessage(`Only ${maxPotionsPerDungeon} potion(s) per dungeon! Discarding...`, 'warning');
                game.room.splice(index, 1);
                game.discardPile.push(potion);
                addLog(`Discarded potion ${potion.value}${potion.suit}`, 'info');
                updateUI();
                checkGameState();
                return;
            }

            // POTIONS DO NOT BREAK COMBO! (Strategic choice - different from weapons)
            // This allows for healing while maintaining combo chains
            
            const healBonus = getRelicBonus('healBonus');
            // Add class bonus (Dancer: +3 HP)
            const classHealBonus = (game.classData && game.classData.passive.potionHealBonus) || 0;
            const heal = potion.numValue + healBonus + classHealBonus;
            
            const oldHealth = game.health;
            game.health = Math.min(game.health + heal, game.maxHealth);
            const actualHeal = game.health - oldHealth;
            
            if (actualHeal > 0) {
                game.potionsUsed++;
                game.stats.potionsUsed++;
                game.stats.totalHealing += actualHeal;
                showDamageNumber(actualHeal, 'heal');
                playSound('heal');
                addLog(`Used ${potion.value}${potion.suit}, healed ${actualHeal} HP`, 'heal');
                showMessage(`💚 Healed ${actualHeal} HP!`, 'success');
            } else {
                 showMessage(`💚 HP is full!`, 'info');
            }
            
            game.room.splice(index, 1);
            game.discardPile.push(potion);
            updateUI();
            checkGameState();
            checkAchievements();
        }

        function checkGameState() {
            // Room Cleared?
            if (game.room.length === 0 && !game.gameOver) {
                game.potionsUsed = 0;
                game.stats.roomsCleared++;
                
                // Show combo message if active (combo now persists between rooms!)
                if (game.combo >= 3) {
                    showMessage(`🔥 ${game.combo}x COMBO! DUNGEON CLEAR! Keep it going!`, 'success');
                    createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 40);
                }
                
                // COMBO NO LONGER RESETS - it persists between chambers!
                // (Only breaks when: taking damage, or equipping a weapon)
                game.undoAvailable = false; // Reset undo for new room
                game.lastGameState = null;
                game.eventTriggeredThisRoom = false; // Reset event flag for new room
                
                // Decrement class ability cooldown
                if (game.classAbilityCooldown > 0) {
                    game.classAbilityCooldown--;
                    if (game.classAbilityCooldown === 0) {
                        showMessage('✨ Class ability ready!', 'success');
                    }
                }
                
                playSound('roomClear');
                addLog(`Dungeon cleared! Total: ${game.stats.roomsCleared}`, 'info');
                
                // Victory particles!
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 40);
                setTimeout(() => createParticles(window.innerWidth / 2 + 100, window.innerHeight / 2, '#6bcf7f', 30), 150);
                setTimeout(() => createParticles(window.innerWidth / 2 - 100, window.innerHeight / 2, '#4ecdc4', 30), 300);
                
                btnDrawRoom.disabled = false;
                btnAvoidRoom.disabled = game.lastActionWasAvoid;
                
                // Room Clear Relics (optimized single iteration)
                let goldPerRoom = 0;
                let passiveHeal = 0;
                
                // Reset per-room flags
                game.firstAttackDone = false; // Power Gauntlet reset
                
                game.relics.forEach(r => {
                    // Reset per-room relic flags
                    if (r.id === 'tank') r.shieldUsed = false;
                    if (r.id === 'cloak') r.usedThisRoom = false;
                    if (r.id === 'stone') r.stoneUsed = false;
                    if (r.id === 'mirror_shard') r.usedThisRoom = false;
                    
                    // Gold bonuses
                    if (r.id === 'coin_pouch') goldPerRoom += 2;
                    if (r.id === 'greedy') goldPerRoom += 3;
                    
                    // Passive healing (generic system based on effect)
                    if (r.effect === 'passive_heal') {
                        // Standard passive healing: +1 HP per room (meditation, healing_study)
                        passiveHeal += 1;
                    }
                    if (r.id === 'bandage') passiveHeal += 0.5; // Bandage gives additional 0.5
                });
                
                // Rogue: +1 gold per room
                if (game.classData && game.classData.passive.bonusGoldPerRoom) {
                    goldPerRoom += game.classData.passive.bonusGoldPerRoom;
                }
                
                if (goldPerRoom > 0) earnGold(goldPerRoom);
                if (passiveHeal > 0) game.health = Math.min(game.maxHealth, game.health + Math.floor(passiveHeal));
                
                // Reset Mirror Shield at room clear (only for current dungeon)
                game.mirrorShield = 0;
                
                // Reset weapon durability at room clear (Master Smith relic)
                if (game.equippedWeapon && game.relics.some(r => r.id === 'master_smith')) {
                    game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                    showMessage('🔨 Master Smith repaired your weapon!', 'success');
                }
                
                // Room clear bonus (difficulty-based)
                const roomBonusByDifficulty = {
                    easy: Math.floor(Math.random() * 4) + 5,    // 5-8 gold
                    normal: Math.floor(Math.random() * 3) + 4,  // 4-6 gold
                    hard: Math.floor(Math.random() * 3) + 2,    // 2-4 gold
                    endless: Math.floor(Math.random() * 3) + 4  // 4-6 gold
                };
                const bonusGold = roomBonusByDifficulty[game.difficulty] || 3;
                earnGold(bonusGold);
                
                updateRunningScore(); // Update score
                updateUI(); // Update stats
                checkAchievements();

                // Event Chance (difficulty-based)
                // Only trigger if no event was triggered this room yet
                const eventChanceByDifficulty = {
                    easy: 0.40,      // 40% chance
                    normal: 0.30,    // 30% chance
                    hard: 0.20,      // 20% chance
                    endless: 0.25    // 25% chance
                };
                let eventChance = eventChanceByDifficulty[game.difficulty] || 0.30;
                
                // Dancer: +15% event chance (luck passive)
                if (game.classData && game.classData.passive.eventChanceBonus) {
                    eventChance += (game.classData.passive.eventChanceBonus / 100);
                }
                
                // Event Luck unlock: +50% event chance
                if (permanentUnlocks.eventLuck) {
                    eventChance += 0.50;
                }
                
                // Compass relic: +10% event chance
                if (game.relics.some(r => r.id === 'compass')) {
                    eventChance += 0.10;
                }
                
                setTimeout(() => {
                    if (!game.gameOver && !game.eventTriggeredThisRoom && Math.random() < eventChance) {
                        triggerRandomEvent();
                    }
                }, 800);
            }

            if (game.health <= 0) {
                endGame('death');
            }

            // Victory condition: deck empty and room empty (non-endless)
            if (game.dungeon.length === 0 && game.room.length === 0 && game.difficulty !== 'endless') {
                // Check if final boss already defeated
                if (!game.finalBossDefeated) {
                    spawnFinalBoss();
                } else {
                    endGame('victory');
                }
            }
            
            // ENDLESS MODE: Auto-reload deck if both dungeon and room are empty
            if (game.dungeon.length === 0 && game.room.length === 0 && game.difficulty === 'endless' && !game.gameOver) {
                // Progressive difficulty scaling
                game.endlessLevel = (game.endlessLevel || 0) + 1;
                const difficultyScaling = Math.min(game.endlessLevel * 0.15, 2); // Max 2x scaling
                
                game.dungeon = createDeck();
                
                // Make monsters progressively harder
                game.dungeon.forEach(card => {
                    if (card.suitName === 'clubs' || card.suitName === 'spades') {
                        card.numValue = Math.floor(card.numValue * (1 + difficultyScaling));
                    }
                });
                
                showMessage(`♾️ ENDLESS MODE: Deck ${game.endlessLevel} loaded! Monsters +${Math.floor(difficultyScaling * 100)}% HP!`, 'warning');
                playSound('special');
                createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 50);
                
                // Automatically draw first room from new deck
                setTimeout(() => {
                    if (!game.gameOver) {
                        drawRoom();
                    }
                }, 1000);
            }
        }

        function endGame(reason, gaveUp = false) {
            if (game.gameStartTime === 0 || game.gameOver) return;
            
            game.gameOver = true;
            if (game.gameTimerInterval) clearInterval(game.gameTimerInterval); // Stop clock
            
            // Check if this is the first death or every 5th death (show encouraging modal)
            const lifetimeStats = storage.get('scoundrel_lifetime_stats', {});
            const totalDeaths = (lifetimeStats.deaths || 0) + 1; // Current death count
            const isFirstDeath = reason === 'death' && !gaveUp && totalDeaths === 1;
            const isEveryFifthDeath = reason === 'death' && !gaveUp && totalDeaths >= 5 && totalDeaths % 5 === 0;
            
            // Switch music based on outcome
            if (reason === 'victory') {
                music.switchContext('victory');
            } else {
                music.switchContext('defeat');
            }
            
            const gameTime = Math.floor((Date.now() - game.gameStartTime) / 1000);
            let title, message, score, scoreLabel, isVictory = false;

            if (reason === 'death') {
                title = '💀 DEFEAT';
                const deathNarratives = [
                    'The darkness claimed another soul...',
                    'Your tale ends here, in the depths.',
                    'The dungeon has taken its toll.',
                    'Another scoundrel falls to the abyss.'
                ];
                const randomDeath = deathNarratives[Math.floor(Math.random() * deathNarratives.length)];
                message = gaveUp ? 'You gave up the run.' : randomDeath;
                score = gaveUp ? 0 : calculateDeathScore(); // Score is 0 if gave up
                scoreLabel = 'Final Score:';
                playSound('defeat');
            } else if (reason === 'victory') {
                isVictory = true;
                title = '🏆 VICTORY';
                const victoryNarratives = [
                    'Against all odds, you emerge victorious!',
                    'The dungeon is conquered. You are the legend.',
                    'Light pierces through the darkness. You survived.',
                    'Your name will echo through these halls forever.'
                ];
                const randomVictory = victoryNarratives[Math.floor(Math.random() * victoryNarratives.length)];
                message = randomVictory;
                score = calculateWinScore();
                scoreLabel = 'Final Score:';
                playSound('victory');
                
                // Epic victory particle explosion!
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        const x = window.innerWidth / 2 + (Math.random() - 0.5) * 400;
                        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 300;
                        const colors = ['#ffd700', '#6bcf7f', '#4ecdc4', '#ff6b6b', '#ffd93d'];
                        createParticles(x, y, colors[i % colors.length], 50);
                    }, i * 200);
                }
                
                game.stats.gamesWon = 1;
                permanentStats.gamesWon = (permanentStats.gamesWon || 0) + 1;
                if (game.difficulty === 'hard') {
                    game.stats.hardWins = 1;
                    permanentStats.hardWins = (permanentStats.hardWins || 0) + 1;
                }
                if (permanentStats.fastestWin === 0 || gameTime < permanentStats.fastestWin) {
                    permanentStats.fastestWin = gameTime;
                }
                
                // Check special victory achievements
                if (gameTime < 60) { // Speedrun: <1 minute
                    unlockAchievement('speedrun');
                }
                if (game.health === 1) { // Iron Will: Win with exactly 1 HP
                    unlockAchievement('iron_will');
                }
                if (game.stats.roomsCleared >= 10 && game.stats.maxCombo >= 10) { // Perfect Run: 10 rooms with 10x combo
                    unlockAchievement('perfect_run');
                }
                
                setTimeout(() => showDamageNumber(score, 'score'), 500);
            }
            
            // Update permanent stats
            updateLifetimeStats(reason, gaveUp); // Save stats
            checkAchievements(); // Check one last time
            savePermanentStats(); // Save progress
            saveUnlocks(); // Save unlocks

            showGameOver(title, message, score, scoreLabel, isVictory, gameTime, reason, gaveUp);
        }
        
        // Ported Score Functions
        function calculateWinScore() {
            const timeInSeconds = Math.max(1, Math.floor((Date.now() - game.gameStartTime) / 1000));
            
            let difficultyMultiplier = 1;
            if (game.difficulty === 'normal') difficultyMultiplier = 1.5;
            if (game.difficulty === 'hard') difficultyMultiplier = 2.5;

            const baseScore = 1000; // Win bonus
            const healthBonus = game.health * 20;
            const goldBonus = game.totalGoldEarned * 5;
            const comboBonus = game.stats.maxCombo * 10;
            const monsterBonus = game.stats.monstersSlain * 2;
            
            // NEW BONUSES/PENALTIES
            const speedrunBonus = timeInSeconds < 60 ? 1000 : (timeInSeconds < 300 ? 500 : 0); // <1min: +1000, <5min: +500
            const perfectRunBonus = game.stats.totalDamage === 0 ? 1000 : 0; // No damage taken
            const shopPenalty = (game.stats.shopsVisited || 0) * 50; // -50 per shop visit
            
            const timePenalty = timeInSeconds * 2;
            
            const totalScore = Math.floor(
                ((baseScore + healthBonus + goldBonus + comboBonus + monsterBonus + speedrunBonus + perfectRunBonus) - timePenalty - shopPenalty) * difficultyMultiplier
            );
            
            return Math.max(1, totalScore); // Score must be at least 1
        }
        
        function calculateDeathScore() {
            // Original logic from Letterboard
            const monstersInDiscard = game.discardPile.filter(c => 
                c.suitName === 'clubs' || c.suitName === 'spades'
            );
            const totalValue = monstersInDiscard.reduce((sum, card) => sum + card.numValue, 0);
            return game.health - totalValue; // Will be a negative number
        }

        function showGameOver(title, message, score, scoreLabel, isVictory, gameTime, reason, gaveUp) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active game-over'; // Use modal class
            
            const submitButtonHTML = isVictory ? 
                `<button class="btn btn-success" id="btnSubmitScore">🚀 Submit Score</button>` : '';
            
            // Score Breakdown
            let scoreBreakdownHTML = '';
            if (isVictory) {
                const timeInSeconds = Math.max(1, gameTime);
                let difficultyMultiplier = 1;
                if (game.difficulty === 'normal') difficultyMultiplier = 1.5;
                if (game.difficulty === 'hard') difficultyMultiplier = 2.5;

                const baseScore = 1000;
                const healthBonus = game.health * 20;
                const goldBonus = game.totalGoldEarned * 5;
                const comboBonus = game.stats.maxCombo * 10;
                const monsterBonus = game.stats.monstersSlain * 2;
                
                // NEW BONUSES/PENALTIES
                const speedrunBonus = timeInSeconds < 60 ? 1000 : (timeInSeconds < 300 ? 500 : 0); // <1min: +1000, <5min: +500
                const perfectRunBonus = game.stats.totalDamage === 0 ? 1000 : 0;
                const shopPenalty = (game.stats.shopsVisited || 0) * 50;
                
                const timePenalty = timeInSeconds * 2;
                const subTotal = (baseScore + healthBonus + goldBonus + comboBonus + monsterBonus + speedrunBonus + perfectRunBonus) - timePenalty - shopPenalty;

                let bonusesHTML = '';
                if (speedrunBonus > 0) bonusesHTML += `<p style="color: #6bcf7f;">⚡ Speedrun Bonus (${Math.floor(timeInSeconds/60)}m${timeInSeconds%60}s): +${speedrunBonus}</p>`;
                if (perfectRunBonus > 0) bonusesHTML += `<p style="color: #ffd700;">🏆 Perfect Run (No Damage): +${perfectRunBonus}</p>`;
                if (shopPenalty > 0) bonusesHTML += `<p style="color: #ff6b6b;">🏺 Shop Penalty (${game.stats.shopsVisited || 0} visits): -${shopPenalty}</p>`;

                scoreBreakdownHTML = `
                    <div class="game-over-stats" style="background: rgba(0,0,0,0.4); border: 1px solid #ffd700; margin-bottom: 15px; text-align: left;">
                        <p style="color: #ffd700; font-weight: bold; font-size: 1.1em; margin-bottom: 10px;">📊 Score Breakdown:</p>
                        <p>🎯 Win Bonus: +1000</p>
                        <p>❤️ Health Bonus (${game.health} HP): +${healthBonus}</p>
                        <p>💰 Gold Bonus (${game.totalGoldEarned} 🪙): +${goldBonus}</p>
                        <p>🔥 Combo Bonus (${game.stats.maxCombo}x): +${comboBonus}</p>
                        <p>⚔️ Monster Bonus (${game.stats.monstersSlain}): +${monsterBonus}</p>
                        ${bonusesHTML}
                        <p style="color: #ff6b6b;">⏱️ Time Penalty (${Math.floor(timeInSeconds/60)}m${timeInSeconds%60}s): -${timePenalty}</p>
                        <hr style="border-color: rgba(255,255,255,0.2); margin: 5px 0;">
                        <p>Subtotal: ${subTotal} x ${difficultyMultiplier}x (${game.difficulty.toUpperCase()}) = <strong style="color: #ffd700; font-size: 1.2em;">${score}</strong></p>
                    </div>
                `;
            }
            
            overlay.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <h1>${title}</h1>
                    <p>${message}</p>
                    ${scoreBreakdownHTML}
                    <p class="game-over-score">${scoreLabel} ${score}</p>
                    <div class="game-over-stats">
                        <p>📊 <strong>Run Statistics:</strong></p>
                        <p>⏱️ Time: ${Math.floor(gameTime/60)}m ${(gameTime%60).toString().padStart(2, '0')}s</p>
                        <p>⚔️ Monsters Slain: ${game.stats.monstersSlain}</p>
                        <p>🗡️ Weapons Used: ${game.stats.weaponsEquipped}</p>
                        <p>💔 Damage Taken: ${game.stats.totalDamage}</p>
                        <p>💚 Healing Received: ${game.stats.totalHealing}</p>
                        <p>🏰 Rooms Cleared: ${game.stats.roomsCleared}</p>
                        <p>🔥 Max Combo: ${game.stats.maxCombo}x</p>
                        <p>🪙 Gold Earned: ${game.totalGoldEarned}</p>
                    </div>
                    <div class="game-over-controls">
                        <button class="btn btn-primary" id="btnPlayAgain">🔄 Play Again</button>
                        ${submitButtonHTML}
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            document.getElementById('btnPlayAgain').onclick = () => {
                overlay.remove();
                btnStartGameModal.disabled = false; // Reset button
                
                // Check if this is first death or every 5th death (stored before modal appeared)
                const lifetimeStats = storage.get('scoundrel_lifetime_stats', {});
                const totalDeaths = lifetimeStats.deaths || 0;
                const shouldShowModal = reason === 'death' && !gaveUp && (totalDeaths === 1 || (totalDeaths >= 5 && totalDeaths % 5 === 0));
                
                if (shouldShowModal) {
                    // Show encouraging modal AFTER game over modal is closed
                    const isFirstDeath = totalDeaths === 1;
                    showEncouragingModal(isFirstDeath, () => {
                        // Callback: Return to menu AFTER modal is closed
                        music.switchContext('menu');
                        showWelcomeScreen();
                    });
                } else {
                    // No modal needed, go straight to menu
                    music.switchContext('menu');
                    showWelcomeScreen();
                }
            };
            
            if (isVictory) {
                const btnSubmitScore = document.getElementById('btnSubmitScore');
                
                // AUTO-SUBMIT: Enviar automaticamente sem input do player
                (async () => {
                    const btn = btnSubmitScore;
                    setButtonLoading(btn, true);
                    btn.textContent = '📤 Sending...';
                    hapticFeedback('medium');
                    
                    try {
                        await submitScoreToLeaderboard(score, gameTime);
                        btn.textContent = '✅ Score Submitted!';
                        btn.style.background = 'linear-gradient(180deg, #6bcf7f 0%, #4ecdc4 100%)';
                        btn.disabled = true; // Prevent re-submission
                        hapticFeedback('success');
                        pulseElement(btn, '#6bcf7f');
                        console.log(`✅ Score ${score} auto-submitted to leaderboard!`);
                    } catch (err) {
                        setButtonLoading(btn, false);
                        btn.textContent = '❌ Submission Failed';
                        btn.style.background = 'linear-gradient(180deg, #ff6b6b 0%, #d63031 100%)';
                        hapticFeedback('error');
                        shakeElement(btn);
                        console.error("Score submission error:", err);
                        
                        // Allow manual retry on error
                        btn.disabled = false;
                        btn.textContent = '🔄 Retry Submit';
                        btn.onclick = async () => {
                            setButtonLoading(btn, true);
                            try {
                                await submitScoreToLeaderboard(score, gameTime);
                                btn.textContent = '✅ Score Submitted!';
                                btn.style.background = 'linear-gradient(180deg, #6bcf7f 0%, #4ecdc4 100%)';
                                btn.disabled = true;
                                hapticFeedback('success');
                            } catch (retryErr) {
                                setButtonLoading(btn, false);
                                btn.textContent = '❌ Failed Again';
                                console.error("Retry failed:", retryErr);
                            }
                        };
                    }
                })();
            }
        }
        
        function spawnFinalBoss() {
            // Spawn final boss based on difficulty
            const difficultyHP = {
                easy: 20,
                normal: 30,
                hard: 40
            };
            
            const finalBossHP = difficultyHP[game.difficulty] || 30;
            
            const finalBoss = {
                suit: '👹',
                value: '👹',
                numValue: finalBossHP,
                maxHP: finalBossHP,
                isBoss: true,
                bossNumber: 99,  // Special marker for final boss
                bossName: 'The Dungeon Lord',
                bossFlavor: 'The master of this cursed place. Defeat them to claim your victory!'
            };
            
            game.room = [finalBoss];
            
            playSound('special');
            showMessage('👑 FINAL BOSS: The Dungeon Lord appears!', 'danger');
            setTimeout(() => showMessage(finalBoss.bossFlavor, 'warning'), 1500);
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 100);
            
            // Screen shake for dramatic effect
            screenShake();
            
            updateUI();
        }
        
        function showEncouragingModal(isFullVersion = true, onCloseCallback = null) {
            // Create a moment of silence - pause the music for contemplation
            const wasPlaying = music.isPlaying;
            if (wasPlaying) {
                music.stop();
            }
            
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            
            if (isFullVersion) {
                // FIRST DEATH: Full modal with tips
                overlay.innerHTML = `
                    <div class="modal-content" style="max-width: 600px; border: 3px solid #ffd700;">
                        <button class="modal-close-btn" id="btnEncouragingClose1">✕</button>
                        <h1 style="color: #ffd700;">DON'T GIVE UP!</h1>
                        <div style="text-align: left; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; margin: 20px 0;">
                            <p style="font-size: 1.1em; color: #ddd; margin-bottom: 15px;"><strong style="color: #ff6b6b;">Death is just the beginning.</strong> This game is intentionally challenging!</p>
                            
                            <p style="font-size: 1em; color: #c9a961; margin-bottom: 10px;"><strong>Tips for Success:</strong></p>
                            <ul style="color: #aaa; line-height: 1.8; margin-left: 20px;">
                                <li><strong style="color: #6bcf7f;">Always equip weapons</strong> before fighting monsters</li>
                                <li><strong style="color: #ffd93d;">Visit the Shop (S)</strong> to buy relics and upgrades</li>
                                <li><strong style="color: #d4af37;">Unlock permanent upgrades</strong> that carry between runs</li>
                                <li><strong style="color: #a8edea;">Hold cards (right-click)</strong> for strategic plays</li>
                                <li><strong style="color: #ff6b6b;">Start on Easy</strong> to learn the mechanics</li>
                                <li><strong style="color: #c9a961;">Read the Tutorial</strong> for detailed strategies</li>
                            </ul>
                            
                            <p style="font-size: 1em; color: #6bcf7f; margin-top: 20px; text-align: center;">Each death makes you stronger! Keep trying!</p>
                        </div>
                        
                        <div style="text-align: center; padding: 20px 15px; margin: 15px 0; background: linear-gradient(135deg, rgba(78, 205, 196, 0.15) 0%, rgba(107, 207, 127, 0.15) 100%); border-radius: 12px; border: 2px solid rgba(212, 175, 55, 0.3); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
                            <p style="font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 1.3em; font-weight: 700; color: #ffd700; margin: 0; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8); letter-spacing: 0.05em; line-height: 1.4;">
                                Dreams never get old
                            </p>
                            <p style="font-family: 'Cinzel', serif; font-size: 0.95em; font-style: italic; color: #c9a961; margin: 8px 0 0 0; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6); letter-spacing: 0.03em;">
                                Os sonhos não envelhecem
                            </p>
                        </div>
                        
                        <div class="modal-controls">
                            <button class="btn btn-primary" id="btnEncouragingOK1">I'LL TRY AGAIN!</button>
                        </div>
                    </div>
                `;
                
                // Add soft ambient sound when modal opens (optional whisper of wind)
                setTimeout(() => {
                    // Gentle visual pulse effect
                    const modalContent = overlay.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.style.animation = 'gentlePulse 3s ease-in-out infinite';
                    }
                }, 100);
            } else {
                // EVERY 5TH DEATH: Simplified motivational modal
                overlay.innerHTML = `
                    <div class="modal-content" style="max-width: 550px; border: 3px solid #ffd700; text-align: center;">
                        <button class="modal-close-btn" id="btnEncouragingClose2">✕</button>
                        
                        <div style="padding: 40px 30px;">
                            <h1 style="font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 2.5em; font-weight: 900; color: #ffd700; margin: 0 0 30px 0; text-shadow: 0 0 20px rgba(255, 215, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.8); letter-spacing: 0.08em; line-height: 1.3;">
                                DON'T GIVE UP
                            </h1>
                            
                            <div style="padding: 35px 25px; margin: 30px 0; background: linear-gradient(135deg, rgba(78, 205, 196, 0.2) 0%, rgba(107, 207, 127, 0.2) 100%); border-radius: 16px; border: 3px solid rgba(212, 175, 55, 0.5); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(255, 215, 0, 0.1);">
                                <p style="font-family: 'Cinzel Decorative', 'Cinzel', serif; font-size: 2em; font-weight: 700; color: #ffd700; margin: 0; text-shadow: 0 0 15px rgba(255, 215, 0, 0.7), 0 3px 6px rgba(0, 0, 0, 0.9); letter-spacing: 0.06em; line-height: 1.5;">
                                    DREAMS NEVER GET OLD
                                </p>
                                <p style="font-family: 'Cinzel', serif; font-size: 1.2em; font-style: italic; color: #c9a961; margin: 20px 0 0 0; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.7); letter-spacing: 0.04em;">
                                    Os sonhos não envelhecem
                                </p>
                            </div>
                        </div>
                        
                        <div class="modal-controls">
                            <button class="btn btn-primary" id="btnEncouragingOK2" style="font-size: 1.1em; padding: 14px 28px;">KEEP FIGHTING!</button>
                        </div>
                    </div>
                `;
                
                // Gentle golden glow effect
                setTimeout(() => {
                    const modalContent = overlay.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.style.animation = 'goldenGlow 4s ease-in-out infinite';
                    }
                }, 100);
            }
            
            document.body.appendChild(overlay);
            
            // Add click handlers for ALL buttons (OK and X)
            const btn1 = document.getElementById('btnEncouragingOK1');
            const btn2 = document.getElementById('btnEncouragingOK2');
            const closeBtn1 = document.getElementById('btnEncouragingClose1');
            const closeBtn2 = document.getElementById('btnEncouragingClose2');
            
            const handleClose = () => {
                // Resume music if it was playing
                if (wasPlaying && typeof music !== 'undefined') {
                    music.start();
                }
                // Remove modal
                overlay.remove();
                // Execute callback if provided
                if (onCloseCallback) {
                    onCloseCallback();
                }
            };
            
            // Attach handler to whichever buttons exist
            if (btn1) btn1.onclick = handleClose;
            if (btn2) btn2.onclick = handleClose;
            if (closeBtn1) closeBtn1.onclick = handleClose;
            if (closeBtn2) closeBtn2.onclick = handleClose;
        }

        function showMessage(text, type) {
            const msgEl = document.createElement('div');
            msgEl.className = `message ${type}`;
            msgEl.textContent = text;
            messageArea.appendChild(msgEl);
            
            // Adjust duration based on importance
            const duration = type === 'danger' ? 4000 : (type === 'success' ? 2500 : 3000);
            
            setTimeout(() => {
                msgEl.style.opacity = '0';
                setTimeout(() => msgEl.remove(), 500);
            }, duration);
        }

        // ============================================
        // UI UPDATE
        // ============================================
        
        function updateRunningScore() {
            game.score = (game.stats.monstersSlain * 10) + (game.stats.roomsCleared * 50) + game.totalGoldEarned;
            mainScoreValue.textContent = game.score;
        }
        
        function updateUI() {
            // Check for death FIRST (critical bug fix)
            if (game.health <= 0 && !game.gameOver) {
                endGame('death');
                return; // Stop updating UI
            }
            
            // HP Critical Warning
            if (game.health > 0 && game.health <= 5) {
                document.body.classList.add('hp-critical');
                // Show warning message first time
                if (!game.criticalWarningShown) {
                    showMessage('⚠️ CRITICAL HP! Find healing soon!', 'danger');
                    game.criticalWarningShown = true;
                }
            } else {
                document.body.classList.remove('hp-critical');
                game.criticalWarningShown = false;
            }
            
            // Top Bar
            healthEl.textContent = `${game.health} / ${game.maxHealth}`;
            goldEl.textContent = game.gold;
            
            // Show next cards if player has Map or Candle relic
            const hasMap = game.relics.some(r => r.id === 'map');
            const hasCandle = game.relics.some(r => r.id === 'candle');
            
            if (hasMap && game.dungeon.length > 0) {
                const preview = game.dungeon.slice(0, 3).map(c => `${c.value}${c.suit}`).join(' ');
                dungeonCountEl.textContent = `${game.dungeon.length} (🗺️ ${preview})`;
            } else if (hasCandle && game.dungeon.length > 0) {
                const preview = game.dungeon[0];
                dungeonCountEl.textContent = `${game.dungeon.length} (🕯️ ${preview.value}${preview.suit})`;
            } else {
                dungeonCountEl.textContent = game.dungeon.length;
            }
            
            statRoomsEl.textContent = game.stats.roomsCleared;
            mainScoreValue.textContent = game.score; // Update main score
            
            // Show active class buff indicator
            if (game.classAbilityActive && game.classAbilityCounter > 0) {
                const buffIndicator = document.createElement('div');
                buffIndicator.style.cssText = 'position: fixed; top: 120px; right: 20px; background: rgba(255, 215, 0, 0.9); color: #000; padding: 10px 15px; border-radius: 8px; font-weight: bold; z-index: 100; animation: pulse 1s infinite;';
                buffIndicator.id = 'classBuffIndicator';
                
                if (game.playerClass === 'rogue') {
                    buffIndicator.innerHTML = `🔪 SHADOW STRIKE<br><small>2x damage, combo safe!</small>`;
                } else if (game.playerClass === 'dancer') {
                    buffIndicator.innerHTML = `💃 HEALING DANCE<br><small>+2 dmg (${game.classAbilityCounter} left)</small>`;
                }
                
                // Remove old indicator
                const oldIndicator = document.getElementById('classBuffIndicator');
                if (oldIndicator) oldIndicator.remove();
                
                document.body.appendChild(buffIndicator);
            } else {
                const oldIndicator = document.getElementById('classBuffIndicator');
                if (oldIndicator) oldIndicator.remove();
            }
            
            // Berserk stacks indicator
            if (game.berserkStacks > 0) {
                const berserkIndicator = document.createElement('div');
                berserkIndicator.style.cssText = 'position: fixed; top: 160px; right: 20px; background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: #fff; padding: 10px 15px; border-radius: 8px; font-weight: bold; z-index: 100; box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4); animation: pulse 1s infinite;';
                berserkIndicator.id = 'berserkIndicator';
                berserkIndicator.innerHTML = `🔥 BERSERK x${game.berserkStacks}<br><small>+5 damage per attack</small>`;
                
                // Remove old indicator
                const oldBerserk = document.getElementById('berserkIndicator');
                if (oldBerserk) oldBerserk.remove();
                
                document.body.appendChild(berserkIndicator);
            } else {
                const oldBerserk = document.getElementById('berserkIndicator');
                if (oldBerserk) oldBerserk.remove();
            }
            
            // Undo button visibility (Easy/Normal only)
            const btnUndo = document.getElementById('btnUndo');
            if (btnUndo && (game.difficulty === 'easy' || game.difficulty === 'normal')) {
                btnUndo.style.display = 'inline-block';
                btnUndo.disabled = !game.undoAvailable;
            } else if (btnUndo) {
                btnUndo.style.display = 'none';
            }

            // Center Stage - Weapon
            equippedWeaponEl.innerHTML = '';
            if (game.equippedWeapon) {
                const cardEl = createCardElement(game.equippedWeapon);
                cardEl.classList.add('equipped');
                
                const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
                const berserkBonus = game.berserkStacks > 0 ? 5 : 0;
                const bloodlustBonus = getBloodlustBonus(); // Berserker passive
                const comboBonus = getComboBonus(); // Combo damage
                
                // Calculate TOTAL damage including all buffs
                const baseDamage = game.equippedWeapon.numValue;
                const totalBuffs = powerBonus + berserkBonus + bloodlustBonus + comboBonus;
                const damageBeforeDouble = baseDamage + totalBuffs;
                const finalDamage = game.doubleDamage ? damageBeforeDouble * 2 : damageBeforeDouble;
                
                // Show badge if there's any buff or modifier active
                if (powerBonus > 0 || game.doubleDamage || berserkBonus > 0 || bloodlustBonus > 0 || comboBonus > 0) {
                    const badge = document.createElement('div');
                    badge.style.cssText = 'position:absolute;top:5px;right:5px;background:#ffd93d;color:#000;padding:3px 8px;border-radius:10px;font-size:0.8em;font-weight:bold;';
                    
                    // Show FINAL damage value
                    badge.textContent = `${finalDamage}`;
                    
                    // Red background when Berserk is active for visibility
                    if (berserkBonus > 0) {
                        badge.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
                        badge.style.color = '#fff';
                        badge.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.4)';
                    }
                    // Purple background when Power (2x) is active
                    else if (game.doubleDamage) {
                        badge.style.background = 'linear-gradient(135deg, #a78bfa, #8b5cf6)';
                        badge.style.color = '#fff';
                        badge.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.4)';
                    }
                    
                    cardEl.appendChild(badge);
                }
                
                // Durability indicator
                if (game.equippedWeapon.durability < 999) {
                    const durabilityBar = document.createElement('div');
                    durabilityBar.style.cssText = 'position:absolute;bottom:5px;left:5px;right:5px;height:8px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;';
                    
                    const durabilityFill = document.createElement('div');
                    const percentage = (game.equippedWeapon.durability / game.equippedWeapon.maxDurability) * 100;
                    let fillColor = '#6bcf7f'; // Green (full)
                    if (percentage <= 33) fillColor = '#ff6b6b'; // Red (low)
                    else if (percentage <= 66) fillColor = '#ffd93d'; // Yellow (medium)
                    
                    durabilityFill.style.cssText = `height:100%;width:${percentage}%;background:${fillColor};transition:all 0.3s ease;`;
                    durabilityBar.appendChild(durabilityFill);
                    
                    const durabilityText = document.createElement('div');
                    const durabilityIcon = game.equippedWeapon.durability === 1 ? '⚠️' : '⚔️';
                    durabilityText.style.cssText = 'position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:2px 6px;border-radius:8px;font-size:0.7em;font-weight:bold;white-space:nowrap;';
                    durabilityText.textContent = `${durabilityIcon} ${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability}`;
                    
                    cardEl.appendChild(durabilityBar);
                    cardEl.appendChild(durabilityText);
                }
                
                equippedWeaponEl.appendChild(cardEl);
            } else {
                equippedWeaponEl.innerHTML = '<div class="empty-slot">No Weapon</div>';
            }
            
            // Right Bar - Hold (supports multiple cards for Rogue)
            holdAreaContainer.innerHTML = '';
            let maxHold = (game.classData && game.classData.passive.maxHoldCards) || 1;
            
            // Feather relic: +1 hold slot
            if (game.relics.some(r => r.id === 'feather')) maxHold += 1;
            
            if (game.heldCard) {
                // Handle both single card and array of cards
                const heldCards = Array.isArray(game.heldCard) ? game.heldCard : [game.heldCard];
                
                // ROGUE: Multiple cards - show ONE at a time with navigation
                if (maxHold > 1 && heldCards.length > 1) {
                    // Ensure index is valid
                    if (game.heldCardIndex >= heldCards.length) game.heldCardIndex = 0;
                    if (game.heldCardIndex < 0) game.heldCardIndex = heldCards.length - 1;
                    
                    const currentCard = heldCards[game.heldCardIndex];
                    
                    // Navigation container
                    const navContainer = document.createElement('div');
                    navContainer.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;';
                    
                    // Left arrow
                    const leftArrow = document.createElement('button');
                    leftArrow.innerHTML = '\u25c0';
                    leftArrow.className = 'held-nav-btn';
                    leftArrow.style.cssText = 'background: rgba(0,0,0,0.5); border: 2px solid #ffd93d; color: #ffd93d; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1em; display: flex; align-items: center; justify-content: center; transition: all 0.3s;';
                    leftArrow.onmouseover = () => leftArrow.style.background = 'rgba(255, 217, 61, 0.3)';
                    leftArrow.onmouseout = () => leftArrow.style.background = 'rgba(0,0,0,0.5)';
                    leftArrow.onclick = (e) => {
                        e.stopPropagation();
                        game.heldCardIndex = (game.heldCardIndex - 1 + heldCards.length) % heldCards.length;
                        updateUI();
                    };
                    
                    // Counter
                    const counter = document.createElement('div');
                    counter.style.cssText = 'color: #ffd93d; font-weight: bold; font-size: 0.9em; min-width: 35px; text-align: center;';
                    counter.textContent = `${game.heldCardIndex + 1}/${heldCards.length}`;
                    
                    // Right arrow
                    const rightArrow = document.createElement('button');
                    rightArrow.innerHTML = '\u25b6';
                    rightArrow.className = 'held-nav-btn';
                    rightArrow.style.cssText = 'background: rgba(0,0,0,0.5); border: 2px solid #ffd93d; color: #ffd93d; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 1em; display: flex; align-items: center; justify-content: center; transition: all 0.3s;';
                    rightArrow.onmouseover = () => rightArrow.style.background = 'rgba(255, 217, 61, 0.3)';
                    rightArrow.onmouseout = () => rightArrow.style.background = 'rgba(0,0,0,0.5)';
                    rightArrow.onclick = (e) => {
                        e.stopPropagation();
                        game.heldCardIndex = (game.heldCardIndex + 1) % heldCards.length;
                        updateUI();
                    };
                    
                    navContainer.appendChild(leftArrow);
                    navContainer.appendChild(counter);
                    navContainer.appendChild(rightArrow);
                    holdAreaContainer.appendChild(navContainer);
                    
                    // Show current card
                    const cardEl = createCardElement(currentCard);
                    cardEl.classList.add('held');
                    cardEl.onclick = () => {
                        const selectedCard = game.heldCard.splice(game.heldCardIndex, 1)[0];
                        if (game.heldCard.length === 0) {
                            game.heldCard = null;
                            game.heldCardIndex = 0;
                        } else {
                            // Adjust index if needed
                            if (game.heldCardIndex >= game.heldCard.length) game.heldCardIndex = 0;
                        }
                        game.room.unshift(selectedCard);
                        updateUI();
                        setTimeout(() => {
                            const firstCardEl = bottomBar.querySelector('.card');
                            if (firstCardEl) firstCardEl.click();
                        }, 100);
                    };
                    holdAreaContainer.appendChild(cardEl);
                    
                } else {
                    // Single card or single-hold classes: show normally
                    heldCards.forEach((card, idx) => {
                        const cardEl = createCardElement(card);
                        cardEl.classList.add('held');
                        cardEl.style.marginBottom = '10px';
                        cardEl.onclick = () => {
                            // Use specific held card
                            if (Array.isArray(game.heldCard)) {
                                const selectedCard = game.heldCard.splice(idx, 1)[0];
                                if (game.heldCard.length === 0) game.heldCard = null;
                                game.room.unshift(selectedCard);
                                updateUI();
                                setTimeout(() => {
                                    const firstCardEl = bottomBar.querySelector('.card');
                                    if (firstCardEl) firstCardEl.click();
                                }, 100);
                            } else {
                                useHeldCard();
                            }
                        };
                        holdAreaContainer.appendChild(cardEl);
                    });
                    
                    // Show count if multiple slots
                    if (maxHold > 1) {
                        const countEl = document.createElement('div');
                        countEl.style.cssText = 'text-align:center;color:#ffd93d;font-size:0.9em;margin-top:5px;';
                        countEl.textContent = `${heldCards.length}/${maxHold} held`;
                        holdAreaContainer.appendChild(countEl);
                    }
                }
            } else {
                const emptyText = maxHold > 1 ? `Right-click to hold (0/${maxHold})` : 'Right-click to hold';
                holdAreaContainer.innerHTML = `<div class="empty-slot" style="font-size: 0.8em;">${emptyText}</div>`;
            }
            
            // Right Bar - Discard
            discardPilePreview.innerHTML = '';
            const lastFive = game.discardPile.slice(-5).reverse();
            if (lastFive.length > 0) {
                lastFive.forEach(card => {
                    discardPilePreview.appendChild(createMiniCardElement(card));
                });
            } else {
                discardPilePreview.innerHTML = '<span style="font-size: 0.8em; opacity: 0.5;">Empty</span>';
            }

            // Bottom Bar - Room
            bottomBar.innerHTML = '';
            if (game.room.length > 0) {
                game.room.forEach((card, index) => {
                    const cardEl = createCardElement(card);
                    
                    const tooltip = generateTooltip(card);
                    if (tooltip) {
                        const tooltipEl = document.createElement('div');
                        tooltipEl.className = 'card-tooltip';
                        tooltipEl.innerHTML = tooltip;
                        cardEl.appendChild(tooltipEl);
                    }
                    
                    // Add preview
                    const type = getCardType(card);
                    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
                    const baseWeaponVal = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
                    const effectiveWeapon = game.doubleDamage ? (baseWeaponVal + powerBonus) * 2 : (baseWeaponVal + powerBonus);

                    if (type === 'monster') {
                        const damage = card.numValue - effectiveWeapon;
                        if (game.dodgeActive || damage <= 0) cardEl.classList.add('preview-safe');
                        else cardEl.classList.add('preview-danger');
                    } else if (type === 'weapon') {
                        const current = baseWeaponVal + powerBonus;
                        const cardValue = card.numValue + powerBonus;
                        if (cardValue > current) cardEl.classList.add('preview-safe');
                        else if (cardValue < current) cardEl.classList.add('preview-danger');
                        else cardEl.classList.add('preview-neutral');
                    } else if (type === 'potion') {
                        const maxPotions = (game.classData && game.classData.passive.maxPotionsPerRoom) || 1;
                        if (game.potionsUsed >= maxPotions) cardEl.classList.add('preview-danger');
                        else cardEl.classList.add('preview-safe');
                    } else if (type === 'special') {
                        cardEl.classList.add('preview-safe');
                    }
                    
                    // Click events
                    cardEl.onclick = (e) => {
                        e.stopPropagation();
                        playSound('cardFlip');
                        handleCardClick(card, index);
                    };
                    cardEl.oncontextmenu = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        holdCard(card, index);
                    };
                    
                    bottomBar.appendChild(cardEl);
                });
            } else if (!game.gameOver) {
                 bottomBar.innerHTML = '<div class="empty-slot">Dungeon Empty. Use controls above.</div>';
            }
            
            // Update class ability UI
            if (game.classData) {
                updateAbilityUI();
            }
        }

        function createCardElement(card) {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            const type = getCardType(card);
            cardEl.classList.add(type);
            
            // Boss special styling
            if (card.isBoss) {
                cardEl.classList.add('boss');
                cardEl.style.boxShadow = '0 0 30px rgba(255, 107, 107, 0.8)';
                cardEl.style.borderColor = '#ff6b6b';
                cardEl.style.animation = 'bossPulse 1.5s infinite';
            }

            if (type === 'special') {
                cardEl.innerHTML = `
                    <div class="card-value">${card.special.name.split(' ')[0]}</div>
                    <div style="font-size: 0.8em; padding: 0 5px;">${card.special.name.split(' ').slice(1).join(' ')}</div>
                    <div class="card-suit">✨</div>
                `;
            } else if (card.isBoss) {
                // Calculate HP percentage for bar
                const hpPercent = card.maxHP ? (card.numValue / card.maxHP) * 100 : 100;
                const hpColor = hpPercent > 66 ? '#6bcf7f' : (hpPercent > 33 ? '#ffd93d' : '#ff6b6b');
                
                cardEl.innerHTML = `
                    <div class="card-value" style="font-size: 2em;">👹</div>
                    <div style="font-size: 0.9em; color: #ff6b6b; font-weight: bold;">BOSS</div>
                    <div class="card-suit" style="font-size: 1.2em; color: #ff6b6b;">${card.numValue} HP</div>
                    <div style="width: 90%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; margin: 5px auto 0; overflow: hidden;">
                        <div style="width: ${hpPercent}%; height: 100%; background: ${hpColor}; transition: all 0.3s ease; border-radius: 4px;"></div>
                    </div>
                `;
            } else {
                cardEl.innerHTML = `
                    <div class="card-value">${card.value}</div>
                    <div class="card-suit">${card.suit}</div>
                `;
                
                // DAMAGE PREVIEW for monster cards
                if (type === 'monster' && card.numValue > 0) {
                    const baseWeapon = game.equippedWeapon ? game.equippedWeapon.numValue : 0;
                    const powerBonus = getRelicBonus('power') + getRelicBonus('bigPower');
                    const berserkBonus = game.berserkStacks > 0 ? 5 : 0;
                    const totalDamage = baseWeapon + powerBonus + berserkBonus;
                    const netDamage = card.numValue - totalDamage;
                    
                    const dmgBadge = document.createElement('div');
                    dmgBadge.style.cssText = 'position:absolute;top:5px;left:5px;padding:4px 8px;border-radius:8px;font-size:0.75em;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.3);color:#fff;';
                    
                    if (totalDamage === 0) {
                        dmgBadge.textContent = '✊ 0';
                        dmgBadge.style.background = 'linear-gradient(135deg,#999,#666)';
                    } else if (netDamage <= 0) {
                        dmgBadge.textContent = `⚔️ ${totalDamage}`;
                        dmgBadge.style.background = 'linear-gradient(135deg,#6bcf7f,#2fbf71)';
                    } else {
                        dmgBadge.textContent = `⚔️ ${totalDamage} (-${netDamage})`;
                        dmgBadge.style.background = 'linear-gradient(135deg,#ff6b6b,#ee5a52)';
                    }
                    cardEl.appendChild(dmgBadge);
                }
                
                // Bell relic: Show gold value on cards
                if (game.relics.some(r => r.id === 'bell') && card.numValue > 0) {
                    const goldBadge = document.createElement('div');
                    goldBadge.style.cssText = 'position:absolute;top:5px;right:5px;background:rgba(255,215,0,0.9);color:#000;padding:2px 6px;border-radius:8px;font-size:0.7em;font-weight:bold;';
                    goldBadge.textContent = `💰${card.numValue}`;
                    cardEl.appendChild(goldBadge);
                }
            }
            return cardEl;
        }
        
        function createMiniCardElement(card) {
            const cardEl = document.createElement('div');
            cardEl.className = 'mini-card';
            const type = getCardType(card);
            cardEl.classList.add(type);

            if (type === 'special') {
                cardEl.innerHTML = `<span class="card-value">✨</span>`;
            } else {
                cardEl.innerHTML = `
                    <span class="card-value">${card.value}</span>
                    <span class="card-suit">${card.suit}</span>
                `;
            }
            return cardEl;
        }

        // ============================================
        // RELICS, SHOP, EVENTS (Ported Logic)
        // ============================================
        const RELICS = [
            // === COMUM (25) - Efeitos básicos e úteis ===
            { id: 'small_shield', name: '🛡️ Small Shield', description: '+3 maximum health', rarity: 'common', effect: 'smallHealth' },
            { id: 'bronze_ring', name: '💍 Bronze Ring', description: '+1 damage to all weapons', rarity: 'common', effect: 'smallPower' },
            { id: 'heal_charm', name: '💚 Healing Charm', description: 'Potions heal +1 HP', rarity: 'common', effect: 'smallHealBonus' },
            { id: 'coin_pouch', name: '💰 Coin Pouch', description: 'Gain 2 gold per room cleared', rarity: 'common', effect: 'smallGoldPerRoom' },
            { id: 'lucky_penny', name: '🪙 Lucky Penny', description: '+20% gold from all sources', rarity: 'common', effect: 'smallGoldBonus' },
            { id: 'leather_boots', name: '👢 Leather Boots', description: 'Avoid costs 2 cards instead of 3', rarity: 'common', effect: 'betterAvoid' },
            { id: 'bandage', name: '🩹 Bandage', description: 'Heal 0.5 HP per room cleared', rarity: 'common', effect: 'tinyRegen' },
            { id: 'weak_thorns', name: '🌿 Weak Thorns', description: 'Reflect 1 damage to attackers', rarity: 'common', effect: 'weakThorns' },
            { id: 'compass', name: '🧭 Compass', description: '10% more events', rarity: 'common', effect: 'moreEvents' },
            { id: 'dice', name: '🎲 Lucky Dice', description: 'Shop items 5% cheaper', rarity: 'common', effect: 'tinyDiscount' },
            { id: 'feather', name: '🪶 Light Feather', description: 'Hold 2 cards instead of 1', rarity: 'common', effect: 'extraHold' },
            { id: 'candle', name: '🕯️ Candle', description: 'See 1 extra card in deck', rarity: 'common', effect: 'peek' },
            { id: 'rope', name: '🪢 Rope', description: 'Start with 1 extra HP', rarity: 'common', effect: 'tinyHealth' },
            { id: 'stone', name: '🪨 Stone', description: 'Reduce first damage by 1', rarity: 'common', effect: 'firstShield' },
            { id: 'herb', name: '🌱 Herb', description: 'Potions usable twice per dungeon', rarity: 'common', effect: 'doublePot' },
            { id: 'map', name: '🗺️ Map', description: 'See next 3 cards', rarity: 'common', effect: 'cardPreview' },
            { id: 'gloves', name: '🧤 Gloves', description: 'Weapons last 1 extra use', rarity: 'common', effect: 'extraDurability' },
            { id: 'book', name: '📖 Old Book', description: 'Special cards +10% more common', rarity: 'common', effect: 'moreSpecials' },
            { id: 'bell', name: '🔔 Bell', description: 'Gold visible on cards', rarity: 'common', effect: 'goldSight' },
            { id: 'key', name: '🗝️ Old Key', description: 'Unlock 1 free shop item', rarity: 'common', effect: 'freeItem' },
            { id: 'mirror_shard', name: '🪞 Mirror Shard', description: 'Reflect 2 damage once per room', rarity: 'common', effect: 'weakReflect' },
            { id: 'charm', name: '✨ Charm', description: 'Start with 10 extra gold', rarity: 'common', effect: 'startGold' },
            { id: 'tooth', name: '🦷 Monster Tooth', description: 'Monsters give +1 gold', rarity: 'common', effect: 'monsterGold' },
            { id: 'clover', name: '☘️ Four Leaf Clover', description: 'Avoid can be used 2x in row', rarity: 'common', effect: 'doubleAvoid' },
            { id: 'lantern', name: '🏮 Lantern', description: 'Events give +2 gold', rarity: 'common', effect: 'eventGold' },
            
            // === INCOMUM (15) - Efeitos moderados ===
            { id: 'silver_shield', name: '🛡️ Silver Shield', description: '+5 maximum health', rarity: 'uncommon', effect: 'maxHealth' },
            { id: 'silver_ring', name: '💍 Silver Ring', description: '+2 damage to all weapons', rarity: 'uncommon', effect: 'power' },
            { id: 'healer', name: '💚 Healing Amulet', description: 'Potions heal +2 HP', rarity: 'uncommon', effect: 'healBonus' },
            { id: 'greedy', name: '💰 Golden Idol', description: 'Gain 3 gold per room cleared', rarity: 'uncommon', effect: 'goldPerRoom' },
            { id: 'vampire', name: '🧛 Vampiric Fang', description: 'Heal 2 HP when defeating monsters', rarity: 'uncommon', effect: 'lifesteal' },
            { id: 'meditation', name: '🧘 Meditation Stone', description: 'Heal 1 HP per room', rarity: 'uncommon', effect: 'passive_heal' },
            { id: 'armor', name: '🦾 Iron Armor', description: 'Reduce all damage by 1', rarity: 'uncommon', effect: 'damageReduction' },
            { id: 'boots', name: '👟 Speed Boots', description: 'Draw 1 extra card per dungeon', rarity: 'uncommon', effect: 'extraDraw' },
            { id: 'gauntlet', name: '🥊 Power Gauntlet', description: 'First attack each room +3 damage', rarity: 'uncommon', effect: 'firstStrike' },
            { id: 'necklace', name: '📿 Holy Necklace', description: 'Events heal 2 HP', rarity: 'uncommon', effect: 'eventHeal' },
            { id: 'crystal', name: '💎 Crystal', description: 'Shop items 15% cheaper', rarity: 'uncommon', effect: 'discount' },
            { id: 'hourglass', name: '⏳ Hourglass', description: 'Berserk lasts 1 extra turn', rarity: 'uncommon', effect: 'longerBerserk' },
            { id: 'magnet', name: '🧲 Magnet', description: '+40% gold from all sources', rarity: 'uncommon', effect: 'goldBonus' },
            { id: 'ring_fire', name: '🔥 Fire Ring', description: 'Combo damage +1 per stack', rarity: 'uncommon', effect: 'comboBoost' },
            { id: 'cloak', name: '🧥 Cloak', description: 'First damage each room is 0', rarity: 'uncommon', effect: 'firstDodge' },
            { id: 'berserker_ring', name: '💢 Berserker Ring', description: '+2 damage to all weapons', rarity: 'uncommon', effect: 'power' },
            
            // === RARA (8) - Efeitos poderosos ===
            { id: 'gold_shield', name: '🛡️ Golden Shield', description: '+10 maximum health', rarity: 'rare', effect: 'bigHealth' },
            { id: 'blade', name: '🗡️ Dancing Blade', description: '+3 weapon damage', rarity: 'rare', effect: 'bigPower' },
            { id: 'lucky', name: '🍀 Lucky Charm', description: '+60% gold from all sources', rarity: 'rare', effect: 'bigGoldBonus' },
            { id: 'warrior', name: '⚡ Thunder Gauntlet', description: '20% chance to deal double damage', rarity: 'rare', effect: 'criticalChance' },
            { id: 'tank', name: '🏰 Fortress Armor', description: 'Start each room with 1 HP shield', rarity: 'rare', effect: 'roomShield' },
            { id: 'master_smith', name: '🔨 Master Smith', description: 'Repairs weapon at end of each room', rarity: 'rare', effect: 'auto_repair' },
            { id: 'crown', name: '👑 Crown', description: 'Double all stat bonuses from relics', rarity: 'rare', effect: 'doubleRelics' },
            { id: 'orb', name: '🔮 Magic Orb', description: 'Special cards appear 2x more', rarity: 'rare', effect: 'manySpecials' },
            
            // === LENDÁRIA (2) - Game-changing ===
            { id: 'phoenix', name: '🐦 Phoenix Feather', description: 'Revive once with 10 HP', rarity: 'legendary', effect: 'revive', oneTime: true, used: false },
            { id: 'durable_weapons', name: '🛠️ Eternal Forge', description: 'Weapons never break', rarity: 'legendary', effect: 'infinite_durability' }
        ];

        const EVENTS = [
            { id: 'shrine', title: '🔮 Mysterious Shrine', text: 'You find a glowing shrine. An ancient voice offers you a choice...',
                choices: [
                    { text: '❤️ Sacrifice 5 HP for +2 weapon damage permanently (Gain Berserker Ring)',
                        effect: () => {
                            if (game.health > 5) { game.health -= 5; game.relics.push({...RELICS.find(r => r.id === 'berserker_ring')}); showMessage('Gained Berserker Ring!', 'success'); updateRelicsDisplay(); } 
                            else { showMessage('Not enough HP!', 'danger'); }
                        }},
                    { text: '💰 Offer 20 gold for +5 max HP',
                        effect: () => {
                            if (game.gold >= 20) { game.gold -= 20; game.maxHealth += 5; game.health += 5; showMessage('+5 Max HP!', 'success'); } 
                            else { showMessage('Not enough gold!', 'danger'); }
                        }},
                    { text: '🚪 Leave quietly', effect: () => { showMessage('You leave the shrine untouched.', 'info'); }}
                ]},
            { id: 'merchant', title: '🎒 Traveling Merchant', text: 'A friendly merchant offers you a deal!',
                choices: [
                    { text: '💊 Buy healing potion for 15 gold (heal 8 HP)',
                        effect: () => {
                            if (game.gold >= 15) { game.gold -= 15; game.health = Math.min(game.maxHealth, game.health + 8); showMessage('Healed 8 HP!', 'success'); } 
                            else { showMessage('Not enough gold!', 'danger'); }
                        }},
                    { text: '🔮 Buy random relic for 30 gold',
                        effect: () => {
                            if (game.gold >= 30) { game.gold -= 30; giveRandomRelic(); } 
                            else { showMessage('Not enough gold!', 'danger'); }
                        }},
                    { text: '👋 Say goodbye', effect: () => { showMessage('Maybe next time!', 'info'); }}
                ]},
            { id: 'fountain', title: '💧 Whispering Fountain', text: 'You find a shimmering fountain. The water looks pure.',
                choices: [
                    { text: 'Drink (Heal 5 HP)', effect: () => { 
                        const heal = Math.min(5, game.maxHealth - game.health);
                        game.health += heal;
                        showMessage(`💧 You feel refreshed! +${heal} HP`, 'success');
                        updateUI();
                    }},
                    { text: 'Ignore', effect: () => { showMessage('You move on.', 'info'); }}
                ]},
            { id: 'gambler', title: '🎲 Shady Gambler', text: 'A figure offers a game. "Bet 10 Gold. Win 25 or lose it all."',
                choices: [
                    { text: 'Bet (Requires 10 Gold)', effect: () => { 
                        if (game.gold < 10) { showMessage('🎲 "You don\'t have enough gold!" he scoffs.', 'warning'); return; }
                        game.gold -= 10;
                        if (Math.random() < 0.4) { showMessage('🎲 You won! +25 Gold!', 'success'); earnGold(25); } 
                        else { showMessage('🎲 You lost! -10 Gold!', 'danger'); }
                        updateUI();
                    }},
                    { text: 'Refuse', effect: () => { showMessage('You walk away from the game.', 'info'); }}
                ]},
            { id: 'treasure', title: '🏺 Cursed Treasure', text: 'A golden chest glimmers before you... but dark energy surrounds it.',
                choices: [
                    { text: '💰 Take the risk (+50 gold, -10 HP)', effect: () => { 
                        if (game.health > 10) { game.health -= 10; earnGold(50); showMessage('💰 +50 gold! But the curse hurts...', 'success'); }
                        else { showMessage('⚠️ Too risky! You need more than 10 HP!', 'danger'); }
                        updateUI();
                    }},
                    { text: '🔮 Try to cleanse it (50% chance)', effect: () => {
                        if (Math.random() < 0.5) { earnGold(60); showMessage('✨ Cleansed! +60 gold with no curse!', 'success'); }
                        else { game.health -= 15; showMessage('💔 The curse backfired! -15 HP!', 'danger'); }
                        updateUI();
                    }},
                    { text: '🚪 Leave it alone', effect: () => { showMessage('Wisdom over greed.', 'info'); }}
                ]},
            { id: 'witch', title: '🧙 Mysterious Witch', text: 'An old witch offers her services: "I can upgrade your equipment... for a price."',
                choices: [
                    { text: '⚔️ Upgrade weapon (+2 damage, 25 gold)', effect: () => {
                        if (game.gold >= 25 && game.equippedWeapon) { game.gold -= 25; game.equippedWeapon.numValue += 2; showMessage('⚔️ Weapon upgraded!', 'success'); updateUI(); }
                        else if (!game.equippedWeapon) { showMessage('No weapon to upgrade!', 'warning'); }
                        else { showMessage('Not enough gold!', 'danger'); }
                    }},
                    { text: '❤️ Restore all HP (30 gold)', effect: () => {
                        if (game.gold >= 30) { game.gold -= 30; game.health = game.maxHealth; showMessage('❤️ Fully healed!', 'success'); updateUI(); }
                        else { showMessage('Not enough gold!', 'danger'); }
                    }},
                    { text: '🏃 Decline', effect: () => { showMessage('"Your loss, scoundrel!"', 'info'); }}
                ]},
            { id: 'library', title: '📚 Ancient Library', text: 'You discover a library filled with magical tomes.',
                choices: [
                    { text: '📖 Study combat techniques (+1 damage permanent)', effect: () => {
                        game.relics.push({ id: 'study_bonus', name: '📖 Combat Study', description: '+1 damage', rarity: 'common', effect: 'smallPower' });
                        showMessage('📖 You learned new techniques!', 'success');
                        updateRelicsDisplay();
                    }},
                    { text: '🔮 Learn healing magic (+1 HP/room)', effect: () => {
                        game.relics.push({ id: 'healing_study', name: '🔮 Healing Magic', description: '+1 HP per room', rarity: 'uncommon', effect: 'passive_heal' });
                        showMessage('🔮 You mastered healing!', 'success');
                        updateRelicsDisplay();
                    }},
                    { text: '🚪 Leave quickly', effect: () => { showMessage('No time for reading!', 'info'); }}
                ]},
            { id: 'beggar', title: '🙏 Poor Beggar', text: 'A starving beggar asks for help. "Please... just 5 gold for food..."',
                choices: [
                    { text: '❤️ Give 5 gold (Karma reward)', effect: () => {
                        if (game.gold >= 5) { 
                            game.gold -= 5; 
                            game.health = Math.min(game.maxHealth, game.health + 3);
                            showMessage('❤️ Good deed! +3 HP (karma)', 'success'); 
                        } else { showMessage('Not enough gold!', 'danger'); }
                        updateUI();
                    }},
                    { text: '💰 Give 20 gold (Great karma)', effect: () => {
                        if (game.gold >= 20) { 
                            game.gold -= 20;
                            giveRandomRelic('uncommon');
                            showMessage('✨ Your kindness is rewarded! (Relic gained)', 'success');
                        } else { showMessage('Not enough gold!', 'danger'); }
                    }},
                    { text: '🚶 Ignore', effect: () => { showMessage('You walk past...', 'info'); }}
                ]},
            { id: 'blacksmith', title: '⚒️ Dwarven Blacksmith', text: 'A skilled dwarf offers to fix your gear. "I can repair or enhance!"',
                choices: [
                    { text: '🔧 Repair weapon (Full durability, 15 gold)', effect: () => {
                        if (game.gold >= 15 && game.equippedWeapon && game.equippedWeapon.durability < game.equippedWeapon.maxDurability) {
                            game.gold -= 15;
                            game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                            showMessage('🔧 Weapon fully repaired!', 'success');
                            updateUI();
                        } else if (!game.equippedWeapon) { showMessage('No weapon!', 'warning'); }
                        else if (game.equippedWeapon.durability >= game.equippedWeapon.maxDurability) { showMessage('Already at full durability!', 'info'); }
                        else { showMessage('Not enough gold!', 'danger'); }
                    }},
                    { text: '⭐ Enhance durability (+2 max uses, 25 gold)', effect: () => {
                        if (game.gold >= 25 && game.equippedWeapon) {
                            game.gold -= 25;
                            game.equippedWeapon.maxDurability += 2;
                            game.equippedWeapon.durability += 2;
                            showMessage('⭐ Weapon enhanced!', 'success');
                            updateUI();
                        } else if (!game.equippedWeapon) { showMessage('No weapon!', 'warning'); }
                        else { showMessage('Not enough gold!', 'danger'); }
                    }},
                    { text: '👋 No thanks', effect: () => { showMessage('"Suit yourself!"', 'info'); }}
                ]},
            { id: 'dragon', title: '🐉 Sleeping Dragon', text: 'A dragon sleeps atop a massive hoard of gold. Do you dare...?',
                choices: [
                    { text: '💎 Steal carefully (60% success)', effect: () => {
                        if (Math.random() < 0.6) { 
                            earnGold(40); 
                            showMessage('🤫 +40 gold stolen! The dragon sleeps...', 'success'); 
                        } else { 
                            game.health -= 20; 
                            showMessage('🐉 The dragon wakes! -20 HP!', 'danger'); 
                        }
                        updateUI();
                    }},
                    { text: '🗡️ Fight the dragon! (-15 HP, +80 gold)', effect: () => {
                        if (game.health > 15) {
                            game.health -= 15;
                            earnGold(80);
                            showMessage('🐉 Victory! +80 gold!', 'success');
                        } else { showMessage('Too dangerous!', 'danger'); }
                        updateUI();
                    }},
                    { text: '🏃 Run away', effect: () => { showMessage('Discretion is the better part of valor.', 'info'); }}
                ]},
            { id: 'mirror', title: '🪞 Magic Mirror', text: 'A mystical mirror shows your reflection. "Touch me and face yourself..."',
                choices: [
                    { text: '✨ Accept the challenge (Mirror match)', effect: () => {
                        const damage = Math.floor(game.health * 0.3);
                        game.health -= damage;
                        earnGold(30);
                        showMessage(`🪞 You defeat your reflection! -${damage} HP, +30 gold`, 'success');
                        updateUI();
                    }},
                    { text: '🔮 Ask for wisdom (+5 HP)', effect: () => {
                        game.health = Math.min(game.maxHealth, game.health + 5);
                        showMessage('🔮 The mirror grants clarity. +5 HP', 'success');
                        updateUI();
                    }},
                    { text: '🚪 Leave', effect: () => { showMessage('You look away from the mirror.', 'info'); }}
                ]},
            { id: 'ghost', title: '👻 Friendly Ghost', text: 'A spectral figure appears. "I can help you... or hurt you. Your choice!"',
                choices: [
                    { text: '🎁 Accept help (Random buff)', effect: () => {
                        const buffs = ['dodge', 'berserk', 'goldBonus'];
                        const buff = buffs[Math.floor(Math.random() * buffs.length)];
                        if (buff === 'dodge') { game.dodgeActive = true; showMessage('👻 Next attack dodged!', 'success'); }
                        else if (buff === 'berserk') { game.berserkStacks += 3; showMessage('👻 +3 Berserk stacks!', 'success'); }
                        else { earnGold(20); showMessage('👻 +20 gold!', 'success'); }
                        updateUI();
                    }},
                    { text: '⚔️ Attack the ghost (Risk/reward)', effect: () => {
                        if (Math.random() < 0.5) {
                            earnGold(50);
                            showMessage('👻 The ghost vanishes, dropping gold! +50', 'success');
                        } else {
                            game.health -= 8;
                            showMessage('👻 The ghost counterattacks! -8 HP', 'danger');
                        }
                        updateUI();
                    }},
                    { text: '🙏 Show respect', effect: () => { showMessage('👻 "Wise choice, mortal."', 'info'); }}
                ]},
            { id: 'portal', title: '🌀 Mysterious Portal', text: 'A swirling portal appears. Where does it lead?',
                choices: [
                    { text: '🎲 Jump in! (Random outcome)', effect: () => {
                        const outcomes = ['good', 'great', 'bad'];
                        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
                        if (result === 'good') { game.health += 8; showMessage('🌀 Portal leads to healing springs! +8 HP', 'success'); }
                        else if (result === 'great') { giveRandomRelic(); showMessage('🌀 You found a treasure room! Relic gained!', 'success'); }
                        else { game.health -= 5; showMessage('🌀 Ouch! Rough landing. -5 HP', 'danger'); }
                        updateUI();
                    }},
                    { text: '🔍 Study it first (Safer)', effect: () => {
                        earnGold(15);
                        showMessage('🌀 You analyze the portal and find gold nearby. +15', 'success');
                        updateUI();
                    }},
                    { text: '🚫 Avoid it', effect: () => { showMessage('You don\'t trust strange portals.', 'info'); }}
                ]},
            { id: 'altar', title: '🕯️ Sacrificial Altar', text: 'An ancient altar radiates dark power. "Offer something... gain something greater."',
                choices: [
                    { text: '❤️ Sacrifice 10 HP (Rare relic)', effect: () => {
                        if (game.health > 10) {
                            game.health -= 10;
                            giveRandomRelic('rare');
                            showMessage('🕯️ The altar accepts! Rare relic gained!', 'success');
                        } else { showMessage('Not enough HP!', 'danger'); }
                        updateUI();
                    }},
                    { text: '💰 Sacrifice 30 gold (+10 max HP)', effect: () => {
                        if (game.gold >= 30) {
                            game.gold -= 30;
                            game.maxHealth += 10;
                            game.health += 10;
                            showMessage('🕯️ Power flows through you! +10 max HP', 'success');
                        } else { showMessage('Not enough gold!', 'danger'); }
                        updateUI();
                    }},
                    { text: '🏃 Flee', effect: () => { showMessage('You back away slowly.', 'info'); }}
                ]},
            { id: 'trap', title: '⚠️ Hidden Trap Room', text: 'You trigger a trap! Spikes, arrows, or treasure?',
                choices: [
                    { text: '🛡️ Defend (-5 HP, safe)', effect: () => {
                        game.health -= 5;
                        showMessage('⚠️ You block most damage! -5 HP', 'warning');
                        updateUI();
                    }},
                    { text: '🤸 Dodge! (50% avoid all)', effect: () => {
                        if (Math.random() < 0.5) {
                            earnGold(25);
                            showMessage('🤸 Perfect dodge! Found hidden gold! +25', 'success');
                        } else {
                            game.health -= 12;
                            showMessage('⚠️ Failed! Hit by trap! -12 HP', 'danger');
                        }
                        updateUI();
                    }},
                    { text: '💰 Check for treasure (Risk)', effect: () => {
                        if (Math.random() < 0.3) {
                            giveRandomRelic();
                            showMessage('🎁 Trap was a ruse! Relic found!', 'success');
                        } else {
                            game.health -= 15;
                            showMessage('💔 Trap activates! -15 HP', 'danger');
                        }
                        updateUI();
                    }}
                ]}
        ];
        
        // ===================================
        // NEW SHOP_ITEMS LIST
        // ===================================
        const SHOP_ITEMS = [
            {
                id: 'heal_small', name: '💊 Small Potion', description: 'Restore 8 HP', price: 18,
                buy: () => { game.health = Math.min(game.maxHealth, game.health + 8); showMessage('Healed 8 HP!', 'success'); return true; }
            },
            {
                id: 'heal_large', name: '🍾 Large Potion', description: 'Restore 15 HP', price: 30,
                buy: () => { game.health = Math.min(game.maxHealth, game.health + 15); showMessage('Healed 15 HP!', 'success'); return true; }
            },
            {
                id: 'heal_full', name: '✨ Elixir', description: 'Restore to full HP', price: 50,
                buy: () => { game.health = game.maxHealth; showMessage('Fully healed!', 'success'); return true; }
            },
            {
                id: 'max_health', name: '❤️ Heart Container', description: '+5 maximum HP', price: 35,
                buy: () => { game.maxHealth += 5; game.health += 5; showMessage('+5 Max HP!', 'success'); return true; }
            },
            {
                id: 'max_health_big', name: '❤️❤️ Large Heart', description: '+10 maximum HP', price: 60,
                buy: () => { game.maxHealth += 10; game.health += 10; showMessage('+10 Max HP!', 'success'); return true; }
            },
            {
                id: 'weapon_upgrade', name: '⚔️ Weapon Polish', description: 'Upgrade current weapon by +2', price: 40,
                buy: () => {
                    if (game.equippedWeapon) {
                        game.equippedWeapon.numValue += 2;
                        showMessage('Weapon upgraded!', 'success');
                        updateUI();
                        return true;
                    } else {
                        showMessage('No weapon equipped!', 'danger');
                        return false;
                    }
                }
            },
            {
                id: 'weapon_big_upgrade', name: '⚔️⚔️ Master Forge', description: 'Upgrade current weapon by +5', price: 70,
                buy: () => {
                    if (game.equippedWeapon) {
                        game.equippedWeapon.numValue += 5;
                        showMessage('Weapon greatly upgraded!', 'success');
                        updateUI();
                        return true;
                    } else {
                        showMessage('No weapon equipped!', 'danger');
                        return false;
                    }
                }
            },
            {
                id: 'common_relic', name: '⚪ Common Relic', description: 'Gain a random common relic', price: 25,
                buy: () => { giveRelicByRarity('common'); return true; }
            },
            {
                id: 'uncommon_relic', name: '🟢 Uncommon Relic', description: 'Gain a random uncommon relic', price: 50,
                buy: () => { giveRelicByRarity('uncommon'); return true; }
            },
            {
                id: 'rare_relic', name: '🔵 Rare Relic', description: 'Gain a random rare relic', price: 100,
                buy: () => { giveRelicByRarity('rare'); return true; }
            },
            {
                id: 'legendary_relic', name: '🟠 Legendary Relic', description: 'Gain a random legendary relic', price: 200,
                buy: () => { giveRelicByRarity('legendary'); return true; }
            },
            {
                id: 'repair_weapon', name: '🔧 Weapon Repair', description: 'Restore weapon durability to full', price: 25,
                buy: () => {
                    if (game.equippedWeapon && game.equippedWeapon.durability < game.equippedWeapon.maxDurability) {
                        game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                        showMessage(` Weapon repaired! (${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability})`, 'success');
                        updateUI();
                        return true;
                    } else if (!game.equippedWeapon) {
                        showMessage('No weapon equipped!', 'danger');
                        return false;
                    } else {
                        // Weapon at full durability: increase max durability by 1!
                        game.equippedWeapon.maxDurability += 1;
                        game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                        showMessage(' Weapon reinforced! Max durability increased!', 'success');
                        updateUI();
                        return true;
                    }
                }
            }
        ];
        
        let permanentUnlocks = {
            startHealth: false, startGold: false, betterDrops: false, extraRelic: false,
            strongerWeapons: false, masterHealer: false, richStart: false, comboMaster: false,
            bigStart: false, ultraWeapons: false, godMode: false, relicMaster: false,
            shopDiscount: false, eventLuck: false, survivalBonus: false, speedBonus: false,
            weaponMaster: false, potionMaster: false, goldRush: false, comboGod: false,
            durablePlus: false, startPower: false, megaHealth: false, luckyCharm: false,
            berserkMaster: false, mirrorMaster: false, dodgeMaster: false, criticalStrike: false,
            lifeSteal: false, thornsArmor: false
        };
        const UNLOCKS = [
            // Tier 1: Beginner (Easy)
            { id: 'startHealth', name: '❤️ Tough Start', description: 'Start each run with +5 max HP', requirement: 'Clear 10 rooms', check: () => getTotalStat('roomsCleared') >= 10 },
            { id: 'startGold', name: '💰 Rich Start', description: 'Start each run with 30 gold', requirement: 'Earn 200 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 200 },
            { id: 'strongerWeapons', name: '⚔️ Weapon Expert', description: 'All weapons get +1 damage', requirement: 'Defeat 50 monsters', check: () => getTotalStat('monstersSlain') >= 50 },
            { id: 'masterHealer', name: '💚 Healer', description: 'All potions heal +2 HP', requirement: 'Use 20 potions', check: () => getTotalStat('potionsUsed') >= 20 },
            { id: 'comboMaster', name: '🔥 Combo Start', description: 'Combos start at 1 instead of 0', requirement: 'Get a 5x combo', check: () => getTotalStat('maxCombo') >= 5 },
            
            // Tier 2: Intermediate (Medium)
            { id: 'betterDrops', name: '🍀 Lucky', description: '+30% gold from all sources', requirement: 'Earn 500 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 500 },
            { id: 'extraRelic', name: '🔮 Relic Start', description: 'Start each run with 1 random relic', requirement: 'Clear 30 rooms', check: () => getTotalStat('roomsCleared') >= 30 },
            { id: 'richStart', name: '💎 Wealthy Start', description: 'Start with 50 gold instead of 30', requirement: 'Earn 1000 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 1000 },
            { id: 'weaponMaster', name: '⚔️ Weapon Master', description: 'All weapons get +1 damage (stacks)', requirement: 'Equip 100 weapons', check: () => getTotalStat('weaponsEquipped') >= 100 },
            { id: 'potionMaster', name: '💊 Potion Master', description: 'All potions heal +4 HP (stacks)', requirement: 'Use 75 potions', check: () => getTotalStat('potionsUsed') >= 75 },
            
            // Tier 3: Advanced (Hard)
            { id: 'bigStart', name: '❤️❤️ Warrior Start', description: 'Start with +10 max HP (stacks)', requirement: 'Clear 75 rooms', check: () => getTotalStat('roomsCleared') >= 75 },
            { id: 'durablePlus', name: '🛠️ Durable Weapons', description: 'Weapons have +1 durability on all difficulties', requirement: 'Win 3 games', check: () => getTotalStat('gamesWon') >= 3 },
            { id: 'goldRush', name: '💰💰 Gold Rush', description: '+50% gold from all sources (stacks)', requirement: 'Earn 3000 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 3000 },
            { id: 'shopDiscount', name: '🏪 Merchant Friend', description: '20% discount in all shops', requirement: 'Buy 50 items from shop', check: () => getTotalStat('itemsBought') >= 50 },
            { id: 'relicMaster', name: '🔮🔮 Double Relic Start', description: 'Start with 2 random relics', requirement: 'Clear 100 rooms', check: () => getTotalStat('roomsCleared') >= 100 },
            
            // Tier 4: Expert (Very Hard)
            { id: 'ultraWeapons', name: '⚔️⚔️⚔️ Weapon God', description: 'All weapons get +2 damage (stacks)', requirement: 'Defeat 500 monsters', check: () => getTotalStat('monstersSlain') >= 500 },
            { id: 'startPower', name: '⚡ Power Start', description: 'Start each run with a random weapon', requirement: 'Win 5 games', check: () => getTotalStat('gamesWon') >= 5 },
            { id: 'megaHealth', name: '❤️❤️❤️ Titan Health', description: 'Start with +20 max HP total', requirement: 'Clear 150 rooms', check: () => getTotalStat('roomsCleared') >= 150 },
            { id: 'eventLuck', name: '🎲 Event Master', description: 'Events appear 50% more often', requirement: 'Complete 50 events', check: () => getTotalStat('eventsCompleted') >= 50 },
            { id: 'luckyCharm', name: '🍀🍀 Super Lucky', description: '+60% gold from all sources', requirement: 'Earn 5000 gold (lifetime)', check: () => getTotalStat('totalGoldEarned') >= 5000 },
            
            // Tier 5: Master (Extreme)
            { id: 'comboGod', name: '🔥🔥🔥 Combo God', description: 'Combos start at 2, +2 damage per combo', requirement: 'Get a 15x combo', check: () => getTotalStat('maxCombo') >= 15 },
            { id: 'survivalBonus', name: '💪 Survivor', description: 'Start with +5 HP when below 50% health', requirement: 'Win 10 games', check: () => getTotalStat('gamesWon') >= 10 },
            { id: 'speedBonus', name: '⏱️ Speedrunner', description: 'Gain 2x gold for winning under 1 minute', requirement: 'Win a game in under 1 minute', check: () => getTotalStat('fastestWin') > 0 && getTotalStat('fastestWin') < 60 },
            { id: 'berserkMaster', name: '🔥 Berserk God', description: 'Berserk gives +7 damage instead of +5', requirement: 'Use Berserk 50 times', check: () => getTotalStat('berserkUses') >= 50 },
            { id: 'mirrorMaster', name: '🪞 Mirror Master', description: 'Mirror reflects 15 damage instead of 10', requirement: 'Win a game on Hard', check: () => getTotalStat('hardWins') >= 1 },
            
            // Tier 6: Legend (Insane)
            { id: 'godMode', name: '👑 God Mode', description: 'Start with +15 max HP, 100 gold, 2 relics', requirement: 'Win 20 games', check: () => getTotalStat('gamesWon') >= 20 },
            { id: 'dodgeMaster', name: '🛡️ Dodge God', description: 'Dodge cards avoid 2 attacks instead of 1', requirement: 'Clear 200 rooms', check: () => getTotalStat('roomsCleared') >= 200 },
            { id: 'criticalStrike', name: '💥 Critical Master', description: '10% chance to deal 3x damage', requirement: 'Defeat 1000 monsters', check: () => getTotalStat('monstersSlain') >= 1000 },
            { id: 'lifeSteal', name: '🧛 Vampiric', description: 'Heal 1 HP on every perfect kill', requirement: 'Win 15 games', check: () => getTotalStat('gamesWon') >= 15 },
            { id: 'thornsArmor', name: '🌵 Thorns', description: 'Reflect 2 damage to all attackers', requirement: 'Win 3 games on Hard', check: () => getTotalStat('hardWins') >= 3 }
        ];

        // Support Functions (Shop, Relics, etc.)
        function earnGold(amount) {
            let mult = 1.0;
            
            // Gold multipliers from relics
            if (game.relics.some(r => r.id === 'lucky_penny')) mult += 0.2;
            if (game.relics.some(r => r.id === 'magnet')) mult += 0.4;
            if (game.relics.some(r => r.id === 'lucky')) mult += 0.6;
            
            // Permanent unlocks
            if (permanentUnlocks.betterDrops) mult += 0.3;   // +30%
            if (permanentUnlocks.goldRush) mult += 0.5;      // +50%
            if (permanentUnlocks.luckyCharm) mult += 0.6;    // +60% (already implemented!)
            
            const actual = Math.floor(amount * mult);
            game.gold += actual;
            game.totalGoldEarned += actual;
            updateRunningScore(); // Update score
            updateUI();
        }

        // Give relic by specific rarity
        function giveRelicByRarity(rarity) {
            let available = RELICS.filter(r => r.rarity === rarity && !game.relics.find(gr => gr.id === r.id));
            
            // If no new relics of this rarity, allow duplicates
            if (available.length === 0) {
                available = RELICS.filter(r => r.rarity === rarity);
            }
            
            if (available.length === 0) {
                showMessage('No relics of this rarity available!', 'warning');
                return;
            }
            
            const randomRelic = available[Math.floor(Math.random() * available.length)];
            game.relics.push({...randomRelic, used: false});
            game.stats.relicsCollected++;  // Track for Priest unlock
            
            // Apply immediate health effects
            if (randomRelic.effect === 'smallHealth') { game.maxHealth += 3; game.health += 3; }
            if (randomRelic.effect === 'maxHealth') { game.maxHealth += 5; game.health += 5; }
            if (randomRelic.effect === 'bigHealth') { game.maxHealth += 10; game.health += 10; }
            if (randomRelic.effect === 'tinyHealth') { game.maxHealth += 1; game.health += 1; }
            
            const rarityColors = { common: '⚪', uncommon: '🟢', rare: '🔵', legendary: '🟠' };
            showMessage(`${rarityColors[rarity]} Relic: ${randomRelic.name}!`, 'success');
            updateRelicsDisplay();
            updateUI();
        }
        
        // Give random relic (defaults to common for unlocks)
        function giveRandomRelic(rarityFilter = 'common') {
            giveRelicByRarity(rarityFilter);
        }
        
        function giveRareRelic() {
            giveRelicByRarity('rare');
        }

        function updateRelicsDisplay() {
            if (game.relics.length === 0) {
                relicsList.innerHTML = '<div class="relic-effect">No relics yet.</div>';
                return;
            }
            relicsList.innerHTML = game.relics.map(r => `
                <div class="relic-item ${r.used ? 'used' : ''}" 
                     title="${r.description}${r.used ? ' (Used)' : ''}"
                     onmouseenter="showTooltip(this, '${r.description.replace(/'/g, "\\'")}', 'bottom')"
                     onmouseleave="hideTooltip()"
                     style="cursor: help;">
                    <div class="relic-name">${r.name}</div>
                    <div class="relic-effect">${r.description}</div>
                </div>
            `).join('');
        }

        function getRelicBonus(type) {
            let bonus = 0;
            game.relics.forEach(r => {
                if (r.effect === type) {
                    // Power bonuses
                    if (type === 'smallPower') bonus += 1;
                    if (type === 'power') bonus += 2;
                    if (type === 'bigPower') bonus += 3;
                    
                    // Heal bonuses
                    if (type === 'smallHealBonus') bonus += 1;
                    if (type === 'healBonus') bonus += 2;
                    
                    // Gold bonuses
                    if (type === 'smallGoldPerRoom') bonus += 2;
                    if (type === 'goldPerRoom') bonus += 3;
                }
            });
            
            // Crown: Double all stat bonuses from relics
            if (game.relics.some(r => r.id === 'crown')) {
                bonus *= 2;
            }
            
            // Permanent unlocks bonuses (BALANCED for better progression)
            if (type === 'power') {
                if (permanentUnlocks.strongerWeapons) bonus += 1;  // +1 damage
                if (permanentUnlocks.weaponMaster) bonus += 1;    // +1 damage (reduced from +2)
                if (permanentUnlocks.ultraWeapons) bonus += 2;    // +2 damage (reduced from +4)
                // Total: +4 instead of +7 (better game balance)
            }
            if (type === 'healBonus') {
                if (permanentUnlocks.masterHealer) bonus += 2;    // +2 HP potions
                if (permanentUnlocks.potionMaster) bonus += 4;    // +4 HP potions (stacks)
            }
            
            // Sum all power types for total weapon bonus
            if (type === 'totalPower') {
                bonus += getRelicBonus('smallPower');
                bonus += getRelicBonus('power');
                bonus += getRelicBonus('bigPower');
            }
            
            return bonus;
        }

        function triggerRandomEvent() {
            if (game.gameOver) return;
            
            game.stats.eventsTriggered++;  // Track for Priest unlock
            
            // Filter out events already seen this run (no repeats)
            const availableEvents = EVENTS.filter(e => !game.seenEvents.includes(e.id));
            
            // If all events seen, reset the pool
            if (availableEvents.length === 0) {
                game.seenEvents = [];
                availableEvents.push(...EVENTS);
            }
            
            // Pick random event from available pool
            const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
            
            // Mark event as seen this run
            game.seenEvents.push(event.id);
            
            // Mark that an event was triggered this room (max 1 per room)
            game.eventTriggeredThisRoom = true;
            
            showEventModal(event);
        }
        
        function showEventModal(event) {
            eventTitle.textContent = event.title;
            eventText.innerHTML = event.text;
            eventChoices.innerHTML = ''; // Clear previous choices
            
            event.choices.forEach(choice => {
                const choiceEl = document.createElement('div');
                choiceEl.className = 'event-choice';
                choiceEl.innerHTML = choice.text;
                choiceEl.onclick = () => {
                    choice.effect();
                    
                    // Lantern: +2 gold per event
                    if (game.relics.some(r => r.id === 'lantern')) {
                        earnGold(2);
                        showMessage('🏮 Lantern: +2 gold from event!', 'info');
                    }
                    
                    // Holy Necklace: Events heal 2 HP
                    if (game.relics.some(r => r.id === 'necklace')) {
                        game.health = Math.min(game.maxHealth, game.health + 2);
                        showMessage('📿 Holy Necklace: +2 HP!', 'success');
                    }
                    
                    eventModal.classList.remove('active');
                    
                    // Track event completion for achievement
                    const saved = localStorage.getItem('scoundrel_lifetime_stats');
                    let lifetimeStats = saved ? JSON.parse(saved) : {};
                    lifetimeStats.eventsCompleted = (lifetimeStats.eventsCompleted || 0) + 1;
                    localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
                    
                    // Re-enable buttons if room is empty
                    if (game.room.length === 0) {
                        btnDrawRoom.disabled = false;
                        btnAvoidRoom.disabled = game.lastActionWasAvoid;
                    }
                    updateUI();
                    checkGameState();
                    checkAchievements();
                };
                eventChoices.appendChild(choiceEl);
            });
            
            // Disable game buttons while event is active
            
            eventModal.classList.remove('active');
            
            // Track event completion for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.eventsCompleted = (lifetimeStats.eventsCompleted || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        }
        
        function updateShopDisplay() {
            // Clear existing items
            shopItems.innerHTML = '';
            shopGoldAmount.textContent = game.gold;
            
            // Check for shop discount (unlocks + relics)
            let discount = 1.0;
            
            // Permanent unlock: 20% discount
            if (permanentUnlocks.shopDiscount) discount *= 0.8;
            
            // Dice relic: 5% discount
            if (game.relics.some(r => r.id === 'dice')) discount *= 0.95;
            
            // Crystal relic: 15% discount
            if (game.relics.some(r => r.id === 'crystal')) discount *= 0.85;
            
            // Show price multiplier warning if prices have increased
            if (game.shopPriceMultiplier > 1.0) {
                const increasePercent = Math.round((game.shopPriceMultiplier - 1) * 100);
                const warningBanner = document.createElement('div');
                warningBanner.style.cssText = 'background: rgba(255, 107, 107, 0.2); border: 2px solid #ff6b6b; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
                warningBanner.innerHTML = `⚠️ <strong>Prices increased by ${increasePercent}%</strong> due to repeated purchases!`;
                shopItems.appendChild(warningBanner);
            }
            
            // Old Key: Check if we have a free item available
            const hasOldKey = game.relics.find(r => r.id === 'key' && !r.used);
            
            SHOP_ITEMS.forEach((item, itemIndex) => {
                // Old Key: First item is FREE (once per game)
                let finalPrice;
                let basePrice = Math.floor(item.price * discount);
                
                if (hasOldKey && itemIndex === 0) {
                    finalPrice = 0;
                } else {
                    finalPrice = Math.floor(basePrice * game.shopPriceMultiplier);
                }
                const itemEl = document.createElement('div');
                itemEl.className = 'shop-item';
                
                // Add visual indicator if can't afford
                const canAfford = game.gold >= finalPrice;
                const affordClass = canAfford ? '' : 'cannot-afford';
                const priceColor = canAfford ? '#ffd700' : '#ff6b6b';
                
                // Show original price if discount OR price increased
                let priceDisplayHTML = '';
                if (discount < 1.0 && game.shopPriceMultiplier > 1.0) {
                    // Show both original and base (with multiplier) if both active
                    priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> → <span style="text-decoration: line-through; opacity: 0.5;">${basePrice}</span> `;
                } else if (discount < 1.0) {
                    // Just discount
                    priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
                } else if (game.shopPriceMultiplier > 1.0) {
                    // Just price increase
                    priceDisplayHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${item.price}</span> `;
                }
                
                itemEl.innerHTML = `
                    <div class="item-info ${affordClass}">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                        <div class="item-price" style="color: ${priceColor}; font-weight: bold;">
                            ${priceDisplayHTML}${finalPrice} 🪙
                            ${!canAfford ? ' <span style="color: #ff6b6b; font-size: 0.9em;">(Need ' + (finalPrice - game.gold) + ' more)</span>' : ''}
                        </div>
                    </div>
                    <button class="buy-btn" data-item-id="${item.id}" data-price="${finalPrice}">${canAfford ? 'Buy' : '🔒 Locked'}</button>
                `;
                
                const buyBtn = itemEl.querySelector('.buy-btn');
                if (!canAfford) {
                    buyBtn.disabled = true;
                    buyBtn.style.opacity = '0.5';
                }
                
                buyBtn.onclick = () => buyItem(item, finalPrice);
                
                shopItems.appendChild(itemEl);
            });
            
            // Show discount banner if unlocked
            if (discount < 1.0) {
                const banner = document.createElement('div');
                banner.style.cssText = 'background: rgba(255, 215, 0, 0.2); border: 2px solid #ffd700; padding: 10px; margin-bottom: 15px; text-align: center; border-radius: 8px;';
                banner.innerHTML = '🏪 <strong>Merchant Friend Active!</strong> 20% discount on all items!';
                shopItems.prepend(banner);
            }
        }
        
        function buyItem(item, finalPrice) {
            if (game.gold < finalPrice) {
                showMessage(`❌ Not enough gold! Need ${finalPrice - game.gold} more.`, 'danger');
                playSound('error');
                return;
            }
            
            const success = item.buy(); // Run the item's function
            if (success) {
                // Old Key: Mark as used if this was a free purchase
                if (finalPrice === 0) {
                    const keyRelic = game.relics.find(r => r.id === 'key');
                    if (keyRelic) {
                        keyRelic.used = true;
                        showMessage('🗝️ Old Key used - 1 free item!', 'info');
                    }
                }
                
                game.gold -= finalPrice;
                
                // ANTI-EXPLOIT: Increase prices by 8% after each purchase (balanced)
                game.shopPriceMultiplier *= 1.08;
                
                showMessage(`Purchased ${item.name}!`, 'success');
                playSound('special');
                
                // Track item purchase for achievement
                const saved = localStorage.getItem('scoundrel_lifetime_stats');
                let lifetimeStats = saved ? JSON.parse(saved) : {};
                lifetimeStats.itemsBought = (lifetimeStats.itemsBought || 0) + 1;
                localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
                
                updateUI();
                updateShopDisplay(); // Re-render shop
                checkAchievements();
            } else {
                playSound('error');
            }
        }
        
        function openShop() {
            updateShopDisplay();
            // Disable game buttons
            btnDrawRoom.disabled = true;
            btnAvoidRoom.disabled = true;
            shopModal.classList.add('active');
            
            // Switch to shop music
            music.switchContext('shop');
            
            // Track shop visit for score penalty AND achievements
            game.stats.shopsVisited = (game.stats.shopsVisited || 0) + 1;
            
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.shopsVisited = (lifetimeStats.shopsVisited || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            checkAchievements();
        }
        
        function closeShop() {
            shopModal.classList.remove('active');
            // Return to gameplay music
            music.switchContext('gameplay');
            if (game.room.length === 0) {
                btnDrawRoom.disabled = false;
                btnAvoidRoom.disabled = game.lastActionWasAvoid;
            }
        }

        // Modal open/close functions
        function showTutorial() { 
            tutorialModal.classList.add('active'); 
            trapFocus(tutorialModal);
            hapticFeedback('light');
        }
        
        function openUnlocks() { 
            updateUnlocksDisplay();
            unlocksModal.classList.add('active');
            trapFocus(unlocksModal);
            hapticFeedback('light');
        }
        
        function updateUnlocksDisplay() { 
            const unlocksList = document.getElementById('unlocksList');
            unlocksList.innerHTML = UNLOCKS.map(unlock => {
                const isUnlocked = permanentUnlocks[unlock.id];
                const canUnlock = !isUnlocked && unlock.check();
                return `
                <div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}">
                    <div class="item-info">
                        <div class="item-name">${unlock.name}</div>
                        <div class="item-description">${unlock.description}</div>
                        <div class="unlock-requirement">
                            ${isUnlocked ? '✅ UNLOCKED' : 
                              (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}
                        </div>
                    </div>
                    ${!isUnlocked && canUnlock ? `
                        <button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">
                            Unlock
                        </button>
                    ` : ''}
                </div>
            `}).join('');
        }
        
        // Track active filter for re-application after unlock
        let activeUpgradeFilter = 'all';
        
        window.unlockUpgradeWrapper = (unlockId) => {
            const unlockData = UNLOCKS.find(u => u.id === unlockId);
            
            permanentUnlocks[unlockId] = true;
            saveUnlocks();
            
            // Enhanced visual feedback
            showMessage(`✨ ${unlockData.name} UNLOCKED!`, 'success');
            playSound('special');
            createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 50);
            
            // Re-apply current filter to update the list
            if (activeUpgradeFilter !== 'all') {
                filterUpgradesByStatus(activeUpgradeFilter);
            } else {
                updateUnlocksDisplay();
            }
        }
        
        // Expose Give Up function globally for onclick
        window.tryGiveUp = () => {
            if (game.gameStartTime > 0 && !game.gameOver) {
                document.getElementById('giveUpModal').classList.add('active');
            } else {
                alert('Start a game first!');
            }
        }
        
        // Expose closeShop globally for onclick
        window.closeShopWrapper = () => closeShop();
        
        // Expose closeEvent globally for onclick
        window.closeEventWrapper = () => {
            eventModal.classList.remove('active');
            // Re-enable buttons if room is empty
            if (game.room.length === 0) {
                btnDrawRoom.disabled = false;
                btnAvoidRoom.disabled = game.lastActionWasAvoid;
            }
        };
        
        window.confirmGiveUp = () => {
            document.getElementById('giveUpModal').classList.remove('active');
            endGame('death', true);
        }
        
        function loadUnlocks() {
             const saved = localStorage.getItem('scoundrel_unlocks');
             if(saved) {
                try {
                    const parsed = JSON.parse(saved);
                    permanentUnlocks = { ...permanentUnlocks, ...parsed }; // This merges the saved data into the default structure
                } catch(e) { console.error("Failed to parse unlocks:", e); }
             }
        }
        function saveUnlocks() { 
            UNLOCKS.forEach(unlock => {
                if (!permanentUnlocks[unlock.id] && unlock.check()) {
                    // We don't unlock here, just check. Unlocking is manual.
                }
            });
            localStorage.setItem('scoundrel_unlocks', JSON.stringify(permanentUnlocks)); 
        }
        
        function applyPermanentUnlocks() {
            // Gold unlocks
            if (permanentUnlocks.startGold) earnGold(30);
            if (permanentUnlocks.richStart) earnGold(20); // Total 50
            if (permanentUnlocks.godMode) earnGold(100); // God Mode bonus
            
            // HP unlocks (apply before health is set)
            let bonusMaxHP = 0;
            if (permanentUnlocks.startHealth) bonusMaxHP += 5;
            if (permanentUnlocks.bigStart) bonusMaxHP += 10;
            if (permanentUnlocks.megaHealth) bonusMaxHP += 20;
            if (permanentUnlocks.godMode) bonusMaxHP += 15;
            if (bonusMaxHP > 0) {
                game.maxHealth += bonusMaxHP;
                game.health += bonusMaxHP;
            }
            
            // Relic unlocks
            if (permanentUnlocks.extraRelic) giveRandomRelic();
            if (permanentUnlocks.relicMaster) {
                giveRandomRelic();
                giveRandomRelic();
            }
            if (permanentUnlocks.godMode) {
                giveRandomRelic();
                giveRandomRelic();
            }
            
            // Weapon unlock
            if (permanentUnlocks.startPower) {
                const weaponValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
                const randomValue = weaponValues[Math.floor(Math.random() * weaponValues.length)];
                const weaponCard = {
                    value: randomValue.toString(),
                    suit: '♦',
                    numValue: randomValue,
                    suitName: 'diamonds'
                };
                game.room.push(weaponCard);
                showMessage('⚡ Power Start! Free weapon in room!', 'success');
            }
        }

        // ============================================
        // LEADERBOARD (FIREBASE)
        // ============================================
        async function submitScoreToLeaderboard(score, gameTime) {
            if (!db || !appId || !userId) throw new Error("Firebase is not ready");
            
            const playerName = playerNameInput.value.trim() || 'Scoundrel';
            
            // Salvar em collection específica por dificuldade
            const collectionName = `leaderboard_${game.difficulty}`;
            const leaderboardCol = collection(db, `/artifacts/${appId}/public/data/${collectionName}`);
            
            const scoreData = {
                name: playerName.substring(0, 20),
                score: score,
                userId: userId,
                difficulty: game.difficulty,
                time: gameTime,
                health: game.health,
                combo: game.stats.maxCombo,
                gold: game.totalGoldEarned,
                createdAt: new Date().toISOString()
            };
            
            await addDoc(leaderboardCol, scoreData);
            console.log(`Score submitted to ${collectionName}:`, scoreData);
        }

        // Current selected difficulty for leaderboard
        let currentLeaderboardDifficulty = 'easy';

        async function showLeaderboard(difficulty = 'easy') {
            leaderboardModal.classList.add('active');
            trapFocus(leaderboardModal);
            hapticFeedback('light');
            currentLeaderboardDifficulty = difficulty;
            
            // Show loading skeleton
            const leaderboardList = document.getElementById('leaderboardList');
            leaderboardList.innerHTML = `
                <div class="skeleton" style="height: 60px; margin-bottom: 10px; border-radius: 6px;"></div>
                <div class="skeleton" style="height: 60px; margin-bottom: 10px; border-radius: 6px;"></div>
                <div class="skeleton" style="height: 60px; margin-bottom: 10px; border-radius: 6px;"></div>
                <div class="skeleton" style="height: 60px; margin-bottom: 10px; border-radius: 6px;"></div>
                <div class="skeleton" style="height: 60px; margin-bottom: 10px; border-radius: 6px;"></div>
            `;
            
            await loadLeaderboardForDifficulty(difficulty);
        }

        async function loadLeaderboardForDifficulty(difficulty) {
            const listDiv = document.getElementById('leaderboardList');
            listDiv.innerHTML = '<p style="text-align: center; color: #aaa;">Loading scores...</p>';
            
            // Validate difficulty
            if (!difficulty || typeof difficulty !== 'string') {
                difficulty = 'easy'; // Default fallback
            }
            
            if (!db || !appId) {
                listDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <p style="color: #ffd93d; font-size: 1.2em; margin-bottom: 15px;">📡 Offline Mode</p>
                        <p style="color: #aaa;">Leaderboard requires online connection.</p>
                        <p style="color: #aaa; font-size: 0.9em; margin-top: 10px;">
                            Your progress and achievements are still saved locally!
                        </p>
                    </div>
                `;
                return;
            }

            try {
                // Carregar da collection específica da dificuldade
                const collectionName = `leaderboard_${difficulty}`;
                const leaderboardCol = collection(db, `/artifacts/${appId}/public/data/${collectionName}`);
                const q = query(leaderboardCol, limit(100)); // Get latest 100
                
                const querySnapshot = await getDocs(q);
                let scores = [];
                querySnapshot.forEach(doc => scores.push(doc.data()));
                
                // Sort on client (mandatory)
                scores.sort((a, b) => b.score - a.score);
                
                const top10 = scores.slice(0, 10);
                
                if (top10.length === 0) {
                    const diffIcons = { easy: '🟢', normal: '🟡', hard: '🔴', endless: '♾️' };
                    const diffName = difficulty ? difficulty.toUpperCase() : 'UNKNOWN';
                    listDiv.innerHTML = `<p style="text-align: center; color: #aaa;">No scores yet for ${diffIcons[difficulty] || '❓'} ${diffName}.<br>Be the first!</p>`;
                    return;
                }
                
                listDiv.innerHTML = top10.map((entry, index) => `
                    <div class="leaderboard-entry">
                        <span class="leaderboard-rank">#${index + 1}</span>
                        <div style="flex: 1;">
                            <div class="leaderboard-name">${entry.name || 'Scoundrel'}</div>
                            <div class="leaderboard-details" style="font-size: 0.8em; color: #aaa;">
                                ${entry.time}s | ${entry.combo}x Combo | ${entry.gold}🪙
                            </div>
                        </div>
                        <span class="leaderboard-score">${entry.score}</span>
                    </div>
                `).join('');

            } catch (e) {
                console.error("Error fetching leaderboard:", e);
                
                // Better error messaging
                let errorMsg = 'Could not load leaderboard';
                let helpText = '';
                
                if (e.code === 'permission-denied' || e.message.includes('permission')) {
                    errorMsg = 'Leaderboard Temporarily Unavailable';
                    helpText = 'The developer is configuring the database. Try again in a few minutes!';
                } else if (e.code === 'unavailable') {
                    errorMsg = 'Connection Issue';
                    helpText = 'Check your internet connection and try again.';
                } else {
                    helpText = e.message || 'Unknown error';
                }
                
                listDiv.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="font-size: 3em; margin-bottom: 15px;">⚠️</div>
                        <p style="color: #ffd93d; font-size: 1.2em; margin-bottom: 10px;">${errorMsg}</p>
                        <p style="color: #aaa; font-size: 0.95em; line-height: 1.6;">${helpText}</p>
                        <button onclick="loadLeaderboardForDifficulty('${difficulty}')" style="
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
                        ">Try Again</button>
                    </div>
                `;
            }
        }

        // Expose function globally for retry button
        window.loadLeaderboardForDifficulty = loadLeaderboardForDifficulty;
        
        // Switch leaderboard difficulty (chamada pelos tabs)
        window.switchLeaderboardDifficulty = async function(difficulty) {
            currentLeaderboardDifficulty = difficulty;
            
            // Update tab active state
            document.querySelectorAll('.difficulty-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.difficulty === difficulty) {
                    tab.classList.add('active');
                }
            });
            
            // Load new leaderboard
            await loadLeaderboardForDifficulty(difficulty);
        }
        
        // ============================================
        // PERMANENT STATS (LOCALSTORAGE)
        // ============================================
        function loadPermanentStats() {
            const saved = localStorage.getItem('scoundrel_permanent_stats');
            if (saved) {
                try {
                    permanentStats = JSON.parse(saved);
                } catch(e) {
                    permanentStats = { gamesWon: 0, hardWins: 0, fastestWin: 0 };
                }
            } else {
                permanentStats = { gamesWon: 0, hardWins: 0, fastestWin: 0 };
            }
        }
        function savePermanentStats() {
            localStorage.setItem('scoundrel_permanent_stats', JSON.stringify(permanentStats));
        }
        
        function getTotalStat(stat) {
            const stats = storage.get('scoundrel_lifetime_stats', {});
            return stats[stat] || 0;
        }

        function updateLifetimeStats(reason = '', gaveUp = false) {
            storage.update('scoundrel_lifetime_stats', stats => ({
                ...stats,
                // Track deaths only for real deaths (not victories, not gave up)
                deaths: (reason === 'death' && !gaveUp) ? (stats.deaths || 0) + 1 : (stats.deaths || 0),
                monstersSlain: (stats.monstersSlain || 0) + game.stats.monstersSlain,
                roomsCleared: (stats.roomsCleared || 0) + game.stats.roomsCleared,
                potionsUsed: (stats.potionsUsed || 0) + game.stats.potionsUsed,
                totalGoldEarned: (stats.totalGoldEarned || 0) + game.totalGoldEarned,
                maxCombo: Math.max((stats.maxCombo || 0), game.stats.maxCombo),
                weaponsEquipped: (stats.weaponsEquipped || 0) + game.stats.weaponsEquipped,
                specialsUsed: (stats.specialsUsed || 0) + game.stats.specialsUsed,
                roomsAvoided: (stats.roomsAvoided || 0) + game.stats.roomsAvoided,
                cardsHeld: (stats.cardsHeld || 0) + game.stats.cardsHeld,
                gamesWon: (stats.gamesWon || 0) + game.stats.gamesWon,
                // Difficulty-specific wins
                easyWins: game.stats.gamesWon > 0 && game.difficulty === 'easy' ? (stats.easyWins || 0) + 1 : (stats.easyWins || 0),
                normalWins: game.stats.gamesWon > 0 && game.difficulty === 'normal' ? (stats.normalWins || 0) + 1 : (stats.normalWins || 0),
                hardWins: game.stats.gamesWon > 0 && game.difficulty === 'hard' ? (stats.hardWins || 0) + 1 : (stats.hardWins || 0),
                // Class unlock tracking
                bossesKilled: (stats.bossesKilled || 0) + game.stats.bossesKilled,
                totalRelicsCollected: (stats.totalRelicsCollected || 0) + game.stats.relicsCollected,
                eventsTriggered: (stats.eventsTriggered || 0) + game.stats.eventsTriggered
            }));
            
            // Check achievements after updating stats
            checkAllAchievements();
        }

        // ============================================
        // ACHIEVEMENTS SYSTEM
        // ============================================
        function getLifetimeStat(stat) {
            return getTotalStat(stat); // Alias for achievements
        }
        
        function loadAchievements() {
            return storage.get('dungeon_scoundrel_achievements', []);
        }
        
        function saveAchievements(unlockedIds) {
            storage.set('dungeon_scoundrel_achievements', unlockedIds);
        }
        
        function unlockAchievement(achievementId) {
            const unlocked = loadAchievements();
            if (!unlocked.includes(achievementId)) {
                unlocked.push(achievementId);
                saveAchievements(unlocked);
                
                const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
                if (ach) {
                    showAchievementToast(ach);
                    playSound('special');
                    createParticles(window.innerWidth / 2, window.innerHeight / 3, '#ffd700', 50);
                }
                
                updateAchievementCounter();
                return true;
            }
            return false;
        }
        
        // Track active achievement toasts for stacking
        let achievementToastCount = 0;
        
        function showAchievementToast(achievement) {
            const toast = document.createElement('div');
            toast.className = 'message success achievement-toast';
            
            // Position à direita, empilhado progressivamente
            const topPosition = 80 + (achievementToastCount * 130); // 130px de espaço entre toasts
            achievementToastCount++;
            
            toast.style.cssText = `
                position: fixed; 
                top: ${topPosition}px; 
                right: 20px; 
                z-index: 9999; 
                min-width: 320px;
                max-width: 350px;
                animation: slideInRight 0.5s ease;
                box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
            `;
            
            toast.innerHTML = `
                <div style="font-size: 1.3em;">🏆 ACHIEVEMENT!</div>
                <div style="font-size: 1.1em; margin-top: 5px;">${achievement.icon} ${achievement.title}</div>
                <div style="font-size: 0.9em; margin-top: 3px; opacity: 0.8;">${achievement.description}</div>
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    toast.remove();
                    achievementToastCount--;
                }, 500);
            }, 4000);
        }
        
        function checkAllAchievements() {
            let newlyUnlocked = [];
            const unlocked = loadAchievements();
            
            ACHIEVEMENTS.forEach(ach => {
                if (!unlocked.includes(ach.id) && ach.check()) {
                    if (unlockAchievement(ach.id)) {
                        newlyUnlocked.push(ach.title);
                    }
                }
            });
            
            return newlyUnlocked;
        }
        
        function updateAchievementCounter() {
            const unlocked = loadAchievements();
            achievementCounter.textContent = `${unlocked.length}/50`;
        }
        
        function updateAchievementsDisplay() {
            const unlocked = loadAchievements();
            
            // Update counters
            const bronze = ACHIEVEMENTS.filter(a => a.tier === 'bronze');
            const silver = ACHIEVEMENTS.filter(a => a.tier === 'silver');
            const gold = ACHIEVEMENTS.filter(a => a.tier === 'gold');
            const platinum = ACHIEVEMENTS.filter(a => a.tier === 'platinum');
            
            const bronzeUnlocked = bronze.filter(a => unlocked.includes(a.id)).length;
            const silverUnlocked = silver.filter(a => unlocked.includes(a.id)).length;
            const goldUnlocked = gold.filter(a => unlocked.includes(a.id)).length;
            const platinumUnlocked = platinum.filter(a => unlocked.includes(a.id)).length;
            
            document.getElementById('achievementStats').textContent = `${unlocked.length}/50 Unlocked`;
            document.getElementById('bronzeCount').textContent = `${bronzeUnlocked}/25`;
            document.getElementById('silverCount').textContent = `${silverUnlocked}/15`;
            document.getElementById('goldCount').textContent = `${goldUnlocked}/9`;
            document.getElementById('platinumCount').textContent = `${platinumUnlocked}/1`;
            
            // Render achievement cards
            achievementsList.innerHTML = ACHIEVEMENTS.map(ach => {
                const isUnlocked = unlocked.includes(ach.id);
                const isSecret = ach.secret && !isUnlocked;
                
                return `
                    <div class="achievement-card ${ach.tier} ${isUnlocked ? 'unlocked' : 'locked'} ${isSecret ? 'secret' : ''}">
                        <div class="achievement-header">
                            <span class="achievement-medal">${ach.icon}</span>
                            <span class="achievement-title">${isSecret ? '???' : ach.title}</span>
                        </div>
                        ${!isSecret ? `<div class="achievement-description">${ach.description}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        // ============================================
        // BUG REPORT (EmailJS)
        // ============================================
        const EMAILJS_SERVICE_ID = 'service_1zs9c54';
        const EMAILJS_TEMPLATE_ID = 'template_x3cplm6';
        const GAME_VERSION = 'v1.3.0';
        function sendBugReport() {
            try {
                const textarea = document.getElementById('bugMessage');
                if (!textarea) { alert('Bug report unavailable.'); return; }
                const message = (textarea.value || '').trim();
                if (!message) { alert('Please describe the bug.'); return; }
                if (!window.emailjs) { alert('Email service not loaded.'); return; }
                const params = {
                    from_name: 'Player',
                    reply_to: '',
                    message: message,
                    browser: navigator.userAgent,
                    screen: `${window.innerWidth}x${window.innerHeight}`,
                    version: GAME_VERSION,
                    date: new Date().toLocaleString()
                };
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
                    .then(() => {
                        document.getElementById('bugReportModal')?.classList.remove('active');
                        textarea.value = '';
                        alert('Bug report sent. Thank you!');
                    })
                    .catch(() => {
                        alert('Failed to send the bug report. Try again later.');
                    });
            } catch (e) {
                alert('Unexpected error while sending.');
            }
        }

        // ============================================
        // INITIALIZATION
        // ============================================
        loadPermanentStats();
        loadUnlocks();
        updateAchievementCounter();
        
        // Initialize menu music (autoplay)
        setTimeout(() => {
            game.settings.musicEnabled = true;
            music.switchContext('menu');
            music.start();
            updateWelcomeMusicButton();
        }, 100);
        
        showWelcomeScreen(); // Show welcome screen on load

        // ============================================
        // CODEX SYSTEM (Unified UI)
        // ============================================
        console.log('[CODEX] Initializing CODEX system...');
        
        function openCodex(tab = 'upgrades') {
            console.log('[CODEX] Opening CODEX with tab:', tab);
            populateCodexUpgrades();
            populateCodexRelics('all');
            populateCodexAchievements();
            switchCodexTab(tab);
            const codexModal = document.getElementById('codexModal');
            if (codexModal) {
                codexModal.classList.add('active');
                trapFocus(codexModal);
                hapticFeedback('light');
            }
        }
        
        function switchCodexTab(tabName) {
            document.querySelectorAll('.codex-content').forEach(content => content.style.display = 'none');
            document.querySelectorAll('.codex-tab').forEach(tab => {
                tab.style.background = 'linear-gradient(180deg, #3d3328 0%, #2a2318 100%)';
                tab.style.borderColor = '#5a4a38';
                tab.style.color = '#c9a961';
            });
            const tabNameCapitalized = tabName.charAt(0).toUpperCase() + tabName.slice(1);
            const content = document.getElementById(`codexContent${tabNameCapitalized}`);
            if (content) content.style.display = 'block';
            const selectedTab = document.getElementById(`codexTab${tabNameCapitalized}`);
            if (selectedTab) {
                selectedTab.style.background = 'linear-gradient(180deg, #4a3d2f 0%, #342820 100%)';
                selectedTab.style.borderColor = '#d4af37';
                selectedTab.style.color = '#d4af37';
            }
        }
        
        function populateCodexUpgrades() {
            const upgradesList = document.getElementById('upgradesList');
            if (!upgradesList) return;
            
            // AUTO-SORT: Available first, then unlocked, then locked
            const sortedUnlocks = [...UNLOCKS].sort((a, b) => {
                const aUnlocked = permanentUnlocks[a.id];
                const bUnlocked = permanentUnlocks[b.id];
                const aAvailable = !aUnlocked && a.check();
                const bAvailable = !bUnlocked && b.check();
                
                // Priority: Available > Unlocked > Locked
                if (aAvailable && !bAvailable) return -1;
                if (!aAvailable && bAvailable) return 1;
                if (aUnlocked && !bUnlocked && !bAvailable) return -1;
                if (!aUnlocked && bUnlocked && !aAvailable) return 1;
                return 0;
            });
            
            upgradesList.innerHTML = sortedUnlocks.map(unlock => {
                const isUnlocked = permanentUnlocks[unlock.id];
                const canUnlock = !isUnlocked && unlock.check();
                return `<div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}"><div class="item-info"><div class="item-name">${unlock.name}</div><div class="item-description">${unlock.description}</div><div class="unlock-requirement">${isUnlocked ? '✅ UNLOCKED' : (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}</div></div>${!isUnlocked && canUnlock ? `<button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">Unlock</button>` : ''}</div>`;
            }).join('');
        }
        
        function populateCodexRelics(rarityFilter = 'all') {
            const glossary = document.getElementById('relicsGlossary');
            if (!glossary) return;
            
            let filteredRelics = rarityFilter === 'all' ? RELICS : RELICS.filter(r => r.rarity === rarityFilter);
            const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
            const rarityColors = {common: {bg: 'rgba(170, 170, 170, 0.1)', border: '#aaa', emoji: '⚪', name: 'Common'}, uncommon: {bg: 'rgba(107, 207, 127, 0.1)', border: '#6bcf7f', emoji: '🟢', name: 'Uncommon'}, rare: {bg: 'rgba(74, 158, 255, 0.1)', border: '#4a9eff', emoji: '🔵', name: 'Rare'}, legendary: {bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', emoji: '🟠', name: 'Legendary'}};
            let html = '';
            if (rarityFilter === 'all') {
                rarityOrder.forEach(rarity => {
                    const relicsInRarity = RELICS.filter(r => r.rarity === rarity);
                    if (relicsInRarity.length === 0) return;
                    const colors = rarityColors[rarity];
                    html += `<div style="margin-bottom: 25px;"><h3 style="color: ${colors.border}; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.1em; font-family: 'Cinzel', serif;">${colors.emoji} ${colors.name} (${relicsInRarity.length})</h3><div style="display: grid; gap: 10px;">`;
                    relicsInRarity.forEach(relic => {
                        const nameParts = relic.name.split(' ');
                        const icon = nameParts[0];
                        const name = nameParts.slice(1).join(' ');
                        html += `<div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 12px 15px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;"><span style="font-size: 1.3em;">${icon}</span><span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span></div><p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p></div>`;
                    });
                    html += `</div></div>`;
                });
            } else {
                const colors = rarityColors[rarityFilter];
                html += '<div style="display: grid; gap: 10px;">';
                filteredRelics.forEach(relic => {
                    const nameParts = relic.name.split(' ');
                    const icon = nameParts[0];
                    const name = nameParts.slice(1).join(' ');
                    html += `<div style="background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 12px 15px; transition: all 0.2s ease;" onmouseover="this.style.borderColor='#c9a961'; this.style.transform='translateX(5px)'" onmouseout="this.style.borderColor='${colors.border}'; this.style.transform='translateX(0)'"><div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;"><span style="font-size: 1.3em;">${icon}</span><span style="color: #d4af37; font-weight: bold; font-size: 1.05em; font-family: 'Cinzel', serif;">${name}</span></div><p style="color: #ddd; font-size: 0.9em; margin: 0; line-height: 1.5;">${relic.description}</p></div>`;
                });
                html += '</div>';
            }
            glossary.innerHTML = html;
        }
        
        function populateCodexAchievements() {
            const achievementsListCodex = document.getElementById('achievementsListCodex');
            if (!achievementsListCodex) return;
            
            // Load unlocked achievements
            const unlockedIds = loadAchievements();
            
            const categories = ['bronze', 'silver', 'gold', 'platinum'];
            const tierColors = {bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2'};
            const tierIcons = {bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎'};
            let html = '';
            categories.forEach(tier => {
                const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === tier);
                if (tierAchievements.length === 0) return;
                html += `<div style="margin-bottom: 20px;"><h3 style="color: ${tierColors[tier]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">${tierIcons[tier]} ${tier} (${tierAchievements.length})</h3><div style="display: grid; gap: 8px;">`;
                tierAchievements.forEach(achievement => {
                    const unlocked = unlockedIds.includes(achievement.id);
                    html += `<div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; border-radius: 6px; padding: 10px 12px; opacity: ${unlocked ? '1' : '0.6'}; transition: all 0.2s ease;" onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'"><div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}</div><div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div></div>`;
                });
                html += `</div></div>`;
            });
            achievementsListCodex.innerHTML = html;
            
            // Update stats
            const unlockedCount = unlockedIds.length;
            const statsElement = document.getElementById('achievementStatsCodex');
            if (statsElement) statsElement.textContent = `${unlockedCount}/50 Unlocked`;
            const bronzeCount = ACHIEVEMENTS.filter(a => a.tier === 'bronze' && unlockedIds.includes(a.id)).length;
            const silverCount = ACHIEVEMENTS.filter(a => a.tier === 'silver' && unlockedIds.includes(a.id)).length;
            const goldCount = ACHIEVEMENTS.filter(a => a.tier === 'gold' && unlockedIds.includes(a.id)).length;
            const platinumCount = ACHIEVEMENTS.filter(a => a.tier === 'platinum' && unlockedIds.includes(a.id)).length;
            const bronzeEl = document.getElementById('bronzeCountCodex');
            const silverEl = document.getElementById('silverCountCodex');
            const goldEl = document.getElementById('goldCountCodex');
            const platinumEl = document.getElementById('platinumCountCodex');
            if (bronzeEl) bronzeEl.textContent = `${bronzeCount}/25`;
            if (silverEl) silverEl.textContent = `${silverCount}/15`;
            if (goldEl) goldEl.textContent = `${goldCount}/9`;
            if (platinumEl) platinumEl.textContent = `${platinumCount}/1`;
        }
        
        function filterCodexRelicsByRarity(rarity) {
            populateCodexRelics(rarity);
            document.querySelectorAll('.rarity-filter-btn').forEach(btn => {
                if (btn.dataset.rarity === rarity) {
                    btn.classList.add('active');
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.classList.remove('active');
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(1)';
                }
            });
        }
        
        function filterUpgradesByStatus(status) {
            const upgradesList = document.getElementById('upgradesList');
            if (!upgradesList) return;
            
            // Save active filter for re-application after unlock
            activeUpgradeFilter = status;
            
            let filteredUnlocks = UNLOCKS;
            
            if (status === 'unlocked') {
                filteredUnlocks = UNLOCKS.filter(u => permanentUnlocks[u.id]);
            } else if (status === 'available') {
                filteredUnlocks = UNLOCKS.filter(u => !permanentUnlocks[u.id] && u.check());
            } else if (status === 'locked') {
                filteredUnlocks = UNLOCKS.filter(u => !permanentUnlocks[u.id] && !u.check());
            }
            
            upgradesList.innerHTML = filteredUnlocks.map(unlock => {
                const isUnlocked = permanentUnlocks[unlock.id];
                const canUnlock = !isUnlocked && unlock.check();
                return `<div class="unlock-item ${isUnlocked ? 'unlocked' : (canUnlock ? '' : 'locked')}"><div class="item-info"><div class="item-name">${unlock.name}</div><div class="item-description">${unlock.description}</div><div class="unlock-requirement">${isUnlocked ? '✅ UNLOCKED' : (canUnlock ? '✨ READY TO UNLOCK!' : `🔒 ${unlock.requirement}`)}</div></div>${!isUnlocked && canUnlock ? `<button class="buy-btn" onclick="unlockUpgradeWrapper('${unlock.id}')">Unlock</button>` : ''}</div>`;
            }).join('');
            
            // Update button styles
            document.querySelectorAll('.upgrade-filter-btn').forEach(btn => {
                if (btn.dataset.status === status) {
                    btn.classList.add('active');
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.classList.remove('active');
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(1)';
                }
            });
        }
        
        function filterAchievementsByTier(tier) {
            const achievementsListCodex = document.getElementById('achievementsListCodex');
            if (!achievementsListCodex) return;
            
            const unlockedIds = loadAchievements();
            let filteredAchievements = tier === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.tier === tier);
            
            const tierColors = {bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2'};
            const tierIcons = {bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎'};
            
            let html = '';
            
            if (tier === 'all') {
                const categories = ['bronze', 'silver', 'gold', 'platinum'];
                categories.forEach(t => {
                    const tierAchievements = ACHIEVEMENTS.filter(a => a.tier === t);
                    if (tierAchievements.length === 0) return;
                    html += `<div style="margin-bottom: 20px;"><h3 style="color: ${tierColors[t]}; text-transform: uppercase; margin-bottom: 10px; font-family: 'Cinzel', serif; letter-spacing: 0.05em;">${tierIcons[t]} ${t} (${tierAchievements.length})</h3><div style="display: grid; gap: 8px;">`;
                    tierAchievements.forEach(achievement => {
                        const unlocked = unlockedIds.includes(achievement.id);
                        html += `<div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; border-radius: 6px; padding: 10px 12px; opacity: ${unlocked ? '1' : '0.6'}; transition: all 0.2s ease;" onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'"><div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}</div><div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div></div>`;
                    });
                    html += `</div></div>`;
                });
            } else {
                html += '<div style="display: grid; gap: 8px;">';
                filteredAchievements.forEach(achievement => {
                    const unlocked = unlockedIds.includes(achievement.id);
                    html += `<div style="background: ${unlocked ? 'rgba(107, 207, 127, 0.1)' : 'rgba(90, 74, 56, 0.3)'}; border: 2px solid ${unlocked ? '#6bcf7f' : '#5a4a38'}; border-radius: 6px; padding: 10px 12px; opacity: ${unlocked ? '1' : '0.6'}; transition: all 0.2s ease;" onmouseover="this.style.borderColor='${unlocked ? '#d4af37' : '#6b5a48'}'" onmouseout="this.style.borderColor='${unlocked ? '#6bcf7f' : '#5a4a38'}'"><div style="font-weight: bold; margin-bottom: 4px; color: ${unlocked ? '#6bcf7f' : '#c9a961'};">${unlocked ? '✅' : '🔒'} ${achievement.icon} ${achievement.title}</div><div style="font-size: 0.85em; color: #bbb;">${achievement.description}</div></div>`;
                });
                html += '</div>';
            }
            
            achievementsListCodex.innerHTML = html;
            
            // Update button styles
            document.querySelectorAll('.achievement-filter-btn').forEach(btn => {
                if (btn.dataset.tier === tier) {
                    btn.classList.add('active');
                    btn.style.opacity = '1';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.classList.remove('active');
                    btn.style.opacity = '0.6';
                    btn.style.transform = 'scale(1)';
                }
            });
        }
        
        // Initialize CODEX buttons
        const btnCodex = document.getElementById('btnCodex');
        const btnTopRelics = document.getElementById('btnTopRelics');
        // btnTopCodex removed - redundant
        if (btnCodex) {
            btnCodex.onclick = () => openCodex('upgrades');
            console.log('[CODEX] Welcome screen button initialized');
        }
        if (btnTopRelics) {
            btnTopRelics.onclick = () => openCodex('relics');
            console.log('[CODEX] In-game Relics button initialized');
        }
        
        // Expose CODEX functions globally
        window.openCodex = openCodex;
        window.switchCodexTab = switchCodexTab;
        window.filterRelicsByRarity = filterCodexRelicsByRarity;
        window.filterUpgradesByStatus = filterUpgradesByStatus;
        window.filterAchievementsByTier = filterAchievementsByTier;
        console.log('[CODEX] System initialized successfully');

        
        // Check orientation on load and resize
        checkMobileOrientation();
        window.addEventListener('resize', debounce(checkMobileOrientation, 300));