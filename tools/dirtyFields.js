async function showDirtyFields() {
    try {
        const entity = Xrm.Page.data.entity;
        const attributes = entity.attributes.get();
        const dirtyFields = attributes.filter(attribute => attribute.getIsDirty());
        
        // Get entity information
        const entityName = entity.getEntityName();
        const recordId = entity.getId().replace(/[{}]/g, "").toLowerCase();
        
        const fieldListHtml = generateDirtyFieldsHtml(dirtyFields);
        const popupHtml = generatePopupHtml(entityName, recordId, dirtyFields.length, fieldListHtml);
        appendPopupToBody(popupHtml);
        
    } catch (error) {
        console.error('Error showing dirty fields:', error);
        alert(`Error: ${error.message}`);
    }
}

function generateDirtyFieldsHtml(dirtyFields) {
    if (dirtyFields.length === 0) {
        return '<div style="padding: 20px; text-align: center; color: #666; font-size: 16px;">No dirty fields found.</div>';
    }
    
    const escapeHtml = (str) => {
        if (!str) return '';
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    };
    
    let html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-left: 15px;">';
    
    dirtyFields.forEach((attribute, index) => {
        const logicalName = attribute.getName();
        const control = attribute.controls.get(0);
        const displayName = control ? control.getLabel() : logicalName;
        const attrType = attribute.getAttributeType();
        const value = formatFieldValue(attribute);
        
        // Get attribute type label
        const typeLabel = getTypeLabel(attrType);
        
        // Build tooltip text
        const tooltipText = `${displayName} (${logicalName})\nType: ${typeLabel}\nCurrent Value: ${value}`;
        
        html += `
            <div class="field-card" data-copy-text="${escapeHtml(tooltipText)}" data-tooltip="${escapeHtml(tooltipText)}" style="padding: 8px; background-color: #f5f5f5; border-radius: 5px; border-left: 3px solid #e81123; cursor: pointer; transition: background-color 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${displayName} 
                        <span style="font-weight: normal; color: #666; font-size: 13px;">(${logicalName})</span>
                    </div>
                    <div style="font-size: 12px; color: #666; white-space: nowrap; margin-left: 10px;">Type: ${typeLabel}</div>
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
    // Use template utility functions for consistent styling
    const infoHeader = createInfoHeader([
        { label: 'Entity Name', value: entityName },
        { label: 'Record ID', value: recordId },
        { label: 'Dirty Fields Count', value: dirtyCount }
    ]);
    
    const noteBanner = createNoteBanner('Click on any field to copy its information');
    
    const scrollSection = createScrollSection(fieldListHtml);
    
    return infoHeader + noteBanner + scrollSection;
}

function appendPopupToBody(html) {
    // Add tooltip styling
    addTooltipStyles();
    
    // Create popup using template utility
    const popupContainer = createStandardPopup({
        title: 'Dirty Fields Info',
        content: html,
        width: '75%',
        movable: true
    });
    
    // Add click-to-copy functionality for field cards
    popupContainer.querySelectorAll('.field-card').forEach(card => {
        card.addEventListener('click', function() {
            const copyText = decodeHtmlEntities(this.getAttribute('data-copy-text'));
            
            navigator.clipboard.writeText(copyText).then(() => {
                // Visual feedback
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = '#d4edda';
                setTimeout(() => this.style.backgroundColor = originalBg, 300);
                
                // Tooltip feedback
                const originalTooltip = this.getAttribute('data-tooltip');
                this.setAttribute('data-tooltip', 'Copied to clipboard! ✓');
                setTimeout(() => this.setAttribute('data-tooltip', originalTooltip), 1500);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        });
        
        // Hover effect
        card.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e8e8e8';
        });
        card.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
    });
}

function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
