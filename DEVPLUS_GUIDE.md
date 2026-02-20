# DevPlus — The Developer & Tester's Power Tool for Dynamics 365

## What Is DevPlus?

DevPlus is a browser-based toolbar that sits quietly inside your Dynamics 365 environment and gives developers and testers a set of powerful shortcuts — all in one place, always one click away. No navigating through menus, no switching between browser tabs, no copy-pasting GUIDs from URLs.

Think of it as a Swiss Army knife that lives inside D365. Everything you find yourself doing repeatedly — cloning records, checking field names, copying security settings, debugging automations — DevPlus turns those multi-step workflows into single clicks.

---

## Who Is This For?

| Role | How DevPlus Helps |
|---|---|
| **Developers** | Instantly see field logical names, inspect Web API responses, debug ribbon commands, and check automations without leaving the record |
| **Testers / QA** | Create multiple test records in seconds, show hidden fields, unlock locked fields, and track which fields have changed |
| **System Administrators** | Assign and copy security roles, teams, and business units across users in a fraction of the time |
| **Business Analysts** | Understand what fields exist on a table, what automations are running, and what values are set — all without needing developer support |

---

## How Much Time Can DevPlus Save?

Based on real-world D365 workflows, here is a conservative estimate of daily time savings:

| Task | Traditional Time | With DevPlus | Time Saved |
|---|---|---|---|
| Clone a test record | 03–06 min | 30 seconds | **~89%** |
| Clone 5 records for a test scenario | 10–10 min | 2 minutes | **~80%** |
| Assign security roles to a new user | 05–10 min | 2–3 min | **~67%** |
| Copy security from one user to another | 10–15 min | 2–3 min | **~80%** |
| Find a field's logical name | 5–10 min | 10 seconds | **~98%** |
| Show all hidden fields / tabs on a form | 5–10 min | 10 seconds | **~98%** |
| Check what automations run on a table | 15–30 min | 30 seconds | **~98%** |
| Open a record's Web API endpoint | 2–4 min | 5 seconds | **~97%** |
| Check which fields changed before saving | 5–10 min | 10 seconds | **~98%** |

> **For a developer or tester using D365 daily, DevPlus realistically saves 1–3 hours every single day.**

---

## The Tools — In Plain English

---

### 🧬 Clone Record

**What problem does it solve?**

Testing in D365 almost always requires multiple records — accounts, contacts, opportunities, cases — with realistic data already filled in. Creating them manually is one of the most time-consuming and tedious parts of any QA cycle.

---

**Traditional workflow (without DevPlus):**

Imagine you need 5 test Accounts, each with the same industry, account type, owner, and address — but different names.

1. Navigate to the Accounts list
2. Click **New**
3. Manually fill in Industry → Account Type → Owner → Address Line 1 → City → Country → Phone → all other fields
4. Save the record
5. Repeat steps 2–4 **four more times**

Total time: **45–90 minutes**, with a high chance of human error (typos, forgetting a field, selecting the wrong option).

---

**With DevPlus:**

1. Open one existing Account that already has all the right data
2. Click the 🧬 Clone Record button
3. A popup appears showing every field on the record with its current value — including fields that are hidden on the form
4. Tick or untick the fields you want carried over
5. Set **Copies: 5** in the bottom-left
6. Click **Clone Record**

Done in **under 2 minutes**. All 5 records are created with identical field values. DevPlus navigates you to the last created record automatically.

**Bonus:** The popup shows an **On Form / Not on Form** badge on every field, so you always know which fields are visible to end users and which are background data fields.

---

### 🔑 Assign Security

**What problem does it solve?**

When a new team member joins a project, or a user's responsibilities change, a D365 admin has to assign the right Business Unit, Teams, and Security Roles to them. In a large environment this is a multi-screen, multi-step process spread across different parts of the Settings area.

---

**Traditional workflow (without DevPlus):**

To set up a new tester with the right access:

