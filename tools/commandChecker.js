// Command Checker Tool - Debug ribbon commands and check availability rules
async function commandChecker() {
    console.log('Command Checker: Tool initiated');
    
    try {
        // Check if we're on a form
        if (typeof Xrm === 'undefined' || !Xrm.Page || !Xrm.Page.data || !Xrm.Page.data.entity) {
            if (typeof showToast === 'function') {
                showToast('Please open a form to use this tool', 'warning');
            }
            return;
        }
        
        // Close any existing popups first
        const existingPopups = document.querySelectorAll('.commonPopup');
        existingPopups.forEach(popup => popup.remove());
        
        // Get entity name
        const entityName = Xrm.Page.data.entity.getEntityName();
        
        // Create and display the popup
        const popupContainer = createCommandCheckerPopup(entityName);
        document.body.appendChild(popupContainer);
        
        // Setup event handlers
        setupCommandCheckerHandlers(popupContainer, entityName);
        
        // Make popup movable
        if (typeof makePopupMovable === 'function') {
            makePopupMovable(popupContainer);
        }
        
    } catch (error) {
        console.error('Error opening Command Checker tool:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening tool', 'error');
        }
    }
}

function createCommandCheckerPopup(entityName) {
    const container = document.createElement('div');
    container.className = 'commonPopup';
    container.style.border = '3px solid #1a1a1a';
    container.style.borderRadius = '12px';
    container.style.width = '70%';
    container.style.minWidth = '700px';
    container.style.maxWidth = '1000px';
    container.style.maxHeight = '90vh';
    
    container.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Command Checker - Debug Ribbon Commands</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body" style="padding: 20px;">
            <div class="commonSection content-section" style="padding: 0; border-right: 0; height: 100%;">
                
                <!-- Instructions -->
                <div style="background-color: white; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #3b82f6; border-right: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.6;">
                        <strong>Note:</strong> Enter a ribbon command ID to check its availability rules and enable rules. Current entity: <strong>${entityName}</strong>
                    </p>
                </div>
                
                <!-- Input Section -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                        Command ID:
                    </label>
                    <input 
                        type="text" 
                        id="commandIdInput" 
                        placeholder="e.g., Mscrm.HomepageGrid.account.NewRecord"
                        style="width: 100%; padding: 10px 12px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; transition: border-color 0.2s ease;"
                        onfocus="this.style.borderColor='#3b82f6'"
                        onblur="this.style.borderColor='#e5e7eb'"
                    />
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button 
                        id="checkAvailabilityButton"
                        style="flex: 1; padding: 10px 20px; font-size: 14px; font-weight: 600; background-color: #3b82f6; color: white; border: none; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
                        onmouseover="this.style.backgroundColor='#2563eb'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.15)';"
                        onmouseout="this.style.backgroundColor='#3b82f6'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.1)';"
                    >
                        Check Availability
                    </button>
                    <button 
                        id="checkEnableButton"
                        style="flex: 1; padding: 10px 20px; font-size: 14px; font-weight: 600; background-color: #10b981; color: white; border: none; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
                        onmouseover="this.style.backgroundColor='#059669'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.15)';"
                        onmouseout="this.style.backgroundColor='#10b981'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.1)';"
                    >
                        Check Enable Rules
                    </button>
                    <button 
                        id="checkBothButton"
                        style="flex: 1; padding: 10px 20px; font-size: 14px; font-weight: 600; background-color: #6366f1; color: white; border: none; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"
                        onmouseover="this.style.backgroundColor='#4f46e5'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(0, 0, 0, 0.15)';"
                        onmouseout="this.style.backgroundColor='#6366f1'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.1)';"
                    >
                        Check Both
                    </button>
                </div>
                
                <!-- Results Section -->
                <div id="resultsContainer" style="display: none;">
                    <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">Results</h3>
                            <button 
                                id="copyResultsButton"
                                style="padding: 6px 12px; font-size: 12px; font-weight: 600; background-color: #6b7280; color: white; border: none; cursor: pointer; border-radius: 4px; transition: background-color 0.2s ease;"
                                onmouseover="this.style.backgroundColor='#4b5563';"
                                onmouseout="this.style.backgroundColor='#6b7280';"
                            >
                                Copy Results
                            </button>
                        </div>
                        <div id="resultsContent" style="background-color: white; padding: 15px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; max-height: 400px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; line-height: 1.6;">
                            <!-- Results will be inserted here -->
                        </div>
                    </div>
                </div>
                
                <!-- Quick Reference -->
                <div style="margin-top: 20px; padding: 12px; background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e; font-size: 13px;">💡 Quick Tips:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 12px; line-height: 1.6;">
                        <li>Command IDs are case-sensitive</li>
                        <li>Check browser console for detailed error messages</li>
                        <li>Use "Check Both" to see complete rule evaluation</li>
                        <li>Results show which rules passed (✓) or failed (✗)</li>
                    </ul>
                </div>
                
            </div>
        </div>
    `;
    
    return container;
}

function setupCommandCheckerHandlers(container, entityName) {
    // Close button
    const closeButton = container.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        container.remove();
    });
    
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e81123';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Get elements
    const commandInput = container.querySelector('#commandIdInput');
    const checkAvailabilityBtn = container.querySelector('#checkAvailabilityButton');
    const checkEnableBtn = container.querySelector('#checkEnableButton');
    const checkBothBtn = container.querySelector('#checkBothButton');
    const resultsContainer = container.querySelector('#resultsContainer');
    const resultsContent = container.querySelector('#resultsContent');
    const copyResultsBtn = container.querySelector('#copyResultsButton');
    
    // Check Availability button
    checkAvailabilityBtn.addEventListener('click', () => {
        const commandId = commandInput.value.trim();
        if (!commandId) {
            if (typeof showToast === 'function') {
                showToast('Please enter a Command ID', 'warning');
            }
            return;
        }
        checkCommandRules(commandId, 'availability', resultsContainer, resultsContent);
    });
    
    // Check Enable Rules button
    checkEnableBtn.addEventListener('click', () => {
        const commandId = commandInput.value.trim();
        if (!commandId) {
            if (typeof showToast === 'function') {
                showToast('Please enter a Command ID', 'warning');
            }
            return;
        }
        checkCommandRules(commandId, 'enable', resultsContainer, resultsContent);
    });
    
    // Check Both button
    checkBothBtn.addEventListener('click', () => {
        const commandId = commandInput.value.trim();
        if (!commandId) {
            if (typeof showToast === 'function') {
                showToast('Please enter a Command ID', 'warning');
            }
            return;
        }
        checkCommandRules(commandId, 'both', resultsContainer, resultsContent);
    });
    
    // Copy Results button
    copyResultsBtn.addEventListener('click', () => {
        const text = resultsContent.textContent;
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') {
                showToast('Results copied to clipboard!', 'success');
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
            if (typeof showToast === 'function') {
                showToast('Failed to copy results', 'error');
            }
        });
    });
    
    // Enter key support
    commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkBothBtn.click();
        }
    });
}

function checkCommandRules(commandId, checkType, resultsContainer, resultsContent) {
    console.log(`Checking ${checkType} rules for command: ${commandId}`);
    
    try {
        let output = '';
        output += `Command ID: ${commandId}\n`;
        output += `Check Type: ${checkType.toUpperCase()}\n`;
        output += `Timestamp: ${new Date().toLocaleString()}\n`;
        output += `Entity: ${Xrm.Page.data.entity.getEntityName()}\n`;
        output += `\n${'='.repeat(60)}\n\n`;
        
        // Check if Mscrm.CommandBarActions exists
        if (typeof Mscrm === 'undefined' || !Mscrm.CommandBarActions) {
            output += '❌ ERROR: Mscrm.CommandBarActions is not available.\n';
            output += 'This may indicate the ribbon is not fully loaded.\n';
            displayResults(resultsContainer, resultsContent, output, false);
            return;
        }
        
        let hasResults = false;
        
        // Check Availability Rules
        if (checkType === 'availability' || checkType === 'both') {
            output += '📋 AVAILABILITY RULES:\n';
            output += '-'.repeat(60) + '\n';
            
            try {
                const availabilityResult = Mscrm.CommandBarActions.canExecuteCommand(commandId);
                output += `\nResult: ${availabilityResult ? '✓ AVAILABLE' : '✗ NOT AVAILABLE'}\n\n`;
                
                // Try to get more details
                if (!availabilityResult) {
                    output += 'Command is not available. Possible reasons:\n';
                    output += '  • Command ID does not exist\n';
                    output += '  • Command is hidden by availability rules\n';
                    output += '  • Command is not applicable to current context\n';
                }
                
                hasResults = true;
            } catch (error) {
                output += `\n❌ Error checking availability: ${error.message}\n`;
                console.error('Availability check error:', error);
            }
            
            output += '\n';
        }
        
        // Check Enable Rules
        if (checkType === 'enable' || checkType === 'both') {
            output += '🔒 ENABLE RULES:\n';
            output += '-'.repeat(60) + '\n';
            
            try {
                const enableResult = Mscrm.CommandBarActions.isCommandEnabled(commandId);
                output += `\nResult: ${enableResult ? '✓ ENABLED' : '✗ DISABLED'}\n\n`;
                
                // Try to get more details
                if (!enableResult) {
                    output += 'Command is disabled. Possible reasons:\n';
                    output += '  • Enable rules are evaluating to false\n';
                    output += '  • Required privileges are missing\n';
                    output += '  • Record state does not meet requirements\n';
                }
                
                hasResults = true;
            } catch (error) {
                output += `\n❌ Error checking enable rules: ${error.message}\n`;
                console.error('Enable rules check error:', error);
            }
            
            output += '\n';
        }
        
        // Additional Context
        output += '📊 CURRENT CONTEXT:\n';
        output += '-'.repeat(60) + '\n';
        
        try {
            const entity = Xrm.Page.data.entity;
            const recordId = entity.getId();
            
            output += `Entity Name: ${entity.getEntityName()}\n`;
            output += `Record ID: ${recordId || 'New Record (Not Saved)'}\n`;
            output += `Is Dirty: ${entity.getIsDirty()}\n`;
            output += `Form Type: ${Xrm.Page.ui.getFormType()}\n`;
            
            // Form type descriptions
            const formTypes = {
                0: 'Undefined',
                1: 'Create',
                2: 'Update',
                3: 'Read Only',
                4: 'Disabled',
                6: 'Bulk Edit'
            };
            output += `Form Type Name: ${formTypes[Xrm.Page.ui.getFormType()] || 'Unknown'}\n`;
            
        } catch (error) {
            output += `Error getting context: ${error.message}\n`;
        }
        
        output += '\n' + '='.repeat(60) + '\n';
        output += '\n💡 TIP: Check browser console for additional debugging information.\n';
        
        displayResults(resultsContainer, resultsContent, output, hasResults);
        
    } catch (error) {
        console.error('Error in checkCommandRules:', error);
        const errorOutput = `❌ ERROR: ${error.message}\n\nCheck browser console for details.`;
        displayResults(resultsContainer, resultsContent, errorOutput, false);
    }
}

function displayResults(resultsContainer, resultsContent, output, success) {
    resultsContent.textContent = output;
    resultsContainer.style.display = 'block';
    
    // Scroll results into view
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Show toast
    if (typeof showToast === 'function') {
        if (success) {
            showToast('Command check completed!', 'success');
        } else {
            showToast('Command check completed with errors', 'warning');
        }
    }
    
    // Log to console
    console.log('Command Check Results:\n', output);
}

