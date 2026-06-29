/* ============================================
   PRODUCTION-AWARE SILENT LOGGING
   Must load first (blocking) so window.onerror is installed before any other
   script can throw. Externalized from an inline <script> so the CSP can drop
   'unsafe-inline' from script-src / script-src-elem.
   ============================================ */
(function () {
    var p = location.hostname.includes('netlify.app') || location.hostname === 'dungeonscoundrel.com';
    window.silentLog = p ? function () {} : console.log.bind(console);
    window.silentWarn = p ? function () {} : console.warn.bind(console);
    window.silentError = p ? function () {} : console.error.bind(console);
    window.isProduction = p;
    // In production, suppress the default error UI but keep a capped
    // in-memory log so regressions stay diagnosable (e.g. via bug reports).
    if (p) {
        window.__errorLog = [];
        var _record = function (info) {
            try {
                window.__errorLog.push({ t: Date.now(), info: String(info) });
                if (window.__errorLog.length > 50) window.__errorLog.shift();
            } catch (e) {}
        };
        window.onerror = function (msg, src, line, col) {
            _record(msg + ' @ ' + src + ':' + line + ':' + col);
            return true; // suppress default error overlay in production
        };
        window.onunhandledrejection = function (e) {
            _record('unhandledrejection: ' + (e && e.reason));
            e.preventDefault();
        };
    }
})();
