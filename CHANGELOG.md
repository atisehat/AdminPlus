# Changelog

All notable changes to AdminPlus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Format
- **Major (X.0.0)**: Breaking changes or major architectural updates
- **Minor (0.X.0)**: New features or significant enhancements
- **Patch (0.0.X)**: Bug fixes, minor improvements, documentation updates

---

## [2.0.0] - 2024-11-17

### 🎉 Major Reorganization
Complete codebase restructuring for better maintainability and scalability.

### Added
- ✨ **Version numbering system** with display in main popup
- ✨ New `version.js` file for centralized version management
- ✨ Version badge displayed in popup header
- ✨ Console logging of version information
- 📁 Created modular folder structure:
  - `utils/` - Shared utility functions
  - `tools/` - Individual tool modules
  - `styles/` - Organized stylesheets
- 📄 Comprehensive `README.md` with full documentation
- 📄 `REORGANIZATION_SUMMARY.md` with detailed changes
- 📄 This `CHANGELOG.md` for version tracking

### Changed
- ♻️ **File Reorganization**:
  - Split `common.js` into `utils/api.js` and `utils/ui.js`
  - Split `styles.css` into `styles/common.css` and `styles/tools.css`
- ♻️ **File Renaming** (clearer, more descriptive names):
  - `aFuPrB.js` → `tools/advancedFind.js`
  - `aSecurity.js` → `tools/assignSecurity.js`
  - `cSecurity.js` → `tools/copySecurity.js`
  - `shf_uf.js` → `tools/showLogicalNames.js`
  - `dateCalc.js` → `tools/dateCalculator.js`
  - `commonSecurity.js` → `tools/securityOperations.js`
  - `dirtyFields.js` → `tools/dirtyFields.js` (moved)
  - `entityInfo.js` → `tools/entityInfo.js` (moved)
  - `fieldsControl.js` → `tools/fieldsControl.js` (moved)
- 🔄 Updated `CRMDevTools.js` to load from new folder structure

### Removed
- 🗑️ Deleted `alerts.js` (legacy/test code)
- 🗑️ Removed all old root-level files after reorganization

### Technical Details
- 18 files changed
- +955 insertions, -648 deletions
- Maintained 100% backward compatibility
- All functionality preserved

---

## [1.0.0] - Previous Versions

### Features
- ✅ Advanced Find Classic launcher
- ✅ Entity information viewer
- ✅ Field controls (unlock, show hidden)
- ✅ Logical names display
- ✅ Dirty fields detector
- ✅ User security management (copy & assign)
- ✅ Date calculator with holiday schedules
- ✅ REST Builder integration
- ✅ User Provision tool access

---

## How to Update Version

When making changes, update the version in `version.js`:

```javascript
const ADMINPLUS_VERSION = {
    major: 2,    // Breaking changes
    minor: 0,    // New features
    patch: 1,    // Bug fixes
    buildDate: "YYYY-MM-DD",
    releaseNotes: "Brief description of changes"
};
```

Then update this CHANGELOG.md with your changes.

---

## Future Roadmap

### Planned Features
- [ ] Auto-update notification system
- [ ] User preferences/settings storage
- [ ] Export/Import configurations
- [ ] Advanced reporting tools
- [ ] Bulk operations interface
- [ ] Integration with Power Automate
- [ ] Custom theme support

### Under Consideration
- [ ] Multi-language support
- [ ] Plugin architecture for custom tools
- [ ] Performance metrics dashboard
- [ ] Advanced search across entities
- [ ] Workflow visualization tools

