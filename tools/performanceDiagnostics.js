// Performance Diagnostics Tool - Open Dynamics 365 diagnostics page
async function performanceDiagnostics() {
    try {
        // Get the organization URL
        if (typeof Xrm === 'undefined' || !Xrm.Page || !Xrm.Page.context) {
            if (typeof showToast === 'function') {
                showToast('Please open a Dynamics 365 page first', 'warning');
            }
            return;
        }
        
        const clientUrl = Xrm.Page.context.getClientUrl();
        const diagUrl = `${clientUrl}/tools/diagnostics/diag.aspx`;
        
        // Open diagnostics page in new tab
        window.open(diagUrl, '_blank');
        
        if (typeof showToast === 'function') {
            showToast('Opening Performance Diagnostics page...', 'success', 3000);
        }
        
    } catch (error) {
        console.error('Error opening Performance Diagnostics:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening Performance Diagnostics', 'error');
        }
    }
}
