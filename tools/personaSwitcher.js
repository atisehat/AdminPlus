/**
 * Persona Switcher Tool
 * Allows admins to temporarily switch to a basic user persona for testing,
 * then restore their original admin roles without needing another admin's help.
 *
 * Key design: No System Administrator check is required to open this tool
 * or restore roles, since the user won't have admin when they need to restore.
 *
 * Roles are saved to localStorage so they persist across page refreshes.
 *
 * @requires fetchRolesForUser, fetchSecurityRoles from utils/api.js
 * @requires updateUserDetails from securityOperations.js
 * @requires makePopupMovable, showLoadingDialog, closeLoadingDialog, showToast from utils/ui.js
 */
function personaSwitcher() {
	const clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();
	const currentUserId = Xrm.Utility.getGlobalContext().userSettings.userId.replace(/[{}]/g, '');
	const currentUserName = Xrm.Utility.getGlobalContext().userSettings.userName;
	const STORAGE_KEY = `adminplus_persona_${currentUserId}`;

	let businessUnitId = null;
	let currentRoles = [];
	let availableRoles = [];
	let selectedBasicRoles = [];

	// ── Snapshot Management ──

	function getSnapshot() {
		try {
			const data = localStorage.getItem(STORAGE_KEY);
			if (!data) return null;
			const parsed = JSON.parse(data);
			if (parsed.userId !== currentUserId) return null;
			return parsed;
		} catch (e) {
			return null;
		}
	}

	function saveSnapshot(roles) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			userId: currentUserId,
			userName: currentUserName,
			roles: roles,
			timestamp: new Date().toISOString()
		}));
	}

	function clearSnapshot() {
		localStorage.removeItem(STORAGE_KEY);
	}

	// ── Data Loading ──

	async function loadCurrentUser() {
		const response = await Xrm.WebApi.retrieveRecord("systemuser", currentUserId, "?$select=_businessunitid_value");
		businessUnitId = response._businessunitid_value;
	}

	async function loadCurrentRoles() {
		return new Promise((resolve) => {
			fetchRolesForUser(currentUserId, async function(response) {
				currentRoles = [];
				if (response && response.entities) {
					const rolePromises = response.entities.map(role =>
						Xrm.WebApi.retrieveRecord("role", role.roleid, "?$select=name,roleid")
							.then(detail => currentRoles.push({ id: detail.roleid, name: detail.name }))
					);
					await Promise.all(rolePromises);
					currentRoles.sort((a, b) => a.name.localeCompare(b.name));
				}
				resolve();
			});
		});
	}

	async function loadAvailableRoles() {
		if (!businessUnitId) return;
		return new Promise((resolve) => {
			fetchSecurityRoles(businessUnitId, function(response) {
				availableRoles = [];
				if (response && response.entities) {
					availableRoles = response.entities
						.map(role => ({ id: role.roleid, name: role.name }))
						.sort((a, b) => a.name.localeCompare(b.name));
				}
				resolve();
			});
		});
	}

	// ── Popup ──

	function createPopup() {
		document.querySelectorAll('.commonPopup').forEach(p => p.remove());

		const popup = document.createElement('div');
		popup.className = 'commonPopup';
		popup.setAttribute('data-popup-id', 'personaSwitcher');

		popup.innerHTML = `
			<div class="commonPopup-header">
				<span style="color: white;">Persona Switcher</span>
				<span class="close-button">&times;</span>
			</div>
			<div class="popup-body">
				<div class="persona-layout" id="personaContent">
					<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-style: italic; font-size: 14px;">
						Loading security information...
					</div>
				</div>
			</div>
		`;

		document.body.appendChild(popup);

		const closeButton = popup.querySelector('.close-button');
		closeButton.addEventListener('click', () => popup.remove());
		closeButton.addEventListener('mouseenter', function() { this.style.backgroundColor = '#e81123'; });
		closeButton.addEventListener('mouseleave', function() { this.style.backgroundColor = 'transparent'; });

		makePopupMovable(popup);
		return popup;
	}

	// ── Render ──

	function renderContent() {
		const content = document.getElementById('personaContent');
		const snapshot = getSnapshot();

		if (snapshot) {
			renderRestoreView(content, snapshot);
		} else {
			renderSwitchView(content);
		}
	}

	function renderSwitchView(content) {
		const isAdmin = checkSystemAdministratorRole();

		content.innerHTML = `
			<div class="persona-header-bar">
				<div class="persona-user-badge">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2">
						<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
						<circle cx="12" cy="7" r="4"/>
					</svg>
					<span class="persona-badge-name">${currentUserName}</span>
					<span class="persona-badge-status persona-badge-admin">
						${isAdmin ? 'Admin' : 'Current'}
					</span>
				</div>
			</div>

			<div class="persona-body">
				<div class="persona-section">
					<div class="persona-section-title">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2">
							<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
							<path d="M8 11V7a4 4 0 118 0v4"/>
						</svg>
						Current Security Roles
					</div>
					<div class="persona-roles-grid">
						${currentRoles.length > 0
							? currentRoles.map(role => `
								<div class="persona-role-chip">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
									${role.name}
								</div>
							`).join('')
							: '<div class="empty-message">No roles assigned</div>'
						}
					</div>
				</div>

				<div class="persona-divider-line"></div>

				<div class="persona-section">
					<div class="persona-section-title">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" stroke-width="2">
							<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
						</svg>
						Select Basic Persona Roles
					</div>
					<p class="persona-hint">Choose the roles for your basic persona. Your current roles will be saved and can be restored anytime.</p>
					${!isAdmin ? `
						<div class="persona-warning-note">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
								<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
								<line x1="12" y1="9" x2="12" y2="13"/>
								<line x1="12" y1="17" x2="12.01" y2="17"/>
							</svg>
							<span>System Administrator role is required to switch personas.</span>
						</div>
					` : ''}
					<input type="text" id="personaRoleSearch" placeholder="Search roles..." class="search-input" style="margin-bottom: 10px;">
					<div class="persona-select-list" id="personaRoleList">
						${availableRoles.map(role => `
							<div class="persona-select-item selectable-item" data-role-id="${role.id}" data-search-text="${role.name.toLowerCase()}">
								<span>${role.name}</span>
							</div>
						`).join('')}
					</div>
				</div>
			</div>

			<div class="persona-footer">
				<div class="persona-counter" id="personaCounter" style="display: none;">
					<span id="personaCounterText">0 selected</span>
				</div>
				<button id="personaSwitchBtn" class="btn-primary" disabled style="opacity: 0.5;">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
					</svg>
					Switch to Basic Persona
				</button>
			</div>
		`;

		// Role selection handlers
		document.querySelectorAll('.persona-select-item').forEach(item => {
			item.addEventListener('click', function() {
				const roleId = this.dataset.roleId;
				const idx = selectedBasicRoles.indexOf(roleId);
				if (idx > -1) {
					selectedBasicRoles.splice(idx, 1);
					this.classList.remove('selected');
				} else {
					selectedBasicRoles.push(roleId);
					this.classList.add('selected');
				}
				updateSwitchUI();
			});
		});

		// Search handler
		const searchInput = document.getElementById('personaRoleSearch');
		if (searchInput) {
			searchInput.addEventListener('input', function() {
				const query = this.value.toLowerCase().trim();
				document.querySelectorAll('.persona-select-item').forEach(item => {
					item.style.display = item.dataset.searchText.includes(query) ? 'flex' : 'none';
				});
			});
		}

		document.getElementById('personaSwitchBtn').addEventListener('click', handleSwitch);
	}

	function renderRestoreView(content, snapshot) {
		const switchedAt = new Date(snapshot.timestamp).toLocaleString();

		content.innerHTML = `
			<div class="persona-header-bar persona-header-basic">
				<div class="persona-user-badge">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
						<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
						<circle cx="12" cy="7" r="4"/>
					</svg>
					<span class="persona-badge-name">${currentUserName}</span>
					<span class="persona-badge-status persona-badge-basic">Basic Persona</span>
				</div>
			</div>

			<div class="persona-alert-banner">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="flex-shrink: 0;">
					<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
					<line x1="12" y1="9" x2="12" y2="13"/>
					<line x1="12" y1="17" x2="12.01" y2="17"/>
				</svg>
				<div>
					<strong>Basic persona is currently active.</strong>
					<span>Switched on ${switchedAt}</span>
				</div>
			</div>

			<div class="persona-body">
				<div class="persona-section">
					<div class="persona-section-title">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
							<circle cx="12" cy="12" r="10"/>
							<path d="M12 16v-4M12 8h.01"/>
						</svg>
						Active Roles (Basic Persona)
					</div>
					<div class="persona-roles-grid">
						${currentRoles.length > 0
							? currentRoles.map(role => `
								<div class="persona-role-chip persona-chip-basic">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
										<polyline points="20 6 9 17 4 12"/>
									</svg>
									${role.name}
								</div>
							`).join('')
							: '<div class="empty-message">No roles assigned</div>'
						}
					</div>
				</div>

				<div class="persona-divider-line"></div>

				<div class="persona-section">
					<div class="persona-section-title">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
							<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>
							<path d="M8 11V7a4 4 0 118 0v4"/>
						</svg>
						Saved Admin Roles (Will Be Restored)
					</div>
					<div class="persona-roles-grid">
						${snapshot.roles.map(role => `
							<div class="persona-role-chip persona-chip-saved">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12"/>
								</svg>
								${role.name}
							</div>
						`).join('')}
					</div>
				</div>
			</div>

			<div class="persona-footer persona-footer-restore">
				<button id="personaClearBtn" class="btn-secondary">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
					Clear Saved Data
				</button>
				<button id="personaRestoreBtn" class="btn-primary persona-btn-restore">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
						<path d="M21 3v5h-5"/>
						<path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/>
						<path d="M3 21v-5h5"/>
					</svg>
					Restore Admin Persona
				</button>
			</div>
		`;

		document.getElementById('personaRestoreBtn').addEventListener('click', handleRestore);
		document.getElementById('personaClearBtn').addEventListener('click', handleClearSnapshot);
	}

	// ── UI Updates ──

	function updateSwitchUI() {
		const counter = document.getElementById('personaCounter');
		const counterText = document.getElementById('personaCounterText');
		const switchBtn = document.getElementById('personaSwitchBtn');

		if (selectedBasicRoles.length > 0) {
			counter.style.display = 'flex';
			counterText.textContent = `${selectedBasicRoles.length} role${selectedBasicRoles.length > 1 ? 's' : ''} selected`;
			switchBtn.disabled = false;
			switchBtn.style.opacity = '1';
		} else {
			counter.style.display = 'none';
			switchBtn.disabled = true;
			switchBtn.style.opacity = '0.5';
		}
	}

	// ── Actions ──

	async function handleSwitch() {
		if (selectedBasicRoles.length === 0) {
			showToast('Please select at least one role for your basic persona.', 'warning', 3000);
			return;
		}

		if (!checkSystemAdministratorRole()) {
			showToast('System Administrator role is required to switch personas.', 'error', 4000);
			return;
		}

		try {
			showLoadingDialog('Switching to basic persona...');

			saveSnapshot(currentRoles);
			await updateUserDetails(currentUserId, null, [], [], 'RemoveAllRoles');
			await updateUserDetails(currentUserId, null, [], selectedBasicRoles, 'AddRoles');

			closeLoadingDialog();
			showToast('Switched to basic persona. Page will reload...', 'success', 2500);
			setTimeout(() => window.location.reload(), 2000);
		} catch (error) {
			closeLoadingDialog();
			console.error('Error switching persona:', error);
			showToast('Error switching persona. Please try again.', 'error', 4000);
		}
	}

	async function handleRestore() {
		const snapshot = getSnapshot();
		if (!snapshot) {
			showToast('No saved persona found.', 'error', 3000);
			return;
		}

		try {
			showLoadingDialog('Restoring admin persona...');

			await updateUserDetails(currentUserId, null, [], [], 'RemoveAllRoles');
			const roleIds = snapshot.roles.map(r => r.id);
			await updateUserDetails(currentUserId, null, [], roleIds, 'AddRoles');

			clearSnapshot();
			closeLoadingDialog();
			showToast('Admin persona restored. Page will reload...', 'success', 2500);
			setTimeout(() => window.location.reload(), 2000);
		} catch (error) {
			closeLoadingDialog();
			console.error('Error restoring persona:', error);
			showToast('Error restoring admin persona. You may need to contact another admin.', 'error', 5000);
		}
	}

	function handleClearSnapshot() {
		clearSnapshot();
		showToast('Saved persona data cleared.', 'info', 2000);
		renderContent();
	}

	// ── Initialize ──

	const popup = createPopup();

	showLoadingDialog('Loading security information...');

	Promise.all([loadCurrentUser(), loadCurrentRoles()])
		.then(() => loadAvailableRoles())
		.then(() => {
			closeLoadingDialog();
			renderContent();
		})
		.catch(error => {
			closeLoadingDialog();
			console.error('Error loading persona data:', error);
			showToast('Failed to load security information.', 'error', 4000);
		});
}
