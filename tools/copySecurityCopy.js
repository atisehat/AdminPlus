function copySecurityCopy() {
	// Check if Sys Admin
	if (!checkSystemAdministratorRole()) {
		Xrm.Navigation.openAlertDialog({ text: "You do not have permission to execute this action. System Administrator role required." });
		return;
	}
	
	let selectedUserId2 = null; 
	let selectedUserName2 = '';
	let selectedUserId = null;
	let selectedUserName = '';
	let selectedBusinessUnitId = null; 
	let selectedTeamIds = []; 
	let selectedRoleIds = [];	
	
	function createAppendSecurityPopup() {		
		var newContainer = document.createElement('div');		
		newContainer.className = 'commonPopup';
		newContainer.style.border = '3px solid #1a1a1a';
		newContainer.style.borderRadius = '12px';
		newContainer.style.width = '85%';
		newContainer.style.maxWidth = '1400px';
		newContainer.style.maxHeight = '92vh';
		
		newContainer.innerHTML =  `
		  <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
		    <span style="color: white; font-size: 18px; font-weight: 600;">Copy Security from User to User</span>
		    <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
		  </div>
		  <div class="popup-body" style="padding: 20px; overflow-y: auto; max-height: calc(92vh - 80px);">
		    
		    <!-- User Selection Row -->
		    <div class="securityPopup-row" style="gap: 20px; margin-bottom: 20px;">
		      <div class="user-section" id="section1" style="flex: 1; border: 2px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa;">
		        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
		          <h3 style="margin: 0; color: #2b2b2b; font-size: 16px; font-weight: 600; white-space: nowrap;">FROM User</h3>
		          <input type="text" id="searchInput1" placeholder="🔍 Search..." style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
		        </div>
		        <div style="margin-bottom: 8px;">
		          <span id="fromStatus" style="font-size: 12px; color: #999; font-style: italic;">No user selected</span>
		        </div>
		        <div class="user-list-container" style="max-height: 220px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; background: white;">
		          <div id="userList1"></div>
		        </div>
		      </div>
		      
		      <div style="display: flex; align-items: center; justify-content: center; padding: 20px 10px;">
		        <div style="font-size: 32px; color: #666;">→</div>
		      </div>
		      
		      <div class="user-section" id="section2" style="flex: 1; border: 2px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa;">
		        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
		          <h3 style="margin: 0; color: #2b2b2b; font-size: 16px; font-weight: 600; white-space: nowrap;">TO User</h3>
		          <input type="text" id="searchInput2" placeholder="🔍 Search..." style="flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 13px; box-sizing: border-box;">
		        </div>
		        <div style="margin-bottom: 8px;">
		          <span id="toStatus" style="font-size: 12px; color: #999; font-style: italic;">No user selected</span>
		        </div>
		        <div class="user-list-container" style="max-height: 220px; overflow-y: auto; border: 1px solid #ddd; border-radius: 6px; background: white;">
		          <div id="userList2"></div>
		        </div>
		      </div>
		    </div>
		    
		    <!-- Divider -->
		    <div style="border-top: 2px solid #ddd; margin: 20px 0;"></div>
		    
		    <!-- Security Details Section -->
		    <div style="margin-bottom: 15px;">
		      <h3 style="margin: 0 0 15px 0; color: #2b2b2b; font-size: 16px; font-weight: 600;">Security Details</h3>
		    </div>
		    
		    <!-- Business Unit & Teams Row -->
		    <div class="securityPopup-row" style="gap: 20px; margin-bottom: 15px;">
		      <div class="details-section-row" id="section3" style="flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: white;">
		        <h4 style="margin: 0 0 12px 0; color: #555; font-size: 14px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">FROM - Business Unit & Teams</h4>
		        <div class="roles-and-teams-list-row" style="max-height: 180px; overflow-y: auto;">
		          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #333;"></ul>
		        </div>
		      </div>
		      <div class="details-section-row" id="section5" style="flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: white;">
		        <h4 style="margin: 0 0 12px 0; color: #555; font-size: 14px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">TO - Business Unit & Teams</h4>
		        <div class="roles-and-teams-list-row" style="max-height: 180px; overflow-y: auto;">
		          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #333;"></ul>
		        </div>
		      </div>
		    </div>
		    
		    <!-- Security Roles Row -->
		    <div class="securityPopup-row" style="gap: 20px; margin-bottom: 20px;">
		      <div class="details-section-row" id="section4" style="flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: white;">
		        <h4 style="margin: 0 0 12px 0; color: #555; font-size: 14px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">FROM - Security Roles</h4>
		        <div class="roles-and-teams-list-row" style="max-height: 180px; overflow-y: auto;">
		          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #333;"></ul>
		        </div>
		      </div>
		      <div class="details-section-row" id="section6" style="flex: 1; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; background: white;">
		        <h4 style="margin: 0 0 12px 0; color: #555; font-size: 14px; font-weight: 600; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">TO - Security Roles</h4>
		        <div class="roles-and-teams-list-row" style="max-height: 180px; overflow-y: auto;">
		          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #333;"></ul>
		        </div>
		      </div>
		    </div>
		    
		    <!-- Action Section -->
		    <div style="display: flex; align-items: center; justify-content: center; gap: 15px; padding: 15px; background: #f5f5f5; border-radius: 8px; border: 1px solid #ddd;">
		      <div style="flex: 1; text-align: center;">
		        <p style="margin: 0; font-size: 13px; color: #666;">
		          <strong>Note:</strong> Only 'Owner' or 'Access' type teams will be copied. The TO user's existing security will be replaced.
		        </p>
		      </div>
		      <button id="submitButton" style="display: none; padding: 12px 40px; font-size: 15px; font-weight: 600; background-color: #2b2b2b; color: white; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); white-space: nowrap;">
		        Copy Security
		      </button>
		    </div>
		  </div>
		`;
		
		// Close all popups
		const existingPopups = document.querySelectorAll('.commonPopup');
		existingPopups.forEach(popup => popup.remove());		
		newContainer.setAttribute('data-popup-id', 'copySecurityCopy');
		document.body.appendChild(newContainer);
		
		// Close Btn
		const closeButton = newContainer.querySelector('.close-button');
		closeButton.addEventListener('click', () => {
		  newContainer.remove();
		});
		
		// Hover effect for Close Btn
		closeButton.addEventListener('mouseenter', function() {
		  this.style.backgroundColor = '#e81123';
		});
		closeButton.addEventListener('mouseleave', function() {
		  this.style.backgroundColor = 'transparent';
		});		
		makePopupMovable(newContainer);	
}

	function renderUserList(users, selectUserCallback, sectionId, searchInputId) {
		const userListDiv = document.getElementById(sectionId);
		users.forEach(user => {
			const userDiv = document.createElement('div');
			userDiv.className = `user${sectionId.charAt(sectionId.length - 1)}`;
			userDiv.textContent = user.fullname;
			userDiv.dataset.id = user.systemuserid;
			userDiv.onclick = () => selectUserCallback(user);
			// Add styling
			userDiv.style.padding = '8px 12px';
			userDiv.style.cursor = 'pointer';
			userDiv.style.fontSize = '13px';
			userDiv.style.transition = 'all 0.2s ease';
			userDiv.style.borderBottom = '1px solid #f0f0f0';
			userDiv.addEventListener('mouseenter', function() {
				if (!this.classList.contains('selected')) {
					this.style.backgroundColor = '#f8f8f8';
				}
			});
			userDiv.addEventListener('mouseleave', function() {
				if (!this.classList.contains('selected')) {
					this.style.backgroundColor = 'white';
				}
			});
			userListDiv.appendChild(userDiv);
		});
	}

	function updateSubmitButtonVisibility() {
		const submitButton = document.getElementById("submitButton");
		const fromStatus = document.getElementById("fromStatus");
		const toStatus = document.getElementById("toStatus");
		
		if (selectedUserId && selectedUserId2) {
			submitButton.style.display = 'block';
			if (fromStatus) fromStatus.textContent = `✓ ${selectedUserName}`;
			if (fromStatus) fromStatus.style.color = '#10b981';
			if (fromStatus) fromStatus.style.fontWeight = '600';
			if (toStatus) toStatus.textContent = `✓ ${selectedUserName2}`;
			if (toStatus) toStatus.style.color = '#10b981';
			if (toStatus) toStatus.style.fontWeight = '600';
		} else {
			submitButton.style.display = 'none';
			if (!selectedUserId && fromStatus) {
				fromStatus.textContent = 'No user selected';
				fromStatus.style.color = '#999';
				fromStatus.style.fontWeight = 'normal';
			}
			if (!selectedUserId2 && toStatus) {
				toStatus.textContent = 'No user selected';
				toStatus.style.color = '#999';
				toStatus.style.fontWeight = 'normal';
			}
		}
	}

	function selectUser(user, sectionPrefix) {		
		try {	
			document.querySelectorAll('.user' + sectionPrefix).forEach(el => {
				el.classList.remove('selected');
				el.style.backgroundColor = 'white';
				el.style.fontWeight = 'normal';
			});
			const userDiv = document.getElementById('userList' + sectionPrefix).querySelector(`[data-id='${user.systemuserid}']`);
			userDiv.classList.add('selected');
			userDiv.style.backgroundColor = '#e3f2fd';
			userDiv.style.fontWeight = '600';
			userDiv.style.color = '#1976d2';

			if (sectionPrefix === '1') {
				selectedUserId = user.systemuserid;
				selectedUserName = user.fullname;
			}
			if (sectionPrefix === '2') {
				selectedUserId2 = user.systemuserid;
				selectedUserName2 = user.fullname;
			}
			updateSubmitButtonVisibility();

			const businessUnitAndTeamsList = document.getElementById('section' + (3 + (sectionPrefix - 1) * 2)).querySelector('ul');
			businessUnitAndTeamsList.innerHTML = '<li style="color: #999; font-style: italic;">Loading...</li>';
			let businessUnitListItem = null;
			let teamListItems = [];
			const appendLists = () => {
			 	businessUnitAndTeamsList.innerHTML = '';
			 	if (businessUnitListItem) {
				    businessUnitAndTeamsList.appendChild(businessUnitListItem);
				    businessUnitAndTeamsList.appendChild(document.createElement('br'));
				}
				if (teamListItems.length === 0) {
					const noTeamsItem = document.createElement('li');
					noTeamsItem.innerHTML = '<em style="color: #999;">No teams assigned</em>';
					businessUnitAndTeamsList.appendChild(noTeamsItem);
				} else {
					teamListItems.forEach(item => businessUnitAndTeamsList.appendChild(item));
				}
			};

			fetchBusinessUnitName(user.systemuserid, function(response) {
				if (!response || !response.entities[0] || !response.entities[0].businessunitid || !response.entities[0].businessunitid.name) {
					console.error('Business unit not found');
					return;
				}

				const businessUnitName = response.entities[0].businessunitid.name;
				if (sectionPrefix === '1') {
					selectedBusinessUnitId = user._businessunitid_value;
				}

				businessUnitListItem = document.createElement('li');
				businessUnitListItem.innerHTML = '<strong style="color: #555;">Business Unit:</strong> <span style="color: #1976d2;">' + businessUnitName + '</span>';
				businessUnitListItem.style.marginBottom = '8px';
				appendLists();			
			});

			fetchTeamsForUser(user.systemuserid, function(response) {
				if (!response || !response.entities || !response.entities[0].teammembership_association) {
					console.error('Teams not found');
					appendLists();
					return;
				}
				if (sectionPrefix === '1') {
					selectedTeamIds = [];
				}
				teamListItems = response.entities[0].teammembership_association.map(team => {
				   if (sectionPrefix === '1') {
					selectedTeamIds.push(team.teamid);
				   }
				   const listItem = document.createElement('li');
				   const teamTypeText = team['teamtype@OData.Community.Display.V1.FormattedValue']; 
				   const isAssignable = teamTypeText === 'Owner' || teamTypeText === 'Access';
				   const iconColor = isAssignable ? '#10b981' : '#999';
				   const icon = isAssignable ? '✓' : '○';
				   listItem.innerHTML = '<span style="color: ' + iconColor + '; font-weight: bold; margin-right: 5px;">' + icon + '</span><strong style="color: #555;">Team:</strong> ' + team.name + ' <span style="color: #666; font-size: 12px;">(Type: ' + teamTypeText + ')</span>';
				   listItem.style.marginBottom = '4px';
				   return listItem; 
				});
				teamListItems.sort((a, b) => {
				   const nameA = a.innerHTML.replace('Team: ', '');
				   const nameB = b.innerHTML.replace('Team: ', '');
				   return nameA.localeCompare(nameB);
				});
				appendLists();
			});

			const rolesList = document.getElementById('section' + (4 + (sectionPrefix - 1) * 2)).querySelector('ul');
			rolesList.innerHTML = '<li style="color: #999; font-style: italic;">Loading...</li>';
			
			fetchRolesForUser(user.systemuserid, function(roles) {
				if (!roles || !roles.entities) {
					console.error('Roles not found');
					return;
				}
				if (sectionPrefix === '1') {
					selectedRoleIds = [];
				}
				rolesList.innerHTML = '';

				const roleDetailsArr = [];
				const rolePromises = roles.entities.map(role => {
				  const roleId = role['roleid'];	
				  if (sectionPrefix === '1') {
				     selectedRoleIds.push(roleId);
				  }
	                          return Xrm.WebApi.retrieveRecord("role", roleId, "?$select=name,roleid").then(function(roleDetail) {
				     roleDetailsArr.push(roleDetail);
				  });
				});
				Promise.all(rolePromises).then(() => {
				  roleDetailsArr.sort((a, b) => {
				     if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				      });
				      if (roleDetailsArr.length === 0) {
				      	const noRolesItem = document.createElement('li');
				      	noRolesItem.innerHTML = '<em style="color: #999;">No roles assigned</em>';
				      	rolesList.appendChild(noRolesItem);
				      } else {
					      roleDetailsArr.forEach(roleDetail => {
							const listItem = document.createElement('li');
							listItem.innerHTML = '<span style="color: #10b981; font-weight: bold; margin-right: 5px;">✓</span>' + roleDetail.name;
							listItem.style.marginBottom = '4px';
							rolesList.appendChild(listItem);
					      });
					  }
				});
			});
		} catch (e) {
			console.error('Error in selectUser function', e);
		}
	}

	function displayPopup(users) {
	    sortByProperty(users.entities, 'fullname');
	    const newContainer = createAppendSecurityPopup();
	    renderUserList(users.entities, user => selectUser(user, '1'), 'userList1', 'searchInput1');
	    renderUserList(users.entities, user => selectUser(user, '2'), 'userList2', 'searchInput2');
	    setupSearchFilter('searchInput1', 'user1');
	    setupSearchFilter('searchInput2', 'user2');	

	    const submitButton = document.getElementById("submitButton");
	    if (submitButton) {	        
	        submitButton.addEventListener("click", async function() {
	            var userId = Xrm.Utility.getGlobalContext().userSettings.userId;        
	            userId = userId.replace(/[{}]/g, "");

	            if (selectedUserId2.toLowerCase() === userId.toLowerCase()) {
	                showCustomAlert("You are not allowed to change your own security settings.");                
	                return;
	            }
	            
	            // Disable button during processing
	            submitButton.disabled = true;
	            submitButton.style.opacity = '0.6';
	            submitButton.style.cursor = 'not-allowed';
	            submitButton.textContent = 'Processing...';
	            
	            showLoadingDialog("Copying security settings, please wait...");
	            const actionType = "Change BUTR"; // BUTR = Business Unit, Teams, Roles
	            let updateWasSuccessful = true;
	            
	            if (typeof updateUserDetails === "function") {
	                try {
	                    await updateUserDetails(selectedUserId2, selectedBusinessUnitId, selectedTeamIds, selectedRoleIds, actionType);
	                } catch (error) {
	                    console.error("An error occurred during the update process:", error);
	                    showCustomAlert(`An error occurred: ${error.message}`);
	                    updateWasSuccessful = false;
	                } finally {
	                    closeLoadingDialog();
	                    // Re-enable button
	                    submitButton.disabled = false;
	                    submitButton.style.opacity = '1';
	                    submitButton.style.cursor = 'pointer';
	                    submitButton.textContent = 'Copy Security';
	                }
	                
	                if (updateWasSuccessful) {
	                    showCustomAlert(`Security successfully copied to ${selectedUserName2}!`);
	                    
	                    // Refresh the TO user's data to show updated security
	                    setTimeout(() => {
	                        const toUserDiv = document.getElementById('userList2').querySelector(`[data-id='${selectedUserId2}']`);
	                        if (toUserDiv) {
	                            const toUserData = users.entities.find(u => u.systemuserid === selectedUserId2);
	                            if (toUserData) {
	                                selectUser(toUserData, '2');
	                            }
	                        }
	                    }, 1000);
	                }
	            } else {
	                updateWasSuccessful = false;
	                closeLoadingDialog();
	                submitButton.disabled = false;
	                submitButton.style.opacity = '1';
	                submitButton.style.cursor = 'pointer';
	                submitButton.textContent = 'Copy Security';
	                showCustomAlert("Failed to update security settings. Please check the logs for more details.");
	            }
	        });
	    }
	    updateSubmitButtonVisibility();
	}
	fetchUsers(function(users) {
		displayPopup(users);
	});
}

