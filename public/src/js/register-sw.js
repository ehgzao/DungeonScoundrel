/* ============================================
   SERVICE WORKER REGISTRATION
   Externalized from an inline <script> so the CSP can drop 'unsafe-inline'
   from script-src / script-src-elem.
   ============================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}
