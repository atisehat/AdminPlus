# AdminPlus - Dynamics 365 Developer Tools

A comprehensive toolkit for Microsoft Dynamics 365 CRM administrators and developers.

## 📁 Project Structure

```
AdminPlus/
├── CRMDevTools.js          # Main entry point - loads all tools
├── utils/                  # Shared utility functions
│   ├── api.js             # Dynamics 365 API functions (fetch users, roles, teams, etc.)
│   └── ui.js              # UI helpers (dialogs, popups, loading indicators)
├── tools/                  # Individual tool modules
│   ├── advancedFind.js    # Advanced Find Classic & REST Builder
│   ├── entityInfo.js      # Entity & field information display
│   ├── fieldsControl.js   # Unlock fields & show hidden items
│   ├── showLogicalNames.js # Display logical names for tabs/sections/fields
│   ├── dirtyFields.js     # Show modified fields on form
│   ├── copySecurity.js    # Copy security from one user to another
│   ├── assignSecurity.js  # Assign security (BU, Teams, Roles) to users
│   ├── securityOperations.js # Backend security operations (associate/disassociate)
│   └── dateCalculator.js  # Business day calculator with holiday schedules
└── styles/                 # Stylesheets
    ├── common.css         # Shared styles (popups, buttons, layouts)
    └── tools.css          # Tool-specific styles

```

## 📌 Current Version

**Version**: 2.0.0 (See `version.js` for details)  
**Last Updated**: November 17, 2024  
**Changelog**: See [CHANGELOG.md](CHANGELOG.md) for version history

The version number is displayed in the top-right corner of the main popup.

---

## 🚀 Features

### 1. Advanced Find Classic
- Opens the classic Advanced Find interface
- REST Builder launcher
- User Provision tool access

### 2. Entity Information
- View entity logical/plural names
- Display all fields with types
- Show current record ID

### 3. Field Controls
- **Unlock All Fields**: Make read-only fields editable
- **Show Hidden Items**: Reveal hidden tabs, sections, controls

### 4. Show Logical Names
- Display logical names instead of display names
- Works on tabs, sections, fields
- Shows OptionSet values with IDs

### 5. Dirty Fields Detector
- Identifies modified fields on forms
- Shows both display and logical names

### 6. User Security Management

#### Copy Security
- Side-by-side user comparison
- One-click security profile copying
- Copies Business Unit, Teams, and Roles

#### Assign Security
- Change Business Unit
- Add/Remove Teams (Owner/Access types)
- Add/Remove Security Roles
- Granular control with checkboxes

### 7. Date Calculator
- Calculate business days between dates
- Add days to a date (excluding weekends/holidays)
- Holiday schedule integration
- Interactive calendar view

## 🔧 Installation

### Option 1: Bookmarklet
1. Create a new bookmark in your browser
2. Paste the following as the URL:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://atisehat.github.io/AdminPlus/CRMDevTools.js';document.body.appendChild(s);})();
```
3. Click the bookmark while on a Dynamics 365 page

### Option 2: Browser Console
1. Open Developer Console (F12)
2. Paste the following and press Enter:
```javascript
var s=document.createElement('script');s.src='https://atisehat.github.io/AdminPlus/CRMDevTools.js';document.body.appendChild(s);
```

## 🔐 Security

- Only accessible to System Administrators
- Additional user whitelist support
- Prevents users from modifying their own security

## 🛠️ Technical Details

**Technologies:**
- JavaScript (ES6+)
- Dynamics 365 Web API (v9.2)
- Xrm.WebApi / Xrm.Page APIs
- FetchXML for queries
- Pure CSS (no frameworks)

**Architecture:**
- Modular design with separated concerns
- Async/await for API calls
- Event-driven popup system
- Dynamic script loading

## 📝 Development

### File Organization
- **utils/**: Reusable functions shared across tools
- **tools/**: Individual feature implementations
- **styles/**: Separated CSS for maintainability

### Adding a New Tool
1. Create new file in `tools/` directory
2. Add tool-specific CSS to `styles/tools.css`
3. Load script in `CRMDevTools.js`
4. Add button/menu item in main popup
5. Update version in `version.js` (minor bump)
6. Document in `CHANGELOG.md`

### Updating Version
See [UPDATE_VERSION.md](UPDATE_VERSION.md) for detailed instructions on version management.

## 📄 License

Internal use only - VHA Organization

## 👤 Author

Atiq Sehat

