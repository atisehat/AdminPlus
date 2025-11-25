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
    // Common D365 container selectors (in priority order)
    var selectors = [
      '#crmContentPanel',
      '#mainContent',
      '#pageContentContainer',
      '[role="main"]',
      'div[data-id="form-container"]',
      '#ContentPanel'
    ];
    
    // Try known D365 selectors first
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        return el;
      }
    }
    
    // Fallback: Find the largest positioned element
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var best = null;
    var bestArea = 0;
    
    document.querySelectorAll('body > *').forEach(function(el) {
      if (!(el instanceof HTMLElement)) return;
      if (el.id === 'MenuPopup') return; // Skip our own sidebar
      
      var rect = el.getBoundingClientRect();
      var area = rect.width * rect.height;
      
      // More lenient criteria - at least 50% of viewport
      if (rect.width < vw * 0.5 || rect.height < vh * 0.5) return;
      
      var style = getComputedStyle(el);
      
      // Accept any element that's positioned or is a direct body child
      if (area > bestArea) {
        bestArea = area;
        best = el;
      }
    });
    
    return best;
  }
  
  // Adjust content positioning for sidebar
  function adjustContentPosition() {
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
    
    // Store original styles only once
    if (!mainContainer.getAttribute('data-adminplus-original-right')) {
      var cs = getComputedStyle(mainContainer);
      mainContainer.setAttribute('data-adminplus-original-right', mainContainer.style.right || '');
      mainContainer.setAttribute('data-adminplus-original-left', mainContainer.style.left || '');
      mainContainer.setAttribute('data-adminplus-original-position', mainContainer.style.position || '');
      mainContainer.setAttribute('data-adminplus-original-boxsizing', mainContainer.style.boxSizing || '');
      mainContainer.setAttribute('data-adminplus-original-width', mainContainer.style.width || '');
      mainContainer.setAttribute('data-adminplus-original-marginright', mainContainer.style.marginRight || '');
      mainContainer.setAttribute('data-adminplus-computed-position', cs.position);
      mainContainer.setAttribute('data-adminplus-target', 'true');
    }
    
    // Apply positioning styles
    var computedPosition = mainContainer.getAttribute('data-adminplus-computed-position');
    
    // If element was static, make it relative
    if (computedPosition === 'static') {
      mainContainer.style.position = 'relative';
    }
    
    mainContainer.style.boxSizing = 'border-box';
    
    // For fixed/absolute positioned elements, use right property
    if (computedPosition === 'fixed' || computedPosition === 'absolute') {
      mainContainer.style.right = sidebarWidth + 'px';
      mainContainer.style.left = '0';
    } else {
      // For relative/static, use margin or width reduction
      var currentWidth = mainContainer.offsetWidth;
      if (currentWidth > sidebarWidth) {
        mainContainer.style.marginRight = sidebarWidth + 'px';
        mainContainer.style.width = 'calc(100% - ' + sidebarWidth + 'px)';
      }
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
    
    // Try to get target element from stored reference first
    var targetElement = window.adminPlusTargetElement;
    
    // Fallback to query if reference doesn't exist or element was removed from DOM
    if (!targetElement || !document.body.contains(targetElement)) {
        targetElement = document.querySelector('[data-adminplus-target="true"]');
    }
    
    if (targetElement && document.body.contains(targetElement)) {
        // Get original styles
        var originalRight = targetElement.getAttribute('data-adminplus-original-right');
        var originalLeft = targetElement.getAttribute('data-adminplus-original-left');
        var originalPosition = targetElement.getAttribute('data-adminplus-original-position');
        var originalBoxSizing = targetElement.getAttribute('data-adminplus-original-boxsizing');
        var originalWidth = targetElement.getAttribute('data-adminplus-original-width');
        var originalMarginRight = targetElement.getAttribute('data-adminplus-original-marginright');
        
        // Restore or remove properties
        if (originalRight !== null) {
            if (originalRight === '') {
                targetElement.style.removeProperty('right');
            } else {
                targetElement.style.right = originalRight;
            }
            targetElement.removeAttribute('data-adminplus-original-right');
        }
        
        if (originalLeft !== null) {
            if (originalLeft === '') {
                targetElement.style.removeProperty('left');
            } else {
                targetElement.style.left = originalLeft;
            }
            targetElement.removeAttribute('data-adminplus-original-left');
        }
        
        if (originalPosition !== null) {
            if (originalPosition === '') {
                targetElement.style.removeProperty('position');
            } else {
                targetElement.style.position = originalPosition;
            }
            targetElement.removeAttribute('data-adminplus-original-position');
        }
        
        if (originalBoxSizing !== null) {
            if (originalBoxSizing === '') {
                targetElement.style.removeProperty('box-sizing');
            } else {
                targetElement.style.boxSizing = originalBoxSizing;
            }
            targetElement.removeAttribute('data-adminplus-original-boxsizing');
        }
        
        if (originalWidth !== null) {
            if (originalWidth === '') {
                targetElement.style.removeProperty('width');
            } else {
                targetElement.style.width = originalWidth;
            }
            targetElement.removeAttribute('data-adminplus-original-width');
        }
        
        if (originalMarginRight !== null) {
            if (originalMarginRight === '') {
                targetElement.style.removeProperty('margin-right');
            } else {
                targetElement.style.marginRight = originalMarginRight;
            }
            targetElement.removeAttribute('data-adminplus-original-marginright');
        }
        
        targetElement.removeAttribute('data-adminplus-target');
        targetElement.removeAttribute('data-adminplus-computed-position');
        
        // Force reflow to ensure styles are updated
        void targetElement.offsetHeight;
    }
    
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
