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
        
        // Get app ID
        const appId = Xrm.Page.context.getAppId();
        console.log('Live Monitor - App ID:', appId);
        
        if (!appId) {
            if (typeof showToast === 'function') {
                showToast('Could not detect app ID. Open this from a model-driven app.', 'warning');
            }
            console.warn('Live Monitor: No app ID found');
            return;
        }
        
        // Extract environment ID from client URL
        // URL format: https://{org}.crm.dynamics.com or https://{org}.{region}.dynamics.com
        let environmentId = null;
        
        // Try to get environment ID from context (if available)
        if (typeof Xrm.Page.context.getEnvironmentId === 'function') {
            try {
                environmentId = Xrm.Page.context.getEnvironmentId();
                console.log('Live Monitor - Environment ID from context:', environmentId);
            } catch (e) {
                console.warn('Live Monitor: Could not get environment ID from context:', e);
            }
        }
        
        // If no environment ID, try to extract from URL
        if (!environmentId) {
            // Try to parse from the URL - format could be in query params or path
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

