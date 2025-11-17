// AdminPlus Version Information
const ADMINPLUS_VERSION = {
    major: 2,
    minor: 0,
    patch: 0,
    // Auto-updated: 2024-11-17
    buildDate: "2024-11-17",
    releaseNotes: "Reorganized codebase with modular structure"
};

// Generate version string (e.g., "v2.0.0")
function getVersionString() {
    return `v${ADMINPLUS_VERSION.major}.${ADMINPLUS_VERSION.minor}.${ADMINPLUS_VERSION.patch}`;
}

// Generate full version info with date
function getFullVersionInfo() {
    return `${getVersionString()} (${ADMINPLUS_VERSION.buildDate})`;
}

// Display version in console
console.log(`%cAdminPlus ${getVersionString()}`, 'color: #102e55; font-weight: bold; font-size: 14px;');
console.log(`Build Date: ${ADMINPLUS_VERSION.buildDate}`);
console.log(`Release: ${ADMINPLUS_VERSION.releaseNotes}`);

