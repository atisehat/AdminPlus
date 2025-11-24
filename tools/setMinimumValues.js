// Clone Record Tool - Clone current record to a new record (unsaved)
async function setMinimumValues() {
    console.log('Clone Record: Tool initiated');
    
    try {
        // Check if we're on a form
        if (typeof Xrm === 'undefined' || !Xrm.Page || !Xrm.Page.data || !Xrm.Page.data.entity) {
            if (typeof showToast === 'function') {
                showToast('Please open a form to use this tool', 'warning');
            }
            return;
        }
        
        // Check if this is an existing record (must be saved to clone)
        const entityId = Xrm.Page.data.entity.getId();
        if (!entityId) {
            if (typeof showToast === 'function') {
                showToast('Please open an existing record to clone', 'warning');
            }
            return;
        }
        
        // Close any existing popups first
        const existingPopups = document.querySelectorAll('.commonPopup');
        existingPopups.forEach(popup => popup.remove());
        
        // Get entity name and ID
        const entityName = Xrm.Page.data.entity.getEntityName();
        const cleanRecordId = entityId.replace(/[{}]/g, "").toLowerCase();
        
        // Analyze form fields
        const fieldAnalysis = analyzeFormFields();
        
        // Create and display the popup
        const popupContainer = createCloneRecordPopup(entityName, cleanRecordId, fieldAnalysis);
        document.body.appendChild(popupContainer);
        
        // Setup event handlers
        setupCloneRecordHandlers(popupContainer, fieldAnalysis, entityName, cleanRecordId);
        
        // Make popup movable
        if (typeof makePopupMovable === 'function') {
            makePopupMovable(popupContainer);
        }
        
    } catch (error) {
        console.error('Error opening Clone Record tool:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening tool', 'error');
        }
    }
}

function analyzeFormFields() {
    const fields = {
        lookup: [],
        string: [],
        memo: [],
        boolean: [],
        datetime: [],
        decimal: [],
        double: [],
        integer: [],
        money: [],
        optionset: [],
        multiselectoptionset: [],
        bigint: [],
        other: []
    };
    
    try {
        const attributes = Xrm.Page.data.entity.attributes.get();
        
        attributes.forEach(attribute => {
            try {
                const attrType = attribute.getAttributeType();
                const attrName = attribute.getName();
                const controls = attribute.controls.get();
                
                // Get display name from first control if available
                let displayName = attrName;
                if (controls && controls.length > 0 && typeof controls[0].getLabel === 'function') {
                    const label = controls[0].getLabel();
                    if (label) {
                        displayName = label;
                    }
                }
                
                // Check if field is required or recommended
                const requiredLevel = attribute.getRequiredLevel();
                const isRequired = requiredLevel === 'required';
                const isRecommended = requiredLevel === 'recommended';
                
                // Get current value
                const currentValue = attribute.getValue();
                
                const fieldInfo = {
                    name: attrName,
                    displayName: displayName,
                    type: attrType,
                    isRequired: isRequired,
                    isRecommended: isRecommended,
                    currentValue: currentValue,
                    attribute: attribute
                };
                
                // Categorize by type
                switch (attrType) {
                    case 'lookup':
                        fields.lookup.push(fieldInfo);
                        break;
                    case 'string':
                        fields.string.push(fieldInfo);
                        break;
                    case 'memo':
                        fields.memo.push(fieldInfo);
                        break;
                    case 'boolean':
                        fields.boolean.push(fieldInfo);
                        break;
                    case 'datetime':
                        fields.datetime.push(fieldInfo);
                        break;
                    case 'decimal':
                        fields.decimal.push(fieldInfo);
                        break;
                    case 'double':
                        fields.double.push(fieldInfo);
                        break;
                    case 'integer':
                        fields.integer.push(fieldInfo);
                        break;
                    case 'money':
                        fields.money.push(fieldInfo);
                        break;
                    case 'bigint':
                        fields.bigint.push(fieldInfo);
                        break;
                    case 'optionset':
                        // Get options
                        if (controls && controls.length > 0 && typeof controls[0].getOptions === 'function') {
                            const options = controls[0].getOptions();
                            fieldInfo.options = options;
                        }
                        fields.optionset.push(fieldInfo);
                        break;
                    case 'multiselectoptionset':
                        // Get options
                        if (controls && controls.length > 0 && typeof controls[0].getOptions === 'function') {
                            const options = controls[0].getOptions();
                            fieldInfo.options = options;
                        }
                        fields.multiselectoptionset.push(fieldInfo);
                        break;
                    default:
                        // Catch all other field types (owner, customer, state, status, etc.)
                        console.log(`Other field type detected: ${attrType} (${attrName})`);
                        fields.other.push(fieldInfo);
                        break;
                }
            } catch (e) {
                // Skip fields that cause errors
            }
        });
        
    } catch (error) {
        console.error('Error analyzing form fields:', error);
    }
    
    return fields;
}

