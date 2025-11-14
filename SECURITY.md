# 🛡️ Security Policy - Dungeon Scoundrel

Thank you for helping to keep **Dungeon Scoundrel** and its community safe! We take security seriously and appreciate your efforts to responsibly disclose vulnerabilities.

---

## 🔒 Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.6.x   | ✅ Yes              | Current stable release |
| 1.5.x   | ⚠️ Limited support | Critical fixes only |
| < 1.5   | ❌ No              | Please upgrade |

**Recommendation:** Always use the latest version available at [https://dungeonscoundrel.com/](https://dungeonscoundrel.com/)

---

## 🐛 Reporting a Vulnerability

### **Where to Report**

If you discover a security vulnerability, please report it via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Navigate to: [https://github.com/ehgzao/DungeonScoundrel/security/advisories/new](https://github.com/ehgzao/DungeonScoundrel/security/advisories/new)
   - This allows private disclosure and coordinated fixes

2. **Email** (Alternative)
   - Use the in-game bug report feature (encrypted via EmailJS)
   - Or open a GitHub issue with `[SECURITY]` prefix if non-critical

3. **GitHub Issues** (For non-critical issues only)
   - [https://github.com/ehgzao/DungeonScoundrel/issues](https://github.com/ehgzao/DungeonScoundrel/issues)
   - **Do not disclose critical vulnerabilities publicly**

### **What to Include**

Please provide as much information as possible:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Impact** assessment (what can an attacker do?)
- **Affected versions** (if known)
- **Potential fix** (if you have suggestions)
- **Proof of concept** (code, screenshots, video)

### **Response Timeline**

- **Initial Response:** Within 48 hours
- **Status Updates:** Every 5-7 days until resolved
- **Fix Timeline:**
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### **What to Expect**

✅ **If Accepted:**
- We'll confirm the vulnerability and its severity
- We'll work on a fix and keep you updated
- You'll be credited in the security advisory (optional)
- We'll release a patch and publish a security advisory
- We may award a "Security Researcher" badge in-game 🛡️

❌ **If Declined:**
- We'll explain why it's not considered a vulnerability
- We may still implement improvements based on your report
- You're welcome to discuss the decision

---

## 🎯 Security Scope

### **In Scope:**

These areas are considered in scope for security reports:

#### **High Priority:**
- 🔐 **Authentication bypass** (Firebase Auth)
- 💉 **Injection vulnerabilities** (XSS, HTML injection, etc.)
- 🗄️ **Data leaks** (LocalStorage, IndexedDB, Firebase)
- 🔓 **Authorization issues** (accessing other players' data)
- 🎮 **Game integrity** (cheating, save manipulation)
- 📊 **Leaderboard manipulation** (fake scores)
- 🌐 **Cross-Site Scripting (XSS)**
- 🔒 **Insecure storage** of sensitive data
- 🚨 **Service Worker vulnerabilities**

#### **Medium Priority:**
- ⚡ **Denial of Service (DoS)** (client-side only)
- 🍪 **Cookie/session issues**
- 📧 **Email system abuse** (EmailJS)
- 🎨 **UI redressing / Clickjacking**
- 🔑 **Exposed API keys** (Firebase, EmailJS)

#### **Low Priority:**
- 📱 **Mobile PWA issues**
- 🎵 **Audio system exploits**
- 🎨 **CSS injection** (cosmetic only)

### **Out of Scope:**

These are **not** considered security vulnerabilities:

- ❌ Social engineering attacks
- ❌ Physical access to unlocked devices
- ❌ Outdated browser warnings (we support modern browsers only)
- ❌ Performance issues without security impact
- ❌ UI/UX bugs without security implications
- ❌ Theoretical vulnerabilities without proof of concept
- ❌ Third-party service issues (Firebase, Netlify, EmailJS)
- ❌ DDoS attacks (handled by Netlify)
- ❌ Issues in dependencies (report to the library maintainer)

---

## 🔐 Security Best Practices

### **For Players:**

1. **Don't share save files** from untrusted sources
2. **Keep your browser updated** (Chrome, Firefox, Safari, Edge)
3. **Use strong passwords** if syncing with Firebase
4. **Report suspicious activity** in leaderboards
5. **Don't trust modified versions** of the game

### **For Contributors:**

1. **Never commit secrets** (API keys, credentials)
2. **Use environment variables** for sensitive config
3. **Sanitize user input** before rendering
4. **Validate all data** from Firebase/IndexedDB
5. **Follow OWASP Top 10** guidelines
6. **Use Content Security Policy** headers
7. **Enable SRI** for external scripts
8. **Test XSS vectors** in user-generated content

---

## 🛠️ Security Features

**Dungeon Scoundrel** implements the following security measures:

### **Authentication:**
- ✅ Firebase Anonymous Auth (no passwords stored)
- ✅ Google Sign-In (OAuth 2.0)
- ✅ Firestore security rules

### **Data Protection:**
- ✅ Client-side encryption for saves (optional)
- ✅ IndexedDB with same-origin policy
- ✅ No sensitive data stored in LocalStorage
- ✅ HTTPS-only (enforced by Netlify)

### **Frontend Security:**
- ✅ Content Security Policy (CSP)
- ✅ Subresource Integrity (SRI) for CDN scripts
- ✅ Input sanitization
- ✅ XSS protection
- ✅ Service Worker with secure caching

### **Infrastructure:**
- ✅ Netlify CDN with DDoS protection
- ✅ Automatic HTTPS (Let's Encrypt)
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Firebase security rules

---

## 📜 Known Issues

### **Current (v1.6.25):**
- None reported

### **Fixed in Previous Versions:**
- **v1.6.24:** Fixed infinite weapon durability bug
- **v1.5.x:** Improved Firebase security rules

See [CHANGELOG.md](CHANGELOG.md) for full history.

---

## 🏆 Security Hall of Fame

We recognize security researchers who have helped improve Dungeon Scoundrel:

| Researcher | Vulnerability | Date | Severity |
|-----------|---------------|------|----------|
| *Be the first!* | - | - | - |

Want to be listed? Report a valid vulnerability!

---

## 🤝 Responsible Disclosure Policy

We follow **coordinated vulnerability disclosure**:

1. **Report privately** to us first (not publicly)
2. **Give us time** to fix (90 days before public disclosure)
3. **Don't exploit** the vulnerability maliciously
4. **Don't access** other users' data
5. **Don't disrupt** the service (DoS attacks)

In return, we promise:

- ✅ Acknowledge your report within 48 hours
- ✅ Keep you updated on fix progress
- ✅ Credit you in the security advisory (optional)
- ✅ Not take legal action for good-faith research

---

## 📞 Contact

- **Security Issues:** [GitHub Security Advisories](https://github.com/ehgzao/DungeonScoundrel/security/advisories/new)
- **General Questions:** [GitHub Issues](https://github.com/ehgzao/DungeonScoundrel/issues)
- **Email:** hello@dungeonscoundrel.com (or use in-game bug report)
- **Community:** [GitHub Discussions](https://github.com/ehgzao/DungeonScoundrel/discussions)

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [PWA Security Best Practices](https://web.dev/security/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Security issues are handled separately from the open-source license.

---

**Last Updated:** 2025-11-12 | **Version:** 1.6.25

Thank you for helping keep Dungeon Scoundrel secure! 🛡️⚔️
