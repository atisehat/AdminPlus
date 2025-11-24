// Command Checker Tool - Enable Microsoft's built-in Command Checker for ribbon debugging
async function commandChecker() {
    try {
        // Check if ribbondebug parameter is already present
        const urlParams = new URLSearchParams(window.location.search);
        const ribbonDebugEnabled = urlParams.get('ribbondebug') === 'true';
        
        if (ribbonDebugEnabled) {
            if (typeof showToast === 'function') {
                showToast('Command Checker already enabled', 'info', 3000);
            }
            return;
        }
        
        // Mark that we're enabling it
        sessionStorage.setItem('adminplus_command_checker_enabled', 'true');
        
        // Add ribbondebug parameter to URL and reload
        const currentUrl = window.location.href;
        const newUrl = currentUrl.includes('?') 
            ? currentUrl + '&ribbondebug=true' 
            : currentUrl + '?ribbondebug=true';
        
        window.location.href = newUrl;
        
    } catch (error) {
        console.error('Error enabling Command Checker:', error);
        if (typeof showToast === 'function') {
            showToast('Error enabling Command Checker', 'error');
        }
    }
}


