async function fetchEntityFields() {
    const entityName = Xrm.Page.data.entity.getEntityName();
    const recordId = Xrm.Page.data.entity.getId();
    const cleanRecordId = recordId.replace(/[{}]/g, "").toLowerCase();
    const url = `${Xrm.Page.context.getClientUrl()}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,AttributeType,DisplayName`;
    const urlPlural = `${Xrm.Page.context.getClientUrl()}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')?$select=LogicalCollectionName`; 
    try {
        const response = await fetch(url);
	const responsePlural = await fetch(urlPlural);
        if (response.ok && responsePlural.ok) {
            const results = await response.json();
            const pluralResults = await responsePlural.json();
            const pluralName = pluralResults.LogicalCollectionName;
            
            // Get field values from current form
            const fieldValues = {};
            const fieldMetadata = {};
            const attributes = Xrm.Page.data.entity.attributes.get();
            attributes.forEach(attr => {
                const logicalName = attr.getName();
                const value = attr.getValue();
                fieldValues[logicalName] = formatFieldValue(attr);
                fieldMetadata[logicalName] = {
                    type: attr.getAttributeType(),
                    rawValue: value
                };
            });
            
            const fieldListHtml = generateFieldListHtml(results.value, fieldValues, fieldMetadata);
            const popupHtml = generatePopupHtml(entityName, cleanRecordId, fieldListHtml, pluralName);
            appendPopupToBody(popupHtml);
        } else {
            const errorText = response.statusText || responsePlural.statusText;
            alert(`Error: ${errorText}`);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        alert(`Error: ${error}`);
    }
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
        
        // Default: convert to string
        return value.toString();
    } catch (error) {
        console.error('Error formatting field value:', error);
        return '(error)';
    }
}

function categorizeFields(fields) {
    const categories = {
        'TextFields': [],
        'ChoiceFields': [],
        'NumberFields': [],
        'DateTimeFields': [],
        'LookupFields': [],
        'FileMediaFields': [],
        'ComputedFields': [],
        'OtherFields': []
    };
    
    const typeMapping = {
        'String': 'TextFields',
        'Memo': 'TextFields',
        'Boolean': 'ChoiceFields',
        'Picklist': 'ChoiceFields',
        'MultiSelectPicklist': 'ChoiceFields',
        'State': 'ChoiceFields',
        'Status': 'ChoiceFields',
        'Integer': 'NumberFields',
        'Decimal': 'NumberFields',
        'Double': 'NumberFields',
        'Money': 'NumberFields',
        'BigInt': 'NumberFields',
        'DateTime': 'DateTimeFields',
        'Lookup': 'LookupFields',
        'Customer': 'LookupFields',
        'Owner': 'LookupFields',
        'PartyList': 'LookupFields',
        'File': 'FileMediaFields',
        'Image': 'FileMediaFields',
        'Calculated': 'ComputedFields',
        'Rollup': 'ComputedFields'
    };
    
    fields.forEach(field => {
        if (field.AttributeType === 'Virtual' || !field.DisplayName || !field.DisplayName.UserLocalizedLabel || !field.DisplayName.UserLocalizedLabel.Label) {
            return;
        }
        
        const category = typeMapping[field.AttributeType] || 'OtherFields';
        categories[category].push(field);
    });
    
    return categories;
}

