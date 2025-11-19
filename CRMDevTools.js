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
  
  var sidebarWidth = 420;
  
  var popupHtml = `  
    <style>
	/* Sidebar overlay backdrop */
	#MenuPopupBackdrop {
	    position: fixed !important;
	    top: 0 !important;
	    left: 0 !important;
	    width: 100% !important;
	    height: 100vh !important;
	    background-color: rgba(0, 0, 0, 0.3);
	    z-index: 999998 !important;
	    transition: opacity 0.3s ease;
	}
	
	/* Main sidebar container */
	#MenuPopup {
	    position: fixed !important;
	    right: 0 !important;
	    top: 0 !important;
	    bottom: 0 !important;
	    width: ${sidebarWidth}px !important;
	    height: 100vh !important;
	    z-index: 999999 !important;
	    margin: 0 !important;
	    padding: 0 !important;
	    animation: slideIn 0.3s ease-out;
	}
	
	@keyframes slideIn {
	    from { transform: translateX(100%); }
	    to { transform: translateX(0); }
	}
	
	/* Sidebar content panel */
	#MenuPopup .popup { 
	    position: relative !important;
	    width: 100% !important;
	    height: 100% !important;
	    background-color: #f9f9f9; 
	    border-left: 3px solid #102e55;
	    box-shadow: -2px 0 15px rgba(0, 0, 0, 0.3); 
	    overflow-y: auto; 
	    overflow-x: hidden;
	    margin: 0 !important;
	    padding: 0 !important;
	}
	
	/* Button container and styles */
	.button-container { 
	    padding: 20px; 
	    width: 380px; 
	}
	
	.popup button { 
	    display: block; 
	    width: 100%; 
	    margin-bottom: 10px; 
	    padding: 10px; 
	    background-color: #102e55; 
	    color: white; 
	    border: none; 
	    border-radius: 20px; 
	    cursor: pointer; 
	    transition: all 0.3s ease; 
	    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); 
	}
	
	.popup button:hover { 
	    background-color: #3c6690; 
	    transform: translateY(-2px); 
	    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.25); 
	}
	
	.popup button:active { 
	    transform: translateY(0); 
	    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); 
	}
	
	.button-row { 
	    display: flex; 
	    justify-content: space-between; 
	    flex-direction: row; 
	    width: 100%; 
	}
	
	.button-row button { 
	    width: calc(50% - 5px); 
	}
	
	.dropdown button { 
	    width: 100%; 
	}
	
	.button-row .full-width { 
	    width: 100%; 
	}
	
	.dropdown-row { 
	    display: flex; 
	    justify-content: space-between; 
	    flex-direction: row; 
	    width: 100%; 
	}
	
	.dropdown { 
	    position: relative; 
	    display: inline-block; 
	    width: calc(50% - 5px); 
	}
	
	.dropdown-content { 
	    display: none; 
	    position: absolute; 
	    min-width: 100%; 
	    z-index: 1; 
	}
	
	.dropdown-content button { 
	    display: block; 
	    background-color: white; 
	    color: black; 
	    padding: 5px; 
	    text-align: center; 
	    border: none; 
	    width: 100%; 
	}
	
	.popup button.close-btn { 
	    margin-top: 10px; 
	    font-size: 15px; 
	}
	
	.build-badge { 
	    position: absolute; 
	    top: 12px; 
	    right: 15px; 
	    background-color: rgba(255, 255, 255, 0.2); 
	    color: white; 
	    padding: 3px 10px; 
	    border-radius: 12px; 
	    font-size: 11px; 
	    font-weight: normal; 
	}
	
	/* Adjust page content to make room for sidebar */
	body.adminplus-sidebar-open {
	    margin-right: ${sidebarWidth}px !important;
	    transition: margin-right 0.3s ease;
	}
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
  
  // Create backdrop
  var backdrop = document.createElement('div');
  backdrop.id = 'MenuPopupBackdrop';
  backdrop.onclick = closePopup;
  document.body.appendChild(backdrop);
  
  // Create sidebar container
  var newContainer = document.createElement('div');
  newContainer.id = 'MenuPopup';
  newContainer.innerHTML = popupHtml;
  document.body.appendChild(newContainer);
  
  // Add class to body to shift content
  document.body.classList.add('adminplus-sidebar-open');
  
  // Debug log
  console.log('%c✅ AdminPlus Sidebar Loaded', 'color: #102e55; font-weight: bold; font-size: 14px;');
  console.log('📏 Sidebar Width:', sidebarWidth + 'px');
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
    
    // Remove body class
    document.body.classList.remove('adminplus-sidebar-open');
    
    // Remove backdrop
    var backdrop = document.getElementById('MenuPopupBackdrop');
    if (backdrop) {
        backdrop.remove();
    }
    
    // Remove MenuPopup
    var menuPopup = document.getElementById('MenuPopup');
    if (menuPopup) {
        menuPopup.remove();
    }
    
    closeSubPopups();
    
    console.log('%c❌ AdminPlus Sidebar Closed', 'color: #666; font-weight: bold; font-size: 12px;');
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
