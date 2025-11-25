// Live Monitor Tool - Enable Microsoft's Live Monitor for comprehensive app debugging
async function liveMonitor() {
    try {
        // Check if monitor parameter is already present
        const urlParams = new URLSearchParams(window.location.search);
        const monitorEnabled = urlParams.get('monitor') === 'true';
        
        if (monitorEnabled) {
            if (typeof showToast === 'function') {
                showToast('Live Monitor already enabled', 'info', 3000);
            }
            return;
        }
        
        // Add monitor parameter to URL and reload
        const currentUrl = window.location.href;
        const newUrl = currentUrl.includes('?') 
            ? currentUrl + '&monitor=true' 
            : currentUrl + '?monitor=true';
        
        window.location.href = newUrl;
        
    } catch (error) {
        console.error('Error enabling Live Monitor:', error);
        if (typeof showToast === 'function') {
            showToast('Error enabling Live Monitor', 'error');
        }
    }
}

