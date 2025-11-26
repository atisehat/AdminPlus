// Entity Automations Tool - Show workflows, business rules, flows, custom APIs, and actions for current entity
async function showEntityAutomations() {
    // Check if we're on a form page
    if (!requireFormContext()) {
        return;
    }
    
    try {
        const entityName = Xrm.Page.data.entity.getEntityName();
        const clientUrl = Xrm.Page.context.getClientUrl();
        
        // Show loading dialog
        if (typeof showLoadingDialog === 'function') {
            showLoadingDialog('Loading table automations...');
        }
        
        // Fetch all automation data in parallel
        const [workflows, dialogs, businessRules, businessProcessFlows, flows, customApis, customActions] = await Promise.all([
            fetchWorkflows(entityName, clientUrl),
            fetchDialogs(entityName, clientUrl),
            fetchBusinessRules(entityName, clientUrl),
            fetchBusinessProcessFlows(entityName, clientUrl),
            fetchFlows(entityName, clientUrl),
            fetchCustomApis(entityName, clientUrl),
            fetchCustomActions(entityName, clientUrl)
        ]);
        
        // Enrich all items with owner information if missing
        const allItems = [...workflows, ...dialogs, ...businessRules, ...businessProcessFlows, ...flows, ...customApis, ...customActions];
        await enrichWithOwnerNames(allItems, clientUrl);
        
        // Enrich all items with solution information
        await enrichWithSolutionInfo(allItems, clientUrl);
        
        // Hide loading dialog before showing popup
        if (typeof hideLoadingDialog === 'function') {
            hideLoadingDialog();
        }
        
        // Create and display popup after loading is complete
        createAutomationsPopup(entityName, workflows, dialogs, businessRules, businessProcessFlows, flows, customApis, customActions);
        
    } catch (error) {
        if (typeof hideLoadingDialog === 'function') {
            hideLoadingDialog();
        }
        if (typeof showToast === 'function') {
            showToast('Error loading table automations: ' + error.message, 'error');
        }
    }
}

