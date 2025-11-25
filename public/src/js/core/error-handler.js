/* ============================================
   GLOBAL ERROR HANDLER
   Prevents white screen of death
   ============================================ */

// Global error handler
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

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