1. Go to **Settings → Security → Users**, search for the user
2. Open their profile, click **Manage Roles**, tick each role, save
3. Go back to the user record, click **Join Teams**, search for each team, add one by one
4. If they need a different Business Unit: go to **Settings → Security → Users**, select the user, click **Change Business Unit**, select it, confirm
5. Switch back and forth between screens to verify everything was applied correctly

Total time: **15–30 minutes per user** — longer if there are many roles or teams.

---

**With DevPlus:**

1. Navigate to the user's record in D365
2. Click the 🔑 Assign Security button
3. A single popup appears with three tabs: **Business Unit**, **Teams**, and **Roles**
4. Change the Business Unit, add or remove Teams, and assign or remove Roles — all in the same window
5. Click Apply — done

Total time: **2–3 minutes**, everything in one place, no switching screens.

---

### 🛡️ Copy Security

**What problem does it solve?**

When onboarding a new team member who needs the same access as an existing colleague, admins typically have to open both user profiles side by side, manually note down every role and team on the source user, and then manually apply each one to the target user — hoping they don't miss anything.

---

**Traditional workflow (without DevPlus):**

1. Open User A's profile, click Manage Roles — note down all roles
2. Open User A's profile, check their Teams — note them down
3. Open User B's profile, click Manage Roles — compare with your notes, tick matching ones
4. Add User B to each team one by one
5. Double-check both profiles to make sure nothing was missed

Total time: **30–60 minutes** — and mistakes are common because you're comparing two screens from memory.

---

**With DevPlus:**

1. Click 🛡️ Copy Security
2. Select **Source User** (the person whose setup you want to copy)
3. Select **Target User** (the new team member)
4. DevPlus shows a **side-by-side comparison** — what the source user has, what the target user already has, and what will be added
5. Click **Apply** — all roles and teams are copied across instantly

Total time: **2–3 minutes**, with a visual diff so you always know exactly what changed and nothing is missed.

---

### 📋 Entity Info

**What problem does it solve?**

Developers constantly need to know the **logical name** (the technical name) of a field — for example, when writing JavaScript, creating Power Automate flows, building Web API queries, or configuring FetchXML. The traditional way is to leave D365, open the Power Apps maker portal, navigate to the right table, find the field, and copy the schema name. This is slow and breaks your flow.

---

**Traditional workflow (without DevPlus):**

1. Leave D365 and open make.powerapps.com
2. Navigate to **Tables**, search for the right table
3. Click **Columns**, find the field by its display name
4. Copy the logical name
5. Switch back to D365

Total time: **5–15 minutes per field lookup**, multiplied across a day of development work.

---

**With DevPlus:**

1. Open any record in D365
2. Click 📋 Entity Info
3. Every field on the table is listed immediately — display name, logical name, data type, and current value all in one view
4. Click the copy icon next to any field name

Total time: **10 seconds**.

---

### 🏷️ Logical Names (Show Field Schema Names Inline)

Even faster than Entity Info — with one click, DevPlus **replaces every field label on the current form** with its logical name. So instead of seeing "First Name" you see `firstname`, instead of "Account Name" you see `name`. Click again to switch back.

This is invaluable during development when you are writing code or flows and need to quickly confirm field names without switching tools.

---

### 👁️ Show Hidden Items

D365 forms often hide fields, tabs, and sections based on business rules, user roles, or scripting. For developers and testers this is a problem — you need to see and test the full form, not just what an end user sees.

**With DevPlus:** One click on 👁️ Show Hidden Items reveals every hidden tab, section, and field on the current form instantly. No editing form configurations, no disabling JavaScript — just click and see everything.

---

### 🔓 Unlock Fields

Certain fields on D365 forms are locked (read-only) by default — either by the system or by a customisation. If you need to manually correct data during testing, locked fields get in the way.

**With DevPlus:** One click on 🔓 Unlock Fields removes the read-only lock from every field on the form, letting you edit anything directly. This is a tester's best friend when fixing test data without writing code.

---

### ✏️ Dirty Fields (See What Changed Before Saving)

When you make changes to a D365 record and then wonder "what did I actually change?", there is normally no easy way to check before saving. This leads to accidental saves with wrong data — a common problem in test environments.

