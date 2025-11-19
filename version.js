// AdminPlus Version Information
const ADMINPLUS_VERSION = {
    major: 2,
    minor: 0,
    patch: 0,
    // Last Updated: 2025-11-18 08:09:45 PM EST
    buildTimestamp: "2025-11-18 08:09:45 PM EST",
    releaseNotes: "Code refactoring - consolidated duplicate code and improved maintainability"
};

// ==================== DEVELOPMENT MODE ====================
// Set to false before production release to hide build timestamp
const SHOW_BUILD_INFO = true;
// ==========================================================

// Generate version string (e.g., "v2.0.0")
function getVersionString() {
    return `v${ADMINPLUS_VERSION.major}.${ADMINPLUS_VERSION.minor}.${ADMINPLUS_VERSION.patch}`;
}

// Generate display string for UI badge
function getBadgeText() {
    if (SHOW_BUILD_INFO && ADMINPLUS_VERSION.buildTimestamp) {
        return ADMINPLUS_VERSION.buildTimestamp;
    }
    return getVersionString();
}

// Generate full version info with timestamp
function getFullVersionInfo() {
    return `${getVersionString()} (${ADMINPLUS_VERSION.buildTimestamp})`;
}

// Display version in console (always shows full info for debugging)
console.log(`%cAdminPlus ${getVersionString()}`, 'color: #102e55; font-weight: bold; font-size: 14px;');
console.log(`Last Updated: ${ADMINPLUS_VERSION.buildTimestamp}`);
if (ADMINPLUS_VERSION.releaseNotes) {
    console.log(`Release: ${ADMINPLUS_VERSION.releaseNotes}`);
}

