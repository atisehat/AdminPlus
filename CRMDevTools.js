// ── Impersonation Early Patch ──
// This runs at the very top of CRMDevTools.js — before D365 makes any API
// calls — so the MSCRMCallerID header is injected from the first request.
(function () {
	try {
		var raw = localStorage.getItem('adminplus_impersonate_session');
		if (!raw) return;
		var data = JSON.parse(raw);
		if (!data || !data.id) return;
		var uid = data.id;
		var API = '/api/data/';
		var HDR = 'MSCRMCallerID';
		if (window.__adminplusImpersonating) return;
		window.__adminplusImpersonating = true;
		var oFetch = window.fetch;
		window.__adminplusOrigFetch = oFetch;
		window.fetch = function (input, init) {
			var url = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
			if (!url || url.indexOf(API) === -1) return oFetch.call(window, input, init);
			var opts = init ? Object.assign({}, init) : {};
			var hdrs = {};
			if (opts.headers instanceof Headers) { opts.headers.forEach(function (v, k) { hdrs[k] = v; }); }
			else if (opts.headers) { Object.assign(hdrs, opts.headers); }
			hdrs[HDR] = uid;
			opts.headers = hdrs;
			return oFetch.call(window, input, opts);
		};
		var oOpen = XMLHttpRequest.prototype.open;
		var oSend = XMLHttpRequest.prototype.send;
		window.__adminplusOrigXHROpen = oOpen;
		window.__adminplusOrigXHRSend = oSend;
		XMLHttpRequest.prototype.open = function () {
			this.__xhrUrl = typeof arguments[1] === 'string' ? arguments[1] : '';
			return oOpen.apply(this, arguments);
		};
		XMLHttpRequest.prototype.send = function () {
			if (this.__xhrUrl && this.__xhrUrl.indexOf(API) !== -1) {
				try { this.setRequestHeader(HDR, uid); } catch (e) {}
			}
			return oSend.apply(this, arguments);
		};
	} catch (e) {}
})();

const baseUrl = 'https://atisehat.github.io/AdminPlus/';
const cacheBuster = '?v=' + new Date().getTime(); // Force refresh - dateCalc test version added


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

// Load styles
loadCSS('styles/common.css');
loadCSS('styles/tools.css');
loadCSS('styles/sidebar.css');

// Load util
let utilScriptsLoaded = 0;
const totalUtilScripts = 2;

function onUtilScriptLoaded() {
  utilScriptsLoaded++;
  if (utilScriptsLoaded === totalUtilScripts) {    
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
    loadScript('tools/personaSwitcher.js');
  }
}

loadScript('utils/api.js', onUtilScriptLoaded);
loadScript('utils/ui.js', onUtilScriptLoaded);

