async function showDirtyFields() {
    console.log('Dirty Fields: showDirtyFields called');
    try {
        const entity = Xrm.Page.data.entity;
        const attributes = entity.attributes.get();
        const dirtyFields = attributes.filter(attribute => attribute.getIsDirty());
        console.log('Dirty Fields: Found', dirtyFields.length, 'dirty fields');
        
        // If no dirty fields, show toast message and return
        if (dirtyFields.length === 0) {
            showToast('No dirty fields found.', 'success');
            return;
        }
        
        // Get entity information
        const entityName = entity.getEntityName();
        const recordId = entity.getId().replace(/[{}]/g, "").toLowerCase();
        const clientUrl = Xrm.Page.context.getClientUrl();
        
        // Fetch metadata for display names (especially for hidden fields)
        const metadata = await fetchFieldMetadata(entityName, clientUrl);
        
        const fieldListHtml = generateDirtyFieldsHtml(dirtyFields, metadata);
        appendDirtyFieldsPopupToBody(entityName, recordId, dirtyFields.length, fieldListHtml);
        
    } catch (error) {
        console.error('Error showing dirty fields:', error);
        alert(`Error: ${error.message}`);
    }
}

async function fetchFieldMetadata(entityName, clientUrl) {
    try {
        const response = await fetch(`${clientUrl}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,DisplayName`);
        
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        
        const data = await response.json();
        const metadataMap = {};
        
        data.value.forEach(field => {
            if (field.DisplayName && field.DisplayName.UserLocalizedLabel && field.DisplayName.UserLocalizedLabel.Label) {
                metadataMap[field.LogicalName] = field.DisplayName.UserLocalizedLabel.Label;
            }
        });
        
        return metadataMap;
    } catch (error) {
        console.error('Error fetching field metadata:', error);
        return {};
    }
}

function generateDirtyFieldsHtml(dirtyFields, metadata) {
    const escapeHtml = (str) => {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    };
    
    let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-left: 15px;">';
    
    dirtyFields.forEach((attribute) => {
        const logicalName = attribute.getName();
        const control = attribute.controls.get(0);
        
        // Get display name from control, or fallback to metadata, or use logical name
        let displayName;
        if (control && control.getLabel()) {
            displayName = control.getLabel();
        } else if (metadata[logicalName]) {
            displayName = metadata[logicalName];
        } else {
            displayName = logicalName;
        }
        
        const attrType = attribute.getAttributeType();
        const value = formatDirtyFieldValue(attribute);
        
        // Get attribute type label
        const typeLabel = getDirtyFieldTypeLabel(attrType);
        
        html += `
            <div class="dirtyfield-card" style="padding: 8px; background-color: #f5f5f5; border-radius: 5px; border-left: 3px solid #e81123;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(displayName)} 
                        <span style="font-weight: normal; color: #666; font-size: 13px;">(${escapeHtml(logicalName)})</span>
                    </div>
                    <div style="font-size: 12px; color: #666; white-space: nowrap; margin-left: 10px;">Type: ${escapeHtml(typeLabel)}</div>
                </div>
                <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; font-size: 12px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <strong>Current Value:</strong> <span style="font-style: italic;">${escapeHtml(value)}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function formatDirtyFieldValue(attribute) {
    try {
        const value = attribute.getValue();
        
        if (value === null || value === undefined) {
            return '(empty)';
        }
        
        const attrType = attribute.getAttributeType();
        
        // Handle lookups
        if (attrType === 'lookup') {
            if (Array.isArray(value) && value.length > 0) {
                return value.map(v => v.name).join(', ');
            }
            return '(empty)';
        }
        
        // Handle boolean
        if (attrType === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        
        // Handle optionset (picklist)
        if (attrType === 'optionset' || attrType === 'multiselectoptionset') {
            try {
                if (typeof attribute.getFormattedValue === 'function') {
                    const formattedValue = attribute.getFormattedValue();
                    if (formattedValue) {
                        return formattedValue;
                    }
                }
            } catch (e) {
                // Fallback to raw value
            }
            return value.toString();
        }
        
        // Handle datetime
        if (attrType === 'datetime' && value instanceof Date) {
            return value.toLocaleString();
        }
        
        // Handle money
        if (attrType === 'money') {
            return '$' + value.toFixed(2);
        }
        
        // Handle arrays (multiselect)
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        
        // Truncate long values
        const stringValue = value.toString();
        return stringValue.length > 100 ? stringValue.substring(0, 100) + '...' : stringValue;
    } catch (error) {
        console.error('Error formatting field value:', error);
        return '(error)';
    }
}

function getDirtyFieldTypeLabel(attrType) {
    const typeLabels = {
        'string': 'Single line of text',
        'memo': 'Multiple lines of text',
        'boolean': 'Yes/No',
        'optionset': 'Choice',
        'multiselectoptionset': 'Choices',
        'integer': 'Whole Number',
        'decimal': 'Decimal Number',
        'double': 'Floating Point Number',
        'money': 'Currency',
        'datetime': 'Date and Time',
        'lookup': 'Lookup'
    };
    
    return typeLabels[attrType] || attrType;
}

function appendDirtyFieldsPopupToBody(entityName, recordId, dirtyCount, fieldListHtml) {
    // Close any existing popups first
    const existingPopups = document.querySelectorAll('.commonPopup');
    existingPopups.forEach(popup => popup.remove());
    
    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'commonPopup';
    popupContainer.style.border = '3px solid #1a1a1a';
    popupContainer.style.borderRadius = '12px';
    popupContainer.style.width = '75%';
    popupContainer.style.maxHeight = '90vh';
    
    // Build content HTML
    const contentHtml = `
        <div style="background-color: #f9f9f9; padding: 15px 20px; border-radius: 5px; margin-bottom: 15px;">
            <div style="display: flex; gap: 50px; align-items: center; flex-wrap: wrap; font-size: 15px;">
                <div style="white-space: nowrap;"><strong>Entity Name:</strong> ${entityName}</div>
                <div style="white-space: nowrap;"><strong>Record ID:</strong> ${recordId}</div>
                <div style="white-space: nowrap; flex: 1;"><strong>Dirty Fields Count:</strong> ${dirtyCount}</div>
            </div>
        </div>
        <div class="scroll-section" style="padding: 0 2px 20px 20px; overflow-y: auto; max-height: calc(90vh - 235px);">
            ${fieldListHtml}
        </div>
    `;
    
    // Build popup HTML structure
    popupContainer.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Dirty Fields Info</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body">
            <div class="commonSection content-section" style="padding: 0; border-right: 0;">
                ${contentHtml}
            </div>
        </div>
    `;
    
    // Append to body
    document.body.appendChild(popupContainer);
    
    // Setup close button functionality
    const closeButton = popupContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        popupContainer.remove();
    });
    
    // Add hover effect for close button
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
