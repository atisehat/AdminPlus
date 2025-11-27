/**
 * Assign Security Tool
 * Allows System Administrators to manage user security including:
 * - Changing user's business unit
 * - Adding/removing teams
 * - Adding/removing security roles
 * 
 * Features:
 * - Full error handling and validation
 * - State persistence during filtering/searching
 * - Real-time checkbox state management
 * - Loading indicators and user feedback
 * 
 * @requires System Administrator role
 * @requires Xrm.WebApi, fetchUsers, fetchBusinessUnits, fetchTeamsForUser, fetchRolesForUser, fetchSecurityRoles
 * @requires updateUserDetails function from securityOperations.js
 */
function editSecurity() {
	// Check if user Sys Admin
	if (!checkSystemAdministratorRole()) {
		Xrm.Navigation.openAlertDialog({ text: "You do not have permission to execute this action. System Administrator role required." });
		return;
	}
	
	let businessUnits = null;
	let selectedUserId = null;
	let selectedUserFullName = null;	
	let selectedBusinessUnitId = null;
	let teamsRadioSelected = null;
	let rolesRadioSelected = null;
	let businessUnitRadioSelected = null;
	let selectedTeamIds = [];
	let selectedRoleIds = [];
	let teamsCheckedValues = [];
	let rolesCheckedValues = [];	
	let stateArray = { 'team': [], 'role': [] }; 
	
	function createAppendSecurityPopup() {		
	  var newContainer = document.createElement('div');		
	  newContainer.className = 'commonPopup';
	  newContainer.style.border = '3px solid #1a1a1a';
	  newContainer.style.borderRadius = '12px';
	  newContainer.style.width = '75%';
	  newContainer.style.minWidth = '900px';
	  newContainer.style.maxHeight = '90vh';
	  
	  newContainer.innerHTML =  `
	    <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
	      <span style="color: white;">Assign User Security</span>
	      <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
	    </div>
	    <div class="popup-body" style="padding: 0; overflow: hidden;">
	      <div class="commonSection content-section" style="padding: 0; border-right: 0; height: 100%;">
	        <div class="scroll-section" style="padding: 20px; overflow: visible; max-height: none;">
	          <div class="assignSecurityPopup-row">
	            <div class="assignSection leftUser-section" id="section1">
	              <div class="section-header-with-search">
	                <h3>Current User Security:</h3>
	                <input type="text" id="searchInput1" placeholder="Search Users">
	              </div>
	              <div class="leftUser-list-container">
	                <div id="userList1"></div>
	              </div>
	            </div> 
	            <div class="assignSection rightBuss-section" id="section2">
	              <div class="section-header-with-search">
	                <h3 id="bUh3" style="display: none;" >Change Business Unit:</h3>
	                <input type="text" id="searchInput2" placeholder="Search Business Units" style="display: none;">
	              </div>
	              <div class="businessUnit-list-container">
	                <div id="businessUnitList"></div>
	              </div>
	            </div>
	          </div>
	          <div id="sectionsRow1" class="assignSecurityPopup-row">
	            <div class="assignSection leftDetails-section-row" id="section3">
	              <h3>Current Business Unit & Teams:</h3>
	              <div class="leftRoles-and-teams-list-row">
	                <ul></ul>
	              </div>
	            </div>
	            <div class="assignSection rightTeam-section" id="section5">	        
	              <div class="teams-wrapper">
	                <div id="teamsH3" style="display: flex; align-items: center; justify-content: center; width: 100%; text-align: center; padding: 10px 20px; color: #444; font-size: 18px; margin-top: -100px;">
	                  <span style="margin-right: 15px; line-height: 1; display: flex; align-items: center;">
	                    <svg width="60" height="30" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
	                      <path d="M0 15L15 5L15 25L0 15Z" fill="#444"/>
	                      <rect x="15" y="10" width="45" height="10" fill="#444"/>
	                    </svg>
	                  </span>
	                  <span style="line-height: 1.5; font-weight: bold;">To modify user security, please choose a user from the list of users.</span>
	                </div>
	                <div class="teamsRoles-list-container">	          
	                  <div id="teamsList"></div>		   
	                </div>	  
	              </div>
	            </div>
	          </div>
	          <div id="sectionsRow2" class="assignSecurityPopup-row">
	            <div class="assignSection leftDetails-section-row" id="section4">
	              <h3>Current Security Roles:</h3>
	              <div class="leftRoles-and-teams-list-row">
	                <ul></ul>
	              </div>		
	            </div>
	            <div class="assignSection rightTeam-section" id="section6">	        
	              <div class="teams-wrapper">	        
	                <div class="teamsRoles-list-container">
	                  <div id="securityRolesList"></div>	          		 
	                </div>
	              </div>
	            </div>
	          </div>
	          <div class="assignSecurityPopup-row" style="margin-top: -25px;">
	            <div class="assignSection" style="width: 38%;"></div>
	            <div class="assignSection" style="width: 62%; display: flex; flex-direction: column; align-items: center; gap: 10px; padding-top: 0;">
	              <p style="margin: 0; font-size: 13px; color: #666;"><strong>**Note: </strong> Only 'Owner' or 'Access' type teams are assignable.</p>
	              <button id="assignSubmitButton" style="display: none;">Submit</button>
	            </div>
	          </div>
	        </div>
	      </div>
	    </div>
	  `;
	  
	  // Close existing popups
	  const existingPopups = document.querySelectorAll('.commonPopup');
	  existingPopups.forEach(popup => popup.remove());
	  
	  newContainer.setAttribute('data-popup-id', 'assignSecurity');
	  document.body.appendChild(newContainer);
	  
	  // Close button functionality
	  const closeButton = newContainer.querySelector('.close-button');
	  closeButton.addEventListener('click', () => {
	    newContainer.remove();
	  });
	  
	  // Hover for close button
	  closeButton.addEventListener('mouseenter', function() {
	    this.style.backgroundColor = '#e81123';
	  });
	  closeButton.addEventListener('mouseleave', function() {
	    this.style.backgroundColor = 'transparent';
	  });
	  
	  makePopupMovable(newContainer);	
	}
 
	function toggleChangeBuInputAndHeading() {
	  const bUh3 = document.getElementById('bUh3');
	  const searchInput2 = document.getElementById('searchInput2');
	  const teamsH3 = document.getElementById('teamsH3');
	  
	  // Show business unit heading and search
	  if (bUh3 && bUh3.style.display === 'none') {
	    bUh3.style.display = 'block';
	  }
	  if (searchInput2 && searchInput2.style.display === 'none') {
	    searchInput2.style.display = 'inline-block';
	  }
	  
	  // Always hide the arrow message when a user is selected
	  if (teamsH3) {
	    teamsH3.style.display = 'none';
	  }
	}
	
	function toggleCheckboxes(action, classNames) {	  
	  const classes = Array.isArray(classNames) ? classNames : [classNames];
	  classes.forEach(className => {
	    const checkboxes = document.querySelectorAll(`.${className}`);	    
	    checkboxes.forEach(checkbox => {
	      if (action === 'disable') {
	        checkbox.checked = false;
	      }
	      checkbox.disabled = (action === 'disable');
	    });
	  });
	}	
	
	function renderGenericList(entities, selectCallback, sectionId, searchInputId, classNamePrefix, textProperty, idProperty, skipSectionWrapper = false) {
	    const listDiv = document.getElementById(sectionId);
	    if (!listDiv) {
	        console.error('List container not found:', sectionId);
	        return;
	    }
	    
	    listDiv.innerHTML = '';
	    
	    if (!entities || !Array.isArray(entities)) {
	        console.error('Invalid entities array provided to renderGenericList');
	        return;
	    }
	    
	    if (classNamePrefix === 'businessUnit') {
	        addNoChangeRadioButton(listDiv, sectionId);
	    }

	    entities.forEach(entity => {
	        if (!entity) return;
	        const entityDiv = document.createElement('div');
	        entityDiv.className = `${classNamePrefix}${sectionId.charAt(sectionId.length - 1)}`;	
	        const wrapperDiv = document.createElement('div');
	        if (!skipSectionWrapper) {
	            wrapperDiv.className = 'sectionWrapper';
	        }
	
	        if (classNamePrefix === 'businessUnit') {
	            const inputElement = document.createElement('input');
	            inputElement.type = 'radio';
	            inputElement.name = 'businessUnit';
	            inputElement.className = 'businessUnitRadioButtons';
	            inputElement.value = entity['businessunitid']; 
	            wrapperDiv.appendChild(inputElement);
		    
		    inputElement.addEventListener('change', function() {
	               toggleCheckboxes('disable', ['assignCheckbox', 'teamsCheckbox', 'teamsRadioButtons', 'rolesCheckbox', 'rolesRadioButtons']);
                       businessUnitRadioSelected = this.value; 
                    });			
	        }
	
	        const textDiv = document.createElement('div');
	        textDiv.dataset.id = entity[idProperty];
	        textDiv.dataset.searchText = entity[textProperty];
	        textDiv.onclick = () => selectCallback(entity);
	        textDiv.textContent = entity[textProperty] || 'N/A';
	
	        wrapperDiv.appendChild(textDiv);
	        entityDiv.appendChild(wrapperDiv);	
	        listDiv.appendChild(entityDiv);
	    });
	}
	
	function addNoChangeRadioButton(listDiv, sectionId) {
	    const noChangeDiv = document.createElement('div');
	    noChangeDiv.className = 'businessUnit' + sectionId.charAt(sectionId.length - 1);
	
	    const wrapperDiv = document.createElement('div');
	    wrapperDiv.className = 'sectionWrapper';
	
	    const noChangeRadio = document.createElement('input');
	    noChangeRadio.type = 'radio';
	    noChangeRadio.name = 'businessUnit';
	    noChangeRadio.value = 'noChange';
	    noChangeRadio.className = 'businessUnitRadioButtons';
	    wrapperDiv.appendChild(noChangeRadio);
	
	    const textDiv = document.createElement('div');
	    textDiv.textContent = 'No Change';
	    wrapperDiv.appendChild(textDiv);	
	    noChangeDiv.appendChild(wrapperDiv);
	    listDiv.appendChild(noChangeDiv);
	    
	    noChangeRadio.addEventListener('change', function() {
	      toggleCheckboxes('enable', ['assignCheckbox', 'teamsRadioButtons', 'rolesRadioButtons']);
              businessUnitRadioSelected = this.value; 
           });
	}
	
	function addSearchFunctionality(array, inputElementId, displayFunction, targetElement) {
	    const searchInput = document.getElementById(inputElementId);
	
	    searchInput.addEventListener('input', function() {
	        const query = this.value.toLowerCase();
	        const filteredArray = array.filter(item => {
	            let name = item.hasOwnProperty('name') ? item.name : '';
	            let businessUnitName = item.hasOwnProperty('businessUnitName') ? `(${item.businessUnitName})` : '';
	            const itemInfo = `${name} ${businessUnitName}`.toLowerCase().trim();
	            return itemInfo.includes(query);
	        });	
	        displayFunction(filteredArray, targetElement);
	    });
	}
	
	function createAndAppendItems(itemArray, targetElement, valueType, valueKey, textKeys, additionalClassNames, itemType) {	    
	    if (!targetElement) {
	        console.error('Target element not found in createAndAppendItems');
	        return;
	    }
	    
	    targetElement.innerHTML = '';	    
	    
	    // Initialize stateArray for this itemType if it doesn't exist
	    if (!stateArray[itemType]) {
	        stateArray[itemType] = [];
	    }
	    
	    const relevantStateArray = stateArray[itemType];    
	    
	    itemArray.forEach(item => {
	        const wrapperDiv = document.createElement('div');
	        wrapperDiv.className = 'sectionWrapper';

	        if (itemType === 'team') {
	            wrapperDiv.classList.add('teamClass'); 
	        } else if (itemType === 'role') {
	            wrapperDiv.classList.add('roleClass'); 
	        }

	        const assignCheckbox = document.createElement('input');
	        assignCheckbox.type = valueType;
	        assignCheckbox.value = item[valueKey];
	        assignCheckbox.className = additionalClassNames;
	        
	        // Add data attribute for item name for easier debugging
	        assignCheckbox.setAttribute('data-item-name', textKeys.map(key => item[key]).join(' '));

	        // Preserve checked state from stateArray
	        if (relevantStateArray.includes(assignCheckbox.value)) {
	            assignCheckbox.checked = true;
	        }

	        assignCheckbox.addEventListener('change', function() {
	            const value = this.value;
	            const isChecked = this.checked;
	            
	            // Update stateArray
	            if (isChecked) {
	                if (!relevantStateArray.includes(value)) {
	                    relevantStateArray.push(value);
	                }
	            } else {
	                const index = relevantStateArray.indexOf(value);
	                if (index > -1) {
	                    relevantStateArray.splice(index, 1);
	                }
	            }	            
	            
	            // Update the checked values array (for submit)
	            const arrayToUse = (itemType === 'team') ? teamsCheckedValues : rolesCheckedValues;
	            if (isChecked) {
	                if (!arrayToUse.includes(value)) {
	                    arrayToUse.push(value);
	                }
	            } else {
	                const arrayIndex = arrayToUse.indexOf(value);
	                if (arrayIndex > -1) {
	                    arrayToUse.splice(arrayIndex, 1);
	                }
	            }
	        });       

		const label = document.createElement('label');
		label.appendChild(assignCheckbox);
		label.appendChild(document.createTextNode(textKeys.map(key => item[key]).join(' ')));
		label.style.cursor = 'pointer';
		    
	        wrapperDiv.appendChild(label);	
	        targetElement.appendChild(wrapperDiv);
	    });	    
	    
	    // Manage checkbox states
	    toggleCheckboxes('disable', ['assignCheckbox', 'teamsCheckbox', 'teamsRadioButtons', 'rolesCheckbox', 'rolesRadioButtons']);
	    toggleCheckboxes('enable', ['assignCheckbox', 'teamsRadioButtons','rolesRadioButtons']);
	}
	
	function selectUser(user, sectionPrefix) {
		try {
			const messageDiv = document.getElementById('updateMessage');
			if (messageDiv) {
				messageDiv.style.display = 'none';
			}		
			
			document.querySelectorAll('.userSelected').forEach(el => el.classList.remove('userSelected'));		
		        const userDiv = document.getElementById('userList' + sectionPrefix).querySelector(`[data-id='${user.systemuserid}']`);
		        if (userDiv) {
		            userDiv.classList.add('userSelected');
		        }		
		        
		        if (sectionPrefix === '1') {
		            selectedUserId = user.systemuserid;
		            selectedBusinessUnitId = user._businessunitid_value;
			    selectedUserFullName = user.fullname;
				
   			    //clear 
			    stateArray['team'] = [];
			    stateArray['role'] = [];
		        }
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
				try {
					if (!response || !response.entities || !response.entities[0] || !response.entities[0].businessunitid || !response.entities[0].businessunitid.name) {
						console.error('Business unit not found for user:', user.systemuserid);
						businessUnitListItem = document.createElement('li');
						businessUnitListItem.innerHTML = '<strong>Business Unit:</strong> (Not Available)';
						appendLists();
						return;
					}
					const businessUnitName = response.entities[0].businessunitid.name;
					if (sectionPrefix === '1') {
						selectedBusinessUnitId = user._businessunitid_value;
					}
					businessUnitListItem = document.createElement('li');
					businessUnitListItem.innerHTML = '<strong>Business Unit:</strong> ' + businessUnitName;
					appendLists();
				} catch (error) {
					console.error('Error fetching business unit:', error);
					businessUnitListItem = document.createElement('li');
					businessUnitListItem.innerHTML = '<strong>Business Unit:</strong> (Error)';
					appendLists();
				}
			});
			fetchTeamsForUser(user.systemuserid, function(response) {
				try {
					if (!response || !response.entities || !response.entities[0]) {
						console.error('Teams not found for user:', user.systemuserid);
						teamListItems = [];
						appendLists();
						return;
					}
					
					const teams = response.entities[0].teammembership_association || [];
					
					if (sectionPrefix === '1') {
						selectedTeamIds = [];
					}
					teamListItems = teams.map(team => {
					   if (sectionPrefix === '1') {
						selectedTeamIds.push(team.teamid);
					   }				
					   const listItem = document.createElement('li');
					   const teamTypeText = team['teamtype@OData.Community.Display.V1.FormattedValue'] || 'Unknown'; 
					   listItem.innerHTML = '<strong>Team:</strong> ' + team.name + ' (Type: ' + teamTypeText + ')';
					   return listItem;
					});
					teamListItems.sort((a, b) => {
					   const nameA = a.innerHTML.replace('Team: ', '');
					   const nameB = b.innerHTML.replace('Team: ', '');
					   return nameA.localeCompare(nameB);
					});
					appendLists();
				} catch (error) {
					console.error('Error fetching teams:', error);
					teamListItems = [];
					appendLists();
				}
			});						
		        const teamsList = document.getElementById('teamsList');
		        teamsList.innerHTML = '';
		
		       // Fetch teams
			fetchTeams(function(teams) {
			    try {
				    if (!teams || !teams.entities) {
				        console.error('Teams not found');
				        showToast('Unable to load teams. Please try again.', 'error', 3000);
				        return;
				    }			
				    const teamsList = document.getElementById('teamsList');
				    if (!teamsList) {
				        console.error('Teams list container not found');
				        return;
				    }
				    teamsList.innerHTML = '';			
				    const teamDetailsArr = teams.entities.map(team => ({
					    name: team.name || 'Unnamed Team', 
					    teamid: team.teamid, 
					    businessUnitName: team.businessunitid ? `(BU: ${team.businessunitid.name})` : '(BU: N/A)'
				    }));						
			            teamDetailsArr.sort((a, b) => {
				            return a.name.localeCompare(b.name);
				    });						    	
				    addSearchFunctionality(teamDetailsArr, 'searchInput3', (filteredItems) => {
				    	const teamsList = document.getElementById('teamsList');
				    	if (teamsList) {
					   	 createAndAppendItems(filteredItems, teamsList, 'checkbox', 'teamid', ['name', 'businessUnitName'], 'teamsCheckbox', 'team');
					}
					});				
					createAndAppendItems(teamDetailsArr, teamsList, 'checkbox', 'teamid', ['name', 'businessUnitName'], 'teamsCheckbox', 'team');
			    } catch (error) {
			        console.error('Error processing teams:', error);
			        showToast('Error loading teams. Please try again.', 'error', 3000);
			    }
			   });
			
			if (sectionPrefix === '1') { 
			    // Fetch user roles
			    const rolesListUser = document.getElementById('section4');
			    if (!rolesListUser) {
			        console.error('Roles section not found');
			        return;
			    }
			    const rolesUl = rolesListUser.querySelector('ul');
			    if (rolesUl) {
			        rolesUl.innerHTML = '';
			    }
			
			    fetchRolesForUser(user.systemuserid, function(roles) {
			        try {
				        if (!roles || !roles.entities) {
				            console.error('Roles not found for user:', user.systemuserid);
				            showToast('Unable to load user roles. Please try again.', 'error', 3000);
				            return;
				        }
				        if (sectionPrefix === '1') {
				            selectedRoleIds = [];
				        }
				        const rolesList = document.getElementById('section' + (4 + (sectionPrefix - 1) * 2));
				        if (!rolesList) {
				            console.error('Roles list section not found');
				            return;
				        }
				        const rolesUl = rolesList.querySelector('ul');
				        if (rolesUl) {
				            rolesUl.innerHTML = '';
				        }
				        const roleDetailsArr = [];
				        const rolePromises = roles.entities.map(role => {
				            const roleId = role['roleid'];
				            if (sectionPrefix === '1') {
				                selectedRoleIds.push(roleId);
				            }
				            return Xrm.WebApi.retrieveRecord("role", roleId, "?$select=name,roleid").then(function(roleDetail) {
				                roleDetailsArr.push(roleDetail);
				            }).catch(function(error) {
				                console.error('Error fetching role details for roleId:', roleId, error);
				            });
				        });								
					    
				        Promise.all(rolePromises).then(() => {			            
				            roleDetailsArr.sort((a, b) => {
				                return a.name.localeCompare(b.name);
				            });
				            
				            // Display roles in left section
				            if (rolesUl) {
					            roleDetailsArr.forEach(roleDetail => {
					                const listItem = document.createElement('li');
					                listItem.textContent = roleDetail.name || 'Unnamed Role';
					                rolesUl.appendChild(listItem);
					            });
					        }
					        
					        // Populate checkboxes in right section
					        const rolesListUserCheckbox = document.getElementById('section4').querySelector('ul');
					        if (rolesListUserCheckbox) {
						        createAndAppendItems(roleDetailsArr, rolesListUserCheckbox, 'checkbox', 'roleid', ['name'], 'rolesCheckbox', 'role');
						    }
				        }).catch(function(error) {
				            console.error('Error processing roles:', error);
				            showToast('Error loading roles. Please try again.', 'error', 3000);
				        });
				    } catch (error) {
				        console.error('Error in fetchRolesForUser callback:', error);
				        showToast('Error loading roles. Please try again.', 'error', 3000);
				    }
			    });     	 		    			
			     
			    // Fetch roles based on BU
			    const rolesSection = document.getElementById('section6');
			    if (!rolesSection) {
			        console.error('Security roles section not found');
			        return;
			    }
			    const rolesListBusinessUnit = rolesSection.querySelector('#securityRolesList');
			    if (!rolesListBusinessUnit) {
			        console.error('Security roles list not found');
			        return;
			    }
				rolesListBusinessUnit.innerHTML = '';
				
				if (!selectedBusinessUnitId) {
				    console.error('No business unit selected');
				    showToast('Unable to load roles - no business unit selected', 'error', 3000);
				    return;
				}
				
				fetchSecurityRoles(selectedBusinessUnitId, function(response) {
				    try {
					    if (!response || !response.entities) {
					        console.error('Roles not found for business unit:', selectedBusinessUnitId);
					        showToast('Unable to load security roles. Please try again.', 'error', 3000);
					        return;
					    }		        
					    const roleDetailsArr = response.entities.map(role => ({
					        name: role.name || 'Unnamed Role', 
					        roleid: role.roleid
					    }));				    				    
					    roleDetailsArr.sort((a, b) => {
					        return a.name.localeCompare(b.name);
					    });				
					       addSearchFunctionality(roleDetailsArr, 'searchInput4', (filteredItems) => {
					           const rolesListBusinessUnit = document.getElementById('section6').querySelector('#securityRolesList');
					           if (rolesListBusinessUnit) {
						       createAndAppendItems(filteredItems, rolesListBusinessUnit, 'checkbox', 'roleid', ['name'], 'rolesCheckbox', 'role');
						   }
					       });
					       createAndAppendItems(roleDetailsArr, rolesListBusinessUnit, 'checkbox', 'roleid', ['name'], 'rolesCheckbox', 'role');
					} catch (error) {
					    console.error('Error processing security roles:', error);
					    showToast('Error loading security roles. Please try again.', 'error', 3000);
					}
				});				
				
				toggleChangeBuInputAndHeading();      			
				if (businessUnits && businessUnits.entities && businessUnits.entities.length > 0) {
				    // Business units don't need a select callback - they use radio buttons
				    renderGenericList(businessUnits.entities, () => {}, 'businessUnitList', 'searchInput2', 'businessUnit', 'name', 'businessunitid');
				    setupSearchFilter('searchInput2', `businessUnit${'businessUnitList'.charAt('businessUnitList'.length - 1)}`);
				} else {
				    console.warn('No business units available for selection');
				    const businessUnitList = document.getElementById('businessUnitList');
				    if (businessUnitList) {
				        businessUnitList.innerHTML = '<div style="padding: 10px; color: #666;">No business units available</div>';
				    }
				}				
				
				addRadioButtonsToSection({
				    sectionId: 'section5',
				    headingText: 'Change Team(s):',
				    radioName: 'teamAction',
				    radioData: [
				        { id: 'noTeamUpdate', label: 'No Change', value: 'noTeamUpdates' },
				        { id: 'addTeam', label: 'Add', value: 'addTeam' },
				        { id: 'removeTeam', label: 'Remove', value: 'removeTeam' },
				        { id: 'addAndRemoveTeam', label: 'Add + Remove Existing', value: 'addAndRemoveTeam' }
				    ],				    
				    inputIds: 'Search Teams',
				    inputId: 'searchInput3',
				    radioButtonClassName: 'teamsRadioButtons'
				});				
				
				addRadioButtonsToSection({
				    sectionId: 'section6',
				    headingText: 'Change Security Role(s):',
				    radioName: 'roleAction',
				    radioData: [
				        { id: 'noRoleUpdate', label: 'No Change', value: 'noRoleUpdates' },
				        { id: 'addRole', label: 'Add', value: 'addRole' },
				        { id: 'removeRole', label: 'Remove', value: 'removeRole' },
				        { id: 'addAndRemoveRole', label: 'Add + Remove Existing', value: 'addAndRemoveRole' }
				    ],				    
				    inputIds: 'Search Security Role',
				    inputId: 'searchInput4',
				    radioButtonClassName: 'rolesRadioButtons'
				});				
				initSubmitButton();				
			}			
		} catch (e) {
			console.error('Error in selectUser function', e);
		}		
	}		
	function createElementWithAttributes(tag, attributes = {}) {
	    const element = document.createElement(tag);
	    Object.entries(attributes).forEach(([key, value]) => {
		element[key] = value;
	    });
	    return element;
	}	
	
	function toggleElementDisplay(element, state = 'none') {
	    if (element) element.style.display = state;
	}
	
	async function handleSubmitButtonClick(event) {
	    // Validate user is selected
	    if (!selectedUserId) {
	        showToast('Please select a user first.', 'warning', 3000);
	        return;
	    }
	    
	    // Check if updateUserDetails function exists
	    if (typeof updateUserDetails !== "function") {
	        console.error('updateUserDetails function not found');
	        showToast('Security update function not available. Please refresh and try again.', 'error', 3000);
	        return;
	    }
	    
	    try {
	        // Disable all controls during update
	        toggleCheckboxes('disable', ['assignCheckbox', 'teamsCheckbox', 'teamsRadioButtons', 'rolesCheckbox', 'rolesRadioButtons', 'businessUnitRadioButtons']);
	        
	        // Perform the update
	        await handleConditions(businessUnitRadioSelected, teamsRadioSelected, teamsCheckedValues, rolesRadioSelected, rolesCheckedValues);
	        
	        // Re-enable controls after update
	        toggleCheckboxes('enable', ['teamsRadioButtons', 'rolesRadioButtons', 'businessUnitRadioButtons']);
	        
	        // Clear selections after successful update
	        teamsCheckedValues = [];
	        rolesCheckedValues = [];
	        teamsRadioSelected = null;
	        rolesRadioSelected = null;
	        businessUnitRadioSelected = null;
	        
	        // Reset radio buttons
	        const radioButtons = document.querySelectorAll('.teamsRadioButtons, .rolesRadioButtons, .businessUnitRadioButtons');
	        radioButtons.forEach(radio => {
	            radio.checked = false;
	        });
	        
	        // Clear checkboxes
	        const checkboxes = document.querySelectorAll('.teamsCheckbox, .rolesCheckbox');
	        checkboxes.forEach(checkbox => {
	            checkbox.checked = false;
	        });
	        
	        // Reset state arrays
	        stateArray['team'] = [];
	        stateArray['role'] = [];
	    } catch (error) {
	        console.error('Error during security update:', error);
	        showToast('An error occurred during the security update. Please try again.', 'error', 3000);
	        
	        // Re-enable controls on error
	        toggleCheckboxes('enable', ['teamsRadioButtons', 'rolesRadioButtons', 'businessUnitRadioButtons']);
	    }
	}	
	
	function initSubmitButton() {
	    const submitButton = document.getElementById('assignSubmitButton');
	    if (submitButton) {
	        toggleElementDisplay(submitButton, 'block');
	        submitButton.addEventListener('click', handleSubmitButtonClick);
	    }
	}
	
	async function handleConditions(businessUnitRadioSelected, teamsRadioSelected, teamsCheckedValues, rolesRadioSelected, rolesCheckedValues) {
	    // Validate that at least one change is selected
	    const hasBusinessUnitChange = businessUnitRadioSelected && businessUnitRadioSelected !== "noChange";
	    const hasTeamChange = teamsRadioSelected && teamsRadioSelected !== "noTeamUpdates" && teamsCheckedValues.length > 0;
	    const hasRoleChange = rolesRadioSelected && rolesRadioSelected !== "noRoleUpdates" && rolesCheckedValues.length > 0;
	    
	    if (!hasBusinessUnitChange && !hasTeamChange && !hasRoleChange) {
		    showCustomAlert('To update user security, please select from one of the following categories: Business Unit, Team, or Security Role.');
		    return;
	    }
	    
	    // Additional validation
	    if (teamsRadioSelected && teamsRadioSelected !== "noTeamUpdates" && teamsCheckedValues.length === 0) {
	        showCustomAlert('Please select at least one team to modify.');
	        return;
	    }
	    
	    if (rolesRadioSelected && rolesRadioSelected !== "noRoleUpdates" && rolesCheckedValues.length === 0) {
	        showCustomAlert('Please select at least one role to modify.');
	        return;
	    }
	    
	    try {
		    showLoadingDialog("Your update is in progress, please be patient...");
		    
		    // Business Unit Change
		    if (hasBusinessUnitChange) {
		        await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "ChangeBU");		        
		    }
		    
		    // Team Changes
		    if (hasTeamChange) {
		        if (teamsRadioSelected === "addTeam") {
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "AddTeams");
			} else if (teamsRadioSelected === "removeTeam") {
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "RemoveTeams");
		        } else if (teamsRadioSelected === "addAndRemoveTeam") {
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "RemoveAllTeams");
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "AddTeams");
			}
		    }
		    
		    // Role Changes
		    if (hasRoleChange) {
		        if (rolesRadioSelected === "addRole") {
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "AddRoles");
			} else if (rolesRadioSelected === "removeRole") {
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "RemoveRoles");
		        } else if (rolesRadioSelected === "addAndRemoveRole") {
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "RemoveAllRoles");
			    await updateUserDetails(selectedUserId, businessUnitRadioSelected, teamsCheckedValues, rolesCheckedValues, "AddRoles");
			}
		    }
		    
		    // Clear the display sections
		    const section3Ul = document.getElementById('section3')?.querySelector('ul');
		    const section4Ul = document.getElementById('section4')?.querySelector('ul');
		    if (section3Ul) section3Ul.innerHTML = '';
		    if (section4Ul) section4Ul.innerHTML = '';
		    
		    closeLoadingDialog();
		    showCustomAlert(`Security updated successfully for ${selectedUserFullName || 'user'}`);
		    
	    } catch (error) {
	        console.error('Error updating user security:', error);
	        closeLoadingDialog();
	        showCustomAlert(`Error updating security: ${error.message || 'Unknown error'}. Please try again.`);
	        throw error; // Re-throw to be caught by handleSubmitButtonClick
	    }
	}
	
	// Radio buttons
	function addRadioButtonsToSection(options) {	    
	    const { sectionId, headingText, radioName, radioData, inputIds, inputId, radioButtonClassName } = options;
	    const sectionElement = document.getElementById(sectionId); 

	    if (sectionElement.getAttribute('data-hasRadioButtons') === 'true') {
	        return;
	    }	
	    sectionElement.setAttribute('data-hasRadioButtons', 'true');	    
			    
	    const headerWrapper = document.createElement('div');
	    headerWrapper.className = 'section-header-with-search';
	    
	    if (headingText) {
	        const heading = document.createElement('h3');
	        heading.appendChild(document.createTextNode(headingText));
	        headerWrapper.appendChild(heading);
	    }

	    if (inputIds) {
	        const searchInput = document.createElement('input');
	        searchInput.type = 'text';
	        searchInput.id = inputId;
	        searchInput.placeholder = inputIds;
	        headerWrapper.appendChild(searchInput);
	    }
	    
	    sectionElement.appendChild(headerWrapper);
		
	    // If no radioData
	    if (!radioData || !Array.isArray(radioData)) {
	        return;
	    }
		
	    let teamsWrapper = sectionElement.querySelector('.teams-wrapper');
	    if (!teamsWrapper) {
	        teamsWrapper = document.createElement('div');
	        teamsWrapper.className = 'teams-wrapper';
	        sectionElement.appendChild(teamsWrapper);
	    }
	
	    const container = document.createElement('div');
	    container.className = 'team-action-checkboxes';
	    container.innerHTML = '';
	
	    const actionMap = {
	      'noTeamUpdates': { action: 'disable', classes: ['teamsCheckbox'] },
	      'addTeam': { action: 'enable', classes: ['teamsCheckbox'] },
	      'removeTeam': { action: 'enable', classes: ['teamsCheckbox'] },
	      'addRole': { action: 'enable', classes: ['rolesCheckbox'] },
	      'removeRole': { action: 'enable', classes: ['rolesCheckbox'] },
	      'addAndRemoveTeam': { action: 'enable', classes: ['teamsCheckbox'] },
	      'noRoleUpdates': { action: 'disable', classes: ['rolesCheckbox'] },
	    };
	
	    radioData.forEach(({ id, label, value }) => {
	        const radioButton = document.createElement('input');
	        radioButton.type = 'radio';
	        radioButton.id = id;
	        radioButton.className = radioButtonClassName;
	        radioButton.name = radioName;
	        radioButton.value = value;
	
	        radioButton.addEventListener('change', function() {		
	            const selectedAction = actionMap[this.value] || { action: 'enable', classes: ['teamsCheckbox', 'rolesCheckbox'] };		    
	            toggleCheckboxes(selectedAction.action, selectedAction.classes);
	
	            if (radioName === 'teamAction') {
	                teamsRadioSelected = this.value;		            
	            } else if (radioName === 'roleAction') {
	                rolesRadioSelected = this.value;		            
	            }
	        });
	
	        const labelElement = document.createElement('label');
	        labelElement.htmlFor = id;
	        labelElement.appendChild(document.createTextNode(label));
	
	        const wrapperDiv = document.createElement('div');
	        wrapperDiv.className = 'sectionWrapper';
	        wrapperDiv.appendChild(radioButton);
	        wrapperDiv.appendChild(labelElement);
	
	        container.appendChild(wrapperDiv);
	    });
	
	    teamsWrapper.appendChild(container);
	    sectionElement.appendChild(teamsWrapper);	    
	}
	
	function displayPopup(users, businessUnits) {
	    if (users && users.entities) {
	        sortByProperty(users.entities, 'fullname');
	    }	
	    createAppendSecurityPopup();

	    if (businessUnits && businessUnits.entities) {
	        sortByProperty(businessUnits.entities, 'name');
	    }
	    if (users && users.entities) {		    
		renderGenericList(users.entities, user => selectUser(user, '1'), 'userList1', 'searchInput1', 'user', 'fullname', 'systemuserid', true);		
	    }			
	      setupSearchFilter('searchInput1', `user${'userList1'.charAt('userList1'.length - 1)}`);	     
	}	
	
	 Promise.all([
	    new Promise(resolve => fetchUsers(resolve)),
	    new Promise(resolve => fetchBusinessUnits(resolve)),	    
	 ]).then(([users, fetchedBusinessUnits]) => {
	    if (!users || !users.entities || users.entities.length === 0) {
	        showToast('No users found. Please check your permissions.', 'error', 3000);
	        return;
	    }
	    if (!fetchedBusinessUnits || !fetchedBusinessUnits.entities || fetchedBusinessUnits.entities.length === 0) {
	        showToast('No business units found. Proceeding with limited functionality.', 'warning', 3000);
	    }
	    displayPopup(users, fetchedBusinessUnits);
	    businessUnits = fetchedBusinessUnits;
	 }).catch(error => {
	    console.error('Error initializing Assign Security:', error);
	    showToast('Failed to load security data. Please check your permissions and try again.', 'error', 4000);
	 });
}
