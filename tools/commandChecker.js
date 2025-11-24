// Command Checker Tool - Enable Microsoft's built-in Command Checker for ribbon debugging
async function commandChecker() {
    console.log('Command Checker: Tool initiated');
    
    try {
        // Check if ribbondebug parameter is already present
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const ribbonDebugEnabled = urlParams.get('ribbondebug') === 'true';
        
        if (ribbonDebugEnabled) {
            // Already enabled, show info
            if (typeof showToast === 'function') {
                showToast('Command Checker is already enabled! Look for the "Command checker" button in ribbons.', 'info', 5000);
            }
            return;
        }
        
        // Close any existing popups first
        const existingPopups = document.querySelectorAll('.commonPopup');
        existingPopups.forEach(popup => popup.remove());
        
        // Create and display the popup
        const popupContainer = createCommandCheckerPopup();
        document.body.appendChild(popupContainer);
        
        // Setup event handlers
        setupCommandCheckerHandlers(popupContainer);
        
        // Make popup movable
        if (typeof makePopupMovable === 'function') {
            makePopupMovable(popupContainer);
        }
        
    } catch (error) {
        console.error('Error opening Command Checker tool:', error);
        if (typeof showToast === 'function') {
            showToast('Error opening tool', 'error');
        }
    }
}

function createCommandCheckerPopup() {
    const container = document.createElement('div');
    container.className = 'commonPopup';
    container.style.border = '3px solid #1a1a1a';
    container.style.borderRadius = '12px';
    container.style.width = '650px';
    container.style.maxHeight = '90vh';
    
    const currentUrl = window.location.href;
    const newUrl = currentUrl.includes('?') 
        ? currentUrl + '&ribbondebug=true' 
        : currentUrl + '?ribbondebug=true';
    
    container.innerHTML = `
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: move; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">Enable Command Checker</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body" style="padding: 25px;">
            <div class="commonSection content-section" style="padding: 0; border-right: 0;">
                
                <!-- Main Info -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                    <h2 style="margin: 0 0 10px 0; font-size: 20px; color: #1f2937;">Microsoft Command Checker</h2>
                    <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                        Built-in tool to inspect ribbon commands, buttons, and rules
                    </p>
                </div>
                
                <!-- What it does -->
                <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6; border-right: 4px solid #3b82f6;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e40af; font-size: 14px;">What you'll get:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 13px; line-height: 1.8;">
                        <li>Visibility and enable rule evaluation for each button</li>
                        <li>Command execution details and JavaScript functions</li>
                        <li>Solution layer comparison for buttons and rules</li>
                        <li>"Command checker" button in all ribbons</li>
                    </ul>
                </div>
                
                <!-- Enable Button -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <button 
                        id="enableCommandCheckerButton"
                        style="padding: 14px 32px; font-size: 15px; font-weight: 600; background-color: #2b2b2b; color: white; border: none; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);"
                        onmouseover="this.style.backgroundColor='#1a1a1a'; this.style.boxShadow='0 5px 12px rgba(0, 0, 0, 0.3)'; this.style.transform='translateY(-2px)';"
                        onmouseout="this.style.backgroundColor='#2b2b2b'; this.style.boxShadow='0 3px 8px rgba(0, 0, 0, 0.2)'; this.style.transform='translateY(0)';"
                    >
                        Enable Command Checker
                    </button>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
                        This will reload the page with ribbondebug=true
                    </p>
                </div>
                
                <!-- Divider -->
                <div style="border-top: 2px solid #e5e7eb; margin: 25px 0;"></div>
                
                <!-- How to Use -->
                <div>
                    <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #374151;">How to Use:</h3>
                    <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px; line-height: 1.8;">
                        <li>Click "Enable Command Checker" button above</li>
                        <li>Page will reload with the feature enabled</li>
                        <li>Look for "Command checker" button in ribbon bars</li>
                        <li>Click it to inspect buttons, rules, and commands</li>
                        <li>View solution layers and compare definitions</li>
                    </ol>
                </div>
                
                <!-- Info Box -->
                <div style="margin-top: 20px; padding: 12px; background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e; font-size: 13px;">💡 Pro Tip:</p>
                    <p style="margin: 0; color: #78350f; font-size: 12px; line-height: 1.6;">
                        The Command Checker button appears at the end of each ribbon, so you may need to click the overflow menu (⋯) to find it.
                    </p>
                </div>
                
                <!-- Learn More -->
                <div style="margin-top: 15px; text-align: center;">
                    <a href="https://www.microsoft.com/en-us/power-platform/blog/power-apps/introducing-command-checker-for-model-app-ribbons/" 
                       target="_blank" 
                       style="color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;"
                       onmouseover="this.style.textDecoration='underline'"
                       onmouseout="this.style.textDecoration='none'">
                        Learn more about Command Checker →
                    </a>
                </div>
                
            </div>
        </div>
    `;
    
    return container;
}

function setupCommandCheckerHandlers(container) {
    // Close button
    const closeButton = container.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        container.remove();
    });
    
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e81123';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    // Enable Command Checker button
    const enableButton = container.querySelector('#enableCommandCheckerButton');
    enableButton.addEventListener('click', () => {
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
            showToast('Enabling Command Checker...', 'info', 2000);
        }
        
        console.log('Reloading with ribbondebug=true');
        console.log('New URL:', newUrl);
        
        // Reload the page with the parameter
        window.location.href = newUrl;
    });
}

