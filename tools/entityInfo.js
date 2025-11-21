async function fetchEntityFields() {
    const entityName = Xrm.Page.data.entity.getEntityName();
    const recordId = Xrm.Page.data.entity.getId();
    const cleanRecordId = recordId.replace(/[{}]/g, "").toLowerCase();
    const clientUrl = Xrm.Page.context.getClientUrl();
    
    try {
        // Fetch entity metadata and plural name in parallel
        const [metadataResponse, pluralResponse] = await Promise.all([
            fetch(`${clientUrl}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,AttributeType,DisplayName`),
            fetch(`${clientUrl}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')?$select=LogicalCollectionName`)
        ]);
        
        if (!metadataResponse.ok || !pluralResponse.ok) {
            throw new Error(metadataResponse.statusText || pluralResponse.statusText);
        }
        
        const [metadata, pluralData] = await Promise.all([
            metadataResponse.json(),
            pluralResponse.json()
        ]);
        
        const pluralName = pluralData.LogicalCollectionName;
        
        // Get field values from current form
        const fieldValues = {};
        const fieldMetadata = {};
        const attributes = Xrm.Page.data.entity.attributes.get();
        
        attributes.forEach(attr => {
            const logicalName = attr.getName();
            fieldValues[logicalName] = formatFieldValue(attr);
            fieldMetadata[logicalName] = {
                type: attr.getAttributeType(),
                rawValue: attr.getValue()
            };
        });
        
        // Fetch complete record data for fields not on form
        const recordResponse = await fetch(`${clientUrl}/api/data/v9.2/${pluralName}(${cleanRecordId})`);
        
        if (recordResponse.ok) {
            const recordData = await recordResponse.json();
            
            // Populate values for fields not on form
            metadata.value.forEach(field => {
                const logicalName = field.LogicalName;
                if (!fieldValues[logicalName]) {
                    fieldValues[logicalName] = formatFieldValueFromAPI(recordData[logicalName], field.AttributeType, recordData, logicalName);
                    fieldMetadata[logicalName] = {
                        type: field.AttributeType,
                        rawValue: recordData[logicalName]
                    };
                }
            });
        }
        
        const fieldListHtml = generateFieldListHtml(metadata.value, fieldValues, fieldMetadata);
        const popupHtml = generatePopupHtml(entityName, cleanRecordId, fieldListHtml, pluralName);
        appendPopupToBody(popupHtml);
        
    } catch (error) {
        console.error('Error fetching entity fields:', error);
        alert(`Error: ${error.message}`);
    }
}

function formatFieldValueFromAPI(value, attributeType, recordData, logicalName) {
    try {
        if (value === null || value === undefined) {
            return '(empty)';
        }
        
        // Handle lookups
        if (attributeType === 'Lookup' || attributeType === 'Customer' || attributeType === 'Owner') {
            const lookupValue = recordData[`_${logicalName}_value`];
            const lookupFormatted = recordData[`_${logicalName}_value@OData.Community.Display.V1.FormattedValue`];
            return lookupFormatted || lookupValue || '(empty)';
        }
        
        // Handle boolean
        if (attributeType === 'Boolean') {
            return value ? 'Yes' : 'No';
        }
        
        // Handle option sets (check for formatted value)
        if (attributeType === 'Picklist' || attributeType === 'State' || attributeType === 'Status') {
            const formattedValue = recordData[`${logicalName}@OData.Community.Display.V1.FormattedValue`];
            return formattedValue || value.toString();
        }
        
        // Handle multi-select option sets
        if (attributeType === 'MultiSelectPicklist') {
            const formattedValue = recordData[`${logicalName}@OData.Community.Display.V1.FormattedValue`];
            return formattedValue || value;
        }
        
        // Handle datetime
        if (attributeType === 'DateTime') {
            return new Date(value).toLocaleString();
        }
        
        // Handle money
        if (attributeType === 'Money') {
            return '$' + parseFloat(value).toFixed(2);
        }
        
        // Default: convert to string
        return value.toString();
    } catch (error) {
        console.error('Error formatting field value from API:', error);
        return '(empty)';
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
    
    const escapeHtml = (str) => {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    };
    
    let html = '';
    
    Object.keys(categories).forEach(categoryKey => {
        const categoryFields = categories[categoryKey];
        if (categoryFields.length === 0) return;
        
        // Sort fields alphabetically
        categoryFields.sort((a, b) => 
            a.DisplayName.UserLocalizedLabel.Label.localeCompare(b.DisplayName.UserLocalizedLabel.Label)
        );
        
        html += `
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2b2b2b; margin-bottom: 15px; font-size: 18px; font-weight: bold;">${categoryLabels[categoryKey]}:</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-left: 15px;">
        `;
        
        categoryFields.forEach(field => {
            const typeLabel = typeLabels[field.AttributeType] || field.AttributeType;
            const displayName = field.DisplayName.UserLocalizedLabel.Label;
            const logicalName = field.LogicalName;
            const fieldValue = fieldValues[logicalName] || '(empty)';
            const metadata = fieldMetadata[logicalName];
            
            // Truncate value for display (max 100 characters)
            const displayValue = fieldValue.length > 100 ? fieldValue.substring(0, 100) + '...' : fieldValue;
            
            // Build tooltip based on field type
            let fullTooltip = `${displayName} (${logicalName})\nValue: ${fieldValue}`;
            
            // Enhanced tooltip for lookup fields
            if (metadata && metadata.type === 'lookup' && metadata.rawValue && Array.isArray(metadata.rawValue) && metadata.rawValue.length > 0) {
                const lookupData = metadata.rawValue[0];
                fullTooltip = `Lookup Name: ${displayName} (${logicalName})\nEntity Name: ${lookupData.entityType || 'N/A'}\nRecord ID: ${lookupData.id || 'N/A'}\nValue: ${lookupData.name || fieldValue}`;
            }
            
            html += `
                <div class="field-card" data-copy-text="${escapeHtml(fullTooltip)}" data-tooltip="${escapeHtml(fullTooltip)}" style="padding: 8px; background-color: #f5f5f5; border-radius: 5px; border-left: 3px solid #2b2b2b; cursor: pointer; transition: background-color 0.2s;">
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
    // Use template utility functions for consistent styling
    const infoHeader = createInfoHeader([
        { label: 'Entity Name', value: entityName },
        { label: 'Plural Name', value: pluralName },
        { label: 'Record ID', value: cleanRecordId }
    ]);
    
    const noteBanner = createNoteBanner('Click on any field to copy its information');
    
    const scrollSection = createScrollSection(fieldListHtml);
    
    return infoHeader + noteBanner + scrollSection;
}

function appendPopupToBody(html) {
    // Create popup using template utility
    const popupContainer = createStandardPopup({
        title: 'Entity & Fields Info',
        content: html,
        popupId: 'entityInfo',
        width: '75%',
        movable: true
    });
    
    // Add tooltip styling scoped to this popup
    addTooltipStyles({
        popupContainer: popupContainer
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
