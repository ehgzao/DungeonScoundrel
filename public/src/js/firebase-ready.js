// Firebase Ready Check for Modular SDK (v9+)
// The modular SDK doesn't expose a global 'firebase' object
// Instead, we check for window.db (exposed by firebase-auth.js)
(function () {
    window.FirebaseReady = new Promise((resolve, reject) => {
        let tries = 0;
        function check() {
            tries++;
            try {
                // Check for db and auth exposed by firebase-auth.js
                if (window.db || window.auth) {
                    resolve({ db: window.db, auth: window.auth });
                    return;
                }
            } catch (e) {
                // Silent error
            }
            if (tries > 50) {
                // Don't reject - just resolve with null (offline mode)
                resolve(null);
                return;
            }
            setTimeout(check, 200);
        }
        check();
    });
})();
