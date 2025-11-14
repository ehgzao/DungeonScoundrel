# Security: Remove unsafe-inline and unsafe-eval from CSP

## Priority
🔶 Medium - Security hardening (non-blocking)

## Current Status
The Content Security Policy in `public/_headers` currently uses:
- `script-src 'unsafe-inline' 'unsafe-eval'`
- `style-src 'unsafe-inline'`

These directives reduce the effectiveness of CSP by allowing inline scripts and dynamic code evaluation.

## Why It Exists
Required for compatibility with:
1. **Firebase SDK v11.6.1** - Loaded from CDN, uses dynamic evaluation
2. **Firebase Authentication** - Popup flow uses inline event handlers
3. **Workbox Service Worker** - Uses inline scripts for SW registration
4. **Google Fonts** - Inline styles for font loading

## Security Implications

### Current Risk Level: ⚠️ Moderate
- **Attack Vector**: XSS via injected inline scripts
- **Mitigation**: All external domains are explicitly whitelisted
- **Residual Risk**: If any allowed domain is compromised, inline scripts could be injected

### Attack Scenarios Prevented by Current CSP:
✅ Loading scripts from unauthorized domains
✅ Data exfiltration to arbitrary endpoints
✅ Unauthorized iframe embedding

### Attack Scenarios NOT Prevented:
❌ XSS via inline script injection (if XSS vulnerability exists)
❌ DOM-based XSS with eval/Function constructors

## Migration Plan

### Phase 1: Audit Current Inline Scripts (2-4 hours)
- [ ] Identify all inline `<script>` tags in `index.html`
- [ ] Identify all inline event handlers (`onclick`, `onload`, etc.)
- [ ] Identify all inline `<style>` tags
- [ ] List all `eval()` and `Function()` calls in codebase

**Command to find inline scripts:**
```bash
grep -rn "<script>" public/index.html
grep -rn "on[a-z]*=" public/index.html
grep -rn "<style>" public/index.html
grep -rn "eval\|Function(" public/src/js/
```

### Phase 2: Replace with CSP Nonces (8-12 hours)

#### Option A: Nonce-based CSP (Recommended)
1. Generate cryptographic nonce on page load
2. Add nonce to all inline scripts/styles
3. Update CSP header with nonce

**Implementation:**
```javascript
// In server/build script
const nonce = crypto.randomBytes(16).toString('base64');
// Inject nonce into HTML and CSP header
```

**Updated CSP:**
```http
script-src 'self' 'nonce-{RANDOM}' https://www.gstatic.com ...
style-src 'self' 'nonce-{RANDOM}' https://fonts.googleapis.com
```

#### Option B: Hash-based CSP (Static sites)
1. Calculate SHA256 hash of each inline script
2. Add hashes to CSP header

**Example:**
```http
script-src 'self' 'sha256-abc123...' 'sha256-def456...' https://www.gstatic.com
```

**Trade-offs:**
- ✅ Simpler for static sites
- ❌ Must recalculate on every inline script change
- ❌ Large CSP header if many inline scripts

### Phase 3: Bundle Firebase SDK (4-6 hours)
Instead of loading Firebase from CDN, bundle it locally:

```bash
npm install firebase
# Bundle with webpack/rollup/vite
```

**Benefits:**
- ✅ Remove `unsafe-eval` requirement
- ✅ Better performance (local bundle)
- ✅ Version pinning
- ❌ Larger bundle size (~300KB)

### Phase 4: Refactor Inline Event Handlers (2-4 hours)
Move all `onclick="..."` to addEventListener:

```diff
- <button onclick="signIn()">Sign In</button>
+ <button id="sign-in-btn">Sign In</button>
+ <script nonce="{NONCE}">
+   document.getElementById('sign-in-btn').addEventListener('click', signIn);
+ </script>
```

Or use a build tool to inject event listeners.

### Phase 5: Testing & Validation (4-6 hours)
- [ ] Test all interactive features (auth, shop, combat, etc.)
- [ ] Verify Service Worker still works
- [ ] Check Firebase Auth popup flow
- [ ] Validate CSP with browser console
- [ ] Run Lighthouse security audit

**Validation command:**
```bash
# Use Google CSP Evaluator
https://csp-evaluator.withgoogle.com/
```

## Timeline
**Estimated Total**: 20-32 hours (2.5-4 days)

**Suggested Schedule:**
- Week 1: Phase 1 (Audit)
- Week 2: Phase 2 (Nonce implementation)
- Week 3: Phase 3 (Bundle Firebase)
- Week 4: Phase 4-5 (Refactor + Test)

## Success Criteria
- [ ] CSP header contains NO `unsafe-inline` or `unsafe-eval`
- [ ] All game features work correctly
- [ ] Firebase authentication works
- [ ] Service Worker registers successfully
- [ ] Lighthouse security score improves
- [ ] No console CSP errors

## Alternative: Accept Current Risk
If migration is too costly, document risk acceptance:
- Firebase is a trusted service (Google-owned)
- All external domains are explicitly whitelisted
- Risk is acceptable for this application's threat model

**Risk Acceptance Sign-off**: [Project Owner]

## References
- [CSP Level 3 Spec](https://www.w3.org/TR/CSP3/)
- [Google CSP Guide](https://developers.google.com/web/fundamentals/security/csp)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Firebase SDK Bundling](https://firebase.google.com/docs/web/module-bundling)

## Related
- Original issue: CSP blocking Firebase auth popups
- PR: #[Current PR number]
