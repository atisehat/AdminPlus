// Performance Diagnostics Tool - Enable built-in performance monitoring
async function performanceDiagnostics() {
    try {
        // Check if perfdiag parameter is already present
        const urlParams = new URLSearchParams(window.location.search);
        const perfDiagEnabled = urlParams.get('perfdiag') === 'true';
        
        if (perfDiagEnabled) {
            if (typeof showToast === 'function') {
                showToast('Performance Diagnostics already enabled', 'info', 3000);
            }
            return;
        }
        
        // Add perfdiag parameter to URL and reload
        const currentUrl = window.location.href;
        const newUrl = currentUrl.includes('?') 
            ? currentUrl + '&perfdiag=true' 
            : currentUrl + '?perfdiag=true';
        
        window.location.href = newUrl;
        
    } catch (error) {
        console.error('Error enabling Performance Diagnostics:', error);
        if (typeof showToast === 'function') {
            showToast('Error enabling Performance Diagnostics', 'error');
        }
    }
}

