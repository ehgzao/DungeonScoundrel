/* ============================================
   LEADERBOARD SYSTEM
   Firebase Leaderboard (Top 100 scores)
   Extracted from game.js
   ============================================ */

// Get Firebase globals from firebase-auth.js
// These are set by firebase-auth.js when it loads
const getFirebaseGlobals = () => ({
    db: window.db,
    appId: window.appId,
    userId: window.userId
});

// ============================================
// LEADERBOARD (FIREBASE)
// ============================================
async function submitScoreToLeaderboard(score, gameTime) {
    const { db, appId, userId } = getFirebaseGlobals();
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
    const leaderboardModal = document.getElementById('leaderboardModal');
    if (!leaderboardModal) {
        console.error('[LEADERBOARD] Modal element not found');
        return;
    }
    
    leaderboardModal.classList.add('active');
    if (typeof trapFocus !== 'undefined') trapFocus(leaderboardModal);
    if (typeof hapticFeedback !== 'undefined') hapticFeedback('light');
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
    
    const { db, appId } = getFirebaseGlobals();
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

// Expose functions globally for HTML onclick handlers
window.showLeaderboard = showLeaderboard;
window.loadLeaderboardForDifficulty = loadLeaderboardForDifficulty;

// Log module load
console.log('[LEADERBOARD] Firebase leaderboard system loaded');