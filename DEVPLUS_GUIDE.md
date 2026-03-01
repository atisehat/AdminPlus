# Dev+ — Developer & Tester Toolbar for Dynamics 365

Dev+ is a browser-based toolbar that runs inside your Dynamics 365 environment, giving developers, testers, and administrators quick access to a set of tools — all from a single sidebar.

---

## Tools

### 🕵️ Advanced Find
Opens the Classic Advanced Find tool in a new window — the query builder for searching D365 data using complex filters.

---

### 📋 Entity Info
Displays every field on the current table, showing the display name, logical name, data type, and current value. Fields can be copied to clipboard directly from the popup.

---

### 🔍 Open Record
Opens any D365 record by entering an entity logical name and a GUID. Includes a shortcut to pre-fill the details of the currently open record.

---

### 🧬 Clone Record
Creates one or more copies of the current record. A popup displays all fields with their values — choose which fields to carry over, set how many copies to create, and clone.

---

### ✏️ Dirty Fields
Shows a list of all fields that have been modified on the current form but not yet saved, including each field's name, type, and new value.

---

### 👁️ Show Hidden Items
Reveals all hidden tabs, sections, and fields on the current form without modifying form configurations or disabling scripts.

---

### 🔓 Unlock Fields
Removes the read-only lock from all fields on the current form, making locked fields editable.

---

### 🏷️ Logical Names
Replaces all field labels on the current form with their logical (schema) names. Click again to switch back to display names.

---

### 🤖 Table Automations
Lists all automations associated with the current table — including workflows, business rules, business process flows, Power Automate flows, custom APIs, and custom actions — along with each item's name, status, owner, and solution.

---

### 🎭 Persona Switcher
Impersonates another D365 user by injecting their ID into all API calls. All data and views load as if you are that user, without modifying any roles. A banner shows who is being impersonated, and a Stop button ends the session.

---

### 🔑 Assign Security
Manages a selected user's Business Unit, Teams, and Security Roles from a single popup with three tabs — Business Unit, Teams, and Roles. Supports adding, removing, and replacing items in each category.

---

### 🛡️ Copy Security
Copies the Business Unit, Teams, and Security Roles from one user to another. Displays a side-by-side view of both users' current security before applying.

---

### 📅 Date Calculator
Calculates the number of days between two dates, or adds a number of working days to a date. Supports custom holiday schedules for working day calculations.

---

### 🌐 Open Web API Endpoint
Opens the Web API URL for the current record in a new browser tab, showing the raw JSON response for that record.

---

### 🐛 Command Checker
Activates the D365 Command Checker (ribbon debugger) for the current page, used to inspect and debug toolbar button behaviour.

---

### ⚡ Performance Diagnostics
Opens the Dynamics 365 Performance Diagnostics page in a new tab.

---

*Dev+ requires the System Administrator role for security-related tools (Assign Security, Copy Security, Persona Switcher).*
