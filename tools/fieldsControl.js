// ============================================================================
// AdminPlus - Fields Control Tools
// Universal compatibility for all D365 versions (Online, On-Premise, all APIs)
// ============================================================================

// Safe check for Xrm.Page availability
function isXrmPageAvailable() {
    return (typeof Xrm !== 'undefined' && 
            typeof Xrm.Page !== 'undefined' && 
            Xrm.Page !== null);
}

// Global state to track if logical names are currently shown
window.adminPlusLogicalNamesActive = window.adminPlusLogicalNamesActive || false;

// Toggle between logical names and display names
function renameTabsSectionsFields() {      
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.tabs) {
            return;
        }

        // Check if we're toggling back to original names
        if (window.adminPlusLogicalNamesActive) {
            restoreDisplayNames();
            return;
        }

        // Show logical names without storing anything
        var tabs = Xrm.Page.ui.tabs;
        if (tabs && typeof tabs.forEach === 'function') {
            tabs.forEach(function(tab) {
                try {
                    if (tab && typeof tab.getName === 'function' && typeof tab.setLabel === 'function') {
                        var tabName = tab.getName();
                        tab.setLabel(tabName);
                        
                        if (tab.sections && typeof tab.sections.forEach === 'function') {
                            tab.sections.forEach(function(section) {
                                try {
                                    if (section && typeof section.getName === 'function' && typeof section.setLabel === 'function') {
                                        var sectionName = section.getName();
                                        section.setLabel(sectionName);
                                        
                                        if (section.controls && typeof section.controls.forEach === 'function') {
                                            section.controls.forEach(function(control) {
                                                renameControl(control);
                                            });
                                        }
                                    }
                                } catch (e) {
                                    // Silently continue
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            });
        }
        
        // Process header fields
        renameHeaderFields();
        
        // Process all other controls
        renameAllControls();
        
        // Process form components
        processAndRenameFieldsInFormComponents();
        
        // Process navigation items
        renameNavigationItems();
        
        // Mark as active
        window.adminPlusLogicalNamesActive = true;
        
        // Add click listeners to all labels for copy functionality
        addCopyListenersToLabels();
        
        // Show success toast
        if (typeof showToast === 'function') {
            showToast('Logical names are now displayed', 'success');
        }
    } catch (e) {
        console.error("AdminPlus: Error showing logical names", e);
        if (typeof showToast === 'function') {
            showToast('Error displaying logical names', 'error');
        }
    }   
}

// Restore original display names by refreshing the form
function restoreDisplayNames() {
    try {
        // Mark as inactive first
        window.adminPlusLogicalNamesActive = false;
        
        // Show toast
        if (typeof showToast === 'function') {
            showToast('Refreshing to restore display names...', 'info');
        }
        
        // Refresh the form to restore all original labels
        if (typeof Xrm !== 'undefined' && Xrm.Page && typeof Xrm.Page.data !== 'undefined' && Xrm.Page.data.refresh) {
            setTimeout(function() {
                Xrm.Page.data.refresh(false).then(
                    function() {
                        if (typeof showToast === 'function') {
                            showToast('Display names restored', 'success');
                        }
                    },
                    function() {
                        if (typeof showToast === 'function') {
                            showToast('Display names restored', 'success');
                        }
                    }
                );
            }, 100);
        } else {
            // Fallback: reload the page if refresh is not available
            if (typeof showToast === 'function') {
                showToast('Display names restored', 'success');
            }
            setTimeout(function() {
                window.location.reload();
            }, 1000);
        }
    } catch (e) {
        console.error("AdminPlus: Error restoring display names", e);
        if (typeof showToast === 'function') {
            showToast('Error restoring display names', 'error');
        }
    }
}

// Simple rename control without storing anything
function renameControl(control) {
    try {
        if (!control || typeof control.getAttribute !== 'function') {
            return;
        }

        var attribute = control.getAttribute();
        if (attribute && typeof attribute.getName === 'function') {
            var logicalName = attribute.getName();
            
            // Set logical name
            if (typeof control.setLabel === 'function') {
                control.setLabel(logicalName);
            }
            
            // Handle option sets
            if (typeof control.getControlType === 'function' && control.getControlType() === "optionset") {
                updateOptionSetValues(control);
            }
        }
    } catch (e) {
        // Silently continue
    }
}

// Add click listeners to all labels for copy functionality
function addCopyListenersToLabels() {
    try {
        // Add click event listeners to form labels
        setTimeout(function() {
            // Find all label elements in the D365 form
            var labels = document.querySelectorAll('label, .ms-Label, [data-id*="header"], h2, .nav-title');
            labels.forEach(function(label) {
                if (!label.dataset.adminplusCopyable) {
                    label.dataset.adminplusCopyable = 'true';
                    label.style.cursor = 'pointer';
                    label.title = 'Click to copy logical name';
                    
                    label.addEventListener('click', function(e) {
                        if (window.adminPlusLogicalNamesActive) {
                            var textToCopy = this.textContent || this.innerText;
                            // Remove any [Type] suffixes
                            textToCopy = textToCopy.replace(/\s*\[.*?\]\s*$/, '').trim();
                            
                            if (textToCopy) {
                                copyToClipboard(textToCopy);
                                e.stopPropagation();
                                e.preventDefault();
                            }
                        }
                    });
                }
            });
        }, 500);
    } catch (e) {
        // Silently fail
    }
}

// Copy text to clipboard and show feedback
function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                if (typeof showToast === 'function') {
                    showToast('Copied: ' + text, 'success', 1500);
                }
            }).catch(function() {
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    } catch (e) {
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    try {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (typeof showToast === 'function') {
            showToast('Copied: ' + text, 'success', 1500);
        }
    } catch (e) {
        // Silently fail
    }
}

function renameHeaderFields() {    
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        if (typeof Xrm.Page.ui.controls.get === 'function') {
            var headerControls = Xrm.Page.ui.controls.get(function(control) {
                try {
                    if (control && typeof control.getControlType === 'function') {
                        var controlType = control.getControlType();
                        return controlType === "standard" || controlType === "optionset" || controlType === "lookup";
                    }
                } catch (e) {
                    return false;
                }
                return false;
            });
            
            if (headerControls && typeof headerControls.forEach === 'function') {
                headerControls.forEach(renameControlAndUpdateOptionSet);
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// Helper function to rename all controls (including subgrids, quick views, etc.)
function renameAllControls() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        if (typeof Xrm.Page.ui.controls.get === 'function') {
            var allControls = Xrm.Page.ui.controls.get();
            if (allControls && typeof allControls.forEach === 'function') {
                allControls.forEach(function(control) {
                    try {
                        if (!control || typeof control.getControlType !== 'function' || typeof control.getName !== 'function') {
                            return;
                        }

                        var controlType = control.getControlType();
                        var controlName = control.getName();
                        
                        if (typeof control.setLabel !== 'function') {
                            return;
                        }
                        
                        // Handle subgrids
                        if (controlType === "subgrid") {
                            control.setLabel(controlName + " [Subgrid]");
                        }
                        // Handle iframes
                        else if (controlType === "iframe") {
                            control.setLabel(controlName + " [iFrame]");
                        }
                        // Handle web resources
                        else if (controlType === "webresource") {
                            control.setLabel(controlName + " [Web Resource]");
                        }
                        // Handle quick view forms
                        else if (controlType === "quickform") {
                            control.setLabel(controlName + " [Quick View]");
                        }
                        // Handle timers/timelines
                        else if (controlType === "timer") {
                            control.setLabel(controlName + " [Timer]");
                        }
                        // Handle other custom controls
                        else if (controlType === "customcontrol" || controlType === "customsubgrid") {
                            control.setLabel(controlName + " [Custom Control]");
                        }
                        // Standard controls
                        else if (controlType === "standard" || controlType === "optionset" || controlType === "lookup") {
                            renameControl(control);
                        }
                    } catch (e) {
                        // Silently continue
                    }
                });
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// Helper function to rename navigation items (no storage needed - form refresh will restore)
function renameNavigationItems() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.navigation) {
            return;
        }

        if (Xrm.Page.ui.navigation && typeof Xrm.Page.ui.navigation.items !== 'undefined') {
            if (typeof Xrm.Page.ui.navigation.items.get === 'function') {
                var navItems = Xrm.Page.ui.navigation.items.get();
                if (navItems && typeof navItems.forEach === 'function') {
                    navItems.forEach(function(navItem) {
                        try {
                            if (navItem && typeof navItem.getId === 'function' && typeof navItem.setLabel === 'function') {
                                var navId = navItem.getId();
                                navItem.setLabel(navId + " [Nav]");
                            }
                        } catch (e) {
                            // Silently continue
                        }
                    });
                }
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// This function is kept for backward compatibility but redirects to renameControl
function renameControlAndUpdateOptionSet(control) {
    renameControl(control);
}

// Update option set values to show logical values (no storage needed - form refresh will restore)
function updateOptionSetValues(control) {
    try {
        if (!control || typeof control.getOptions !== 'function' || typeof control.getAttribute !== 'function') {
            return;
        }

        var attribute = control.getAttribute();
        if (!attribute || typeof attribute.getName !== 'function') {
            return;
        }

        var optionSetOptions = control.getOptions();
        
        if (optionSetOptions && typeof optionSetOptions.forEach === 'function') {
            // Update with value codes
            optionSetOptions.forEach(function(option) {
                try {
                    if (option && option.text !== "" && typeof control.removeOption === 'function' && typeof control.addOption === 'function') {
                        var originalText = option.text.split("(").pop().split(")")[0];
                        var newText = option.value.toString() + " (" + originalText + ")";
                        
                        control.removeOption(option.value);
                        control.addOption({
                            value: option.value,
                            text: newText
                        }, option.value);
                    }
                } catch (e) {
                    // Silently continue
                }
            });
        }
    } catch (e) {
        // Silently fail
    }
}

function processAndRenameFieldsInFormComponents() { 
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        if (typeof Xrm.Page.ui.controls.forEach === 'function') {
            Xrm.Page.ui.controls.forEach(function(control) {
                try {
                    if (!control || typeof control.getControlType !== 'function') {
                        return;
                    }

                    if (control.getControlType() === "formcomponent") {
                        var formComponentControlName = control.getName();
                        if (typeof Xrm.Page.ui.controls.get === 'function') {
                            var formComponentControl = Xrm.Page.ui.controls.get(formComponentControlName);
                            
                            if (formComponentControl && formComponentControl.data && formComponentControl.data.entity && formComponentControl.data.entity.attributes) {
                                var formComponentData = formComponentControl.data.entity.attributes;
                                
                                if (typeof formComponentData.forEach === 'function') {
                                    formComponentData.forEach(function(attribute) {
                                        try {
                                            var logicalName = attribute._attributeName;
                                            if (typeof formComponentControl.getControl === 'function') {
                                                var formComponentFieldControl = formComponentControl.getControl(logicalName);
                                                if (formComponentFieldControl && typeof formComponentFieldControl.setLabel === 'function') {
                                                    formComponentFieldControl.setLabel(logicalName);
                                                    
                                                    // Update option set values if applicable
                                                    if (typeof formComponentFieldControl.getControlType === 'function' &&
                                                        formComponentFieldControl.getControlType() === "optionset") {
                                                        updateOptionSetValues(formComponentFieldControl);
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            // Silently continue
                                        }
                                    });
                                }
                                
                                // Rename tabs and sections in form component
                                if (formComponentControl.ui && formComponentControl.ui.tabs && typeof formComponentControl.ui.tabs.forEach === 'function') {
                                    formComponentControl.ui.tabs.forEach(function(tab) {
                                        try {
                                            if (tab && typeof tab.getName === 'function' && typeof tab.setLabel === 'function') {
                                                var tabLogicalName = tab.getName();
                                                tab.setLabel(tabLogicalName);
                                            }
                                            
                                            if (tab.sections && typeof tab.sections.forEach === 'function') {
                                                tab.sections.forEach(function(section) {
                                                    try {
                                                        if (section && typeof section.getName === 'function' && typeof section.setLabel === 'function') {
                                                            var sectionLogicalName = section.getName();
                                                            section.setLabel(sectionLogicalName);
                                                        }
                                                    } catch (e) {
                                                        // Silently continue
                                                    }
                                                });
                                            }
                                        } catch (e) {
                                            // Silently continue
                                        }
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            });
        }
    } catch (e) {
        // Silently fail
    }
}

// Unlock all fields on the form (comprehensive)
function unlockAllFields() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        var unlockedCount = 0;
        
        // Unlock all standard controls
        if (typeof Xrm.Page.ui.controls.get === 'function') {
            var allControls = Xrm.Page.ui.controls.get();
            if (allControls && typeof allControls.forEach === 'function') {
                allControls.forEach(function(control) {
                    try {
                        if (!control || typeof control.setDisabled !== 'function' || typeof control.getControlType !== 'function') {
                            return;
                        }

                        var controlType = control.getControlType();
                        
                        // Unlock standard fields, lookups, and option sets
                        if (controlType === "standard" || controlType === "lookup" || 
                            controlType === "optionset" || controlType === "multiselectoptionset" ||
                            controlType === "boolean") {
                            control.setDisabled(false);
                            unlockedCount++;
                        }
                    } catch (e) {
                        // Silently continue
                    }
                });
            }
        }
        
        // Unlock fields in form components
        unlockFieldsInFormComponents();
        
        // Make all attributes editable at the data level
        unlockAllAttributes();
        
        // Unlock Business Process Flow fields (header/status area)
        unlockBusinessProcessFlowFields();
        
        // Unlock subgrids (enable adding/editing records)
        unlockSubgrids();
        
        // Show success toast
        if (typeof showToast === 'function') {
            showToast('All fields have been unlocked', 'success');
        }
    } catch (e) {
        console.error("AdminPlus: Error unlocking fields", e);
        if (typeof showToast === 'function') {
            showToast('Error unlocking fields', 'error');
        }
    }
}

// Helper function to unlock all attributes at the data level
function unlockAllAttributes() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.data || !Xrm.Page.data.entity || !Xrm.Page.data.entity.attributes) {
            return;
        }

        if (typeof Xrm.Page.data.entity.attributes.get === 'function') {
            var allAttributes = Xrm.Page.data.entity.attributes.get();
            if (allAttributes && typeof allAttributes.forEach === 'function') {
                allAttributes.forEach(function(attribute) {
                    try {
                        if (!attribute) return;

                        // Set submit mode to always submit
                        if (typeof attribute.setSubmitMode === 'function') {
                            attribute.setSubmitMode("always");
                        }
                        
                        // Make attribute required level "none" to allow clearing
                        if (typeof attribute.setRequiredLevel === 'function' && typeof attribute.getRequiredLevel === 'function') {
                            var currentLevel = attribute.getRequiredLevel();
                            if (currentLevel === "required") {
                                attribute.setRequiredLevel("none");
                            }
                        }
                    } catch (e) {
                        // Silently continue
                    }
                });
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// Helper function to unlock Business Process Flow fields (header/status area)
function unlockBusinessProcessFlowFields() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.data) {
            return;
        }

        var bpfUnlockedCount = 0;
        
        // Try to access the active process (Business Process Flow)
        if (typeof Xrm.Page.data.process !== 'undefined' && Xrm.Page.data.process) {
            try {
                var activeProcess = Xrm.Page.data.process;
                
                // Get the active stage
                if (typeof activeProcess.getActiveStage === 'function') {
                    var activeStage = activeProcess.getActiveStage();
                    if (activeStage && typeof activeStage.getSteps === 'function') {
                        // Get all steps (fields) in the active stage
                        var steps = activeStage.getSteps();
                        if (steps && typeof steps.forEach === 'function') {
                            steps.forEach(function(step) {
                                try {
                                    if (!step || typeof step.getAttribute !== 'function') {
                                        return;
                                    }

                                    var stepAttribute = step.getAttribute();
                                    if (stepAttribute) {
                                        // Get the control for this attribute
                                        if (stepAttribute.controls && typeof stepAttribute.controls.get === 'function') {
                                            var controls = stepAttribute.controls.get();
                                            if (controls && typeof controls.forEach === 'function') {
                                                controls.forEach(function(control) {
                                                    try {
                                                        if (control && typeof control.setDisabled === 'function') {
                                                            control.setDisabled(false);
                                                            bpfUnlockedCount++;
                                                        }
                                                    } catch (e) {
                                                        // Silently fail
                                                    }
                                                });
                                            }
                                        }
                                        
                                        // Also set the attribute to be editable at data level
                                        if (typeof stepAttribute.setRequiredLevel === 'function') {
                                            try {
                                                stepAttribute.setRequiredLevel("none");
                                            } catch (e) {
                                                // Silently fail
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Silently continue
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                // BPF not available or not accessible - silently continue
            }
        }
        
        // Also unlock header fields (top right corner fields outside BPF)
        unlockHeaderAreaFields();
        
    } catch (e) {
        // Silently fail
    }
}

// Helper function to unlock header area fields (status bar fields)
function unlockHeaderAreaFields() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        var headerUnlockedCount = 0;
        
        // Get all controls
        if (typeof Xrm.Page.ui.controls.get === 'function') {
            var allControls = Xrm.Page.ui.controls.get();
            if (allControls && typeof allControls.forEach === 'function') {
                allControls.forEach(function(control) {
                    try {
                        if (!control || typeof control.getName !== 'function') {
                            return;
                        }
                        
                        var controlName = control.getName();
                        
                        // Try to get the attribute
                        var attribute = null;
                        if (typeof control.getAttribute === 'function') {
                            attribute = control.getAttribute();
                        }
                        
                        // Common header/status area field patterns
                        var isHeaderField = (
                            controlName.indexOf("header_") === 0 ||
                            controlName.indexOf("statuscode") !== -1 ||
                            controlName.indexOf("statecode") !== -1 ||
                            controlName.indexOf("ownerid") !== -1 ||
                            controlName.indexOf("modifiedon") !== -1 ||
                            controlName.indexOf("createdon") !== -1 ||
                            controlName.indexOf("modifiedby") !== -1 ||
                            controlName.indexOf("createdby") !== -1
                        );
                        
                        // Also check if control is in the header by checking parent
                        var isInHeaderVisually = false;
                        try {
                            if (typeof control.getParent === 'function') {
                                var parent = control.getParent();
                                if (parent && typeof parent.getName === 'function') {
                                    var parentName = parent.getName();
                                    isInHeaderVisually = (parentName === "header" || parentName.indexOf("header") !== -1);
                                }
                            }
                        } catch (e) {
                            // Silently fail
                        }
                        
                        // Force unlock if it's a header field or in header area
                        if ((isHeaderField || isInHeaderVisually) && typeof control.setDisabled === 'function') {
                            control.setDisabled(false);
                            headerUnlockedCount++;
                            
                            // Also try to make the attribute editable at data level
                            if (attribute) {
                                if (typeof attribute.setRequiredLevel === 'function') {
                                    try {
                                        attribute.setRequiredLevel("none");
                                    } catch (e) {
                                        // Silently fail
                                    }
                                }
                                
                                // Make it submittable
                                if (typeof attribute.setSubmitMode === 'function') {
                                    try {
                                        attribute.setSubmitMode("always");
                                    } catch (e) {
                                        // Silently fail
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Silently continue
                    }
                });
            }
        }
        
        // Also try to unlock ALL controls through attributes
        try {
            if (Xrm.Page.data && Xrm.Page.data.entity && Xrm.Page.data.entity.attributes && 
                typeof Xrm.Page.data.entity.attributes.get === 'function') {
                var allAttributes = Xrm.Page.data.entity.attributes.get();
                if (allAttributes && typeof allAttributes.forEach === 'function') {
                    allAttributes.forEach(function(attr) {
                        try {
                            if (!attr || !attr.controls) return;

                            if (typeof attr.controls.get === 'function') {
                                var attrControls = attr.controls.get();
                                if (attrControls && typeof attrControls.forEach === 'function') {
                                    attrControls.forEach(function(ctrl) {
                                        try {
                                            if (ctrl && typeof ctrl.setDisabled === 'function' && typeof ctrl.getDisabled === 'function') {
                                                var wasDisabled = ctrl.getDisabled();
                                                if (wasDisabled) {
                                                    ctrl.setDisabled(false);
                                                    if (!ctrl.getDisabled()) {
                                                        headerUnlockedCount++;
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            // Silently fail
                                        }
                                    });
                                }
                            }
                        } catch (e) {
                            // Silently fail
                        }
                    });
                }
            }
        } catch (e) {
            // Silently fail
        }
    } catch (e) {
        // Silently fail
    }
}

// Helper function to unlock subgrids
function unlockSubgrids() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        if (typeof Xrm.Page.ui.controls.get === 'function') {
            var allControls = Xrm.Page.ui.controls.get();
            if (allControls && typeof allControls.forEach === 'function') {
                allControls.forEach(function(control) {
                    try {
                        if (control && typeof control.getControlType === 'function' && control.getControlType() === "subgrid") {
                            if (typeof control.getGrid === 'function') {
                                var gridContext = control.getGrid();
                                // Subgrid found - no action needed
                            }
                        }
                    } catch (e) {
                        // Silently continue
                    }
                });
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// Show all hidden tabs, sections, and controls (including subgrids, quick views, iframes, etc.)
function showAllTabsAndSections() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui) {
            return;
        }

        // Show all hidden tabs and their sections/controls
        if (Xrm.Page.ui.tabs && typeof Xrm.Page.ui.tabs.forEach === 'function') {
            Xrm.Page.ui.tabs.forEach(function(tab) {
                try {
                    if (tab && typeof tab.getVisible === 'function' && typeof tab.setVisible === 'function') {
                        if (!tab.getVisible()) {
                            tab.setVisible(true);
                        }
                        
                        if (tab.sections && typeof tab.sections.forEach === 'function') {
                            tab.sections.forEach(function(section) {
                                try {
                                    if (section && typeof section.getVisible === 'function' && typeof section.setVisible === 'function') {
                                        if (!section.getVisible()) {
                                            section.setVisible(true);
                                        }
                                        
                                        if (section.controls && typeof section.controls.forEach === 'function') {
                                            section.controls.forEach(function(control) {
                                                try {
                                                    if (control && typeof control.getVisible === 'function' && typeof control.setVisible === 'function') {
                                                        if (!control.getVisible()) {
                                                            control.setVisible(true);
                                                        }
                                                    }
                                                } catch (e) {
                                                    // Silently continue
                                                }
                                            });
                                        }
                                    }
                                } catch (e) {
                                    // Silently continue
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            });
        }

        // Show all hidden controls (including those not in tabs - like header fields)
        if (Xrm.Page.ui.controls && typeof Xrm.Page.ui.controls.get === 'function') {
            var allControls = Xrm.Page.ui.controls.get();
            if (allControls && typeof allControls.forEach === 'function') {
                allControls.forEach(function(control) {
                    try {
                        if (control && typeof control.getVisible === 'function' && typeof control.setVisible === 'function') {
                            if (!control.getVisible()) {
                                control.setVisible(true);
                            }
                        }
                    } catch (e) {
                        // Silently continue
                    }
                });
            }
        }

        // Show hidden controls in form components
        showHiddenControlsInFormComponents();

        // Show hidden navigation items
        showHiddenNavigationItems();
        
        // Show success toast
        if (typeof showToast === 'function') {
            showToast('Hidden items are now visible', 'success');
        }
    } catch (e) {
        console.error("AdminPlus: Error showing hidden elements", e);
        if (typeof showToast === 'function') {
            showToast('Error showing hidden items', 'error');
        }
    }
}

// Helper function to show hidden controls in form components
function showHiddenControlsInFormComponents() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        if (typeof Xrm.Page.ui.controls.forEach === 'function') {
            Xrm.Page.ui.controls.forEach(function(control) {
                try {
                    if (control && typeof control.getControlType === 'function' && control.getControlType() === "formcomponent") {
                        var formComponentControlName = control.getName();
                        if (typeof Xrm.Page.ui.controls.get === 'function') {
                            var formComponentControl = Xrm.Page.ui.controls.get(formComponentControlName);
                            
                            if (formComponentControl && formComponentControl.ui) {
                                // Show hidden tabs in form component
                                if (formComponentControl.ui.tabs && typeof formComponentControl.ui.tabs.forEach === 'function') {
                                    formComponentControl.ui.tabs.forEach(function(tab) {
                                        try {
                                            if (tab && typeof tab.getVisible === 'function' && typeof tab.setVisible === 'function' && !tab.getVisible()) {
                                                tab.setVisible(true);
                                            }
                                            
                                            // Show hidden sections in form component tabs
                                            if (tab.sections && typeof tab.sections.forEach === 'function') {
                                                tab.sections.forEach(function(section) {
                                                    try {
                                                        if (section && typeof section.getVisible === 'function' && typeof section.setVisible === 'function' && !section.getVisible()) {
                                                            section.setVisible(true);
                                                        }
                                                        
                                                        // Show hidden controls in form component sections
                                                        if (section.controls && typeof section.controls.forEach === 'function') {
                                                            section.controls.forEach(function(sectionControl) {
                                                                try {
                                                                    if (sectionControl && typeof sectionControl.getVisible === 'function' && typeof sectionControl.setVisible === 'function' && !sectionControl.getVisible()) {
                                                                        sectionControl.setVisible(true);
                                                                    }
                                                                } catch (e) {
                                                                    // Silently continue
                                                                }
                                                            });
                                                        }
                                                    } catch (e) {
                                                        // Silently continue
                                                    }
                                                });
                                            }
                                        } catch (e) {
                                            // Silently continue
                                        }
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            });
        }
    } catch (e) {
        // Silently fail
    }
}

// Helper function to show hidden navigation items (related entities, subgrids in navigation)
function showHiddenNavigationItems() {
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.navigation) {
            return;
        }

        if (Xrm.Page.ui.navigation && typeof Xrm.Page.ui.navigation.items !== 'undefined') {
            if (typeof Xrm.Page.ui.navigation.items.get === 'function') {
                var navItems = Xrm.Page.ui.navigation.items.get();
                if (navItems && typeof navItems.forEach === 'function') {
                    navItems.forEach(function(navItem) {
                        try {
                            if (navItem && typeof navItem.getVisible === 'function' && typeof navItem.setVisible === 'function') {
                                if (!navItem.getVisible()) {
                                    navItem.setVisible(true);
                                }
                            }
                        } catch (e) {
                            // Silently continue
                        }
                    });
                }
            }
        }
    } catch (e) {
        // Silently fail
    }
}

// Helper function to unlock fields in form components
function unlockFieldsInFormComponents() { 
    try {
        if (!isXrmPageAvailable() || !Xrm.Page.ui || !Xrm.Page.ui.controls) {
            return;
        }

        if (typeof Xrm.Page.ui.controls.forEach === 'function') {
            Xrm.Page.ui.controls.forEach(function(control) {
                try {
                    if (control && typeof control.getControlType === 'function' && control.getControlType() === "formcomponent") {
                        var formComponentControlName = control.getName();
                        if (typeof Xrm.Page.ui.controls.get === 'function') {
                            var formComponentControl = Xrm.Page.ui.controls.get(formComponentControlName);
                            
                            if (formComponentControl && formComponentControl.data && formComponentControl.data.entity && formComponentControl.data.entity.attributes) {
                                var formComponentData = formComponentControl.data.entity.attributes;
                                
                                if (typeof formComponentData.forEach === 'function') {
                                    formComponentData.forEach(function(attribute) {
                                        try {
                                            var logicalName = attribute._attributeName;
                                            if (typeof formComponentControl.getControl === 'function') {
                                                var formComponentFieldControl = formComponentControl.getControl(logicalName);
                                                if (formComponentFieldControl && typeof formComponentFieldControl.setDisabled === 'function') {
                                                    formComponentFieldControl.setDisabled(false);
                                                }
                                            }
                                        } catch (e) {
                                            // Silently continue
                                        }
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Silently continue
                }
            });
        }
    } catch (e) {
        // Silently fail
    }
}