function generateFieldListHtml(fields, fieldValues, fieldMetadata) {
    const categories = categorizeFields(fields);
    const categoryLabels = {
        'TextFields': 'Text Fields',
        'ChoiceFields': 'Choice Fields',
        'NumberFields': 'Number Fields',
        'DateTimeFields': 'Date & Time Fields',
        'LookupFields': 'Lookup Fields',
        'FileMediaFields': 'File & Media Fields',
        'ComputedFields': 'Computed Fields',
        'OtherFields': 'Other Fields'
    };
    
    const typeLabels = {
        'String': 'Single line of text',
        'Memo': 'Multiple lines of text',
        'Boolean': 'Yes/No',
        'Picklist': 'Choice',
        'MultiSelectPicklist': 'Choices',
        'State': 'Status',
        'Status': 'Status Reason',
        'Integer': 'Whole Number',
        'Decimal': 'Decimal Number',
        'Double': 'Floating Point Number',
        'Money': 'Currency',
        'BigInt': 'Big Integer',
        'DateTime': 'Date and Time',
        'Lookup': 'Lookup',
        'Customer': 'Customer',
        'Owner': 'Owner',
        'PartyList': 'Activity Party',
        'File': 'File',
        'Image': 'Image',
        'Calculated': 'Calculated',
        'Rollup': 'Rollup'
    };
    
    let html = '';
    
    Object.keys(categories).forEach(categoryKey => {
        const categoryFields = categories[categoryKey];
        if (categoryFields.length === 0) return;
        
        categoryFields.sort((a, b) => {
            const labelA = a.DisplayName.UserLocalizedLabel.Label;
            const labelB = b.DisplayName.UserLocalizedLabel.Label;
            return labelA.localeCompare(labelB);
        });
        
        html += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2b2b2b; margin-bottom: 15px; font-size: 18px; font-weight: bold;">${categoryLabels[categoryKey]}:</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-left: 15px;">
        `;
        
        categoryFields.forEach(field => {
            const typeLabel = typeLabels[field.AttributeType] || field.AttributeType;
            const displayName = field.DisplayName.UserLocalizedLabel.Label;
            const logicalName = field.LogicalName;
            const fieldValue = fieldValues[logicalName] || '(not on form)';
            const metadata = fieldMetadata[logicalName];
            
            // Truncate value for display (max 100 characters)
            const maxLength = 100;
            let displayValue = fieldValue;
            if (fieldValue.length > maxLength) {
                displayValue = fieldValue.substring(0, maxLength) + '...';
            }
            
            // Escape HTML entities for tooltip
            const escapeHtml = (str) => {
                return str.replace(/&/g, '&amp;')
                          .replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/"/g, '&quot;')
                          .replace(/'/g, '&#039;');
            };
            
            // Build tooltip based on field type
            let fullTooltip = `${displayName} (${logicalName})\nValue: ${fieldValue}`;
            
            // Enhanced tooltip for lookup fields
            if (metadata && metadata.type === 'lookup' && metadata.rawValue && Array.isArray(metadata.rawValue) && metadata.rawValue.length > 0) {
                const lookupData = metadata.rawValue[0];
                fullTooltip = `Lookup Name: ${displayName} (${logicalName})\nEntity Name: ${lookupData.entityType || 'N/A'}\nRecord ID: ${lookupData.id || 'N/A'}\nValue: ${lookupData.name || fieldValue}`;
            }
            
             const combinedTooltip = `${escapeHtml(fullTooltip)}\n${'Click to copy ►'.padStart(102)}`;
             html += `
                <div class="field-card" data-copy-text="${escapeHtml(fullTooltip)}" data-tooltip="${combinedTooltip}" style="padding: 8px; background-color: #f5f5f5; border-radius: 5px; border-left: 3px solid #2b2b2b; cursor: pointer; transition: background-color 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${displayName} 
                            <span style="font-weight: normal; color: #666; font-size: 13px;">(${logicalName})</span>
                        </div>
                        <div style="font-size: 12px; color: #666; white-space: nowrap; margin-left: 10px;">Type: ${typeLabel}</div>
                    </div>
                    <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; font-size: 12px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <strong>Value:</strong> <span style="font-style: italic;">${escapeHtml(displayValue)}</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
                <hr style="border: none; border-top: 2px solid #ddd; margin-top: 20px;">
            </div>
        `;
    });
    
    return html;
}

function generatePopupHtml(entityName, cleanRecordId, fieldListHtml, pluralName) {
     return `
        <div style="background-color: #f9f9f9; padding: 15px 20px; border-radius: 5px; margin-bottom: 15px;">
            <div style="display: flex; gap: 50px; align-items: center; flex-wrap: wrap;">
                <div style="white-space: nowrap;"><strong>Entity Name:</strong> ${entityName}</div>
                <div style="white-space: nowrap;"><strong>Plural Name:</strong> ${pluralName}</div>
                <div style="white-space: nowrap; flex: 1;"><strong>Record ID:</strong> ${cleanRecordId}</div>
            </div>
        </div>
        <div class="scroll-section" style="padding: 0 2px 0 20px; overflow-y: auto; max-height: calc(90vh - 180px);">
            ${fieldListHtml}
        </div>
    `;
}

function appendPopupToBody(html, clearPrevious = false) {
    if (clearPrevious) {
       const existingPopups = document.querySelectorAll('.commonPopup');
       existingPopups.forEach(popup => popup.remove());
    }    
    var newContainer = document.createElement('div');	  	
       newContainer.className = 'commonPopup';
       newContainer.style.border = '3px solid #1a1a1a';
       newContainer.style.borderRadius = '12px';
       newContainer.style.width = '75%';
       
       // Add custom tooltip styling with restricted width
       const tooltipStyle = document.createElement('style');
       tooltipStyle.innerHTML = `
           .field-card[data-tooltip] {
               position: relative;
           }
           .field-card[data-tooltip]:hover::before {
               content: attr(data-tooltip);
               position: absolute;
               left: 0;
               top: 100%;
               margin-top: 8px;
               padding: 10px 14px;
               background-color: rgba(43, 43, 43, 0.95);
               color: white;
               border-radius: 6px;
               font-size: 12px;
               line-height: 1.5;
               white-space: pre-wrap;
               width: 500px;
               box-sizing: border-box;
               z-index: 100000;
               box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
               pointer-events: none;
               display: block;
               word-wrap: break-word;
           }
       `;
       document.head.appendChild(tooltipStyle);
       
       newContainer.innerHTML = `
	<div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
	   <span style="color: white;">Entity & Fields Info</span>
	   <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
	</div>   
	<div class="entityInfoPopup-row">
	   <div class="commonSection content-section" id="section1" style="padding: 0; border-right: 0;">
	    ${html}
	   </div>
	</div>
	`;
    document.body.appendChild(newContainer);
    
    // Add close button functionality
    const closeButton = newContainer.querySelector('.close-button');
    closeButton.addEventListener('click', function() {
        newContainer.remove();
    });
    
    // Add hover effect for close button
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e81123';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Add click-to-copy functionality for field cards
    const fieldCards = newContainer.querySelectorAll('.field-card');
    fieldCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const copyText = this.getAttribute('data-copy-text');
            const decodedText = decodeHtmlEntities(copyText);
            
            // Copy to clipboard
            navigator.clipboard.writeText(decodedText).then(() => {
                // Visual feedback - flash green
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = '#d4edda';
                setTimeout(() => {
                    this.style.backgroundColor = originalBg;
                }, 300);
                
                // Show tooltip feedback
                const originalTooltip = this.getAttribute('data-tooltip');
                const copiedTooltip = `Copied to clipboard!\n${'✓'.padStart(102)}`;
                this.setAttribute('data-tooltip', copiedTooltip);
                setTimeout(() => {
                    this.setAttribute('data-tooltip', originalTooltip);
                }, 1500);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e8e8e8';
        });
        card.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#f5f5f5';
        });
    });
    
    makePopupMovable(newContainer);
}

function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
} 
