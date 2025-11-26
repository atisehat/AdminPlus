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
    loadScript('tools/entityAutomations.js');
    loadScript('tools/fieldsControl.js');
    loadScript('tools/dirtyFields.js');
    loadScript('tools/copySecurity.js');
    loadScript('tools/assignSecurity.js');
    loadScript('tools/securityOperations.js');
    loadScript('tools/dateCalculator.js');
    loadScript('tools/openRecord.js');
    loadScript('tools/openWebApi.js');
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

// Helper function to check if running within Dynamics 365 (not Power Pages or other contexts)
function isD365Context() {
  try {
    // Check if Xrm exists
    if (typeof Xrm === 'undefined' || !Xrm.Utility || !Xrm.Utility.getGlobalContext) {
      return false;
    }
    
    // Check if we have access to Xrm.Page (specific to D365 forms/views)
    // Power Pages has Xrm but not Xrm.Page or other D365-specific APIs
    if (typeof Xrm.Page === 'undefined' || !Xrm.Page.context) {
      return false;
    }
    
    // Additional check: Ensure we can get client URL (D365 specific)
    var clientUrl = Xrm.Page.context.getClientUrl();
    if (!clientUrl) {
      return false;
    }
    
    // Check that URL contains dynamics.com or typical D365 patterns
    // Power Pages URLs are different (powerappsportals.com, microsoftcrmportals.com, etc.)
    var url = window.location.href.toLowerCase();
    var isD365Url = url.includes('dynamics.com') || 
                    url.includes('crm.dynamics.com') ||
                    url.includes('/main.aspx') ||
                    url.includes('/userdefined/') ||
                    (clientUrl && (clientUrl.includes('dynamics.com') || clientUrl.includes('.crm')));
    
    return isD365Url;
  } catch (error) {
    return false;
  }
}

