# Cache Troubleshooting Guide

## Why Am I Seeing the Old Version?

Browser caching is the most common reason you don't see updates immediately. Browsers cache JavaScript and CSS files to improve performance.

---

## ✅ Solution 1: Hard Refresh (Recommended)

### In Dynamics 365:
1. **Windows:** Press `Ctrl + Shift + R` or `Ctrl + F5`
2. **Mac:** Press `Cmd + Shift + R`

This forces the browser to bypass the cache and download fresh files.

---

## ✅ Solution 2: Clear Cache via DevTools

1. Open Developer Tools:
   - **Windows:** Press `F12`
   - **Mac:** Press `Cmd + Option + I`

2. Right-click the **Refresh** button (while DevTools is open)

3. Select **"Empty Cache and Hard Reload"**

---

## ✅ Solution 3: Clear Browser Cache Completely

### Chrome/Edge:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select **"Cached images and files"**
3. Click **"Clear data"**

### Firefox:
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select **"Cache"**
3. Click **"Clear Now"**

---

## 🔍 How to Verify You Have the Latest Version

### Method 1: Check the Console
1. Open Developer Tools (`F12`)
2. Go to the **Console** tab
3. Look for:
   ```
   AdminPlus v2.0.0
   Last Updated: 2025-11-18 05:22:59 PM EST
   ```

### Method 2: Check the Badge
After clearing cache, the badge should show:
```
[2025-11-18 05:22:59 PM EST]
```
Instead of:
```
[v2.0.0]
```

---

## 🚀 Automatic Cache Busting (Now Enabled!)

The tool now includes **automatic cache busting** which adds a timestamp to all file loads:
```
https://atisehat.github.io/AdminPlus/version.js?v=1700340000000
```

This means **future updates will automatically bypass the cache** in most cases. However, you may still need to do a hard refresh the first time after this update.

---

## ⏱️ GitHub Pages Propagation Time

After pushing to GitHub, it can take **1-3 minutes** for GitHub Pages to update:
1. Code is pushed to GitHub ✅
2. GitHub Pages builds (30-60 seconds) ⏳
3. CDN propagates (1-2 minutes) ⏳
4. Files are available 🎉

**Tip:** Wait 3-5 minutes after pushing before testing.

---

## 🔧 Troubleshooting Checklist

- [ ] Did you wait 3-5 minutes after pushing to GitHub?
- [ ] Did you do a hard refresh (`Ctrl + Shift + R`)?
- [ ] Did you check the console for the correct timestamp?
- [ ] Is `SHOW_BUILD_INFO` set to `true` in `version.js`?
- [ ] Are you using the correct GitHub Pages URL?

---

## 📞 Still Having Issues?

1. **Check the Network tab** in DevTools to see if files are loading with `200` status
2. **Verify the URL** in DevTools to confirm it's loading from `atisehat.github.io`
3. **Check for errors** in the Console tab
4. **Try a different browser** to rule out browser-specific issues
5. **Try incognito/private mode** to bypass all caching

---

## 💡 Pro Tips

1. **Always hard refresh** after updating the tool
2. **Use incognito mode** for testing to avoid cache issues
3. **Check the console** to verify the version loaded
4. **Wait a few minutes** after pushing to GitHub Pages

---

**Last Updated:** 2025-11-18

