// ============================================================================
// AdminPlus - D365 CE Admin Tools
// ============================================================================

const baseUrl = 'https://atisehat.github.io/AdminPlus/';
const cacheBuster = '?v=' + new Date().getTime(); // Force refresh - dateCalc fix

// ============================================================================
// Resource Loading
// ============================================================================

function loadCSS(href) {
  const link = document.createElement('link');
  link.href = baseUrl + href + cacheBuster;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  document.head.appendChild(link); 
}

function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = baseUrl + src + cacheBuster;
  script.onload = callback;
  document.head.appendChild(script);
}

// Load stylesheets
loadCSS('styles/common.css');
loadCSS('styles/tools.css');
loadCSS('styles/sidebar.css');

// Load utility scripts first (with proper sequencing)
let utilScriptsLoaded = 0;
const totalUtilScripts = 2;

function onUtilScriptLoaded() {
  utilScriptsLoaded++;
  if (utilScriptsLoaded === totalUtilScripts) {
    // All utilities loaded, now load tool scripts
    loadScript('tools/advancedFind.js');
    loadScript('tools/entityInfo.js');
    loadScript('tools/fieldsControl.js');
    loadScript('tools/dirtyFields.js');
    loadScript('tools/copySecurity.js');
    loadScript('tools/assignSecurity.js');
    loadScript('tools/securityOperations.js');
    loadScript('tools/dateCalculator.js');
    loadScript('tools/openRecord.js');
    loadScript('tools/cloneRecord.js');
    loadScript('tools/commandChecker.js');
    loadScript('tools/performanceDiagnostics.js');
  }
}

loadScript('utils/api.js', onUtilScriptLoaded);
loadScript('utils/ui.js', onUtilScriptLoaded);

// ============================================================================
// Sidebar Management
// ============================================================================

function openPopup() {
  // Toggle: Close sidebar if already open
  if (document.getElementById('MenuPopup')) {
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
	<div class="commonPopup-header" onclick="closePopup();" style="cursor: pointer;" title="Click to close">	            
	    <span class="header-text">Admin<sup>+</sup></span>
	    <span class="header-close">✖</span>
	</div>
	<div class="button-container">
	  <div class="app-grid">
	    <button onclick="closePopup(); openUrl('advanceFind');" class="app-button" title="Advanced Find">
	      <span class="app-icon">🔍</span>
	    </button>
	    <button onclick="setTimeout(fetchEntityFields, 0);" class="app-button" title="Entity Info">
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
	    <button onclick="showDirtyFields();" class="app-button" title="Dirty Fields">
	      <span class="app-icon">✏️</span>
	    </button>
	    <button onclick="editSecurity();" class="app-button" title="Assign Security">
	      <span class="app-icon">🔐</span>
	    </button>
	    <button onclick="copySecurity();" class="app-button" title="Copy Security">
	      <span class="app-icon">📄</span>
	    </button>
	    <button onclick="dateCalc();" class="app-button" title="Date Calculator">
	      <span class="app-icon">📅</span>
	    </button>
	    <button onclick="openRecord();" class="app-button" title="Open Record">
	      <span class="app-icon">🔗</span>
	    </button>
	    <button onclick="cloneRecord();" class="app-button" title="Clone Record">
	      <span class="app-icon">🔄</span>
	    </button>
	    <button onclick="commandChecker();" class="app-button" title="Command Checker">
	      <span class="app-icon">🐛</span>
	    </button>
	    <button onclick="performanceDiagnostics();" class="app-button" title="Performance Diagnostics">
	      <span class="app-icon">⚡</span>
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
    // Try common D365 container selectors first
    var selectors = [
      '#AppContainer',
      '[data-id="AppContainer"]',
      '#appContainer',
      'div[role="main"]',
      'div[data-id="mainContent"]',
      '#crmContentPanel',
      '#mainContent',
      'div[data-lp-id="MscrmControls.Grid.ReadOnlyGrid"]'
    ];
    
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    
    // Fallback: find largest positioned element
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
    // Function to apply positioning styles
    function applyPositioning(element) {
      if (!element || !document.body.contains(element)) return false;
      
      // Store original styles only once
      if (!element.getAttribute('data-adminplus-original-right')) {
        element.setAttribute('data-adminplus-original-right', element.style.right || '');
        element.setAttribute('data-adminplus-original-left', element.style.left || '');
        element.setAttribute('data-adminplus-original-position', element.style.position || '');
        element.setAttribute('data-adminplus-original-boxsizing', element.style.boxSizing || '');
        element.setAttribute('data-adminplus-target', 'true');
      }
      
      var cs = getComputedStyle(element);
      if (cs.position === 'static') {
        element.style.setProperty('position', 'relative', 'important');
      }
      
      element.style.setProperty('box-sizing', 'border-box', 'important');
      element.style.setProperty('left', '0', 'important');
      element.style.setProperty('right', sidebarWidth + 'px', 'important');
      
      return true;
    }
    
    // Try to get existing target first
    var mainContainer = window.adminPlusTargetElement;
    
    // If not stored yet, find it
    if (!mainContainer || !document.body.contains(mainContainer)) {
      mainContainer = findMainContainer();
      
      if (!mainContainer) {
        mainContainer = document.body;
      }
      
      // Store globally for reliable access during close
      window.adminPlusTargetElement = mainContainer;
    }
    
    // Apply to main container
    applyPositioning(mainContainer);
    
    // Also apply to body as a fallback (helps with different D365 configurations)
    if (mainContainer !== document.body) {
      applyPositioning(document.body);
    }
  }
  
  document.body.classList.add('adminplus-sidebar-open');
  adjustContentPosition();
  
  window.adminPlusResizeHandler = function() {
    if (document.getElementById('MenuPopup')) {
      adjustContentPosition();
    }
  };
  window.addEventListener('resize', window.adminPlusResizeHandler);
}

