const baseUrl = 'https://atisehat.github.io/AdminPlus/';

// Cache busting: Add timestamp to force reload of updated files
const cacheBuster = '?v=' + new Date().getTime();

function loadCSS(href) {
  const link = document.createElement('link');
  link.href = baseUrl + href + cacheBuster;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  document.head.appendChild(link); 
}
// Load CSS
loadCSS('styles/common.css');
loadCSS('styles/tools.css');

function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = baseUrl + src + cacheBuster;
  script.onload = callback;
  document.head.appendChild(script);
}

// Load version info first
loadScript('version.js');

// Load utility scripts
loadScript('utils/api.js');
loadScript('utils/ui.js');

// Load tool scripts 
loadScript('tools/advancedFind.js');
loadScript('tools/entityInfo.js');
loadScript('tools/fieldsControl.js');
loadScript('tools/dirtyFields.js');
loadScript('tools/copySecurity.js');
loadScript('tools/assignSecurity.js');
loadScript('tools/securityOperations.js');
loadScript('tools/dateCalculator.js');

function openPopup() {
  closeSubPopups();
  var isAdmin = false;
  var userName = Xrm.Utility.getGlobalContext().userSettings.userName;
  var roles = Xrm.Utility.getGlobalContext().userSettings.roles;  
  for (var i = 0; i< roles.getLength(); i++) {
    var role = roles.get(i);
    if (role.name == "System Administrator") {
        isAdmin = true;
        break;
    }
  }  
  if (!isAdmin && userName !== "Adrian Solis") {
    Xrm.Navigation.openAlertDialog({ text: "You do not have permission to execute this action."});
    return;    
  }	 
  // Get build info (will be loaded from version.js)
  var badgeText = typeof getBadgeText === 'function' ? getBadgeText() : 'v2.0.0';
  
  var popupHtml = `  
    <style>       
	.popup { 
	    position: fixed; 
	    right: 0; 
	    top: 0; 
	    background-color: #f9f9f9; 
	    border-left: 3px solid #102e55; 
	    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3); 
	    height: 100vh; 
	    width: 420px; 
	    overflow-y: auto; 
	    z-index: 999999;
	    animation: slideInRight 0.3s ease-out;
	}
	@keyframes slideInRight {
	    from { transform: translateX(100%); }
	    to { transform: translateX(0); }
	}
	.button-container { padding: 20px; width: 380px; }
	.popup button { display: block; width: 100%; margin-bottom: 10px; padding: 10px; background-color: #102e55; color: white; border: none; border-radius: 20px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }
	.popup button:hover { background-color: #3c6690; transform: translateY(-2px); box-shadow: 0 7px 20px rgba(0, 0, 0, 0.25); }
	.popup button:active { transform: translateY(0); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); }		
	.button-row { display: flex; justify-content: space-between; flex-direction: row; width: 100%; }
	.button-row button { width: calc(50% - 5px); }
	.dropdown button { width: 100%; }
	.button-row .full-width { width: 100%; }
	.dropdown-row { display: flex; justify-content: space-between; flex-direction: row; width: 100%; }
	.dropdown { position: relative; display: inline-block; width: calc(50% - 5px); }
	.dropdown-content { display: none; position: absolute; min-width: 100%; z-index: 1; }
	.dropdown-content button { display: block; background-color: white; color: black; padding: 5px; text-align: center; border: none; width: 100%; }
	.popup button.close-btn { margin-top: 10px; font-size: 15px; }
	.build-badge { position: absolute; top: 12px; right: 15px; background-color: rgba(255, 255, 255, 0.2); color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: normal; }
    </style>
    <div class="popup">
	<div class="commonPopup-header">	            
	    Admin Plus
	    <span class="build-badge">${badgeText}</span>
	</div>
	<div class="button-container">
	  <div class="button-row">
	    <button onclick="closePopup(); openUrl('advanceFind');">Advanced Find Classic</button>
	    <button onclick="closePopup(); setTimeout(fetchEntityFields, 0);">Show Entity Info</button>
	  </div>	  		  
	  <div class="button-row">
	    <button onclick="showAllTabsAndSections();">Show Hidden Items</button>
	    <button onclick="renameTabsSectionsFields();">Show Logical Names</button>
	  </div>
	  <div class="button-row">		    
	    <button onclick="unlockAllFields();">Unlock All Fields</button>
	    <button onclick="closePopup(); showDirtyFields();">Show Dirty Fields</button>
	  </div>   	 
	  <div class="button-row">
	    <button onclick="closePopup(); editSecurity();">Assign User Security</button>
	    <button onclick="closePopup(); copySecurity();">Copy User Security</button>
	  </div>    		  
	  <div class="button-row">		    
	    <button onclick="closePopup(); dateCalc();">Date Calculator</button>
	    <div class="dropdown">
	      <button onclick="toggleDropdownMenu('dropdown-content');">Extra</button> 
	      <div id="dropdown-content" class="dropdown-content">			 
		 <button onclick="openRestBuilder(getOrgUrl());">Open REST Builder</button>
		 <button onclick="closePopup(); openUrl('userProvision');">User Provision Tool</button>		
	      </div>
	    </div>
	  </div>
	    <button onclick="closePopup();" class="close-btn">Close</button>
	</div>
	<div id="popupContent" class="content"></div>	
   </div>
  `;	  
  var newContainer = document.createElement('div');
  newContainer.id = 'MenuPopup';
  newContainer.innerHTML = popupHtml;
  document.body.appendChild(newContainer);
}
function clearCacheFunction() {
    location.reload(true); // Forces a hard reload to bypassing cache.
}

function closeIframe(url) { 
  var contentDiv = document.getElementById('popupContent');  
  contentDiv.style.display = 'none';  
}

function toggleDropdownMenu(dropdownId) {
  var dropdownContent = document.getElementById(dropdownId);
  if (dropdownContent.style.display === 'block') {
    dropdownContent.style.display = 'none';
  } else {
    dropdownContent.style.display = 'block';
  }
}

function closePopup() {
    closeIframe();    
    // Remove MenuPopup if it exists
    var newContainer = document.getElementById('MenuPopup');
    if (newContainer) {
        newContainer.remove();
    }
    closeSubPopups();
}

function closeSubPopups() { 
    const popupClasses = ['.entityInfoPopup', '.dirtyFieldsPopup', '.securityPopup'];    
    popupClasses.forEach((popupClass) => {
        const popup = document.querySelector(popupClass);
        if (popup) {
            popup.remove();
        }
    });
}

function closeDirtyFieldsPopup() {
  var popup = document.querySelector('.dirty-fields-popup');
  if (popup) {
    popup.remove();
  }
} 

window.fetchEntityFields = fetchEntityFields;
window.unlockAllFields = unlockAllFields;
window.showAllTabsAndSections = showAllTabsAndSections;
window.renameTabsSectionsFields = renameTabsSectionsFields;
window.toggleDropdownMenu = toggleDropdownMenu;
window.closePopup = closePopup;
window.openUrl = openUrl;
window.showDirtyFields = showDirtyFields;
window.closeDirtyFieldsPopup = closeDirtyFieldsPopup;
