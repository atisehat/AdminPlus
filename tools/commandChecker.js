// Command Checker Tool - Enable Microsoft's built-in Command Checker for ribbon debugging
async function commandChecker() {
    console.log('Command Checker: Enabling ribbon debugger');
    
    try {
        // Check if ribbondebug parameter is already present
        const urlParams = new URLSearchParams(window.location.search);
        const ribbonDebugEnabled = urlParams.get('ribbondebug') === 'true';
        
        if (ribbonDebugEnabled) {
            // Already enabled, show info
            if (typeof showToast === 'function') {
                showToast('Command Checker is already enabled! Look for the "Command checker" button in ribbons.', 'info', 5000);
            }
            return;
        }
        
        // Save current state before reload
        try {
            // Save scroll position
            sessionStorage.setItem('adminplus_scroll_position', window.scrollY || 0);
            
            // Save active tab if available
            if (typeof Xrm !== 'undefined' && Xrm.Page && Xrm.Page.ui && Xrm.Page.ui.tabs) {
                const tabs = Xrm.Page.ui.tabs.get();
                tabs.forEach((tab, index) => {
                    if (tab.getDisplayState() === 'expanded') {
                        sessionStorage.setItem('adminplus_active_tab', tab.getName());
                    }
                });
            }
            
            // Mark that sidebar should stay open
            sessionStorage.setItem('adminplus_keep_sidebar_open', 'true');
            sessionStorage.setItem('adminplus_command_checker_enabled', 'true');
            
        } catch (e) {
            console.warn('Could not save form state:', e);
        }
        
        // Get current URL and add ribbondebug parameter
        const currentUrl = window.location.href;
        let newUrl;
        
        if (currentUrl.includes('?')) {
            newUrl = currentUrl + '&ribbondebug=true';
        } else {
            newUrl = currentUrl + '?ribbondebug=true';
        }
        
        // Show loading message
        if (typeof showToast === 'function') {
            showToast('Enabling Command Checker - page will reload...', 'info', 2000);
        }
        
        console.log('Reloading with ribbondebug=true');
        console.log('New URL:', newUrl);
        
        // Reload the page with the parameter
        window.location.href = newUrl;
        
    } catch (error) {
        console.error('Error enabling Command Checker:', error);
        if (typeof showToast === 'function') {
            showToast('Error enabling Command Checker', 'error');
        }
    }
}

