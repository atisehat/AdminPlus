// ============================================================================
// AdminPlus - Fields Control Tools
// ============================================================================

// Show Logical Names for tabs, sections, and fields (comprehensive)
function renameTabsSectionsFields() {      
    try {
        // Rename tabs and their sections/controls
        Xrm.Page.ui.tabs.forEach(function(tab) {
            var tabLogicalName = tab.getName();
            tab.setLabel(tabLogicalName);
            tab.sections.forEach(function(section) {
                var sectionLogicalName = section.getName();
                section.setLabel(sectionLogicalName);
                section.controls.forEach(renameControlAndUpdateOptionSet);
            });
        });
        
        // Rename header fields
        renameHeaderFields();
        
        // Rename all other controls (including subgrids, quick views, iframes, etc.)
        renameAllControls();
        
        // Rename fields in form components
        processAndRenameFieldsInFormComponents();
        
        // Rename navigation items
        renameNavigationItems();
        
    } catch (e) {
        console.error("Error in renameTabsSectionsFields:", e);
    }   
}

function renameHeaderFields() {    
    try {
        var headerControls = Xrm.Page.ui.controls.get(function(control) {
            var controlType = control.getControlType();
            return controlType === "standard" || controlType === "optionset" || controlType === "lookup";
        });
        headerControls.forEach(renameControlAndUpdateOptionSet);   
    } catch (e) {
        console.error("Error in renameHeaderFields:", e);
    }
}

// Helper function to rename all controls (including subgrids, quick views, etc.)
function renameAllControls() {
    try {
        var allControls = Xrm.Page.ui.controls.get();
        allControls.forEach(function(control) {
            try {
                var controlType = control.getControlType();
                var controlName = control.getName();
                
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
                // Standard controls are handled by renameControlAndUpdateOptionSet
                else if (controlType === "standard" || controlType === "optionset" || controlType === "lookup") {
                    renameControlAndUpdateOptionSet(control);
                }
            } catch (e) {
                console.warn("Could not rename control:", control.getName(), e);
            }
        });
    } catch (e) {
        console.error("Error in renameAllControls:", e);
    }
}

// Helper function to rename navigation items
function renameNavigationItems() {
    try {
        if (Xrm.Page.ui.navigation && typeof Xrm.Page.ui.navigation.items !== 'undefined') {
            var navItems = Xrm.Page.ui.navigation.items.get();
            navItems.forEach(function(navItem) {
                try {
                    var navId = navItem.getId();
                    navItem.setLabel(navId + " [Nav]");
                } catch (e) {
                    console.warn("Could not rename navigation item:", e);
                }
            });
        }
    } catch (e) {
        console.error("Error in renameNavigationItems:", e);
    }
}

function renameControlAndUpdateOptionSet(control) {
    try {
        if (control && typeof control.getAttribute === 'function') {
            var attribute = control.getAttribute();
            if (attribute && typeof attribute.getName === 'function') {
                var logicalName = attribute.getName();
                control.setLabel(logicalName);
                if (control.getControlType() === "optionset") {
                    updateOptionSetValues(control);            
                }
            }
        }
    } catch (e) {
        console.error("Error in renameControlAndUpdateOptionSet:", e);
    }
}

function updateOptionSetValues(control) {
    try {
        var optionSetOptions = control.getOptions();
        optionSetOptions.forEach(function(option) {
            if (option.text !== "") {			
                var originalText = option.text.split("(").pop().split(")")[0];
                var newText = option.value.toString() + " (" + originalText + ")";
                control.removeOption(option.value);
                control.addOption({
                    value: option.value,
                    text: newText
                }, option.value);
            }
        });
    } catch (e) {
        console.error("Error in updateOptionSetValues:", e);
    }   
}

