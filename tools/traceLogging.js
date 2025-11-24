// Trace Logging Tool - Enable client-side trace logging for debugging
async function traceLogging() {
    try {
        // Check if trace parameter is already present
        const urlParams = new URLSearchParams(window.location.search);
        const traceEnabled = urlParams.get('trace') === 'true';
        
        if (traceEnabled) {
            if (typeof showToast === 'function') {
                showToast('Trace Logging already enabled', 'info', 3000);
            }
            return;
        }
        
        // Add trace parameter to URL and reload
        const currentUrl = window.location.href;
        const newUrl = currentUrl.includes('?') 
            ? currentUrl + '&trace=true' 
            : currentUrl + '?trace=true';
        
        window.location.href = newUrl;
        
    } catch (error) {
        console.error('Error enabling Trace Logging:', error);
        if (typeof showToast === 'function') {
            showToast('Error enabling Trace Logging', 'error');
        }
    }
}

