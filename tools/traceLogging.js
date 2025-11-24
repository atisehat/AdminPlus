// Trace Logging Tool - Enable verbose console logging for debugging
async function traceLogging() {
    try {
        // Enable verbose console logging
        if (typeof window.localStorage !== 'undefined') {
            // Check current state
            const currentLevel = window.localStorage.getItem('msdyn_consoleLogLevel');
            
            if (currentLevel === 'verbose') {
                // Already enabled, disable it
                window.localStorage.removeItem('msdyn_consoleLogLevel');
                if (typeof showToast === 'function') {
                    showToast('Trace Logging disabled. Reload page to apply.', 'info', 4000);
                }
                console.log('Console trace logging disabled. Reload the page for changes to take effect.');
            } else {
                // Enable verbose logging
                window.localStorage.setItem('msdyn_consoleLogLevel', 'verbose');
                if (typeof showToast === 'function') {
                    showToast('Trace Logging enabled. Reload page to apply.', 'success', 4000);
                }
                console.log('Console trace logging enabled. Reload the page for changes to take effect.');
                console.log('Check browser console for detailed trace logs.');
            }
        } else {
            if (typeof showToast === 'function') {
                showToast('Local storage not available', 'error');
            }
        }
        
    } catch (error) {
        console.error('Error toggling Trace Logging:', error);
        if (typeof showToast === 'function') {
            showToast('Error toggling Trace Logging', 'error');
        }
    }
}

