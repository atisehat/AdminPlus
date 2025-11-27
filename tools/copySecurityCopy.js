function copySecurityCopy() {
	// Check if Sys Admin
	if (!checkSystemAdministratorRole()) {
		Xrm.Navigation.openAlertDialog({ text: "You do not have permission to execute this action. System Administrator role required." });
		return;
	}
	
	let selectedUserId2 = null; 
	let selectedUserName2 = '';
	let selectedUserId = null;
	let selectedBusinessUnitId = null; 
	let selectedTeamIds = []; 
	let selectedRoleIds = [];	
	
	function createAppendSecurityPopup() {		
		var newContainer = document.createElement('div');		
		newContainer.className = 'commonPopup';
		newContainer.style.border = '3px solid #1a1a1a';
		newContainer.style.borderRadius = '12px';
		newContainer.style.width = '75%';
		newContainer.style.maxHeight = '90vh';
		
		newContainer.innerHTML =  `
		  <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
		    <span style="color: white;">Copy Security from User to User</span>
		    <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
		  </div>
		  <div class="popup-body" style="padding: 20px; overflow: visible;">
		    <div class="securityPopup-row">
		      <div class="user-section" id="section1">
		        <h3>FROM</h3>
		        <input type="text" id="searchInput1" placeholder="Search Users">
		        <div class="user-list-container">
		          <div id="userList1"></div>
		        </div>
		      </div>
		      <div class="user-section" id="section2">
		        <h3>TO</h3>
		        <input type="text" id="searchInput2" placeholder="Search Users">
		        <div class="user-list-container">
		          <div id="userList2"></div>
		        </div>
		      </div>
		    </div>
		    <div class="securityPopup-row">
		      <div class="details-section-row" id="section3">
		        <h3>Business Unit & Teams</h3>
		        <div class="roles-and-teams-list-row">
		          <ul></ul>
		        </div>
		      </div>
		      <div class="details-section-row" id="section5">
		        <h3>Business Unit & Teams</h3>
		        <div class="roles-and-teams-list-row">
		          <ul></ul>
		        </div>
		      </div>
		    </div>
		    <div class="securityPopup-row">
		      <div class="details-section-row" id="section4">
		        <h3>Security Roles</h3>
		        <div class="roles-and-teams-list-row">
		          <ul></ul>
		        </div>
		      </div>
		      <div class="details-section-row" id="section6">
		        <h3>Security Roles</h3>
		        <div class="roles-and-teams-list-row">
		          <ul></ul>
		        </div>
		      </div>
		    </div>
		    <div class="securityPopup-row" style="margin-top: 5px;">
		      <div style="width: 50%;"></div>
		      <div style="width: 50%; display: flex; flex-direction: column; align-items: center; gap: 10px;">
		        <p style="margin: 0; font-size: 13px; color: #666;"><strong>**Note: </strong> Only 'Owner' or 'Access' type teams are assignable.</p>
		        <button id="submitButton">Submit</button>
		      </div>
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
			userListDiv.appendChild(userDiv);
		});
	}

	function updateSubmitButtonVisibility() {
		const submitButton = document.getElementById("submitButton");
		if (selectedUserId && selectedUserId2) {
			submitButton.style.display = 'block';
		} else {
			submitButton.style.display = 'none';
		}
	}

	function selectUser(user, sectionPrefix) {		
		try {	
			document.querySelectorAll('.user' + sectionPrefix).forEach(el => el.classList.remove('selected'));
			const userDiv = document.getElementById('userList' + sectionPrefix).querySelector(`[data-id='${user.systemuserid}']`);
			userDiv.classList.add('selected');

			if (sectionPrefix === '1') {
				selectedUserId = user.systemuserid;
			}
			if (sectionPrefix === '2') {
				selectedUserId2 = user.systemuserid;
			}
			if (sectionPrefix === '2') {
				selectedUserName2 = user.fullname;
			}
			updateSubmitButtonVisibility();

			const businessUnitAndTeamsList = document.getElementById('section' + (3 + (sectionPrefix - 1) * 2)).querySelector('ul');
			businessUnitAndTeamsList.innerHTML = '';
			let businessUnitListItem = null;
			let teamListItems = [];
			const appendLists = () => {
			 	if (businessUnitListItem) {
				    businessUnitAndTeamsList.appendChild(businessUnitListItem);
				    businessUnitAndTeamsList.appendChild(document.createElement('br'));
				}
				teamListItems.forEach(item => businessUnitAndTeamsList.appendChild(item));
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
				businessUnitListItem.innerHTML = '<strong>Business Unit:</strong> ' + businessUnitName;
				appendLists();			
			});

			fetchTeamsForUser(user.systemuserid, function(response) {
				if (!response || !response.entities || !response.entities[0].teammembership_association) {
					console.error('Teams not found');
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
				   listItem.innerHTML = '<strong>Team:</strong> ' + team.name + ' (Type: ' + teamTypeText + ')';
				   return listItem; 
				});
				teamListItems.sort((a, b) => {
				   const nameA = a.innerHTML.replace('Team: ', '');
				   const nameB = b.innerHTML.replace('Team: ', '');
				   return nameA.localeCompare(nameB);
				});
				appendLists();
			});

			fetchRolesForUser(user.systemuserid, function(roles) {
				if (!roles || !roles.entities) {
					console.error('Roles not found');
					return;
				}
				if (sectionPrefix === '1') {
					selectedRoleIds = [];
				}
				const rolesList = document.getElementById('section' + (4 + (sectionPrefix - 1) * 2)).querySelector('ul');
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
				      roleDetailsArr.forEach(roleDetail => {
					const listItem = document.createElement('li');
					listItem.textContent = roleDetail.name;
					rolesList.appendChild(listItem);
				      });
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
	            } else {
	                showLoadingDialog("Your update is in progress, please be patient...");
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
	                    }
	                    if (updateWasSuccessful) {
	                        showCustomAlert(`Security updated for ${selectedUserName2}`);
	                    }
	                } else {
	                    updateWasSuccessful = false;
	                }

	                if (!updateWasSuccessful) {	                    
	                    showCustomAlert("Failed to update security settings. Please check the logs for more details.");
	                }
	            }
	        });
	    } else {	        
	    }       
	    updateSubmitButtonVisibility();
	}
	fetchUsers(function(users) {
		displayPopup(users);
	});
}

