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
            showLoadingDialog('Loading entity automations...');
        }
        
        // Fetch all automation data in parallel
        const [workflows, businessRules, flows, customApis, customActions] = await Promise.all([
            fetchWorkflows(entityName, clientUrl),
            fetchBusinessRules(entityName, clientUrl),
            fetchFlows(entityName, clientUrl),
            fetchCustomApis(entityName, clientUrl),
            fetchCustomActions(entityName, clientUrl)
        ]);
        
        // Hide loading dialog
        if (typeof hideLoadingDialog === 'function') {
            hideLoadingDialog();
        }
        
        // Create and display popup
        createAutomationsPopup(entityName, workflows, businessRules, flows, customApis, customActions);
        
    } catch (error) {
        if (typeof hideLoadingDialog === 'function') {
            hideLoadingDialog();
        }
        if (typeof showToast === 'function') {
            showToast('Error loading entity automations: ' + error.message, 'error');
        }
    }
}

// Fetch Workflows (Classic Workflows)
async function fetchWorkflows(entityName, clientUrl) {
    try {
        const response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,category,statecode,statuscode,primaryentity,type,workflowid&$filter=primaryentity eq '${entityName}' and category eq 0&$orderby=name asc`
        );
        
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
        const response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,statecode,statuscode,primaryentity,workflowid&$filter=primaryentity eq '${entityName}' and category eq 2&$orderby=name asc`
        );
        
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
        const response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,category,statecode,statuscode,primaryentity,type,workflowid&$filter=primaryentity eq '${entityName}' and category eq 5&$orderby=name asc`
        );
        
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
        const response = await fetch(
            `${clientUrl}/api/data/v9.2/customapis?$select=uniquename,displayname,bindingtype,boundentitylogicalname,isfunction,customapiid&$filter=boundentitylogicalname eq '${entityName}'&$orderby=uniquename asc`
        );
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Fetch Custom Actions
async function fetchCustomActions(entityName, clientUrl) {
    try {
        const response = await fetch(
            `${clientUrl}/api/data/v9.2/workflows?$select=name,uniquename,statecode,statuscode,primaryentity,workflowid&$filter=primaryentity eq '${entityName}' and category eq 3&$orderby=name asc`
        );
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.value || [];
    } catch (error) {
        return [];
    }
}

// Create the automations popup
function createAutomationsPopup(entityName, workflows, businessRules, flows, customApis, customActions) {
    // Close any existing popups
    const existingPopups = document.querySelectorAll('.commonPopup');
    existingPopups.forEach(popup => popup.remove());
    
    const popupContainer = document.createElement('div');
    popupContainer.className = 'commonPopup';
    popupContainer.style.border = '3px solid #1a1a1a';
    popupContainer.style.borderRadius = '12px';
    popupContainer.style.width = '75%';
    popupContainer.style.maxHeight = '90vh';
    
    const totalCount = workflows.length + businessRules.length + flows.length + customApis.length + customActions.length;
    
    popupContainer.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Entity Automations & Customizations</span>
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
                ${generateAutomationsHtml(workflows, businessRules, flows, customApis, customActions)}
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
function generateAutomationsHtml(workflows, businessRules, flows, customApis, customActions) {
    let html = '';
    
    // Workflows Section
    html += generateSectionHtml('Workflows (Classic)', workflows, 'workflow', '⚙️');
    
    // Business Rules Section
    html += generateSectionHtml('Business Rules', businessRules, 'businessrule', '📋');
    
    // Flows Section
    html += generateSectionHtml('Cloud Flows (Power Automate)', flows, 'flow', '⚡');
    
    // Custom APIs Section
    html += generateSectionHtml('Custom APIs', customApis, 'customapi', '🔌');
    
    // Custom Actions Section
    html += generateSectionHtml('Custom Actions', customActions, 'action', '🎯');
    
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
            <div style="display: grid; gap: 10px;">
    `;
    
    items.forEach(item => {
        const name = item.name || item.displayname || item.uniquename || 'Unnamed';
        const status = getStatusInfo(item, type);
        const url = getItemUrl(item, type, clientUrl);
        const cursorStyle = url ? 'cursor: pointer; transition: background-color 0.2s;' : '';
        const hoverAttribute = url ? 'onmouseenter="this.style.backgroundColor=\'#e8e8e8\';" onmouseleave="this.style.backgroundColor=\'#f5f5f5\';"' : '';
        const clickAttribute = url ? `onclick="window.open('${url}', '_blank');"` : '';
        
        html += `
            <div style="padding: 12px; background-color: #f5f5f5; border-radius: 6px; border-left: 3px solid ${status.color}; ${cursorStyle}" ${hoverAttribute} ${clickAttribute}>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 600; color: #333;">${name}</div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${status.badge}
                        ${getTypeInfo(item, type)}
                    </div>
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

// Get URL to open item in D365
function getItemUrl(item, type, clientUrl) {
    if (type === 'workflow' || type === 'businessrule' || type === 'flow' || type === 'action') {
        if (item.workflowid) {
            return `${clientUrl}/main.aspx?pagetype=entityrecord&etn=workflow&id=${item.workflowid}`;
        }
    }
    
    if (type === 'customapi' && item.customapiid) {
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
    
    if (type === 'workflow' && item.type !== undefined) {
        const typeLabels = {
            1: 'Definition',
            2: 'Activation',
            3: 'Template'
        };
        return `<span style="font-size: 11px; color: #666; background-color: #e5e7eb; padding: 3px 8px; border-radius: 4px;">${typeLabels[item.type] || 'Unknown'}</span>`;
    }
    
    return '';
}

// Get additional information
function getAdditionalInfo(item, type) {
    if (type === 'customapi' && item.uniquename) {
        return `<div style="margin-top: 8px; font-size: 12px; color: #666;"><strong>Unique Name:</strong> ${item.uniquename}</div>`;
    }
    
    if (type === 'action' && item.uniquename) {
        return `<div style="margin-top: 8px; font-size: 12px; color: #666;"><strong>Unique Name:</strong> ${item.uniquename}</div>`;
    }
    
    return '';
}

