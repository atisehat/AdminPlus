// Open Record Tool - Navigate to any record by Entity Logical Name and Record ID
async function openRecord() {
    console.log('Open Record: Tool initiated');
    
    try {
        // Close any existing popups first
        const existingPopups = document.querySelectorAll('.commonPopup');
        existingPopups.forEach(popup => popup.remove());
        
        // Create and display the popup
        const popupContainer = createOpenRecordPopup();
        document.body.appendChild(popupContainer);
        
        // Setup event handlers
        setupOpenRecordHandlers(popupContainer);
        
        // Make popup movable
        if (typeof makePopupMovable === 'function') {
            makePopupMovable(popupContainer);
        }
        
    } catch (error) {
        console.error('Error opening Open Record tool:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening tool', 'error');
        }
    }
}

function createOpenRecordPopup() {
    const container = document.createElement('div');
    container.className = 'commonPopup';
    container.style.border = '3px solid #1a1a1a';
    container.style.borderRadius = '12px';
    container.style.width = '50%';
    container.style.minWidth = '500px';
    container.style.maxWidth = '700px';
    container.style.maxHeight = '90vh';
    
    container.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Open Record</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body" style="padding: 30px 40px;">
            <div class="commonSection content-section" style="padding: 0; border-right: 0;">
                
                <!-- Instructions -->
                <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6;">
                        <strong>📖 Instructions:</strong> Enter the entity logical name (e.g., "account", "contact", "opportunity") 
                        and the record GUID to open that specific record in a new window.
                    </p>
                </div>
                
                <!-- Input Form -->
                <div style="display: flex; flex-direction: column; gap: 25px;">
                    
                    <!-- Entity Logical Name Input -->
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label for="entityLogicalName" style="font-weight: 600; font-size: 15px; color: #333;">
                            Entity/Table Logical Name <span style="color: #ef4444;">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="entityLogicalName" 
                            placeholder="e.g., account, contact, opportunity"
                            style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; font-family: 'Segoe UI', Arial, sans-serif;"
                            onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';"
                            onblur="this.style.borderColor='#e5e7eb';"
                        />
                        <span style="font-size: 12px; color: #6b7280;">Enter the logical name of the entity (lowercase, no spaces)</span>
                    </div>
                    
                    <!-- Record ID Input -->
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <label for="recordId" style="font-weight: 600; font-size: 15px; color: #333;">
                            Record ID (GUID) <span style="color: #ef4444;">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="recordId" 
                            placeholder="e.g., 12345678-1234-1234-1234-123456789abc"
                            style="padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s; font-family: 'Courier New', monospace;"
                            onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none';"
                            onblur="this.style.borderColor='#e5e7eb';"
                        />
                        <span style="font-size: 12px; color: #6b7280;">Enter the GUID of the record (with or without curly braces)</span>
                    </div>
                    
                    <!-- Quick Access Section -->
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0 0 10px 0; font-weight: 600; font-size: 14px; color: #92400e;">
                            🚀 Quick Access - Current Record:
                        </p>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <button 
                                id="useCurrentRecord" 
                                style="padding: 8px 16px; background-color: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background-color 0.2s;"
                                onmouseover="this.style.backgroundColor='#d97706';"
                                onmouseout="this.style.backgroundColor='#f59e0b';"
                            >
                                Use Current Record
                            </button>
                            <span style="font-size: 12px; color: #92400e;">Populate fields with the currently open record</span>
                        </div>
                    </div>
                    
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 35px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
                    <button 
                        id="openRecordButton"
                        style="padding: 12px 32px; font-size: 15px; font-weight: 600; width: auto; min-width: 160px; background-color: #2b2b2b; color: white; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);"
                        onmouseover="this.style.backgroundColor='#1a1a1a'; this.style.boxShadow='0 4px 10px rgba(0, 0, 0, 0.3)'; this.style.transform='translateY(-1px)';"
                        onmouseout="this.style.backgroundColor='#2b2b2b'; this.style.boxShadow='0 2px 6px rgba(0, 0, 0, 0.2)'; this.style.transform='translateY(0)';"
                    >
                        Open Record
                    </button>
                </div>
                
                <!-- Examples Section -->
                <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; font-weight: 600; font-size: 14px; color: #374151;">
                        💡 Common Entity Logical Names:
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 13px; color: #6b7280;">
                        <div><strong>account</strong> - Account</div>
                        <div><strong>contact</strong> - Contact</div>
                        <div><strong>lead</strong> - Lead</div>
                        <div><strong>opportunity</strong> - Opportunity</div>
                        <div><strong>quote</strong> - Quote</div>
                        <div><strong>order</strong> - Order</div>
                        <div><strong>invoice</strong> - Invoice</div>
                        <div><strong>incident</strong> - Case</div>
                        <div><strong>task</strong> - Task</div>
                    </div>
                </div>
                
            </div>
        </div>
    `;
    
    return container;
}

function setupOpenRecordHandlers(container) {
    // Close button
    const closeButton = container.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        container.remove();
    });
    
    // Close button hover effect
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e81123';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Use Current Record button
    const useCurrentButton = container.querySelector('#useCurrentRecord');
    useCurrentButton.addEventListener('click', populateCurrentRecordInfo);
    
    // Open Record button
    const openButton = container.querySelector('#openRecordButton');
    openButton.addEventListener('click', handleOpenRecord);
    
    // Allow Enter key to submit
    const entityInput = container.querySelector('#entityLogicalName');
    const recordIdInput = container.querySelector('#recordId');
    
    entityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleOpenRecord();
        }
    });
    
    recordIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleOpenRecord();
        }
    });
}

function populateCurrentRecordInfo() {
    try {
        // Check if we're on a record form
        if (typeof Xrm === 'undefined' || !Xrm.Page || !Xrm.Page.data || !Xrm.Page.data.entity) {
            if (typeof showToast === 'function') {
                showToast('No record is currently open', 'warning');
            }
            return;
        }
        
        const entityName = Xrm.Page.data.entity.getEntityName();
        const recordId = Xrm.Page.data.entity.getId();
        
        if (!entityName || !recordId) {
            if (typeof showToast === 'function') {
                showToast('Unable to get current record information', 'warning');
            }
            return;
        }
        
        // Clean the record ID (remove curly braces)
        const cleanRecordId = recordId.replace(/[{}]/g, "");
        
        // Populate the inputs
        document.getElementById('entityLogicalName').value = entityName;
        document.getElementById('recordId').value = cleanRecordId;
        
        if (typeof showToast === 'function') {
            showToast('Current record info populated', 'success');
        }
        
    } catch (error) {
        console.error('Error populating current record info:', error);
        if (typeof showToast === 'function') {
            showToast('Error getting current record info', 'error');
        }
    }
}

function handleOpenRecord() {
    try {
        // Get input values
        const entityLogicalName = document.getElementById('entityLogicalName').value.trim();
        const recordId = document.getElementById('recordId').value.trim();
        
        // Validate inputs
        if (!entityLogicalName) {
            if (typeof showToast === 'function') {
                showToast('Please enter an entity logical name', 'warning');
            }
            document.getElementById('entityLogicalName').focus();
            return;
        }
        
        if (!recordId) {
            if (typeof showToast === 'function') {
                showToast('Please enter a record ID', 'warning');
            }
            document.getElementById('recordId').focus();
            return;
        }
        
        // Clean the record ID (remove curly braces and convert to lowercase)
        const cleanRecordId = recordId.replace(/[{}]/g, "").toLowerCase();
        
        // Validate GUID format (basic validation)
        const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!guidPattern.test(cleanRecordId)) {
            if (typeof showToast === 'function') {
                showToast('Invalid GUID format. Please check the Record ID', 'error');
            }
            document.getElementById('recordId').focus();
            return;
        }
        
        // Get the client URL
        const clientUrl = Xrm.Page.context.getClientUrl();
        
        // Construct the record URL
        const recordUrl = `${clientUrl}/main.aspx?etn=${entityLogicalName}&id=${cleanRecordId}&pagetype=entityrecord`;
        
        // Open the record in a new window
        const timestamp = new Date().getTime();
        const windowName = `Record_${entityLogicalName}_${timestamp}`;
        const windowOptions = "height=700,width=1200,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,titlebar=no,toolbar=no";
        
        window.open(recordUrl, windowName, windowOptions);
        
        if (typeof showToast === 'function') {
            showToast('Record opened in new window', 'success');
        }
        
    } catch (error) {
        console.error('Error opening record:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening record: ' + error.message, 'error');
        }
    }
}