function processAndRenameFieldsInFormComponents() { 
    try {
        Xrm.Page.ui.controls.forEach(function(control) {
            if (control.getControlType() === "formcomponent") {
                var formComponentControlName = control.getName(); 
                var formComponentControl = Xrm.Page.ui.controls.get(formComponentControlName);                
                if (formComponentControl && formComponentControl.data && formComponentControl.data.entity) {
                    var formComponentData = formComponentControl.data.entity.attributes;

                    // Rename controls in form component
                    formComponentData.forEach(function(attribute) {
                        var logicalName = attribute._attributeName;
                        var formComponentFieldControl = formComponentControl.getControl(logicalName);
                        if (formComponentFieldControl && typeof formComponentFieldControl.setLabel === 'function') {
                            formComponentFieldControl.setLabel(logicalName);
                            
                            // Update option set values if applicable
                            try {
                                if (formComponentFieldControl.getControlType() === "optionset") {
                                    updateOptionSetValues(formComponentFieldControl);
                                }
                            } catch (e) {
                                console.warn("Could not update option set in form component:", e);
                            }
                        }
                    });

                    // Rename tabs and sections in form component
                    if (formComponentControl.ui && formComponentControl.ui.tabs) {
                        formComponentControl.ui.tabs.forEach(function(tab) {
                            try {
                                var tabLogicalName = tab.getName();
                                tab.setLabel(tabLogicalName);
                            } catch (e) {
                                console.warn("Could not rename tab in form component:", e);
                            }
                            
                            if (tab.sections) {
                                tab.sections.forEach(function(section) {
                                    try {
                                        var sectionLogicalName = section.getName();
                                        section.setLabel(sectionLogicalName);
                                    } catch (e) {
                                        console.warn("Could not rename section in form component:", e);
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error in processAndRenameFieldsInFormComponents:", e);
    }
}

// Unlock all fields on the form (comprehensive)
function unlockAllFields() {
    try {
        var allControls = Xrm.Page.ui.controls.get();
        var unlockedCount = 0;
        
        // Unlock all standard controls
        if (allControls && allControls.forEach) {
            allControls.forEach(function(control) {
                try {
                    if (!control) return;
                    
                    // Check if control has necessary methods
                    if (typeof control.getControlType !== 'function' || 
                        typeof control.setDisabled !== 'function') {
                        return;
                    }
                    
                    var controlType = control.getControlType();
                    
                    // Unlock standard fields, lookups, and option sets
                    if (controlType === "standard" || controlType === "lookup" || 
                        controlType === "optionset" || controlType === "multiselectoptionset") {
                        control.setDisabled(false);
                        unlockedCount++;
                    }
                    // Unlock boolean (two options) fields
                    else if (controlType === "boolean") {
                        control.setDisabled(false);
                        unlockedCount++;
                    }
                } catch (e) {
                    // Silently continue - don't log to avoid spam
                }
            });
        }
        
        // Unlock fields in form components
        unlockFieldsInFormComponents();
        
        // Make all attributes editable at the data level
        unlockAllAttributes();
        
        // Unlock Business Process Flow fields (header/status area)
        unlockBusinessProcessFlowFields();
        
        // Unlock subgrids (enable adding/editing records)
        unlockSubgrids();
        
        // Specifically target whole number fields (they can be stubborn)
        unlockWholeNumberFields();
        
    } catch (e) {
        console.error("Error in unlockAllFields:", e);
    }
}

// Helper function to unlock all attributes at the data level
function unlockAllAttributes() {
    try {
        if (!Xrm.Page.data || !Xrm.Page.data.entity || !Xrm.Page.data.entity.attributes) {
            return;
        }
        
        var allAttributes = Xrm.Page.data.entity.attributes.get();
        if (!allAttributes || !allAttributes.forEach) {
            return;
        }
        
        allAttributes.forEach(function(attribute) {
            try {
                if (!attribute) return;
                
                // Set submit mode to always submit
                if (typeof attribute.setSubmitMode === 'function') {
                    attribute.setSubmitMode("always");
                }
                
                // Make attribute required level "none" to allow clearing
                if (typeof attribute.setRequiredLevel === 'function' && 
                    typeof attribute.getRequiredLevel === 'function') {
                    var currentLevel = attribute.getRequiredLevel();
                    if (currentLevel === "required") {
                        attribute.setRequiredLevel("none");
                    }
                }
                
                // Unlock all controls for this attribute (especially important for whole numbers in header)
                if (attribute.controls && typeof attribute.controls.get === 'function') {
                    var controls = attribute.controls.get();
                    if (controls && controls.forEach) {
                        controls.forEach(function(ctrl) {
                            try {
                                if (ctrl && typeof ctrl.setDisabled === 'function') {
                                    ctrl.setDisabled(false);
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
    } catch (e) {
        console.error("Error in unlockAllAttributes:", e);
    }
}

// Helper function to unlock Business Process Flow fields (header/status area)
function unlockBusinessProcessFlowFields() {
    try {
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
                        steps.forEach(function(step) {
                            try {
                                if (typeof step.getAttribute === 'function') {
                                    var stepAttribute = step.getAttribute();
                                    if (stepAttribute) {
                                        var attributeName = step.getName();
                                        
                                        // Get the control for this attribute
                                        if (stepAttribute.controls && typeof stepAttribute.controls.get === 'function') {
                                            var controls = stepAttribute.controls.get();
                                            controls.forEach(function(control) {
                                                try {
                                                    if (typeof control.setDisabled === 'function') {
                                                        control.setDisabled(false);
                                                        bpfUnlockedCount++;
                                                    }
                                                } catch (e) {
                                                    console.warn("Could not unlock BPF control:", attributeName, e);
                                                }
                                            });
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
                                }
                            } catch (e) {
                                console.warn("Could not process BPF step:", e);
                            }
                        });
                        
                    }
                }
            } catch (e) {
                console.warn("Error accessing BPF:", e.message);
            }
        }
        
        // Also unlock header fields (top right corner fields outside BPF)
        unlockHeaderAreaFields();
        
    } catch (e) {
        console.error("Error in unlockBusinessProcessFlowFields:", e);
    }
}

// Helper function to unlock header area fields (status bar fields)
function unlockHeaderAreaFields() {
    try {
        // Get all controls and specifically target those that might be in the header
        var allControls = Xrm.Page.ui.controls.get();
        var headerUnlockedCount = 0;
        
        allControls.forEach(function(control) {
            try {
                if (!control || typeof control.getName !== 'function') {
                    return;
                }
                
                var controlName = control.getName();
                var controlType = control.getControlType();
                
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
                    if (control.getParent && typeof control.getParent === 'function') {
                        var parent = control.getParent();
                        if (parent && parent.getName) {
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
                console.warn("Could not process header control:", e);
            }
        });
        
        // Also try to unlock ALL controls that have "header" in their parent hierarchy
        try {
            if (Xrm.Page.data && Xrm.Page.data.entity && Xrm.Page.data.entity.attributes) {
                var allAttributes = Xrm.Page.data.entity.attributes.get();
                if (allAttributes && allAttributes.forEach) {
                    allAttributes.forEach(function(attr) {
                        try {
                            if (!attr || !attr.controls) return;
                            
                            var attrControls = attr.controls.get();
                            if (!attrControls || !attrControls.forEach) return;
                            
                            attrControls.forEach(function(ctrl) {
                                try {
                                    if (!ctrl) return;
                                    
                                    // Try unlocking every control aggressively
                                    if (typeof ctrl.setDisabled === 'function' && 
                                        typeof ctrl.getDisabled === 'function') {
                                        var wasDisabled = ctrl.getDisabled();
                                        if (wasDisabled) {
                                            ctrl.setDisabled(false);
                                            // Check if it actually unlocked
                                            if (!ctrl.getDisabled()) {
                                                headerUnlockedCount++;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    // Silently fail
                                }
                            });
                        } catch (e) {
                            // Silently fail
                        }
                    });
                }
            }
        } catch (e) {
            // Silently fail - don't log
        }
        
    } catch (e) {
        console.error("Error in unlockHeaderAreaFields:", e);
    }
}

// Helper function to unlock subgrids
function unlockSubgrids() {
    try {
        var allControls = Xrm.Page.ui.controls.get();
        allControls.forEach(function(control) {
            try {
                if (control.getControlType() === "subgrid") {
                    // Enable adding records if possible
                    var gridContext = control.getGrid();
                    if (gridContext) {
                        // Note: Some subgrid operations may be limited by permissions
                        // This attempts to make them as accessible as possible
                    }
                }
            } catch (e) {
                console.warn("Could not process subgrid:", e);
            }
        });
    } catch (e) {
        console.error("Error in unlockSubgrids:", e);
    }
}

// Helper function to specifically unlock whole number fields (they can be stubborn in header area)
function unlockWholeNumberFields() {
    try {
        if (!Xrm.Page.data || !Xrm.Page.data.entity || !Xrm.Page.data.entity.attributes) {
            return;
        }
        
        var allAttributes = Xrm.Page.data.entity.attributes.get();
        if (!allAttributes || !allAttributes.forEach) {
            return;
        }
        
        allAttributes.forEach(function(attribute) {
            try {
                if (!attribute || typeof attribute.getAttributeType !== 'function') return;
                
                var attrType = attribute.getAttributeType();
                
                // Target integer/whole number fields specifically
                if (attrType === "integer" || attrType === "decimal" || 
                    attrType === "double" || attrType === "money" || attrType === "bigint") {
                    
                    // Unlock at attribute level
                    if (typeof attribute.setRequiredLevel === 'function') {
                        try {
                            attribute.setRequiredLevel("none");
                        } catch (e) {
                            // Silently continue
                        }
                    }
                    
                    if (typeof attribute.setSubmitMode === 'function') {
                        try {
                            attribute.setSubmitMode("always");
                        } catch (e) {
                            // Silently continue
                        }
                    }
                    
                    // Unlock all controls for this numeric attribute
                    if (attribute.controls && typeof attribute.controls.get === 'function') {
                        var controls = attribute.controls.get();
                        if (controls && controls.forEach) {
                            controls.forEach(function(ctrl) {
                                try {
                                    if (!ctrl) return;
                                    
                                    // Aggressively unlock
                                    if (typeof ctrl.setDisabled === 'function') {
                                        ctrl.setDisabled(false);
                                    }
                                    
                                    // Also try to set it as editable
                                    if (typeof ctrl.setVisible === 'function') {
                                        ctrl.setVisible(true);
                                    }
                                } catch (e) {
                                    // Silently continue
                                }
                            });
                        }
                    }
                }
            } catch (e) {
                // Silently continue
            }
        });
    } catch (e) {
        // Silently fail
    }
}

// Show all hidden tabs, sections, and controls (including subgrids, quick views, iframes, etc.)
function showAllTabsAndSections() {
    try {
        // Show all hidden tabs and their sections/controls
        Xrm.Page.ui.tabs.forEach(function(tab) {
            if (!tab.getVisible()) {
                tab.setVisible(true);
            }
            tab.sections.forEach(function(section) {
                if (!section.getVisible()) {
                    section.setVisible(true);
                }
                section.controls.forEach(function(control) {
                    if (!control.getVisible()) {
                        control.setVisible(true);
                    }
                });
            });
        });

        // Show all hidden controls (including those not in tabs - like header fields)
        var allControls = Xrm.Page.ui.controls.get();
        allControls.forEach(function(control) {
            try {
                if (control && typeof control.getVisible === 'function' && !control.getVisible()) {
                    control.setVisible(true);
                }
            } catch (e) {
                console.warn("Could not show control:", e);
            }
        });

        // Show hidden controls in form components
        showHiddenControlsInFormComponents();

        // Show hidden navigation items
        showHiddenNavigationItems();

    } catch (e) {
        console.error("Error in showAllTabsAndSections:", e);
    }
}

// Helper function to show hidden controls in form components
function showHiddenControlsInFormComponents() {
    try {
        Xrm.Page.ui.controls.forEach(function(control) {
            if (control.getControlType() === "formcomponent") {
                var formComponentControlName = control.getName();
                var formComponentControl = Xrm.Page.ui.controls.get(formComponentControlName);
                
                if (formComponentControl && formComponentControl.ui) {
                    // Show hidden tabs in form component
                    if (formComponentControl.ui.tabs) {
                        formComponentControl.ui.tabs.forEach(function(tab) {
                            if (typeof tab.getVisible === 'function' && !tab.getVisible()) {
                                tab.setVisible(true);
                            }
                            // Show hidden sections in form component tabs
                            if (tab.sections) {
                                tab.sections.forEach(function(section) {
                                    if (typeof section.getVisible === 'function' && !section.getVisible()) {
                                        section.setVisible(true);
                                    }
                                    // Show hidden controls in form component sections
                                    if (section.controls) {
                                        section.controls.forEach(function(sectionControl) {
                                            if (typeof sectionControl.getVisible === 'function' && !sectionControl.getVisible()) {
                                                sectionControl.setVisible(true);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error in showHiddenControlsInFormComponents:", e);
    }
}

// Helper function to show hidden navigation items (related entities, subgrids in navigation)
function showHiddenNavigationItems() {
    try {
        if (Xrm.Page.ui.navigation && typeof Xrm.Page.ui.navigation.items !== 'undefined') {
            var navItems = Xrm.Page.ui.navigation.items.get();
            navItems.forEach(function(navItem) {
                try {
                    if (typeof navItem.getVisible === 'function' && !navItem.getVisible()) {
                        navItem.setVisible(true);
                    }
                } catch (e) {
                    console.warn("Could not show navigation item:", e);
                }
            });
        }
    } catch (e) {
        console.error("Error in showHiddenNavigationItems:", e);
    }
}

// Helper function to unlock fields in form components
function unlockFieldsInFormComponents() { 
    try {
        Xrm.Page.ui.controls.forEach(function(control) {
            if (control.getControlType() === "formcomponent") {
                var formComponentControlName = control.getName(); 
                var formComponentControl = Xrm.Page.ui.controls.get(formComponentControlName);                
                if (formComponentControl && formComponentControl.data && formComponentControl.data.entity) {
                    var formComponentData = formComponentControl.data.entity.attributes;

                    formComponentData.forEach(function(attribute) {
                        var logicalName = attribute._attributeName;
                        var formComponentFieldControl = formComponentControl.getControl(logicalName);
                        if (formComponentFieldControl && typeof formComponentFieldControl.setDisabled === 'function') {
                            formComponentFieldControl.setDisabled(false); 
                        }
                    });
                }
            }
        });
    } catch (e) {
        console.error("Error in unlockFieldsInFormComponents:", e);
    }
}
