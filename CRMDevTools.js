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
  // Toggle: Close sidebar if already open
  if (document.getElementById('MenuPopup')) {
    console.log('%c✅ Closing AdminPlus', 'color: #4da6ff; font-weight: bold;');
    closePopup();
    return;
  }
  
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
  
  var popupHtml = `
    <div class="popup">
	<div class="commonPopup-header">	            
	    Admin<sup>+</sup>
	</div>
	<div class="button-container">
	  <div class="app-grid">
	    <button onclick="closePopup(); openUrl('advanceFind');" class="app-button" title="Advanced Find">
	      <span class="app-icon">🔍</span>
	    </button>
	    <button onclick="closePopup(); setTimeout(fetchEntityFields, 0);" class="app-button" title="Entity Info">
	      <span class="app-icon">📋</span>
	    </button>
	    <button onclick="showAllTabsAndSections();" class="app-button" title="Show Hidden">
	      <span class="app-icon">👁️</span>
	    </button>
	    <button onclick="renameTabsSectionsFields();" class="app-button" title="Logical Names">
	      <span class="app-icon">🏷️</span>
	    </button>
	    <button onclick="unlockAllFields();" class="app-button" title="Unlock Fields">
	      <span class="app-icon">🔓</span>
	    </button>
	    <button onclick="closePopup(); showDirtyFields();" class="app-button" title="Dirty Fields">
	      <span class="app-icon">✏️</span>
	    </button>
	    <button onclick="closePopup(); editSecurity();" class="app-button" title="Assign Security">
	      <span class="app-icon">🔐</span>
	    </button>
	    <button onclick="closePopup(); copySecurity();" class="app-button" title="Copy Security">
	      <span class="app-icon">📄</span>
	    </button>
	    <button onclick="closePopup(); dateCalc();" class="app-button" title="Date Calculator">
	      <span class="app-icon">📅</span>
	    </button>
	    <button onclick="openRestBuilder(getOrgUrl());" class="app-button" title="REST Builder">
	      <span class="app-icon">🔨</span>
	    </button>
	    <button onclick="closePopup(); openUrl('userProvision');" class="app-button" title="User Provision">
	      <span class="app-icon">👥</span>
	    </button>
	  </div>
	</div>
   </div>
  `;	  
  
  // Sidebar configuration
  var sidebarWidth = 80;
  
  // Create sidebar container
  var newContainer = document.createElement('div');
  newContainer.id = 'MenuPopup';
  newContainer.innerHTML = popupHtml;
  document.body.appendChild(newContainer);
  
  // Find the main D365 container automatically
  function findMainContainer() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var best = null;
    var bestArea = 0;
    
    document.querySelectorAll('body *').forEach(function(el) {
      if (!(el instanceof HTMLElement)) return;
      
      var rect = el.getBoundingClientRect();
      var area = rect.width * rect.height;
      
      if (rect.width < vw * 0.7 || rect.height < vh * 0.7) return;
      
      var style = getComputedStyle(el);
      if (!['fixed', 'absolute', 'relative'].includes(style.position)) return;
      
      if (area > bestArea) {
        bestArea = area;
        best = el;
      }
    });
    
    return best;
  }
  
  // Adjust content positioning for sidebar
  function adjustContentPosition() {
    var mainContainer = findMainContainer();
    
    if (!mainContainer) {
      mainContainer = document.body;
    }
    
    if (!mainContainer.getAttribute('data-adminplus-original-right')) {
      mainContainer.setAttribute('data-adminplus-original-right', mainContainer.style.right || '');
      mainContainer.setAttribute('data-adminplus-original-left', mainContainer.style.left || '');
      mainContainer.setAttribute('data-adminplus-original-position', mainContainer.style.position || '');
      mainContainer.setAttribute('data-adminplus-original-boxsizing', mainContainer.style.boxSizing || '');
      mainContainer.setAttribute('data-adminplus-target', 'true');
    }
    
    var cs = getComputedStyle(mainContainer);
    if (cs.position === 'static') {
      mainContainer.style.position = 'relative';
    }
    
    mainContainer.style.boxSizing = 'border-box';
    mainContainer.style.left = '0';
    mainContainer.style.right = sidebarWidth + 'px';
  }
  
  document.body.classList.add('adminplus-sidebar-open');
  adjustContentPosition();
  
  window.adminPlusResizeHandler = function() {
    if (document.getElementById('MenuPopup')) {
      adjustContentPosition();
    }
  };
  window.addEventListener('resize', window.adminPlusResizeHandler);
  
  console.log('%c✅ AdminPlus Loaded', 'color: #102e55; font-weight: bold;');
}
function clearCacheFunction() {
    location.reload(true); // Forces a hard reload to bypassing cache.
}

function closePopup() {
    document.body.classList.remove('adminplus-sidebar-open');
    
    var targetElement = document.querySelector('[data-adminplus-target="true"]');
    
    if (targetElement) {
        var originalRight = targetElement.getAttribute('data-adminplus-original-right');
        var originalLeft = targetElement.getAttribute('data-adminplus-original-left');
        var originalPosition = targetElement.getAttribute('data-adminplus-original-position');
        var originalBoxSizing = targetElement.getAttribute('data-adminplus-original-boxsizing');
        
        if (originalRight !== null) {
            originalRight === '' ? targetElement.style.removeProperty('right') : targetElement.style.right = originalRight;
            targetElement.removeAttribute('data-adminplus-original-right');
        }
        
        if (originalLeft !== null) {
            originalLeft === '' ? targetElement.style.removeProperty('left') : targetElement.style.left = originalLeft;
            targetElement.removeAttribute('data-adminplus-original-left');
        }
        
        if (originalPosition !== null) {
            originalPosition === '' ? targetElement.style.removeProperty('position') : targetElement.style.position = originalPosition;
            targetElement.removeAttribute('data-adminplus-original-position');
        }
        
        if (originalBoxSizing !== null) {
            originalBoxSizing === '' ? targetElement.style.removeProperty('box-sizing') : targetElement.style.boxSizing = originalBoxSizing;
            targetElement.removeAttribute('data-adminplus-original-boxsizing');
        }
        
        targetElement.removeAttribute('data-adminplus-target');
    }
    
    if (window.adminPlusResizeHandler) {
        window.removeEventListener('resize', window.adminPlusResizeHandler);
        window.adminPlusResizeHandler = null;
    }
    
    var menuPopup = document.getElementById('MenuPopup');
    if (menuPopup) menuPopup.remove();
    
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
window.closePopup = closePopup;
window.openUrl = openUrl;
window.showDirtyFields = showDirtyFields;
window.closeDirtyFieldsPopup = closeDirtyFieldsPopup;
