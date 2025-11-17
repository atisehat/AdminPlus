# How to Update Version

## Quick Guide

When you make changes to AdminPlus, follow these steps:

### 1. Update version.js

Edit `version.js` and update the version numbers:

```javascript
const ADMINPLUS_VERSION = {
    major: 2,    // Increment for breaking changes
    minor: 0,    // Increment for new features
    patch: 1,    // Increment for bug fixes
    buildDate: "2024-11-17",  // Update to today's date
    releaseNotes: "Brief description of your changes"
};
```

### 2. Update CHANGELOG.md

Add your changes to the top of `CHANGELOG.md`:

```markdown
## [2.0.1] - 2024-11-17

### Fixed
- Brief description of bug fix

### Added
- New feature description

### Changed
- What you changed
```

### 3. Commit and Push

```bash
git add .
git commit -m "Bump version to v2.0.1: Brief description"
git push origin main
```

---

## Version Number Guidelines

### Semantic Versioning (MAJOR.MINOR.PATCH)

**MAJOR (X.0.0)** - Increment when:
- Breaking changes that affect existing functionality
- Complete architectural redesign
- Removing features
- API changes that break compatibility

**MINOR (0.X.0)** - Increment when:
- Adding new tools/features
- Significant enhancements to existing tools
- New capabilities that don't break existing code
- Major UI improvements

**PATCH (0.0.X)** - Increment when:
- Bug fixes
- Small improvements
- Documentation updates
- Performance optimizations
- CSS/styling tweaks
- Security patches

---

## Examples

### Patch Update (2.0.0 → 2.0.1)
**Scenario**: Fixed a bug in Date Calculator
```javascript
major: 2, minor: 0, patch: 1
buildDate: "2024-11-18"
releaseNotes: "Fixed weekend calculation bug in Date Calculator"
```

### Minor Update (2.0.1 → 2.1.0)
**Scenario**: Added new "Bulk User Update" tool
```javascript
major: 2, minor: 1, patch: 0
buildDate: "2024-11-20"
releaseNotes: "Added Bulk User Update tool"
```

### Major Update (2.1.0 → 3.0.0)
**Scenario**: Redesigned with React framework (breaking change)
```javascript
major: 3, minor: 0, patch: 0
buildDate: "2024-12-01"
releaseNotes: "Complete redesign with React framework"
```

---

## Quick Commands

### After making changes:

```bash
# Check what you changed
git status

# Stage all changes
git add .

# Commit with version in message
git commit -m "v2.0.1: Fixed Date Calculator bug"

# Push to GitHub
git push origin main
```

### View version history:
```bash
git log --oneline -10
```

---

## Automation Ideas (Future)

Consider creating a version bump script:

```bash
# bump-version.sh
#!/bin/bash
# Usage: ./bump-version.sh patch "Bug fix description"
# Usage: ./bump-version.sh minor "New feature description"
# Usage: ./bump-version.sh major "Breaking change description"
```

This could automatically:
1. Update version.js
2. Update CHANGELOG.md
3. Git commit with proper message
4. Git push to GitHub

