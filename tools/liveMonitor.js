// Live Monitor Tool - Open Microsoft's Live Monitor for comprehensive app debugging
async function liveMonitor() {
    try {
        // Check if we're on a model-driven app
        if (typeof Xrm === 'undefined' || !Xrm.Page || !Xrm.Page.context) {
            if (typeof showToast === 'function') {
                showToast('Please open a model-driven app first', 'warning');
            }
            return;
        }
        
        // Get app info
        const clientUrl = Xrm.Page.context.getClientUrl();
        const appId = Xrm.Page.context.getAppId();
        
        if (!appId) {
            if (typeof showToast === 'function') {
                showToast('Could not detect app ID. Open this from a model-driven app.', 'warning');
            }
            return;
        }
        
        // Construct the Monitor URL
        // Format: https://make.powerapps.com/environments/{environmentId}/monitor?target=/main.aspx?appid={appId}
        const environmentId = Xrm.Page.context.getEnvironmentId();
        
        // Build the target URL (the app we want to monitor)
        const targetUrl = encodeURIComponent(`/main.aspx?appid=${appId}`);
        
        // Build the full monitor URL
        const monitorUrl = `https://make.powerapps.com/environments/${environmentId}/monitor?target=${targetUrl}`;
        
        // Open Live Monitor in a new tab
        window.open(monitorUrl, '_blank', 'noopener,noreferrer');
        
        if (typeof showToast === 'function') {
            showToast('Opening Live Monitor in new tab...', 'success', 3000);
        }
        
    } catch (error) {
        console.error('Error opening Live Monitor:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening Live Monitor', 'error');
        }
    }
}

