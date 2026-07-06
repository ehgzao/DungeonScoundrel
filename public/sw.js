// Minimal Service Worker for PWA - No console logs to avoid Lighthouse penalty
// CACHE_NAME and PRECACHE_URLS are rewritten by scripts/bump-asset-version.mjs
// on every release (the version query on every URL makes them immutable).
const CACHE_NAME = 'dungeon-scoundrel-v1.8.0';
/* PRECACHE-START */
const PRECACHE_URLS = ["/src/js/config/game-constants.js?v=1.8.0","/src/js/core/audio-context.js?v=1.8.0","/src/js/core/error-handler.js?v=1.8.0","/src/js/core/firebase-auth.js?v=1.8.0","/src/js/core/silent-logging.js?v=1.8.0","/src/js/data/adventures.js?v=1.8.0","/src/js/data/game-data.js?v=1.8.0","/src/js/features/inline-scripts.js?v=1.8.0","/src/js/firebase-ready.js?v=1.8.0","/src/js/game.js?v=1.8.0","/src/js/init-emailjs.js?v=1.8.0","/src/js/modules/adventure-map.js?v=1.8.0","/src/js/modules/adventure-run.js?v=1.8.0","/src/js/modules/game-classes.js?v=1.8.0","/src/js/modules/game-combat.js?v=1.8.0","/src/js/modules/game-deck.js?v=1.8.0","/src/js/modules/game-economy.js?v=1.8.0","/src/js/modules/game-events.js?v=1.8.0","/src/js/modules/game-relics.js?v=1.8.0","/src/js/modules/game-shop.js?v=1.8.0","/src/js/modules/game-sounds.js?v=1.8.0","/src/js/modules/game-state.js?v=1.8.0","/src/js/modules/in-game-tutorial.js?v=1.8.0","/src/js/register-sw.js?v=1.8.0","/src/js/systems/achievements.js?v=1.8.0","/src/js/systems/codex.js?v=1.8.0","/src/js/systems/leaderboard.js?v=1.8.0","/src/js/systems/music.js?v=1.8.0","/src/js/systems/stats.js?v=1.8.0","/src/js/utils/helpers.js?v=1.8.0","/src/js/utils/mobile-optimization.js?v=1.8.0","/src/js/utils/offline-storage.js?v=1.8.0","/src/styles/animations.css?v=1.8.0","/src/styles/components/buttons.css?v=1.8.0","/src/styles/components/waitlist.css?v=1.8.0","/src/styles/scrollbar.css?v=1.8.0","/src/styles/styles.css?v=1.8.0","/src/styles/variables.css?v=1.8.0"];
/* PRECACHE-END */
const OFFLINE_URL = '/';

// Install: precache the app shell (JS/CSS graph + entry page) so the game
// actually PLAYS offline — the old SW cached only '/', which loaded a shell
// whose scripts then all 404'd offline.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL, ...PRECACHE_URLS]))
  );
  self.skipWaiting();
});

// Activate: clean old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//  - navigations: network-first, offline falls back to the cached shell
//  - same-origin /src/* and /assets/*: cache-first (all version-addressed;
//    /src is precached, /assets fills at runtime — card art stays instant)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/src/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
  }
});