function createCloneRecordPopup(entityName, recordId, fieldAnalysis) {
    const container = document.createElement('div');
    container.className = 'commonPopup';
    container.style.border = '3px solid #1a1a1a';
    container.style.borderRadius = '12px';
    container.style.width = '70%';
    container.style.minWidth = '700px';
    container.style.maxWidth = '1000px';
    container.style.maxHeight = '90vh';
    
    // Count total fields that can be cloned (have values)
    const fieldsWithValues = Object.values(fieldAnalysis).reduce((sum, arr) => 
        sum + arr.filter(f => f.currentValue !== null && f.currentValue !== undefined).length, 0);
    const totalFields = Object.values(fieldAnalysis).reduce((sum, arr) => sum + arr.length, 0);
    
    container.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Clone Record</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body" style="padding: 20px;">
            <div class="commonSection content-section" style="padding: 0; border-right: 0; height: 100%;">
                
                <!-- Info Section -->
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; border-right: 4px solid #3b82f6; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                        <strong style="color: #3b82f6;">📋 Entity:</strong> ${entityName} | 
                        <strong style="color: #3b82f6;">🆔 Record ID:</strong> ${recordId} | 
                        <strong style="color: #10b981;">✓ ${fieldsWithValues}/${totalFields}</strong> fields with values
                    </p>
                </div>
                
                <!-- Instructions -->
                <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981; border-right: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.6;">
                        <strong style="color: #10b981;">📝 Instructions:</strong> Select fields to clone, then click "Clone Record". 
                        A new record will open with the selected field values. <strong>Review and modify</strong> before saving. 
                        Fields marked with <span style="color: #ef4444; font-weight: bold;">*</span> are required.
                    </p>
                </div>
                
                <!-- Fields by Type -->
                <div class="scroll-section" style="overflow-y: auto; max-height: calc(90vh - 320px); padding-right: 10px;">
                    ${generateFieldsHTML(fieldAnalysis)}
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                    <button 
                        id="selectAllButton"
                        style="padding: 10px 24px; font-size: 14px; font-weight: 600; background-color: #6b7280; color: white; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);"
                        onmouseover="this.style.backgroundColor='#4b5563'; this.style.transform='translateY(-1px)';"
                        onmouseout="this.style.backgroundColor='#6b7280'; this.style.transform='translateY(0)';"
                    >
                        Select All
                    </button>
                    <button 
                        id="cloneRecordButton"
                        style="padding: 12px 32px; font-size: 15px; font-weight: 600; width: auto; min-width: 180px; background-color: #2b2b2b; color: white; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);"
                        onmouseover="this.style.backgroundColor='#1a1a1a'; this.style.boxShadow='0 4px 10px rgba(0, 0, 0, 0.3)'; this.style.transform='translateY(-1px)';"
                        onmouseout="this.style.backgroundColor='#2b2b2b'; this.style.boxShadow='0 2px 6px rgba(0, 0, 0, 0.2)'; this.style.transform='translateY(0)';"
                    >
                        Clone Record
                    </button>
                </div>
                
            </div>
        </div>
    `;
    
    return container;
}

function generateFieldsHTML(fieldAnalysis) {
    let html = '';
    
    const typeConfigs = {
        lookup: { label: 'Lookup Fields', icon: '🔗', color: '#8b5cf6' },
        string: { label: 'Text Fields (Single Line)', icon: '📝', color: '#3b82f6' },
        memo: { label: 'Text Fields (Multiple Lines)', icon: '📄', color: '#6366f1' },
        boolean: { label: 'Yes/No Fields', icon: '☑️', color: '#10b981' },
        datetime: { label: 'Date & Time Fields', icon: '📅', color: '#f59e0b' },
        decimal: { label: 'Decimal Number Fields', icon: '🔢', color: '#ec4899' },
        double: { label: 'Floating Point Fields', icon: '➗', color: '#06b6d4' },
        integer: { label: 'Whole Number Fields', icon: '#️⃣', color: '#14b8a6' },
        money: { label: 'Currency Fields', icon: '💰', color: '#22c55e' },
        bigint: { label: 'Big Integer Fields', icon: '🔟', color: '#0891b2' },
        optionset: { label: 'Choice Fields (Single)', icon: '🎯', color: '#ef4444' },
        multiselectoptionset: { label: 'Choice Fields (Multi-Select)', icon: '🎲', color: '#dc2626' },
        other: { label: 'Other Fields (Owner, State, Status, etc.)', icon: '⚙️', color: '#6b7280' }
    };
    
    for (const [type, config] of Object.entries(typeConfigs)) {
        const fields = fieldAnalysis[type];
        if (fields.length === 0) continue;
        
        html += `
            <div style="margin-bottom: 25px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid ${config.color};">
                    <span style="font-size: 20px;">${config.icon}</span>
                    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: ${config.color};">
                        ${config.label} (${fields.length})
                    </h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-left: 15px;">
        `;
        
        fields.forEach(field => {
            const requiredMark = field.isRequired ? '<span style="color: #ef4444; font-weight: bold;"> *</span>' : '';
            const recommendedMark = field.isRecommended ? '<span style="color: #f59e0b; font-weight: bold;"> ⭐</span>' : '';
            const hasValue = field.currentValue !== null && field.currentValue !== undefined;
            const isEmpty = !hasValue;
            
            // Format current value for display
            let displayValue = '';
            if (hasValue) {
                if (type === 'boolean') {
                    displayValue = field.currentValue ? 'Yes' : 'No';
                } else if (type === 'datetime' && field.currentValue instanceof Date) {
                    displayValue = field.currentValue.toLocaleString();
                } else if (type === 'money') {
                    displayValue = '$' + field.currentValue.toFixed(2);
                } else if (type === 'lookup' || type === 'owner' || type === 'customer') {
                    // Handle lookup values (array of lookup objects)
                    if (Array.isArray(field.currentValue) && field.currentValue.length > 0) {
                        displayValue = field.currentValue.map(lv => lv.name || lv.id).join(', ');
                    } else if (field.currentValue.name) {
                        displayValue = field.currentValue.name;
                    } else if (field.currentValue.id) {
                        displayValue = 'ID: ' + field.currentValue.id.substring(0, 8) + '...';
                    } else {
                        displayValue = 'Lookup value set';
                    }
                } else if (type === 'multiselectoptionset' || type === 'optionset') {
                    // Handle option set values
                    if (Array.isArray(field.currentValue)) {
                        displayValue = field.currentValue.join(', ');
                    } else {
                        displayValue = String(field.currentValue);
                    }
                } else if (type === 'other') {
                    // Handle other field types
                    if (Array.isArray(field.currentValue)) {
                        if (field.currentValue.length > 0 && field.currentValue[0].name) {
                            displayValue = field.currentValue.map(v => v.name || v).join(', ');
                        } else {
                            displayValue = field.currentValue.join(', ');
                        }
                    } else if (typeof field.currentValue === 'object' && field.currentValue !== null) {
                        if (field.currentValue.name) {
                            displayValue = field.currentValue.name;
                        } else {
                            displayValue = JSON.stringify(field.currentValue);
                        }
                    } else {
                        displayValue = String(field.currentValue);
                    }
                } else {
                    // Default string conversion
                    displayValue = String(field.currentValue);
                }
                
                // Truncate long values
                if (displayValue && displayValue.length > 35) {
                    displayValue = displayValue.substring(0, 35) + '...';
                }
            }
            
            html += `
                <div style="display: flex; flex-direction: column; padding: 8px; background-color: ${hasValue ? '#f0fdf4' : '#fef3c7'}; border-radius: 6px; border: 1px solid ${hasValue ? '#bbf7d0' : '#fde68a'};">
                    <div style="display: flex; align-items: center;">
                        <input type="checkbox" class="field-checkbox" data-field-name="${field.name}" data-field-type="${type}" style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer;" ${isEmpty ? 'disabled' : 'checked'}>
                        <label style="font-size: 13px; color: #374151; cursor: pointer; flex: 1;">
                            ${field.displayName}${requiredMark}${recommendedMark}
                        </label>
                    </div>
                    ${hasValue ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px; margin-left: 24px; font-style: italic;">Value: ${displayValue}</div>` : `<div style="font-size: 11px; color: #92400e; margin-top: 4px; margin-left: 24px;">⚠️ No value to clone</div>`}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    if (html === '') {
        html = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <p style="font-size: 16px; margin: 0;">No supported fields found on this form.</p>
            </div>
        `;
    }
    
    return html;
}

function setupCloneRecordHandlers(container, fieldAnalysis, entityName, recordId) {
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
    
    // Select All button
    const selectAllButton = container.querySelector('#selectAllButton');
    let allSelected = true; // Start with all checked by default
    selectAllButton.textContent = 'Deselect All';
    selectAllButton.addEventListener('click', () => {
        const checkboxes = container.querySelectorAll('.field-checkbox:not([disabled])');
        allSelected = !allSelected;
        checkboxes.forEach(cb => cb.checked = allSelected);
        selectAllButton.textContent = allSelected ? 'Deselect All' : 'Select All';
    });
    
    // Clone button
    const cloneButton = container.querySelector('#cloneRecordButton');
    cloneButton.addEventListener('click', () => handleCloneRecord(container, fieldAnalysis, entityName));
}

function handleCloneRecord(container, fieldAnalysis, entityName) {
    try {
        const selectedCheckboxes = container.querySelectorAll('.field-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            if (typeof showToast === 'function') {
                showToast('Please select at least one field to clone', 'warning');
            }
            return;
        }
        
        // Collect field values to clone
        const fieldsToClone = {};
        
        selectedCheckboxes.forEach(checkbox => {
            try {
                const fieldName = checkbox.getAttribute('data-field-name');
                const fieldType = checkbox.getAttribute('data-field-type');
                
                // Find the field in analysis
                const field = fieldAnalysis[fieldType].find(f => f.name === fieldName);
                if (!field || field.currentValue === null || field.currentValue === undefined) {
                    console.log(`Skipping field ${fieldName} - no value or not found`);
                    return;
                }
                
                // Store the value to clone
                let valueToStore = field.currentValue;
                
                // Validate lookup values have required properties
                if (fieldType === 'lookup' || fieldType === 'other') {
                    if (Array.isArray(valueToStore)) {
                        // Check if all lookup objects have required properties
                        const hasValidLookups = valueToStore.every(lv => 
                            lv && lv.id && lv.name && lv.entityType
                        );
                        if (!hasValidLookups) {
                            console.warn(`Skipping ${fieldName} - lookup missing required properties (id, name, entityType)`);
                            return;
                        }
                    } else if (typeof valueToStore === 'object' && valueToStore !== null) {
                        // Single lookup object
                        if (!valueToStore.id || !valueToStore.name || !valueToStore.entityType) {
                            console.warn(`Skipping ${fieldName} - lookup missing required properties (id, name, entityType)`);
                            return;
                        }
                    }
                }
                
                fieldsToClone[fieldName] = valueToStore;
                console.log(`✓ Collected field ${fieldName} (${fieldType}):`, valueToStore);
                
            } catch (e) {
                console.error(`✗ Error collecting field value for ${fieldName}:`, e);
            }
        });
        
        console.log('Total fields to clone:', Object.keys(fieldsToClone).length);
        console.log('Fields to clone:', fieldsToClone);
        
        if (Object.keys(fieldsToClone).length === 0) {
            if (typeof showToast === 'function') {
                showToast('No fields with values selected to clone', 'warning');
            }
            return;
        }
        
        // Close the popup
        container.remove();
        
        // Show loading message
        if (typeof showToast === 'function') {
            showToast('Opening new record with cloned values...', 'info', 2000);
        }
        
        // Open a new form with the cloned values
        const clientUrl = Xrm.Page.context.getClientUrl();
        const formUrl = `${clientUrl}/main.aspx?etn=${entityName}&pagetype=entityrecord`;
        
        // Build parameters for pre-populated fields
        const params = {};
        Object.keys(fieldsToClone).forEach(fieldName => {
            params[fieldName] = fieldsToClone[fieldName];
        });
        
        // Navigate to create form with parameters
        Xrm.Navigation.openForm({
            entityName: entityName,
            useQuickCreateForm: false,
            openInNewWindow: false
        }).then(function(result) {
            // Form opened successfully
            console.log('Clone form opened', result);
            
            // Set the field values on the new form after it loads
            // We need to wait for the new form to be ready
            const maxAttempts = 20;
            let attempts = 0;
            
            const setValues = setInterval(() => {
                attempts++;
                
                try {
                    // Check if we can access the form context
                    if (typeof Xrm !== 'undefined' && Xrm.Page && Xrm.Page.data && Xrm.Page.data.entity) {
                        // Check if this is a new record (no ID)
                        const newRecordId = Xrm.Page.data.entity.getId();
                        if (!newRecordId) {
                            // This is the new form, set the values
                            let successCount = 0;
                            let errorCount = 0;
                            let skippedCount = 0;
                            const skippedFields = [];
                            const errorFields = [];
                            
                            Object.keys(fieldsToClone).forEach(fieldName => {
                                try {
                                    const attribute = Xrm.Page.data.entity.attributes.get(fieldName);
                                    if (!attribute) {
                                        // Field doesn't exist on create form - this is normal, not an error
                                        skippedCount++;
                                        skippedFields.push(fieldName);
                                        console.log(`⊝ Skipped ${fieldName} - not on create form`);
                                        return;
                                    }
                                    
                                    const attrType = attribute.getAttributeType();
                                    let valueToSet = fieldsToClone[fieldName];
                                    
                                    // Special handling for lookup fields
                                    if (attrType === 'lookup') {
                                        // Ensure lookup value is in correct format
                                        if (valueToSet && !Array.isArray(valueToSet)) {
                                            // Single lookup - wrap in array if not already
                                            if (valueToSet.id && valueToSet.name && valueToSet.entityType) {
                                                valueToSet = [valueToSet];
                                            }
                                        }
                                        // Verify lookup array has required properties
                                        if (Array.isArray(valueToSet) && valueToSet.length > 0) {
                                            const lookup = valueToSet[0];
                                            if (!lookup.id || !lookup.name || !lookup.entityType) {
                                                console.warn(`✗ Invalid lookup format for ${fieldName}:`, valueToSet);
                                                errorCount++;
                                                errorFields.push(`${fieldName} (invalid lookup format)`);
                                                return;
                                            }
                                        }
                                    }
                                    
                                    // Try to set the value
                                    attribute.setValue(valueToSet);
                                    successCount++;
                                    console.log(`✓ Set field ${fieldName} (${attrType}):`, valueToSet);
                                    
                                } catch (e) {
                                    // Real error - permission, validation, etc.
                                    errorCount++;
                                    errorFields.push(`${fieldName} (${e.message || 'unknown error'})`);
                                    console.error(`✗ Could not set field ${fieldName}:`, e);
                                }
                            });
                            
                            // Show results with detailed breakdown
                            console.log(`\n=== Clone Results ===`);
                            console.log(`✓ Successfully set: ${successCount} field(s)`);
                            console.log(`⊝ Skipped (not on create form): ${skippedCount} field(s)`, skippedFields);
                            console.log(`✗ Failed (errors): ${errorCount} field(s)`, errorFields);
                            console.log(`Total attempted: ${Object.keys(fieldsToClone).length} field(s)`);
                            console.log(`====================\n`);
                            
                            if (typeof showToast === 'function') {
                                if (errorCount > 0) {
                                    showToast(`Cloned ${successCount} field(s), ${errorCount} failed, ${skippedCount} not on form. Check console.`, 'warning', 5000);
                                } else if (skippedCount > 0) {
                                    showToast(`Cloned ${successCount} field(s). ${skippedCount} skipped (not on create form).`, 'success', 4000);
                                } else {
                                    showToast(`Successfully cloned all ${successCount} field(s)! Review and save.`, 'success', 3000);
                                }
                            }
                            
                            // Clear the interval
                            clearInterval(setValues);
                        }
                    }
                } catch (e) {
                    console.warn('Waiting for form to load...', e);
                }
                
                // Stop trying after max attempts
                if (attempts >= maxAttempts) {
                    clearInterval(setValues);
                    console.warn('Could not set cloned values - form did not load in time');
                    if (typeof showToast === 'function') {
                        showToast('Form opened but values may not be set', 'warning');
                    }
                }
            }, 500);
            
        }).catch(function(error) {
            console.error('Error opening clone form:', error);
            if (typeof showToast === 'function') {
                showToast('Error opening new record form', 'error');
            }
        });
        
    } catch (error) {
        console.error('Error cloning record:', error);
        if (typeof showToast === 'function') {
            showToast('Error cloning record', 'error');
        }
    }
}

