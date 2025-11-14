# Issue: Remove unsafe-inline and unsafe-eval from Content Security Policy

## Title
🔒 Security: Remove `unsafe-inline` and `unsafe-eval` from CSP

## Labels
- `security`
- `enhancement`
- `P2`

## Description

### Problem

Our current Content Security Policy (CSP) in `public/_headers` contains `unsafe-inline` and `unsafe-eval` directives in the `script-src` directive. These directives weaken the security posture of the application by allowing potential XSS attack vectors.

**Current CSP (from `public/_headers` line 16):**

```
Content-Security-Policy: default-src 'self';
  connect-src 'self' https://www.googleapis.com https://firebasestorage.googleapis.com https://www.gstatic.com https://*.firebasestorage.app https://*.firebaseio.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googleapis.com;
  img-src 'self' data: https://www.gstatic.com;
  style-src 'self' 'unsafe-inline';
```

### Why These Directives Were Added

These directives are **temporarily required** because:

1. **`'unsafe-inline'` in script-src:**
   - Firebase SDK is loaded via CDN and requires inline script execution
   - Firebase initialization code uses inline scripts in `public/src/js/core/firebase-auth.js`

2. **`'unsafe-eval'` in script-src:**
   - Firebase SDK internally uses dynamic code evaluation (`eval()`)
   - This is a requirement of Firebase SDK architecture (v11.6.1)

3. **`'unsafe-inline'` in style-src:**
   - Application uses inline styles throughout
   - Lower security risk than script directives

### Security Risks

| Directive | Attack Vector | Severity |
|-----------|---------------|----------|
| `script-src 'unsafe-inline'` | XSS via injected inline scripts | **HIGH** |
| `script-src 'unsafe-eval'` | Code injection via `eval()` | **MEDIUM** |
| `style-src 'unsafe-inline'` | CSS injection attacks | **LOW** |

### Root Cause

Firebase SDK is loaded from CDN:

```javascript
// public/src/js/core/firebase-auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, ... } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, ... } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
```

This CDN-based approach prevents us from implementing CSP nonces or hashes effectively.

---

## Solution Approach

### Option 1: Migrate to npm-bundled Firebase SDK (Recommended)

**Effort:** Medium (2-3 days)
**Security Impact:** HIGH - Removes both `unsafe-inline` and potentially `unsafe-eval`

#### Steps:

1. **Install Firebase SDK as npm dependency:**
   ```bash
   npm install firebase
   ```

2. **Refactor `firebase-auth.js` to use bundled imports:**
   ```javascript
   // Replace CDN imports with npm imports
   import { initializeApp } from 'firebase/app';
   import { getAuth, signInWithPopup, ... } from 'firebase/auth';
   import { getFirestore, ... } from 'firebase/firestore';
   ```

3. **Add build step to bundle JavaScript:**
   - Option A: Use esbuild/rollup/webpack
   - Option B: Use Vite/Parcel for bundling
   - Update `package.json` scripts

4. **Update CSP to remove `unsafe-inline`:**
   ```
   script-src 'self' https://www.gstatic.com https://www.googleapis.com;
   ```

5. **Test thoroughly:**
   - ✅ Build succeeds
   - ✅ Firebase Auth still works
   - ✅ No CSP violations
   - ✅ Bundle size is reasonable

#### Pros:
- ✅ Removes `unsafe-inline` completely
- ✅ Better performance (bundled + minified)
- ✅ Offline support (no CDN dependency)
- ✅ Version pinning in package-lock.json

#### Cons:
- ⚠️ Requires build tooling setup
- ⚠️ May still require `unsafe-eval` (depends on Firebase SDK)
- ⚠️ Increases bundle size

---

### Option 2: Implement CSP Nonces (Advanced)

**Effort:** High (3-5 days)
**Security Impact:** HIGH - Removes `unsafe-inline`, keeps `unsafe-eval`

#### Steps:

1. **Set up Netlify Edge Functions** to generate nonces server-side:
   ```javascript
   // netlify/edge-functions/csp-nonce.js
   export default async (request, context) => {
     const nonce = crypto.randomUUID();
     const response = await context.next();
     // Inject nonce into HTML and CSP header
     return response;
   };
   ```

2. **Update HTML to use nonces:**
   ```html
   <script nonce="{{NONCE}}">
     // Firebase initialization
   </script>
   ```

3. **Update CSP header dynamically:**
   ```
   script-src 'self' 'nonce-{{NONCE}}' https://www.gstatic.com;
   ```

4. **Requires:**
   - Netlify Edge Functions (currently not in project)
   - Server-side rendering or build-time nonce injection
   - Coordination between Edge Function and HTML templates

#### Pros:
- ✅ Removes `unsafe-inline` while keeping CDN approach
- ✅ Industry-standard CSP hardening

#### Cons:
- ⚠️ Complex implementation
- ⚠️ Requires Netlify Edge Functions ($)
- ⚠️ Still requires `unsafe-eval` for Firebase SDK

---

### Option 3: Accept `unsafe-eval` as Documented Risk

**Effort:** Low (documentation only)
**Security Impact:** LOW - Documents trade-off

If after implementing Option 1 or 2, Firebase SDK still requires `eval()`:

1. **Document the requirement** in `SECURITY.md`
2. **Monitor** Firebase SDK release notes for removal of `eval()` dependency
3. **Accept** as necessary trade-off for Firebase Authentication

---

## Recommended Path Forward

1. **Immediate (this issue):**
   - Implement **Option 1** (npm-bundled Firebase)
   - Target: Remove `unsafe-inline` from `script-src`

2. **Follow-up:**
   - Test if `unsafe-eval` can be removed
   - If not, document as known limitation (Option 3)

3. **Future Enhancement:**
   - Consider **Option 2** (CSP nonces) if budget allows Edge Functions

---

## Acceptance Criteria

### For `unsafe-inline` Removal

- [ ] Firebase SDK installed via npm
- [ ] Build tooling configured (esbuild/vite/rollup)
- [ ] `firebase-auth.js` refactored to use npm imports
- [ ] CSP updated to remove `unsafe-inline` from `script-src`
- [ ] All builds pass
- [ ] Firebase Auth tested in production preview
- [ ] No CSP violations in browser console
- [ ] Google Sign-In flow works end-to-end

### For `unsafe-eval` Assessment

- [ ] Test if bundled Firebase SDK removes `unsafe-eval` requirement
- [ ] If YES: Remove from CSP and test
- [ ] If NO: Document as Firebase SDK limitation in `SECURITY.md`

### For `unsafe-inline` in `style-src` (Lower Priority)

- [ ] Move inline styles to external stylesheet
- [ ] Or implement style nonces (if doing Option 2)

---

## Timeline

**Priority:** P2 (Important, not urgent)
**Estimated Effort:** 2-3 days
**Target Completion:** Within 2 weeks

---

## Related

- **PR #20:** Original CSP implementation for Firebase Auth
- **Commit a3f1422:** Added CSP headers
- **File:** `public/_headers` (line 16)
- **Documentation:** `BUILD_VALIDATION_EVIDENCE.md` (section 7)

---

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Firebase SDK Documentation](https://firebase.google.com/docs/web/setup)
- [CSP Nonces Best Practices](https://content-security-policy.com/nonce/)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

**Created by:** Claude (automated)
**Date:** 2025-11-14
**Status:** Proposed - Awaiting approval and assignment