// Fetch Workflows (Classic Workflows)
async function fetchWorkflows(entityName, clientUrl) {
    try {
        // Try with expand first
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,category,statecode,statuscode,primaryentity,type,workflowid,parentworkflowid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=primaryentity eq '${entityName}' and category eq 0&$orderby=name asc`
        );
        
        // If expand fails, try without it
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/workflows?$select=name,category,statecode,statuscode,primaryentity,type,workflowid,parentworkflowid,_ownerid_value&$filter=primaryentity eq '${entityName}' and category eq 0&$orderby=name asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        
        // Filter out child workflows to avoid duplicates
        // Only show Definition workflows (type 1) - excludes Activation (type 2) and Template (type 3)
        const filteredWorkflows = (data.value || []).filter(workflow => {
            return workflow.type === 1;
        });
        
        return filteredWorkflows;
    } catch (error) {
        return [];
    }
}

// Fetch Dialogs
async function fetchDialogs(entityName, clientUrl) {
    try {
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=primaryentity eq '${entityName}' and category eq 1&$orderby=name asc`
        );
        
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$filter=primaryentity eq '${entityName}' and category eq 1&$orderby=name asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Fetch Business Rules
async function fetchBusinessRules(entityName, clientUrl) {
    try {
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=primaryentity eq '${entityName}' and category eq 2&$orderby=name asc`
        );
        
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$filter=primaryentity eq '${entityName}' and category eq 2&$orderby=name asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Fetch Business Process Flows
async function fetchBusinessProcessFlows(entityName, clientUrl) {
    try {
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=primaryentity eq '${entityName}' and category eq 4&$orderby=name asc`
        );
        
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$filter=primaryentity eq '${entityName}' and category eq 4&$orderby=name asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Fetch Flows (Modern Cloud Flows / Power Automate)
async function fetchFlows(entityName, clientUrl) {
    try {
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,category,statecode,statuscode,primaryentity,type,workflowid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=primaryentity eq '${entityName}' and category eq 5&$orderby=name asc`
        );
        
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/workflows?$select=name,category,statecode,statuscode,primaryentity,type,workflowid,_ownerid_value&$filter=primaryentity eq '${entityName}' and category eq 5&$orderby=name asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Fetch Custom APIs
async function fetchCustomApis(entityName, clientUrl) {
    try {
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/customapis?$select=uniquename,displayname,bindingtype,boundentitylogicalname,isfunction,customapiid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=boundentitylogicalname eq '${entityName}'&$orderby=uniquename asc`
        );
        
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/customapis?$select=uniquename,displayname,bindingtype,boundentitylogicalname,isfunction,customapiid,_ownerid_value&$filter=boundentitylogicalname eq '${entityName}'&$orderby=uniquename asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Enrich items with owner names if missing
async function enrichWithOwnerNames(items, clientUrl) {
    // Get all items that have owner ID but missing owner name
    const itemsNeedingOwner = items.filter(item => 
        item._ownerid_value && (!item.ownerid || !item.ownerid.fullname)
    );
    
    if (itemsNeedingOwner.length === 0) return;
    
    // Fetch owner information for each unique owner ID
    const uniqueOwnerIds = [...new Set(itemsNeedingOwner.map(item => item._ownerid_value))];
    
    const ownerPromises = uniqueOwnerIds.map(async ownerId => {
        try {
            // Try systemuser first
            let response = await fetch(`${clientUrl}/api/data/v9.2/systemusers(${ownerId})?$select=fullname`);
            
            if (response.ok) {
                const data = await response.json();
                return { id: ownerId, name: data.fullname, type: 'systemuser' };
            }
            
            // If not systemuser, try team
            response = await fetch(`${clientUrl}/api/data/v9.2/teams(${ownerId})?$select=name`);
            
            if (response.ok) {
                const data = await response.json();
                return { id: ownerId, name: data.name, type: 'team' };
            }
            
            return { id: ownerId, name: 'Unknown Owner', type: 'unknown' };
        } catch (error) {
            return { id: ownerId, name: 'Unknown Owner', type: 'unknown' };
        }
    });
    
    const ownerResults = await Promise.all(ownerPromises);
    const ownerMap = {};
    ownerResults.forEach(result => {
        ownerMap[result.id] = result.name;
    });
    
    // Update items with owner names
    itemsNeedingOwner.forEach(item => {
        if (!item.ownerid) {
            item.ownerid = {};
        }
        item.ownerid.fullname = ownerMap[item._ownerid_value] || 'Unknown Owner';
    });
}

// Enrich items with solution information
async function enrichWithSolutionInfo(items, clientUrl) {
    // Map of component types for different item types
    const componentTypeMap = {
        workflow: 29,      // Workflow
        businessrule: 29,  // Business Rule (also type 29)
        flow: 29,          // Flow (also type 29)
        customapi: 10380,  // Custom API
        action: 29         // Custom Action (also type 29)
    };
    
    const solutionPromises = items.map(async item => {
        try {
            let objectId;
            let componentType;
            
            // Determine the object ID and component type based on item type
            if (item.workflowid) {
                // Remove braces and convert to lowercase for GUID format
                objectId = item.workflowid.replace(/[{}]/g, '').toLowerCase();
                componentType = 29; // Workflow/Business Rule/Flow/Action
            } else if (item.customapiid) {
                objectId = item.customapiid.replace(/[{}]/g, '').toLowerCase();
                componentType = 10380; // Custom API
            } else {
                return;
            }
            
            // Fetch solution components for this item
            const response = await fetch(
                `${clientUrl}/api/data/v9.2/solutioncomponents?$select=solutioncomponentid&$expand=solutionid($select=friendlyname,uniquename,ismanaged)&$filter=objectid eq ${objectId} and componenttype eq ${componentType}`
            );
            
            if (!response.ok) return;
            
            const data = await response.json();
            
            if (data.value && data.value.length > 0) {
                // Filter out "Active" solution but keep "Default" solution
                const solutions = data.value
                    .filter(sc => sc.solutionid && 
                           sc.solutionid.uniquename !== 'Active')
                    .map(sc => ({
                        name: sc.solutionid.friendlyname || sc.solutionid.uniquename,
                        uniquename: sc.solutionid.uniquename,
                        isManaged: sc.solutionid.ismanaged
                    }));
                
                item.solutions = solutions;
            } else {
                item.solutions = [];
            }
        } catch (error) {
            item.solutions = [];
        }
    });
    
    await Promise.all(solutionPromises);
}

// Fetch Custom Actions
async function fetchCustomActions(entityName, clientUrl) {
    try {
        let response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,uniquename,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$expand=ownerid($select=fullname)&$filter=primaryentity eq '${entityName}' and category eq 3&$orderby=name asc`
        );
        
        if (!response.ok) {
            response = await fetch(
                `${clientUrl}/api/data/v9.2/workflows?$select=name,uniquename,statecode,statuscode,primaryentity,workflowid,_ownerid_value&$filter=primaryentity eq '${entityName}' and category eq 3&$orderby=name asc`
            );
        }
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Create the automations popup
function createAutomationsPopup(entityName, workflows, dialogs, businessRules, businessProcessFlows, flows, customApis, customActions) {
    // Close any existing popups
    const existingPopups = document.querySelectorAll('.commonPopup');
    existingPopups.forEach(popup => popup.remove());
    
    const popupContainer = document.createElement('div');
    popupContainer.className = 'commonPopup';
    popupContainer.style.border = '3px solid #1a1a1a';
    popupContainer.style.borderRadius = '12px';
    popupContainer.style.width = '75%';
    popupContainer.style.maxHeight = '90vh';
    
    const totalCount = workflows.length + dialogs.length + businessRules.length + businessProcessFlows.length + flows.length + customApis.length + customActions.length;
    
    popupContainer.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Table Automations & Customizations</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body" style="padding: 20px;">
            <div style="background-color: #f9f9f9; padding: 12px 20px; border-radius: 5px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>Table:</strong> ${entityName}</div>
                    <div><strong>Total Items:</strong> ${totalCount}</div>
                </div>
            </div>
            
            <div class="scroll-section" style="overflow-y: auto; max-height: calc(90vh - 200px);">
                ${generateAutomationsHtml(workflows, dialogs, businessRules, businessProcessFlows, flows, customApis, customActions)}
            </div>
        </div>
    `;
    
    document.body.appendChild(popupContainer);
    
    // Setup close button
    const closeButton = popupContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => popupContainer.remove());
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e81123';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Make popup movable
    if (typeof makePopupMovable === 'function') {
        makePopupMovable(popupContainer);
    }
}

// Generate HTML for all automations
function generateAutomationsHtml(workflows, dialogs, businessRules, businessProcessFlows, flows, customApis, customActions) {
    let html = '';
    
    // Combine Workflows, Dialogs, and Custom Actions into one section
    const workflowItems = [
        ...workflows.map(w => ({ ...w, itemType: 'Workflow' })),
        ...dialogs.map(d => ({ ...d, itemType: 'Dialog' })),
        ...customActions.map(a => ({ ...a, itemType: 'Custom Action' }))
    ].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    html += generateSectionHtml('Workflows (Classic) / Dialogs / Custom Actions', workflowItems, 'workflow', '⚙️');
    
    // Business Rules Section
    html += generateSectionHtml('Business Rules', businessRules, 'businessrule', '📋');
    
    // Business Process Flows Section
    html += generateSectionHtml('Business Process Flows', businessProcessFlows, 'businessprocessflow', '🔄');
    
    // Flows Section
    html += generateSectionHtml('Cloud Flows (Power Automate)', flows, 'flow', '⚡');
    
    // Custom APIs Section
    html += generateSectionHtml('Custom APIs', customApis, 'customapi', '🔌');
    
    if (html === '') {
        html = '<div style="text-align: center; padding: 40px; color: #666;">No automations or customizations found for this table.</div>';
    }
    
    return html;
}

// Generate section HTML for each automation type
function generateSectionHtml(title, items, type, icon) {
    if (!items || items.length === 0) return '';
    
    const clientUrl = Xrm.Page.context.getClientUrl();
    
    let html = `
        <div style="margin-bottom: 30px;">
            <h3 style="color: #2b2b2b; margin-bottom: 15px; font-size: 18px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                <span>${icon}</span>
                <span>${title}</span>
                <span style="background-color: #2b2b2b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${items.length}</span>
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
    `;
    
    items.forEach(item => {
        const baseName = item.name || item.displayname || item.uniquename || 'Unnamed';
        // Add item type label for combined workflow section
        const itemTypeLabel = item.itemType ? ` (${item.itemType})` : '';
        const name = baseName + itemTypeLabel;
        
        const owner = getOwnerName(item);
        // Don't show solutions for Business Rules
        const solutionDropdown = type === 'businessrule' ? '' : getSolutionDropdown(item);
        const status = getStatusInfo(item, type);
        const url = getItemUrl(item, type, clientUrl);
        const cursorStyle = url ? 'cursor: pointer; transition: background-color 0.2s;' : '';
        const hoverAttribute = url ? 'onmouseenter="this.style.backgroundColor=\'#e8e8e8\';" onmouseleave="this.style.backgroundColor=\'#f5f5f5\';"' : '';
        const clickAttribute = url ? `onclick="window.open('${url}', '_blank');"` : '';
        
        html += `
            <div style="padding: 12px; background-color: #f5f5f5; border-radius: 6px; border-left: 3px solid ${status.color}; ${cursorStyle}" ${hoverAttribute} ${clickAttribute}>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 10px;">${name}</div>
                    <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
                        ${status.badge}
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; flex-wrap: wrap;">
                    ${solutionDropdown}
                    <div style="font-size: 12px; color: #666; flex-shrink: 0;">
                        <strong>Owner:</strong> ${owner}
                    </div>
                    ${getTypeInfo(item, type)}
                </div>
                ${getAdditionalInfo(item, type)}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// Get owner name from item
function getOwnerName(item) {
    if (item.ownerid && item.ownerid.fullname) {
        return item.ownerid.fullname;
    }
    return 'Unknown Owner';
}

// Get solution dropdown for item
function getSolutionDropdown(item) {
    if (!item.solutions) {
        return '';
    }
    
    const itemId = item.workflowid || item.customapiid || Math.random().toString(36).substr(2, 9);
    const solutionCount = item.solutions.length;
    
    if (solutionCount === 0) {
        return `<div style="font-size: 12px; color: #666; position: relative;">
            <div style="display: flex; align-items: center; cursor: pointer; padding: 4px 0;" onclick="event.stopPropagation(); toggleSolutionList('${itemId}')">
                <span id="arrow-${itemId}" style="display: inline-block; margin-right: 6px; transition: transform 0.2s; font-size: 10px;">▶</span>
                <strong>Solutions (0)</strong>
            </div>
            <div id="solutions-${itemId}" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; border-radius: 4px; padding: 8px 12px; margin-top: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 200px; color: #999; font-style: italic; font-size: 11px;">
                Not in any solution
            </div>
        </div>`;
    }
    
    // Create solution list (vertical list format)
    const solutionList = item.solutions.map(sol => {
        const bgColor = sol.isManaged ? '#e3f2fd' : '#e8f5e9';
        return `<div style="padding: 6px 10px; margin-bottom: 4px; background-color: ${bgColor}; border-radius: 3px; font-size: 11px; white-space: nowrap;">
            ${sol.name}
        </div>`;
    }).join('');
    
    return `<div style="font-size: 12px; color: #666; position: relative;">
        <div style="display: flex; align-items: center; cursor: pointer; padding: 4px 0;" onclick="event.stopPropagation(); toggleSolutionList('${itemId}')">
            <span id="arrow-${itemId}" style="display: inline-block; margin-right: 6px; transition: transform 0.2s; font-size: 10px;">▶</span>
            <strong>Solutions (${solutionCount})</strong>
        </div>
        <div id="solutions-${itemId}" style="display: none; position: absolute; top: 100%; left: 0; background: white; border: 1px solid #ccc; border-radius: 4px; padding: 8px; margin-top: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 200px; max-height: 300px; overflow-y: auto;">
            ${solutionList}
        </div>
    </div>`;
}

// Get URL to open item in D365 Classic interface
function getItemUrl(item, type, clientUrl) {
    if (type === 'workflow') {
        // Open classic workflow designer
        if (item.workflowid) {
            return `${clientUrl}/sfa/workflow/edit.aspx?id=${item.workflowid}`;
        }
    }
    
    if (type === 'dialog') {
        // Open dialog in classic editor
        if (item.workflowid) {
            return `${clientUrl}/sfa/workflow/edit.aspx?id=${item.workflowid}`;
        }
    }
    
    if (type === 'businessrule') {
        // Open business rule in classic editor
        if (item.workflowid) {
            return `${clientUrl}/sfa/workflow/edit.aspx?id=${item.workflowid}`;
        }
    }
    
    if (type === 'businessprocessflow') {
        // Open business process flow in classic editor
        if (item.workflowid) {
            return `${clientUrl}/sfa/workflow/edit.aspx?id=${item.workflowid}`;
        }
    }
    
    if (type === 'flow') {
        // Cloud flows open in Power Automate (no classic version)
        if (item.workflowid) {
            return `${clientUrl}/main.aspx?pagetype=entityrecord&etn=workflow&id=${item.workflowid}`;
        }
    }
    
    if (type === 'action') {
        // Open custom action in classic editor
        if (item.workflowid) {
            return `${clientUrl}/sfa/workflow/edit.aspx?id=${item.workflowid}`;
        }
    }
    
    if (type === 'customapi' && item.customapiid) {
        // Custom APIs only have modern interface
        return `${clientUrl}/main.aspx?pagetype=entityrecord&etn=customapi&id=${item.customapiid}`;
    }
    
    return null;
}

// Get status information
function getStatusInfo(item, type) {
    if (type === 'customapi') {
        return {
            color: '#10b981',
            badge: '<span style="background-color: #10b981; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">ACTIVE</span>'
        };
    }
    
    const stateCode = item.statecode;
    
    // Workflow/Business Rule/Flow status codes:
    // statecode: 0 = Draft, 1 = Activated/Active, 2 = Suspended
    if (stateCode === 1) {
        // Activated/Active
        return {
            color: '#10b981',
            badge: '<span style="background-color: #10b981; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">ACTIVE</span>'
        };
    } else if (stateCode === 2) {
        // Suspended/Inactive
        return {
            color: '#ef4444',
            badge: '<span style="background-color: #ef4444; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">SUSPENDED</span>'
        };
    } else {
        // Draft (statecode 0)
        return {
            color: '#f59e0b',
            badge: '<span style="background-color: #f59e0b; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">DRAFT</span>'
        };
    }
}

// Get type information
function getTypeInfo(item, type) {
    if (type === 'customapi') {
        const bindingType = item.bindingtype === 0 ? 'Global' : item.bindingtype === 1 ? 'Entity' : 'Entity Collection';
        const funcType = item.isfunction ? 'Function' : 'Action';
        return `<span style="font-size: 11px; color: #666; background-color: #e5e7eb; padding: 3px 8px; border-radius: 4px;">${funcType} | ${bindingType}</span>`;
    }
    
    // Don't show workflow type labels (Definition/Activation/Template) to end users
    // as they are internal D365 implementation details
    
    return '';
}

// Get additional information
function getAdditionalInfo(item, type) {
    let html = '';
    
    // Show unique name for custom APIs only (not for custom actions)
    if (type === 'customapi' && item.uniquename) {
        html += `<div style="margin-top: 8px; font-size: 12px; color: #666;"><strong>Unique Name:</strong> ${item.uniquename}</div>`;
    }
    
    return html;
}

// Toggle solution list visibility
function toggleSolutionList(itemId) {
    const solutionsDiv = document.getElementById(`solutions-${itemId}`);
    const arrow = document.getElementById(`arrow-${itemId}`);
    
    // Close all other solution dropdowns first
    document.querySelectorAll('[id^="solutions-"]').forEach(el => {
        if (el.id !== `solutions-${itemId}`) {
            el.style.display = 'none';
        }
    });
    document.querySelectorAll('[id^="arrow-"]').forEach(el => {
        if (el.id !== `arrow-${itemId}`) {
            el.style.transform = 'rotate(0deg)';
        }
    });
    
    if (solutionsDiv.style.display === 'none' || solutionsDiv.style.display === '') {
        solutionsDiv.style.display = 'block';
        arrow.style.transform = 'rotate(90deg)';
    } else {
        solutionsDiv.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

// Close solution dropdowns when clicking outside
document.addEventListener('click', function(event) {
    // Check if click is outside of solution dropdown triggers
    if (!event.target.closest('[id^="arrow-"]') && !event.target.closest('[id^="solutions-"]')) {
        document.querySelectorAll('[id^="solutions-"]').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('[id^="arrow-"]').forEach(el => {
            el.style.transform = 'rotate(0deg)';
        });
    }
});

