// Live Monitor Tool - Open Microsoft's Live Monitor for comprehensive app debugging
async function liveMonitor() {
    try {
        // Check if we're on a model-driven app
        if (typeof Xrm === 'undefined' || !Xrm.Page || !Xrm.Page.context) {
            if (typeof showToast === 'function') {
                showToast('Please open a model-driven app first', 'warning');
            }
            console.warn('Live Monitor: Xrm context not available');
            return;
        }
        
        // Get client URL to extract environment info
        const clientUrl = Xrm.Page.context.getClientUrl();
        console.log('Live Monitor - Client URL:', clientUrl);
        
        // Get app ID - try multiple methods
        let appId = null;
        
        // Method 1: Try getAppId() if available
        if (typeof Xrm.Page.context.getAppId === 'function') {
            try {
                appId = Xrm.Page.context.getAppId();
                console.log('Live Monitor - App ID from getAppId():', appId);
            } catch (e) {
                console.warn('Live Monitor: getAppId() failed:', e);
            }
        }
        
        // Method 2: Extract from URL query parameters
        if (!appId) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('appid')) {
                appId = urlParams.get('appid');
                console.log('Live Monitor - App ID from URL:', appId);
            }
        }
        
        // Method 3: Try to get from global context (newer method)
        if (!appId && typeof Xrm.Utility !== 'undefined' && typeof Xrm.Utility.getGlobalContext === 'function') {
            try {
                const globalContext = Xrm.Utility.getGlobalContext();
                if (globalContext && typeof globalContext.getCurrentAppProperties === 'function') {
                    const appProperties = globalContext.getCurrentAppProperties();
                    if (appProperties && appProperties.appId) {
                        appId = appProperties.appId;
                        console.log('Live Monitor - App ID from global context:', appId);
                    }
                }
            } catch (e) {
                console.warn('Live Monitor: Global context method failed:', e);
            }
        }
        
        if (!appId) {
            if (typeof showToast === 'function') {
                showToast('Could not detect app ID. Make sure you are on a model-driven app.', 'warning');
            }
            console.warn('Live Monitor: No app ID found via any method');
            return;
        }
        
        // Extract environment ID from client URL
        let environmentId = null;
        
        // Method 1: Try to get environment ID from context (if available)
        if (typeof Xrm.Page.context.getEnvironmentId === 'function') {
            try {
                environmentId = Xrm.Page.context.getEnvironmentId();
                console.log('Live Monitor - Environment ID from context:', environmentId);
            } catch (e) {
                console.warn('Live Monitor: Could not get environment ID from context:', e);
            }
        }
        
        // Method 2: Try global context
        if (!environmentId && typeof Xrm.Utility !== 'undefined' && typeof Xrm.Utility.getGlobalContext === 'function') {
            try {
                const globalContext = Xrm.Utility.getGlobalContext();
                if (globalContext && typeof globalContext.getEnvironmentId === 'function') {
                    environmentId = globalContext.getEnvironmentId();
                    console.log('Live Monitor - Environment ID from global context:', environmentId);
                }
            } catch (e) {
                console.warn('Live Monitor: Global context environment ID failed:', e);
            }
        }
        
        // Method 3: Try to extract from URL query parameters
        if (!environmentId) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('orgid')) {
                environmentId = urlParams.get('orgid');
                console.log('Live Monitor - Environment ID from URL params:', environmentId);
            }
        }
        
        // If still no environment ID, construct monitor URL without environment
        if (!environmentId) {
            console.warn('Live Monitor: No environment ID found, opening basic monitor');
            // Alternative: Just open the monitor page and let user manually select
            const monitorUrl = 'https://make.powerapps.com/monitor';
            window.open(monitorUrl, '_blank', 'noopener,noreferrer');
            
            if (typeof showToast === 'function') {
                showToast('Opening Live Monitor. Manually select your app to monitor.', 'info', 4000);
            }
            return;
        }
        
        // Build the target URL (the app we want to monitor)
        const targetUrl = encodeURIComponent(`/main.aspx?appid=${appId}`);
        
        // Build the full monitor URL
        const monitorUrl = `https://make.powerapps.com/environments/${environmentId}/monitor?target=${targetUrl}`;
        console.log('Live Monitor - Opening URL:', monitorUrl);
        
        // Open Live Monitor in a new tab
        window.open(monitorUrl, '_blank', 'noopener,noreferrer');
        
        if (typeof showToast === 'function') {
            showToast('Opening Live Monitor in new tab...', 'success', 3000);
        }
        
    } catch (error) {
        console.error('Error opening Live Monitor:', error);
        console.error('Error details:', error.message, error.stack);
        if (typeof showToast === 'function') {
            showToast(`Error: ${error.message}`, 'error', 4000);
        }
    }
}

