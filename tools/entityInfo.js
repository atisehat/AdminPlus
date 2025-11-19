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
            const fieldListHtml = generateFieldListHtml(results.value);
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

function generateFieldListHtml(fields) {
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
            html += `
                <div style="padding: 8px; background-color: #f5f5f5; border-radius: 5px; border-left: 3px solid #2b2b2b;">
                    <div style="font-weight: bold; color: #333; margin-bottom: 3px;">${field.DisplayName.UserLocalizedLabel.Label}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 2px;">Logical Name: ${field.LogicalName}</div>
                    <div style="font-size: 12px; color: #666;">Type: ${typeLabel}</div>
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
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div><strong>Entity Name:</strong> ${entityName}</div>
                <div><strong>Plural Name:</strong> ${pluralName}</div>
                <div style="grid-column: 1 / -1;"><strong>Record ID:</strong> ${cleanRecordId}</div>
            </div>
        </div>
        <div class="scroll-section" style="padding: 0 20px; overflow-y: auto; max-height: calc(90vh - 200px);">
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
       newContainer.innerHTML = `
	<div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
	   <span style="color: white;">Entity & Fields Info</span>
	   <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
	</div>   
	<div class="entityInfoPopup-row">
	   <div class="commonSection content-section" id="section1">
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
    
    makePopupMovable(newContainer);
} 