**With DevPlus:** Click ✏️ Dirty Fields at any point before saving and you get a clean list of every field that has been modified in the current session — showing the field name, type, and the new value it will be saved with.

---

### 🤖 Table Automations

When something goes wrong in a D365 process, the first question is usually: "What automations are running on this table?" Finding that out normally means navigating to multiple areas — Processes, Business Rules, Power Automate, etc.

**With DevPlus:** Click 🤖 Table Automations on any record and instantly see a complete list of every automation affecting that table:

- **Workflows** and Classic Processes
- **Business Rules**
- **Business Process Flows**
- **Power Automate Flows**
- **Custom APIs and Custom Actions**

Each entry shows its name, status (Active / Inactive), owner, and which solution it belongs to. Perfect for debugging unexpected behaviour.

---

### 🌐 Open Web API Endpoint

For developers working with D365's Web API — the interface used to query and update data programmatically — DevPlus can open the full API response for the current record directly in a new browser tab with one click.

**Traditional workflow:** Manually construct the URL using the entity's plural name and the GUID from the record URL — error-prone and slow.

**With DevPlus:** Click 🌐 and the correctly formatted API URL for the current record opens immediately. You see the raw JSON data for the record, which is invaluable for debugging integrations and data issues.

---

### 🔍 Open Record by ID

Developers and testers frequently receive GUIDs (the unique identifiers D365 uses for every record) in error logs, integration messages, or support tickets. Opening a record from a GUID normally requires constructing a URL manually.

**With DevPlus:** Click 🔍 Open Record, paste the entity name and GUID, and navigate directly to that record. There is also a **Use Current Record** shortcut that pre-fills the current record's details — useful for quickly sharing links.

---

### 🕵️ Advanced Find

Opens the Classic Advanced Find tool — the powerful query builder that lets you search D365 data using complex filters. DevPlus gives you a dedicated button to open it instantly without navigating through the main menu.

---

### 📅 Date Calculator

A built-in date utility that supports two common calculations developers and testers need:

- **Days Between Dates** — how many working or calendar days between two dates, with support for custom holiday schedules
- **Add Days to a Date** — calculate what date falls N working days from a given start date

Saves switching to a separate calendar app or spreadsheet for date-based test scenarios.

---

### ⚡ Performance Diagnostics

Opens the Dynamics 365 Performance Diagnostics page directly — useful for investigating slow form loads or sluggish API responses. Previously required navigating through Settings or manually editing a URL.

---

### 🐛 Command Checker

The D365 Command Checker is a built-in Microsoft tool for debugging ribbon buttons (the buttons in the top bar of D365 forms). To activate it the traditional way, you have to manually add `?ribbondebug=true` to the end of the page URL.

**With DevPlus:** One click on 🐛 Command Checker activates it automatically — no URL editing required.

---

## Summary — Why DevPlus Changes How You Work

Development and testing in Dynamics 365 is powerful — but the platform was built for end users, not for the people building and validating it. Developers and testers spend a significant portion of their day not actually developing or testing, but navigating menus, reconstructing URLs, switching between browser tabs, manually comparing settings, and hunting for field names across multiple portals. That time adds up fast and pulls focus away from the work that actually matters.

DevPlus was built specifically to close that gap. It brings tools that D365 simply does not provide out of the box — a built-in **Date Calculator** for working day calculations, **side-by-side security comparisons**, **bulk record cloning**, **instant field schema lookups**, and **live automation discovery** — all surfaced directly on the record you are working on, without leaving the page.

The result is that developers spend more time writing logic, building solutions, and solving real problems — and testers spend more time actually testing, not setting up test data or chasing down configuration details. Every task that used to pull you out of your workflow now takes seconds instead of minutes.

Instead of juggling browser tabs, editing URLs by hand, and navigating through Settings menus buried three levels deep, you have one toolbar — always present, always on the current record, always ready.

For a team of 5 developers and testers each saving just 30–60 minutes per day, **DevPlus delivers the equivalent of an entire extra sprint day — every single week.**

---

*DevPlus works inside Dynamics 365 (online) and requires the System Administrator role for security-related tools.*
