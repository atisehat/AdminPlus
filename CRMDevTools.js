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
loadCSS('styles/sidebar.css');

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
   </div>
  `;	  
  
  // Sidebar configuration
  var sidebarWidth = 420;
  
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
  
  // Calculate and apply content positioning
  function adjustContentPosition() {
    var viewportWidth = window.innerWidth;
    var contentWidth = viewportWidth - sidebarWidth;
    
    // Store original values for restoration (only once)
    if (!document.body.getAttribute('data-original-margin-right')) {
      document.body.setAttribute('data-original-margin-right', document.body.style.marginRight || '');
      document.body.setAttribute('data-original-width', document.body.style.width || '');
      document.body.setAttribute('data-original-max-width', document.body.style.maxWidth || '');
      document.body.setAttribute('data-original-overflow-x', document.body.style.overflowX || '');
    }
    
    // Push content to the left by exact sidebar width using margin-right
    document.body.style.setProperty('margin-right', sidebarWidth + 'px', 'important');
    
    // Also set width to prevent content from expanding
    document.body.style.setProperty('width', contentWidth + 'px', 'important');
    document.body.style.setProperty('max-width', contentWidth + 'px', 'important');
    
    // Prevent horizontal scrolling
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    
    console.log('📐 Viewport Width:', viewportWidth + 'px');
    console.log('📏 Sidebar Width:', sidebarWidth + 'px');
    console.log('✅ Content Width:', contentWidth + 'px');
    console.log('↔️  Content pushed left by:', sidebarWidth + 'px');
  }
  
  // Apply initial positioning calculation
  document.body.classList.add('adminplus-sidebar-open');
  adjustContentPosition();
  
  // Handle window resize to maintain accurate calculations
  window.adminPlusResizeHandler = function() {
    if (document.getElementById('MenuPopup')) {
      adjustContentPosition();
    }
  };
  window.addEventListener('resize', window.adminPlusResizeHandler);
  
  // Debug log
  console.log('%c✅ AdminPlus Sidebar Loaded', 'color: #102e55; font-weight: bold; font-size: 14px;');
}
function clearCacheFunction() {
    location.reload(true); // Forces a hard reload to bypassing cache.
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
    // Remove body class
    document.body.classList.remove('adminplus-sidebar-open');
    
    // Restore all original body styles
    var originalMarginRight = document.body.getAttribute('data-original-margin-right');
    var originalWidth = document.body.getAttribute('data-original-width');
    var originalMaxWidth = document.body.getAttribute('data-original-max-width');
    var originalOverflowX = document.body.getAttribute('data-original-overflow-x');
    
    if (originalMarginRight !== null) {
        if (originalMarginRight === '') {
            document.body.style.removeProperty('margin-right');
        } else {
            document.body.style.setProperty('margin-right', originalMarginRight, 'important');
        }
        document.body.removeAttribute('data-original-margin-right');
    }
    
    if (originalWidth !== null) {
        if (originalWidth === '') {
            document.body.style.removeProperty('width');
        } else {
            document.body.style.setProperty('width', originalWidth, 'important');
        }
        document.body.removeAttribute('data-original-width');
    }
    
    if (originalMaxWidth !== null) {
        if (originalMaxWidth === '') {
            document.body.style.removeProperty('max-width');
        } else {
            document.body.style.setProperty('max-width', originalMaxWidth, 'important');
        }
        document.body.removeAttribute('data-original-max-width');
    }
    
    if (originalOverflowX !== null) {
        if (originalOverflowX === '') {
            document.body.style.removeProperty('overflow-x');
        } else {
            document.body.style.setProperty('overflow-x', originalOverflowX, 'important');
        }
        document.body.removeAttribute('data-original-overflow-x');
    }
    
    // Remove resize handler
    if (window.adminPlusResizeHandler) {
        window.removeEventListener('resize', window.adminPlusResizeHandler);
        window.adminPlusResizeHandler = null;
    }
    
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