// Helper function to check if user has System Administrator role
function checkSystemAdministratorRole() {
  try {
    var roles = Xrm.Utility.getGlobalContext().userSettings.roles;
    for (var i = 0; i < roles.getLength(); i++) {
      var role = roles.get(i);
      if (role.name === "System Administrator") {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

function openPopup() {
  // Check if running within Dynamics 365
  if (!isD365Context()) {
    // Wait a moment for showToast to be available, then show message
    if (typeof showToast === 'function') {
      showToast('AdminPlus can only run inside Dynamics 365. Please open this tool from within your D365 environment.', 'warning', 4000);
    } else {
      // If showToast not loaded yet, wait and try again
      setTimeout(function() {
        if (typeof showToast === 'function') {
          showToast('AdminPlus can only run inside Dynamics 365. Please open this tool from within your D365 environment.', 'warning', 4000);
        }
      }, 100);
    }
    return;
  }
  
  // Toggle: Close sidebar if already open
  if (document.getElementById('MenuPopup')) {
    closePopup();
    return;
  }
  
  closeSubPopups();
  
  var popupHtml = `
    <div class="popup">
	<div class="commonPopup-header" onclick="closePopup();" style="cursor: pointer;" title="Click to close">	            
	    <span class="header-text">Admin<sup>+</sup></span>
	    <span class="header-close">✖</span>
	</div>
	<div class="button-container">
	  <div class="app-grid">
	    <button onclick="openUrl('advanceFind');" class="app-button" title="Advanced Find">
	      <span class="app-icon">🕵️</span>
	    </button>
	    <button onclick="setTimeout(fetchEntityFields, 0);" class="app-button" title="Entity Info">
	      <span class="app-icon">📋</span>
	    </button>
	    <button onclick="openRecord();" class="app-button" title="Open Record">
	      <span class="app-icon">🔍</span>
	    </button>
	    <button onclick="cloneRecord();" class="app-button" title="Clone Record">
	      <span class="app-icon">🧬</span>
	    </button>
	    <button onclick="showDirtyFields();" class="app-button" title="Dirty Fields">
	      <span class="app-icon">✏️</span>
	    </button>
	    <button onclick="showAllTabsAndSections();" class="app-button" title="Show Hidden Items">
	      <span class="app-icon">👁️</span>
	    </button>
	    <button onclick="renameTabsSectionsFields();" class="app-button" title="Logical Names">
	      <span class="app-icon">🏷️</span>
	    </button>
	    <button onclick="unlockAllFields();" class="app-button" title="Unlock Fields">
	      <span class="app-icon">🔓</span>
	    </button>
	    <button onclick="showEntityAutomations();" class="app-button" title="Table Automations">
	      <span class="app-icon">🤖</span>
	    </button>
	    <button onclick="openWebApi();" class="app-button" title="Open Web API Endpoint">
	      <span class="app-icon">🌐</span>
	    </button>
	    <button onclick="editSecurity();" class="app-button" title="Assign Security">
	      <span class="app-icon">🔐</span>
	    </button>
	    <button onclick="copySecurity();" class="app-button" title="Copy Security">
	      <span class="app-icon">🛡️</span>
	    </button>
	    <button onclick="dateCalc();" class="app-button" title="Date Calculator">
	      <span class="app-icon">📅</span>
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
  var sidebarWidth = 60;
  
  // Create sidebar container
  var newContainer = document.createElement('div');
  newContainer.id = 'MenuPopup';
  newContainer.innerHTML = popupHtml;
  document.body.appendChild(newContainer);
  
  // Find all D365 containers that need to be adjusted
  function findD365Containers() {
    var containers = [];
    var vw = window.innerWidth;
    
    // Priority selectors for D365 containers (in order of specificity)
    // We want to target the top-level containers only, not nested ones
    var prioritySelectors = [
      // Shell/App level containers (highest priority - typically contain everything)
      'div[id*="shell-container"]',
      'div[data-id="AppLandingPage"]',
      
      // Main app container
      'div[id*="ApplicationShell"]',
      'div[id*="app-host"]',
      
      // Navigation/Header (should be adjusted independently)
      'header[role="banner"]',
      'div[id*="navbar"]',
      'div[id*="navigation"]',
      'nav[role="navigation"]'
    ];
    
    var processedAncestors = new Set();
    
    // Find containers using priority selectors
    prioritySelectors.forEach(function(selector) {
      try {
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          if (!el || containers.includes(el)) return;
          
          var rect = el.getBoundingClientRect();
          // Include if it spans most of the viewport width and isn't already included
          if (rect.width >= vw * 0.8) {
            // Check if this element is a child of an already selected container
            var isNested = false;
            for (var i = 0; i < containers.length; i++) {
              if (containers[i].contains(el)) {
                isNested = true;
                break;
              }
            }
            
            // Only add if not nested in another container we're already targeting
            if (!isNested) {
              // Remove any containers that are children of this element
              containers = containers.filter(function(existing) {
                return !el.contains(existing);
              });
              containers.push(el);
            }
          }
        });
      } catch (e) {
        // Skip invalid selectors
      }
    });
    
    // If no containers found, target body's direct children that are large enough
    if (containers.length === 0) {
      document.querySelectorAll('body > *').forEach(function(el) {
        if (!(el instanceof HTMLElement)) return;
        if (el.id === 'MenuPopup') return; // Skip our sidebar
        
        var rect = el.getBoundingClientRect();
        var style = getComputedStyle(el);
        
        // Look for containers that span most of viewport width
        if (rect.width >= vw * 0.8 && 
            ['fixed', 'absolute', 'relative'].includes(style.position)) {
          containers.push(el);
        }
      });
    }
    
    return containers;
  }
  
  // Adjust content positioning for sidebar
  function adjustContentPosition() {
    // Try to get existing targets first
    var existingContainers = window.adminPlusTargetElements;
    
    // If not stored yet, find them
    if (!existingContainers || existingContainers.length === 0) {
      existingContainers = findD365Containers();
      
      // Store globally for reliable access during close
      window.adminPlusTargetElements = existingContainers;
    }
    
    // Apply positioning to all containers
    existingContainers.forEach(function(container) {
      if (!container || !document.body.contains(container)) return;
      
      // Store original styles only once
      if (!container.getAttribute('data-adminplus-original-right')) {
        var cs = getComputedStyle(container);
        container.setAttribute('data-adminplus-original-right', container.style.right || '');
        container.setAttribute('data-adminplus-original-left', container.style.left || '');
        container.setAttribute('data-adminplus-original-position', container.style.position || '');
        container.setAttribute('data-adminplus-original-boxsizing', container.style.boxSizing || '');
        container.setAttribute('data-adminplus-original-width', container.style.width || '');
        container.setAttribute('data-adminplus-computed-position', cs.position);
        container.setAttribute('data-adminplus-target', 'true');
      }
      
      var computedPosition = container.getAttribute('data-adminplus-computed-position');
      
      // Apply positioning based on element type
      container.style.boxSizing = 'border-box';
      
      // For fixed/absolute positioned elements - adjust using right property
      if (computedPosition === 'fixed' || computedPosition === 'absolute') {
        // Keep original position type
        if (computedPosition === 'static') {
          container.style.position = 'relative';
        }
        
        container.style.right = sidebarWidth + 'px';
        
        // Only set left if it wasn't explicitly set
        var originalLeft = container.getAttribute('data-adminplus-original-left');
        if (!originalLeft || originalLeft === '' || originalLeft === 'auto') {
          container.style.left = '0';
        }
      } else {
        // For relative/static elements - don't change position, just reduce effective width
        // by adding a right margin instead of changing width directly
        container.style.marginRight = sidebarWidth + 'px';
      }
    });
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
    
    // Try to get target elements from stored reference first
    var targetElements = window.adminPlusTargetElements;
    
    // Fallback to query if reference doesn't exist
    if (!targetElements || targetElements.length === 0) {
        targetElements = Array.from(document.querySelectorAll('[data-adminplus-target="true"]'));
    }
    
    // Restore all target elements
    targetElements.forEach(function(targetElement) {
        if (!targetElement || !document.body.contains(targetElement)) return;
        
        // Get original styles
        var originalRight = targetElement.getAttribute('data-adminplus-original-right');
        var originalLeft = targetElement.getAttribute('data-adminplus-original-left');
        var originalPosition = targetElement.getAttribute('data-adminplus-original-position');
        var originalBoxSizing = targetElement.getAttribute('data-adminplus-original-boxsizing');
        var originalWidth = targetElement.getAttribute('data-adminplus-original-width');
        
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
        
        // Remove margin-right if it was added
        targetElement.style.removeProperty('margin-right');
        
        // Clean up attributes
        targetElement.removeAttribute('data-adminplus-target');
        targetElement.removeAttribute('data-adminplus-computed-position');
        
        // Force reflow to ensure styles are updated
        void targetElement.offsetHeight;
    });
    
    // Clean up global reference
    window.adminPlusTargetElements = null;
    
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
window.isD365Context = isD365Context;
window.checkSystemAdministratorRole = checkSystemAdministratorRole;
window.fetchEntityFields = fetchEntityFields;
window.showEntityAutomations = showEntityAutomations;
window.unlockAllFields = unlockAllFields;
window.showAllTabsAndSections = showAllTabsAndSections;
window.renameTabsSectionsFields = renameTabsSectionsFields;
window.closePopup = closePopup;
window.openUrl = openUrl;
window.showDirtyFields = showDirtyFields;
window.showToast = showToast;
window.openRecord = openRecord;
window.openWebApi = openWebApi;
window.cloneRecord = cloneRecord;
window.commandChecker = commandChecker;
window.performanceDiagnostics = performanceDiagnostics;
