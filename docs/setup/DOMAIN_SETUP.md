# 🌐 Custom Domain Setup - dungeonscoundrel.com

## Domain Information
- **Domain:** dungeonscoundrel.com
- **Registrar:** [Your registrar]
- **DNS Provider:** [Your DNS provider]
- **Hosting:** Netlify
- **Purchased:** November 8, 2025

---

## 📋 Setup Checklist

### 1. DNS Configuration (At Your Registrar)

Add these DNS records:

```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600

Type: CNAME
Name: www
Value: dungeonscoundrel.netlify.app
TTL: 3600
```

**Note:** DNS propagation can take 24-48 hours, but usually completes in 1-2 hours.

---

### 2. Netlify Configuration

1. Go to: https://app.netlify.com/sites/dungeonscoundrel/settings/domain
2. Click **Add custom domain**
3. Enter: `dungeonscoundrel.com`
4. Click **Verify**
5. Netlify will automatically:
   - Configure SSL certificate (HTTPS)
   - Set up redirects (www → non-www or vice versa)
   - Enable automatic HTTPS

**SSL Certificate:** Netlify provides free Let's Encrypt SSL (auto-renews)

---

### 3. Firebase Authentication

Add the new domain to authorized domains:

1. Go to: https://console.firebase.google.com/
2. Select project: **dungeon-scoundrel**
3. **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add these domains:
   - `dungeonscoundrel.com`
   - `www.dungeonscoundrel.com`

---

### 4. Update Meta Tags (Optional)

Update `index.html` meta tags with new domain:

```html
<!-- Open Graph -->
<meta property="og:url" content="https://dungeonscoundrel.com">

<!-- Twitter -->
<meta name="twitter:url" content="https://dungeonscoundrel.com">

<!-- Canonical -->
<link rel="canonical" href="https://dungeonscoundrel.com">
```

---

### 5. Update Links

Update these files with new domain:

- `README.md` - Play link
- `CHANGELOG.md` - Links section
- Any documentation referencing the old URL

---

## 🧪 Testing Checklist

After DNS propagation (1-2 hours):

- [ ] `http://dungeonscoundrel.com` → redirects to HTTPS
- [ ] `https://dungeonscoundrel.com` → loads game
- [ ] `http://www.dungeonscoundrel.com` → redirects to HTTPS
- [ ] `https://www.dungeonscoundrel.com` → loads game
- [ ] SSL certificate valid (green padlock)
- [ ] Google Auth works on new domain
- [ ] Leaderboard loads correctly
- [ ] Cloud save works
- [ ] No mixed content warnings

---

## 🔒 Security

### HTTPS Enforcement
Netlify automatically enforces HTTPS. All HTTP requests redirect to HTTPS.

### HSTS (HTTP Strict Transport Security)
Consider enabling HSTS in Netlify settings for additional security:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Content Security Policy
Already configured in `index.html` meta tags.

---

## 📊 Analytics & SEO

### Google Search Console
1. Add property: `https://dungeonscoundrel.com`
2. Verify ownership via DNS TXT record or HTML file
3. Submit sitemap (if you create one)

### Google Analytics (Optional)
Add GA4 tracking code to `index.html` if desired.

### Sitemap (Optional)
Create `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dungeonscoundrel.com</loc>
    <lastmod>2025-11-08</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

---

## 🔄 Redirect Strategy

**Recommended:** Redirect www to non-www (or vice versa)

Netlify handles this automatically. Choose in:
**Domain settings** → **HTTPS** → **Force HTTPS**

**Recommended setup:**
- Primary: `dungeonscoundrel.com`
- Redirect: `www.dungeonscoundrel.com` → `dungeonscoundrel.com`

---

## 📝 DNS Propagation Check

Use these tools to check DNS propagation:
- https://dnschecker.org/
- https://www.whatsmydns.net/

Enter: `dungeonscoundrel.com`

---

## 🆘 Troubleshooting

### Domain not loading
- Check DNS records are correct
- Wait for DNS propagation (up to 48h)
- Clear browser cache (Ctrl+Shift+R)

### SSL certificate error
- Wait 10-15 minutes after adding domain to Netlify
- Netlify auto-provisions Let's Encrypt certificate
- Check Netlify domain settings

### Google Auth not working
- Ensure domain added to Firebase authorized domains
- Check for typos in domain name
- Wait 5-10 minutes for Firebase to update

### Mixed content warnings
- Ensure all resources load via HTTPS
- Check external scripts (EmailJS, Firebase, etc.)

---

## 📞 Support

- **Netlify Support:** https://answers.netlify.com/
- **Firebase Support:** https://firebase.google.com/support
- **DNS Issues:** Contact your domain registrar

---

## 🎯 Post-Setup Tasks

After everything is working:

1. ✅ Update README.md with new domain
2. ✅ Update CHANGELOG.md links
3. ✅ Update social media links
4. ✅ Announce new domain to players
5. ✅ Keep old Netlify URL as backup

---

**Setup Date:** November 8, 2025  
**Status:** 🟡 Pending DNS configuration  
**Next Review:** After DNS propagation
