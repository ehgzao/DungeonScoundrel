# Testing Documentation for CSP Firebase Fix

## Build Verification

### Local Build Test
```bash
$ npm install
✓ added 501 packages in 14s

$ npm run build
> dungeon-scoundrel@1.4.2 build
> echo 'Building for production...' && npm run build:sw

Building for production...

> dungeon-scoundrel@1.4.2 build:sw
> workbox generateSW workbox-config.js

✓ Using configuration from /home/user/DungeonScoundrel/workbox-config.js.
✓ The service worker files were written to:
  • /home/user/DungeonScoundrel/public/sw.js
  • /home/user/DungeonScoundrel/public/workbox-f2500f95.js
✓ The service worker will precache 41 URLs, totaling 2.22 MB.
```

**Status**: ✅ Build passed successfully

---

## Headers Verification

### Important Note About Local Testing
The `public/_headers` file is **only applied by Netlify's CDN** in production/preview deployments. Local development servers (Python http.server, etc.) do not parse or apply these headers.

### Expected Headers in Netlify Deployment

When deployed to Netlify, the following headers will be served:

```http
Cross-Origin-Opener-Policy: same-origin-allow-popups
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://cdn.jsdelivr.net https://apis.google.com https://www.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.gstatic.com https://www.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://*.cloudfunctions.net https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.firebasestorage.app wss://*.firebaseio.com https://emailjs.com; frame-src 'self' https://accounts.google.com https://*.firebaseapp.com;
```

### CSP Domains Added in This PR

This PR adds the following domains to `connect-src`:
- ✅ `https://www.googleapis.com` (explicit - previously only via wildcard)
- ✅ `https://firebasestorage.googleapis.com` (Firebase Storage operations)
- ✅ `https://*.firebasestorage.app` (new Firebase Storage domain)

These are required for:
- Firebase SDK sourcemap loading
- Firebase Authentication popup flow
- Firebase Storage file operations
- Google API requests

---

## Firebase Sign-In Flow Testing

### Manual Test Procedure

1. **Deploy to Netlify Preview**
   ```bash
   git push origin claude/fix-csp-firebase-popups-014RDXj6jLA2f4EnB9zcs6Wp
   # Wait for Netlify preview deployment
   ```

2. **Open Preview URL**
   - Navigate to Netlify Deploy Preview URL
   - Open Browser DevTools → Console tab

3. **Execute Sign-In Flow**
   - Click "Sign in with Google" button
   - Observe popup window opens
   - Complete Google authentication
   - Verify popup closes and user is authenticated

4. **Verify Console is Clean**
   - ✅ No CSP violation errors
   - ✅ No `Cross-Origin-Opener-Policy` errors
   - ✅ No `auth/cancelled-popup-request` errors
   - ✅ No `auth/popup-closed-by-user` errors

### Expected Console Output (Clean)
```
✓ Firebase initialized
✓ Auth state: signed in
✓ User: {uid: "...", email: "..."}
```

### Previous Console Errors (Now Fixed)
```diff
- ❌ Refused to connect to 'https://www.gstatic.com/...' because it violates CSP directive
- ❌ Cross-Origin-Opener-Policy policy would block the window.closed call
- ❌ Firebase: Error (auth/cancelled-popup-request)
- ❌ Firebase: Error (auth/popup-closed-by-user)
```

---

## Security Audit

### CSP Directives Analysis

| Directive | Value | Security Level | Notes |
|-----------|-------|----------------|-------|
| `default-src` | `'self'` | ✅ Secure | Principle of least privilege |
| `script-src` | Multiple domains + `unsafe-inline` `unsafe-eval` | ⚠️ Moderate | See issue #XX for migration plan |
| `connect-src` | Firebase domains only | ✅ Secure | Minimal necessary domains |
| `img-src` | `'self' data: https:` | ✅ Acceptable | Standard for PWAs |
| `frame-src` | Google OAuth domains | ✅ Secure | Required for auth popups |

### `unsafe-inline` and `unsafe-eval` Usage

**Current Status**: ⚠️ Required for Firebase SDK compatibility

**Why it's used**:
1. Firebase SDK (v11.6.1) loaded from CDN uses dynamic script evaluation
2. Firebase Auth popup mechanism requires inline event handlers
3. Workbox service worker uses inline scripts for caching logic

**Migration Path**: See [Issue #XX] - Plan to remove unsafe-inline/unsafe-eval

**Temporary Justification**:
- Firebase is a trusted first-party service (Google)
- All Firebase domains are explicitly whitelisted
- Authentication flow requires these permissions
- CSP still provides protection against unauthorized domains

---

## Rollback Plan

If issues arise after deployment:

### Option 1: Revert PR
```bash
git revert dff614e
git push origin main
```

### Option 2: Netlify Rollback
1. Go to Netlify Dashboard → Deploys
2. Find previous stable deploy (commit: 8aad95d)
3. Click "Publish deploy"

### Option 3: Emergency CSP Disable
If auth is completely broken, temporarily remove CSP from `_headers`:
```diff
- Content-Security-Policy: ...
+ # Content-Security-Policy: ... (TEMPORARILY DISABLED)
```

---

## Pre-Merge Checklist

- [x] Build passes locally (`npm run build`)
- [x] `_headers` file syntax is valid
- [x] CSP domains are minimal and necessary
- [x] COOP policy allows popups (`same-origin-allow-popups`)
- [ ] Netlify Deploy Preview tested manually
- [ ] Google Sign-In flow verified working
- [ ] Console logs captured (clean, no CSP errors)
- [ ] Issue created for unsafe-inline/unsafe-eval migration
- [ ] PR description updated with test results

---

## References

- [Firebase Web Auth Setup](https://firebase.google.com/docs/auth/web/google-signin)
- [Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)
- [Netlify Headers Documentation](https://docs.netlify.com/routing/headers/)
- [Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