function closePopup() {
    document.body.classList.remove('adminplus-sidebar-open');
    
    // Function to restore element styles
    function restoreElement(element) {
        if (!element || !document.body.contains(element)) return;
        
        // Get original styles
        var originalRight = element.getAttribute('data-adminplus-original-right');
        var originalLeft = element.getAttribute('data-adminplus-original-left');
        var originalPosition = element.getAttribute('data-adminplus-original-position');
        var originalBoxSizing = element.getAttribute('data-adminplus-original-boxsizing');
        
        // Restore or remove properties
        if (originalRight !== null) {
            if (originalRight === '') {
                element.style.removeProperty('right');
            } else {
                element.style.right = originalRight;
            }
            element.removeAttribute('data-adminplus-original-right');
        }
        
        if (originalLeft !== null) {
            if (originalLeft === '') {
                element.style.removeProperty('left');
            } else {
                element.style.left = originalLeft;
            }
            element.removeAttribute('data-adminplus-original-left');
        }
        
        if (originalPosition !== null) {
            if (originalPosition === '') {
                element.style.removeProperty('position');
            } else {
                element.style.position = originalPosition;
            }
            element.removeAttribute('data-adminplus-original-position');
        }
        
        if (originalBoxSizing !== null) {
            if (originalBoxSizing === '') {
                element.style.removeProperty('box-sizing');
            } else {
                element.style.boxSizing = originalBoxSizing;
            }
            element.removeAttribute('data-adminplus-original-boxsizing');
        }
        
        element.removeAttribute('data-adminplus-target');
        
        // Force reflow to ensure styles are updated
        void element.offsetHeight;
    }
    
    // Restore all elements that were modified
    var targetElements = document.querySelectorAll('[data-adminplus-target="true"]');
    targetElements.forEach(function(el) {
        restoreElement(el);
    });
    
    // Clean up global reference
    window.adminPlusTargetElement = null;
    
    // Clean up event listener
    if (window.adminPlusResizeHandler) {
        window.removeEventListener('resize', window.adminPlusResizeHandler);
        window.adminPlusResizeHandler = null;
    }
    
    // Remove sidebar
    var menuPopup = document.getElementById('MenuPopup');
    if (menuPopup) {
        menuPopup.remove();
    }
    
    closeSubPopups();
}

function closeSubPopups() { 
    const popupClasses = ['.commonPopup', '.assignPopup'];    
    popupClasses.forEach((popupClass) => {
        const popups = document.querySelectorAll(popupClass);
        popups.forEach((popup) => {
            popup.remove();
        });
    });
}

// ============================================================================
// Global Exports
// ============================================================================
window.fetchEntityFields = fetchEntityFields;
window.unlockAllFields = unlockAllFields;
window.showAllTabsAndSections = showAllTabsAndSections;
window.renameTabsSectionsFields = renameTabsSectionsFields;
window.closePopup = closePopup;
window.openUrl = openUrl;
window.showDirtyFields = showDirtyFields;
window.showToast = showToast;
window.openRecord = openRecord;
window.cloneRecord = cloneRecord;
window.commandChecker = commandChecker;
window.performanceDiagnostics = performanceDiagnostics;