// Helper function for D365
function isD365Context() {
  try {    
    if (typeof Xrm === 'undefined' || !Xrm.Utility || !Xrm.Utility.getGlobalContext) {
      return false;
    }
        
    if (typeof Xrm.Page === 'undefined' || !Xrm.Page.context) {
      return false;
    }
        
    var clientUrl = Xrm.Page.context.getClientUrl();
    if (!clientUrl) {
      return false;
    }
        
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

// Helper function for Sys Admin
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
  if (!isD365Context()) {    
    if (typeof showToast === 'function') {
      showToast('DevPlus can only run inside Dynamics 365. Please open this tool from within your D365 environment.', 'warning', 4000);
    } else {      
      setTimeout(function() {
        if (typeof showToast === 'function') {
          showToast('DevPlus can only run inside Dynamics 365. Please open this tool from within your D365 environment.', 'warning', 4000);
        }
      }, 100);
    }
    return;
  }  
  
  if (document.getElementById('MenuPopup')) {
    closePopup();
    return;
  }
  
  closeSubPopups();
  
  var popupHtml = `
    <div class="popup">
	<div class="commonPopup-header" onclick="closePopup();" style="cursor: pointer;" title="Click to close">	            
	    <span class="header-text">Dev<sup>+</sup></span>
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
	    <button onclick="unlockAllFields();" class="app-button" title="Unlock Fields">
	      <span class="app-icon">🔓</span>
	    </button>
	    <button onclick="renameTabsSectionsFields();" class="app-button" title="Logical Names">
	      <span class="app-icon">🏷️</span>
	    </button>
	    <button onclick="showEntityAutomations();" class="app-button" title="Table Automations">
	      <span class="app-icon">🤖</span>
	    </button>
	    <button onclick="openWebApi();" class="app-button" title="Open Web API Endpoint">
	      <span class="app-icon">🌐</span>
	    </button>
	    <button onclick="editSecurity();" class="app-button" title="Assign Security">
	      <span class="app-icon">🔑</span>
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
	    <button onclick="personaSwitcher();" class="app-button" title="Persona Switcher">
	      <span class="app-icon">🎭</span>
	    </button>
	  </div>
	</div>
   </div>
  `;	  
    
  var sidebarWidth = 60;  
  var newContainer = document.createElement('div');
  newContainer.id = 'MenuPopup';
  newContainer.innerHTML = popupHtml;
  document.body.appendChild(newContainer);
  
  function findD365Containers() {
    var containers = [];
    var vw = window.innerWidth;    
    var prioritySelectors = [      
      'div[id*="shell-container"]',
      'div[data-id="AppLandingPage"]',      
      'div[id*="ApplicationShell"]',
      'div[id*="app-host"]',      
      'header[role="banner"]',
      'div[id*="navbar"]',
      'div[id*="navigation"]',
      'nav[role="navigation"]'
    ];
    
    var processedAncestors = new Set();        
    prioritySelectors.forEach(function(selector) {
      try {
        var elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          if (!el || containers.includes(el)) return;
          
          var rect = el.getBoundingClientRect();          
          if (rect.width >= vw * 0.8) {            
            var isNested = false;
            for (var i = 0; i < containers.length; i++) {
              if (containers[i].contains(el)) {
                isNested = true;
                break;
              }
            }
                        
            if (!isNested) {              
              containers = containers.filter(function(existing) {
                return !el.contains(existing);
              });
              containers.push(el);
            }
          }
        });
      } catch (e) {        
      }
    });    
    
    if (containers.length === 0) {
      document.querySelectorAll('body > *').forEach(function(el) {
        if (!(el instanceof HTMLElement)) return;
        if (el.id === 'MenuPopup') return;
        
        var rect = el.getBoundingClientRect();
        var style = getComputedStyle(el);        
        if (rect.width >= vw * 0.8 && 
            ['fixed', 'absolute', 'relative'].includes(style.position)) {
          containers.push(el);
        }
      });
    }
    
    return containers;
  }  
  
  function adjustContentPosition() {    
    var existingContainers = window.adminPlusTargetElements;
    if (!existingContainers || existingContainers.length === 0) {
      existingContainers = findD365Containers();      
      window.adminPlusTargetElements = existingContainers;
    }    
    
    existingContainers.forEach(function(container) {
      if (!container || !document.body.contains(container)) return;      
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
      container.style.boxSizing = 'border-box';
            
      if (computedPosition === 'fixed' || computedPosition === 'absolute') {        
        if (computedPosition === 'static') {
          container.style.position = 'relative';
        }
        
        container.style.right = sidebarWidth + 'px';                
        var originalLeft = container.getAttribute('data-adminplus-original-left');
        if (!originalLeft || originalLeft === '' || originalLeft === 'auto') {
          container.style.left = '0';
        }
      } else {        
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
    var targetElements = window.adminPlusTargetElements;    
    if (!targetElements || targetElements.length === 0) {
        targetElements = Array.from(document.querySelectorAll('[data-adminplus-target="true"]'));
    }
    
    
    targetElements.forEach(function(targetElement) {
        if (!targetElement || !document.body.contains(targetElement)) return;        
        
        var originalRight = targetElement.getAttribute('data-adminplus-original-right');
        var originalLeft = targetElement.getAttribute('data-adminplus-original-left');
        var originalPosition = targetElement.getAttribute('data-adminplus-original-position');
        var originalBoxSizing = targetElement.getAttribute('data-adminplus-original-boxsizing');
        var originalWidth = targetElement.getAttribute('data-adminplus-original-width');
                
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
        
        targetElement.style.removeProperty('margin-right');        
        targetElement.removeAttribute('data-adminplus-target');
        targetElement.removeAttribute('data-adminplus-computed-position');
                
        void targetElement.offsetHeight;
    });    
    
    window.adminPlusTargetElements = null;   
    
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
    const popupClasses = ['.commonPopup'];    
    popupClasses.forEach((popupClass) => {
        const popups = document.querySelectorAll(popupClass);
        popups.forEach((popup) => {
            popup.remove();
        });
    });
}

// Global Exports
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
window.dateCalc = dateCalc;
window.personaSwitcher = personaSwitcher;
