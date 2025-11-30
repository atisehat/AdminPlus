async function fetchEntityFields() {
    if (!requireFormContext('Table & Fields Info')) return;
    
    const entity = Xrm.Page.data.entity;
    const entityName = entity.getEntityName();
    const cleanRecordId = entity.getId().replace(/[{}]/g, "").toLowerCase();
    const clientUrl = Xrm.Page.context.getClientUrl();
    
    try {
        const [metadataResponse, pluralResponse] = await Promise.all([
            fetch(`${clientUrl}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')/Attributes?$select=LogicalName,AttributeType,DisplayName`),
            fetch(`${clientUrl}/api/data/v9.2/EntityDefinitions(LogicalName='${entityName}')?$select=LogicalCollectionName`)
        ]);
        
        if (!metadataResponse.ok || !pluralResponse.ok) throw new Error(metadataResponse.statusText || pluralResponse.statusText);
        
        const [metadata, pluralData] = await Promise.all([metadataResponse.json(), pluralResponse.json()]);
        const pluralName = pluralData.LogicalCollectionName;
        
        const fieldValues = {}, fieldMetadata = {};
        entity.attributes.get().forEach(attr => {
            const logicalName = attr.getName();
            fieldValues[logicalName] = formatFieldValue(attr);
            fieldMetadata[logicalName] = {type: attr.getAttributeType(), rawValue: attr.getValue()};
        });
        
        const recordResponse = await fetch(`${clientUrl}/api/data/v9.2/${pluralName}(${cleanRecordId})`);        
        if (recordResponse.ok) {
            const recordData = await recordResponse.json();
            metadata.value.forEach(field => {
                const logicalName = field.LogicalName;
                if (!fieldValues[logicalName]) {
                    fieldValues[logicalName] = formatFieldValueFromAPI(recordData[logicalName], field.AttributeType, recordData, logicalName);
                    fieldMetadata[logicalName] = {type: field.AttributeType, rawValue: recordData[logicalName]};
                }
            });
        }
        
        appendEntityInfoPopupToBody(entityName, cleanRecordId, pluralName, 
            generateFieldListHtml(metadata.value, fieldValues, fieldMetadata));
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function formatFieldValueFromAPI(value, attributeType, recordData, logicalName) {
    try {
        if (value === null || value === undefined) return '(empty)';
        
        if (attributeType === 'Lookup' || attributeType === 'Customer' || attributeType === 'Owner') {
            return recordData[`_${logicalName}_value@OData.Community.Display.V1.FormattedValue`] || 
                   recordData[`_${logicalName}_value`] || '(empty)';
        }
        if (attributeType === 'Boolean') return value ? 'Yes' : 'No';
        if (attributeType === 'Picklist' || attributeType === 'State' || attributeType === 'Status') {
            const formatted = recordData[`${logicalName}@OData.Community.Display.V1.FormattedValue`];
            return formatted && value !== null ? `${formatted} (${value})` : formatted || value.toString();
        }
        if (attributeType === 'MultiSelectPicklist') {
            return recordData[`${logicalName}@OData.Community.Display.V1.FormattedValue`] || value;
        }
        if (attributeType === 'DateTime') return new Date(value).toLocaleString();
        if (attributeType === 'Money') return '$' + parseFloat(value).toFixed(2);
        return value.toString();
    } catch (error) {
        return '(empty)';
    }
}

function formatFieldValue(attribute) {
    try {
        const value = attribute.getValue();
        if (value === null || value === undefined) return '(empty)';
        
        const attrType = attribute.getAttributeType();
        if (attrType === 'lookup') {
            return Array.isArray(value) && value.length > 0 ? value.map(v => v.name).join(', ') : '(empty)';
        }
        if (attrType === 'boolean') return value ? 'Yes' : 'No';
        if (attrType === 'optionset' || attrType === 'multiselectoptionset') {
            try {
                const formatted = attribute.getFormattedValue();
                return formatted && value !== null ? `${formatted} (${value})` : value.toString();
            } catch (e) {
                return value.toString();
            }
        }
        if (attrType === 'datetime' && value instanceof Date) return value.toLocaleString();
        if (attrType === 'money') return '$' + value.toFixed(2);
        if (Array.isArray(value)) return value.join(', ');
        return value.toString();
    } catch (error) {
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
    window.entityInfoAvailableSections = Object.keys(categories).filter(key => categories[key].length > 0);
    
    const categoryLabels = {'TextFields': 'Text Fields', 'ChoiceFields': 'Choice Fields', 'NumberFields': 'Number Fields', 
        'DateTimeFields': 'Date & Time Fields', 'LookupFields': 'Lookup Fields', 'FileMediaFields': 'File & Media Fields', 
        'ComputedFields': 'Computed Fields', 'OtherFields': 'Other Fields'};
    
    const typeLabels = {'String': 'Single line of text', 'Memo': 'Multiple lines of text', 'Boolean': 'Yes/No', 
        'Picklist': 'Choice', 'MultiSelectPicklist': 'Choices', 'State': 'Status', 'Status': 'Status Reason', 
        'Integer': 'Whole Number', 'Decimal': 'Decimal Number', 'Double': 'Floating Point Number', 'Money': 'Currency', 
        'BigInt': 'Big Integer', 'DateTime': 'Date and Time', 'Lookup': 'Lookup', 'Customer': 'Customer', 'Owner': 'Owner', 
        'PartyList': 'Activity Party', 'File': 'File', 'Image': 'Image', 'Calculated': 'Calculated', 'Rollup': 'Rollup'};
    
    const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    
    let html = '';
    Object.keys(categories).forEach(categoryKey => {
        const categoryFields = categories[categoryKey];
        if (categoryFields.length === 0) return;
        
        categoryFields.sort((a, b) => a.DisplayName.UserLocalizedLabel.Label.localeCompare(b.DisplayName.UserLocalizedLabel.Label));
        
        html += `<div id="section-${categoryKey}" style="margin-bottom: 25px;">
                <h3 style="color: #2b2b2b; margin-bottom: 15px; font-size: 18px; font-weight: bold;">${categoryLabels[categoryKey]}</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-left: 15px;">`;
        
        categoryFields.forEach(field => {
            const typeLabel = typeLabels[field.AttributeType] || field.AttributeType;
            const displayName = field.DisplayName.UserLocalizedLabel.Label;
            const logicalName = field.LogicalName;
            const fieldValue = fieldValues[logicalName] || '(empty)';
            const metadata = fieldMetadata[logicalName];
            const displayValue = fieldValue.length > 100 ? fieldValue.substring(0, 100) + '...' : fieldValue;
            
            let fullTooltip = `${displayName} (${logicalName})\nValue: ${fieldValue}`;
            if (metadata && metadata.type === 'lookup' && metadata.rawValue && Array.isArray(metadata.rawValue) && metadata.rawValue.length > 0) {
                const lookupData = metadata.rawValue[0];
                fullTooltip = `Lookup Name: ${displayName} (${logicalName})\nEntity Name: ${lookupData.entityType || 'N/A'}\nRecord ID: ${lookupData.id || 'N/A'}\nValue: ${lookupData.name || fieldValue}`;
            }
            
            html += `<div class="entityinfo-field-card" data-copy-text="${escapeHtml(fullTooltip)}" data-tooltip="${escapeHtml(fullTooltip)}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${displayName} <span style="font-weight: normal; color: #666; font-size: 13px;">(${logicalName})</span>
                        </div>
                        <div style="font-size: 12px; color: #666; white-space: nowrap; margin-left: 10px;">Type: ${typeLabel}</div>
                    </div>
                    <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #ddd; font-size: 12px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <strong>Value:</strong> <span style="font-style: italic;">${escapeHtml(displayValue)}</span>
                    </div>
                </div>`;
        });
        
        html += `</div><hr style="border: none; border-top: 2px solid #ddd; margin-top: 20px;"></div>`;
    });
    
    return html;
}

function appendEntityInfoPopupToBody(entityName, recordId, pluralName, fieldListHtml) {
    document.querySelectorAll('.commonPopup').forEach(popup => popup.remove());
    
    const popupContainer = document.createElement('div');
    popupContainer.className = 'commonPopup';
    
    popupContainer.innerHTML = `
        <div class="commonPopup-header">
            <span>Table & Fields Info</span>
            <span class="close-button">&times;</span>
        </div>
        <div class="popup-body">
            <div class="commonSection content-section" style="padding: 0; border-right: 0;">
                <div style="background-color: #f9f9f9; padding: 12px 20px; border-radius: 5px; margin-bottom: 8px;">
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap; font-size: 15px;">
                        <div style="white-space: nowrap;"><strong>Table Name:</strong> ${entityName}</div>
                        <div style="white-space: nowrap;"><strong>Plural Name:</strong> ${pluralName}</div>
                        <div style="white-space: nowrap; min-width: 200px;"><strong>Record ID:</strong> ${recordId}</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 20px; gap: 15px; position: relative; z-index: 100; overflow: visible;">
                    <div id="section-navigation" style="display: flex; flex: 1; min-width: 0; overflow: visible;">
                        ${generateSectionNavigationButtons()}
                    </div>
                    <div style="font-size: 13px; color: #666; font-style: italic; background-color: #f9f9f9; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd; white-space: nowrap; flex-shrink: 0;">
                        <strong>Note:</strong> Click on any field to copy its information
                    </div>
                </div>
                <div class="scroll-section" style="padding: 0 2px 20px 20px; overflow-y: auto; max-height: calc(90vh - 235px); position: relative; z-index: 1;">
                    ${fieldListHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popupContainer);
    
    const closeButton = popupContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => popupContainer.remove());
    
    if (typeof makePopupMovable === 'function') makePopupMovable(popupContainer);
    setupSectionNavigation(popupContainer);
    
    popupContainer.querySelectorAll('.entityinfo-field-card').forEach(card => {
        card.addEventListener('click', function() {
            navigator.clipboard.writeText(decodeHtmlEntities(this.getAttribute('data-copy-text'))).then(() => {
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = '#d4edda';
                setTimeout(() => this.style.backgroundColor = originalBg, 300);
                
                const originalTooltip = this.getAttribute('data-tooltip');
                this.setAttribute('data-tooltip', 'Copied to clipboard! ✓');
                setTimeout(() => this.setAttribute('data-tooltip', originalTooltip), 1500);
            }).catch(() => alert('Failed to copy to clipboard'));
        });
    });
}

function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function generateSectionNavigationButtons() {
    const categoryLabels = {'TextFields': 'Text Fields', 'ChoiceFields': 'Choice Fields', 'NumberFields': 'Number Fields',
        'DateTimeFields': 'Date & Time', 'LookupFields': 'Lookup Fields', 'FileMediaFields': 'File & Media',
        'ComputedFields': 'Computed', 'OtherFields': 'Other'};
    
    const availableSections = window.entityInfoAvailableSections || [];
    let buttonsHtml = '<div class="nav-buttons-container" style="display: flex; gap: 8px; flex: 1; align-items: center; overflow: visible;">';
    
    availableSections.forEach(categoryKey => {
        if (categoryLabels[categoryKey]) {
            buttonsHtml += `<button class="section-nav-btn" data-section="${categoryKey}">${categoryLabels[categoryKey]}</button>`;
        }
    });
    
    buttonsHtml += `<div class="overflow-menu-container" style="position: relative; flex-shrink: 0; display: none; z-index: 10001;">
            <button class="overflow-menu-btn" type="button"><span>More</span><span style="font-size: 16px; font-weight: bold;">▼</span></button>
            <div class="overflow-menu-dropdown"></div>
        </div></div>`;
    
    return buttonsHtml;
}

function setupSectionNavigation(popupContainer) {
    const scrollSection = popupContainer.querySelector('.scroll-section');
    const navContainer = popupContainer.querySelector('.nav-buttons-container');
    const overflowMenuContainer = popupContainer.querySelector('.overflow-menu-container');
    const overflowMenuBtn = popupContainer.querySelector('.overflow-menu-btn');
    const overflowMenuDropdown = popupContainer.querySelector('.overflow-menu-dropdown');
    
    const handleSectionClick = (sectionId) => {
        const targetSection = popupContainer.querySelector(`#section-${sectionId}`);
        if (targetSection) {
            scrollSection.scrollTo({top: targetSection.offsetTop - scrollSection.offsetTop + 120, behavior: 'smooth'});
            
            const originalBg = targetSection.style.backgroundColor;
            targetSection.style.backgroundColor = '#e6f3ff';
            targetSection.style.transition = 'background-color 0.3s ease';
            setTimeout(() => {
                targetSection.style.backgroundColor = originalBg;
                setTimeout(() => targetSection.style.transition = '', 300);
            }, 600);
            
            if (overflowMenuDropdown) overflowMenuDropdown.style.display = 'none';
        }
    };
    
    popupContainer.querySelectorAll('.section-nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            handleSectionClick(this.getAttribute('data-section'));
        });
    });
    
    if (overflowMenuBtn && overflowMenuDropdown) {
        overflowMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            overflowMenuDropdown.style.display = overflowMenuDropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        const closeDropdown = (e) => {
            if (overflowMenuDropdown && overflowMenuContainer && !overflowMenuContainer.contains(e.target)) {
                overflowMenuDropdown.style.display = 'none';
            }
        };
        
        setTimeout(() => document.addEventListener('click', closeDropdown), 100);
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === popupContainer) {
                        document.removeEventListener('click', closeDropdown);
                        observer.disconnect();
                    }
                });
            });
        });
        observer.observe(document.body, {childList: true});
    }    
    const manageOverflow = () => {
        if (!navContainer || !overflowMenuContainer || !overflowMenuDropdown) return;
        
        const buttons = Array.from(navContainer.querySelectorAll('.section-nav-btn'));
        if (buttons.length === 0) return;
        
        const containerWidth = navContainer.offsetWidth;
        let totalWidth = 80, visibleCount = 0;
        
        buttons.forEach(btn => btn.style.display = '');
        overflowMenuContainer.style.display = 'none';
        overflowMenuDropdown.style.display = 'none';
        
        for (let i = 0; i < buttons.length; i++) {
            totalWidth += buttons[i].offsetWidth + 8;
            if (totalWidth <= containerWidth) visibleCount++;
            else break;
        }
        
        if (visibleCount < buttons.length) {
            overflowMenuContainer.style.display = 'block';
            const hiddenButtons = buttons.slice(visibleCount);
            hiddenButtons.forEach(btn => btn.style.display = 'none');
            
            const categoryLabels = {'TextFields': 'Text Fields', 'ChoiceFields': 'Choice Fields', 'NumberFields': 'Number Fields',
                'DateTimeFields': 'Date & Time', 'LookupFields': 'Lookup Fields', 'FileMediaFields': 'File & Media',
                'ComputedFields': 'Computed', 'OtherFields': 'Other'};
            
            overflowMenuDropdown.innerHTML = '';
            hiddenButtons.forEach(btn => {
                const sectionId = btn.getAttribute('data-section');
                const menuItem = document.createElement('div');
                menuItem.className = 'overflow-menu-item';
                menuItem.textContent = categoryLabels[sectionId] || sectionId;
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleSectionClick(sectionId);
                });
                overflowMenuDropdown.appendChild(menuItem);
            });
        }
    };
    
    [50, 200, 500].forEach(delay => setTimeout(manageOverflow, delay));
    
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(manageOverflow, 100);
    };
    
    window.addEventListener('resize', handleResize);
    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                if (node === popupContainer) {
                    window.removeEventListener('resize', handleResize);
                }
            });
        });
    }).observe(document.body, {childList: true});
}
