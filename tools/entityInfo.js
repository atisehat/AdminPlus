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

function generateFieldListHtml(fields) {
    return fields
        .filter(field => field.AttributeType !== 'Virtual' && field.DisplayName && field.DisplayName.UserLocalizedLabel && field.DisplayName.UserLocalizedLabel.Label)
        .map((field, index) => `
            <div>${index + 1}. <strong>${field.DisplayName.UserLocalizedLabel.Label}</strong>
                <div style="margin-left: 25px; margin-bottom: 10px;">
                    <div>Name: ${field.LogicalName}</div>
                    <div>Type: ${field.AttributeType}</div>
                </div>
            </div>
        `)
        .join('');
}

function generatePopupHtml(entityName, cleanRecordId, fieldListHtml, pluralName) {
     return `
        <h2 style="text-align: left;">Entity Name: ${entityName}</h2>
	<h2 style="text-align: left;">Plural Name: ${pluralName}</h2>
        <h2 style="text-align: left;">Record ID: ${cleanRecordId}</h2>
        <h2 style="text-align: left;">Fields:</h2>
        <br>
        <div class="scroll-section" style="padding-left: 20px; columns: 2; -webkit-columns: 2; -moz-columns: 2;">
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
