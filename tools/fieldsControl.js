// Show Logical Names for tabs, sections, and fields
function renameTabsSectionsFields() {      
    try {
        Xrm.Page.ui.tabs.forEach(function(tab) {
            var logicalName = tab.getName();
            tab.setLabel(logicalName);
            tab.sections.forEach(function(section) {
                var logicalName = section.getName();
                section.setLabel(logicalName);
                section.controls.forEach(renameControlAndUpdateOptionSet);
            });
        });
        renameHeaderFields();
        processAndRenameFieldsInFormComponents();
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

                    formComponentData.forEach(function(attribute) {
                        var logicalName = attribute._attributeName;
                        var formComponentFieldControl = formComponentControl.getControl(logicalName);
                        if (formComponentFieldControl && typeof formComponentFieldControl.setLabel === 'function') {
                            formComponentFieldControl.setLabel(logicalName);
                        }
                    });

                    formComponentControl.ui.tabs.forEach(function(tab) {
                        tab.sections.forEach(function(section) {
                            var logicalName = section.getName();
                            section.setLabel(logicalName);
                        });
                    });
                }
            }
        });
    } catch (e) {
        console.error("Error in processAndRenameFieldsInFormComponents:", e);
    }
}

// Unlock all fields on the form
function unlockAllFields() {
    closeIframe();
    var allControls = Xrm.Page.ui.controls.get();
    for (var i in allControls) {
        var control = allControls[i];
        if (control) {
            control.setDisabled(false);
        }
    }
    unlockFieldsInFormComponents();
}

// Show all hidden tabs, sections, and controls
function showAllTabsAndSections() {
    closeIframe();
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
