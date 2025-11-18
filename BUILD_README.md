# AdminPlus Build & Deployment Guide

## 📅 Build Timestamp System

AdminPlus now displays the **last update timestamp** instead of a version number in the UI. This helps you track exactly when the tool was last updated on GitHub.

---

## 🔧 How to Update Before Pushing to GitHub

### Quick Update (Recommended)
Run this script before committing and pushing:

```bash
./update-timestamp.sh
```

This will:
- ✅ Update the `buildTimestamp` in `version.js` to the current UTC date/time
- ✅ Update both the comment and the actual timestamp value
- ✅ Show you the new timestamp

### Manual Update
If you prefer to update manually, edit `version.js`:

```javascript
// Change this line to the current date/time:
buildTimestamp: "YYYY-MM-DD HH:MM:SS UTC",
```

---

## 🚀 Development vs Production

### Development Mode (Current State)
The timestamp is visible in the UI badge:

```javascript
const SHOW_BUILD_INFO = true;  // Shows timestamp
```

**What users see:** `2025-11-18 22:17:19 UTC`

### Production Mode
Before a major release, you can hide the timestamp and show the version number instead:

```javascript
const SHOW_BUILD_INFO = false;  // Shows version number only
```

**What users see:** `v2.0.0`

**Note:** The console will always show full build information regardless of this setting.

---

## 📝 Standard Workflow

### Before Every GitHub Push:

1. **Update the timestamp:**
   ```bash
   ./update-timestamp.sh
   ```

2. **Stage and commit your changes:**
   ```bash
   git add -A
   git commit -m "Your commit message"
   ```

3. **Push to GitHub:**
   ```bash
   git push origin main
   ```

### For Production Releases:

1. **Update version number** in `version.js`:
   ```javascript
   const ADMINPLUS_VERSION = {
       major: 2,
       minor: 1,    // Increment as needed
       patch: 0,
       ...
   }
   ```

2. **Disable build info display:**
   ```javascript
   const SHOW_BUILD_INFO = false;
   ```

3. **Update release notes:**
   ```javascript
   releaseNotes: "Your release notes here"
   ```

4. **Follow standard push workflow**

---

## 🎯 What Each Flag Does

### `SHOW_BUILD_INFO` Flag

| Value | UI Badge Shows | Use Case |
|-------|---------------|----------|
| `true` | Timestamp (`2025-11-18 22:17:19 UTC`) | Development, tracking updates |
| `false` | Version (`v2.0.0`) | Production releases |

**Console logging always shows full information regardless of this flag!**

---

## 📂 File Structure

```
AdminPlus/
├── version.js              # Version & timestamp configuration
├── update-timestamp.sh     # Automated timestamp updater
├── BUILD_README.md         # This file
└── CRMDevTools.js         # Main file (uses getBadgeText())
```

---

## ⚠️ Important Notes

1. **Always update the timestamp before pushing** - This ensures users know when the tool was last updated
2. **The script is timezone-aware** - Always uses UTC for consistency
3. **No breaking changes** - Toggling `SHOW_BUILD_INFO` doesn't break any functionality
4. **Console logging persists** - Developers can always see full version info in the console

---

## 🔍 Troubleshooting

### Script won't run?
```bash
chmod +x update-timestamp.sh
```

### Wrong timezone?
The script uses UTC by default. To change:
```bash
# Edit update-timestamp.sh and modify:
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
```

### Want to see what changed?
```bash
git diff version.js
```

---

## 📋 Quick Reference

```bash
# Update timestamp
./update-timestamp.sh

# Check current timestamp
grep "buildTimestamp" version.js

# Toggle to production mode
# Edit version.js: SHOW_BUILD_INFO = false

# Toggle to development mode
# Edit version.js: SHOW_BUILD_INFO = true
```

---

**Last Updated:** 2025-11-18  
**Maintained by:** AdminPlus Team

