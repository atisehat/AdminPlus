async function showDirtyFields() {
    try {
        const entity = Xrm.Page.data.entity;
        const attributes = entity.attributes.get();
        const dirtyFields = attributes.filter(attribute => attribute.getIsDirty());
        
        // If no dirty fields, show toast message and return
        if (dirtyFields.length === 0) {
            showToast('No dirty fields found.', 'info');
            return;
        }
        
        // Get entity information
        const entityName = entity.getEntityName();
        const recordId = entity.getId().replace(/[{}]/g, "").toLowerCase();
        const clientUrl = Xrm.Page.context.getClientUrl();
        
        // Fetch metadata for display names (especially for hidden fields)
        const metadata = await fetchFieldMetadata(entityName, clientUrl);
        
        const fieldListHtml = generateDirtyFieldsHtml(dirtyFields, metadata);
        const popupHtml = generatePopupHtml(entityName, recordId, dirtyFields.length, fieldListHtml);
        appendPopupToBody(popupHtml);
        
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
    
    let html = '<div class="df-field-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-left: 15px;">';
    
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
        const value = formatFieldValue(attribute);
        
        // Get attribute type label
        const typeLabel = getTypeLabel(attrType);
        
        html += `
            <div class="df-field-item" style="padding: 10px; background-color: #fff8f8; border-radius: 6px; border-left: 4px solid #e81123; box-shadow: 0 1px 3px rgba(232, 17, 35, 0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 600; color: #d13438; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${escapeHtml(displayName)} 
                        <span style="font-weight: normal; color: #888; font-size: 12px;">(${escapeHtml(logicalName)})</span>
                    </div>
                    <div style="font-size: 11px; color: #888; white-space: nowrap; margin-left: 10px; background-color: #f5f5f5; padding: 3px 8px; border-radius: 3px;">Type: ${escapeHtml(typeLabel)}</div>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f0d0d0; font-size: 13px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <strong style="color: #d13438;">Current Value:</strong> <span style="font-style: italic; color: #666;">${escapeHtml(value)}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function formatFieldValue(attribute) {
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

function getTypeLabel(attrType) {
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

function generatePopupHtml(entityName, recordId, dirtyCount, fieldListHtml) {
    // Create complete popup HTML - self-contained, no shared template dependencies
    return `
        <div class="df-info-header" style="background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%); padding: 18px 22px; border-radius: 6px; margin-bottom: 18px; border: 1px solid #ffcccc;">
            <div style="display: flex; gap: 45px; align-items: center; flex-wrap: wrap; font-size: 14px;">
                <div style="white-space: nowrap;"><strong style="color: #d13438;">Entity Name:</strong> <span style="color: #444;">${entityName}</span></div>
                <div style="white-space: nowrap;"><strong style="color: #d13438;">Record ID:</strong> <span style="color: #444;">${recordId}</span></div>
                <div style="white-space: nowrap;"><strong style="color: #d13438;">Dirty Fields Count:</strong> <span style="color: #444; font-weight: 600; background-color: #e81123; color: white; padding: 2px 8px; border-radius: 3px;">${dirtyCount}</span></div>
            </div>
        </div>
        <div class="df-scroll-area" style="padding: 0 2px 22px 22px; overflow-y: auto; max-height: calc(90vh - 220px);">
            ${fieldListHtml}
        </div>
    `;
}

function appendPopupToBody(html) {
    // Remove any existing Dirty Fields popup
    const existingPopup = document.querySelector('.dirtyFieldsToolPopup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create completely independent popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'dirtyFieldsToolPopup';
    popupContainer.style.border = '3px solid #e81123';
    popupContainer.style.borderRadius = '10px';
    popupContainer.style.width = '75%';
    popupContainer.style.maxHeight = '90vh';
    popupContainer.style.backgroundColor = '#ffffff';
    popupContainer.style.boxShadow = '0 0 25px rgba(232, 17, 35, 0.3)';
    popupContainer.style.fontFamily = 'Arial, sans-serif';
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '50%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translate(-50%, -50%)';
    popupContainer.style.overflow = 'hidden';
    popupContainer.style.zIndex = '10001';
    
    // Build popup HTML structure with unique styling
    popupContainer.innerHTML = `
        <div class="df-popup-header" style="background: linear-gradient(135deg, #e81123 0%, #c00d1f 100%); position: relative; cursor: move; border-radius: 7px 7px 0 0; margin: 0; border-bottom: 3px solid #a00919; padding: 16px 22px; color: white; font-weight: bold; font-size: 17px;">
            🔴 Dirty Fields Info
            <span class="df-close-btn" style="position: absolute; right: 0; top: 0; bottom: 0; width: 50px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 22px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 7px 0 0;">&times;</span>
        </div>
        <div class="df-popup-content" style="padding: 22px;">
            ${html}
        </div>
    `;
    
    // Append to body
    document.body.appendChild(popupContainer);
    
    // Setup close button
    const closeButton = popupContainer.querySelector('.df-close-btn');
    closeButton.addEventListener('click', () => {
        popupContainer.remove();
    });
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#8b0000';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Make popup movable
    if (typeof makePopupMovable === 'function') {
        makePopupMovable(popupContainer);
    }
}
