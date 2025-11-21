/**
 * Popup Template Utility
 * Creates standardized popup windows with consistent styling and behavior
 */

/**
 * Cleans up any external styles associated with a specific popup
 * Note: Inline styles (embedded in popup HTML) are automatically removed with the popup
 * This function only cleans up styles that were added to document.head (legacy approach)
 * @param {HTMLElement} popupContainer - The popup container element
 */
function cleanupPopupStyles(popupContainer) {
    if (!popupContainer) return;
    
    // Clean up any external styles (legacy addTooltipStyles approach)
    const styleId = popupContainer.getAttribute('data-style-id');
    if (styleId) {
        const associatedStyle = document.querySelector(`style[data-popup-style="${styleId}"]`);
        if (associatedStyle) {
            associatedStyle.remove();
        }
    }
}

/**
 * Closes all tool popup windows and cleans up all associated styles
 * Call this before opening a new tool window to ensure completely clean state
 */
function closeAllToolPopups() {
    // Find all commonPopup windows (tool popups)
    const allPopups = document.querySelectorAll('.commonPopup');
    allPopups.forEach(popup => {
        // Clean up any external style elements (legacy approach)
        cleanupPopupStyles(popup);
        // Popup removal will automatically remove any inline styles
        popup.remove();
    });
    
    // THOROUGH CLEANUP: Remove any orphaned tooltip styles from document.head
    // This catches legacy styles and ensures completely clean state
    const orphanedExternalStyles = document.querySelectorAll('style[data-popup-style]');
    orphanedExternalStyles.forEach(style => style.remove());
    
    // Also remove any old inline styles that might have leaked (shouldn't happen, but safety measure)
    const orphanedInlineStyles = document.querySelectorAll('style[data-inline-popup-style]');
    orphanedInlineStyles.forEach(style => {
        // Only remove if not inside a popup (orphaned)
        if (!style.closest('.commonPopup')) {
            style.remove();
        }
    });
}

/**
 * Creates a standardized popup window
 * @param {Object} config - Configuration object
 * @param {string} config.title - Title text for the header
 * @param {string} config.content - HTML content for the popup body
 * @param {string} [config.popupId] - Unique identifier for this popup type (e.g., 'entityInfo', 'dirtyFields')
 * @param {string} [config.inlineStyles] - Optional inline styles HTML (e.g., from generateTooltipStyles) placed at popup root
 * @param {string} [config.width='75%'] - Width of the popup (default: 75%)
 * @param {string} [config.maxHeight='90vh'] - Maximum height of the popup (default: 90vh)
 * @param {boolean} [config.movable=true] - Whether the popup should be draggable (default: true)
 * @param {Function} [config.onClose] - Optional callback function when popup is closed
 * @param {Object} [config.customStyles] - Optional custom styles to override defaults
 * @returns {HTMLElement} The created popup container element
 */
function createStandardPopup(config) {
    const {
        title,
        content,
        popupId,
        inlineStyles,
        width = '75%',
        maxHeight = '90vh',
        movable = true,
        onClose,
        customStyles = {}
    } = config;

    // ALWAYS close all existing tool popups before opening a new one
    // This ensures clean state and no interference between tools
    closeAllToolPopups();

    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'commonPopup';
    
    // Add unique identifier if provided
    if (popupId) {
        popupContainer.setAttribute('data-popup-id', popupId);
        // Generate unique style ID for this popup instance
        const styleId = `${popupId}-${Date.now()}`;
        popupContainer.setAttribute('data-style-id', styleId);
    }
    
    // Apply default styles
    popupContainer.style.border = customStyles.border || '3px solid #1a1a1a';
    popupContainer.style.borderRadius = customStyles.borderRadius || '12px';
    popupContainer.style.width = customStyles.width || width;
    popupContainer.style.maxHeight = customStyles.maxHeight || maxHeight;
    
    // Apply any additional custom styles
    if (customStyles.additionalStyles) {
        Object.assign(popupContainer.style, customStyles.additionalStyles);
    }

    // Build popup HTML structure with optional inline styles at the root level
    popupContainer.innerHTML = `
        ${inlineStyles || ''}
        <div class="commonPopup-header" style="background-color: #2b2b2b; position: relative; cursor: ${movable ? 'move' : 'default'}; border-radius: 9px 9px 0 0; margin: 0; border-bottom: 2px solid #1a1a1a;">
            <span style="color: white;">${title}</span>
            <span class="close-button" style="position: absolute; right: 0; top: 0; bottom: 0; width: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 20px; color: white; font-weight: bold; transition: background-color 0.2s ease; border-radius: 0 9px 0 0;">&times;</span>
        </div>
        <div class="popup-body">
            <div class="commonSection content-section" style="padding: 0; border-right: 0;">
                ${content}
            </div>
        </div>
    `;

    // Append to body
    document.body.appendChild(popupContainer);

    // Setup close button functionality
    const closeButton = popupContainer.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        // Clean up any external styles (legacy approach)
        // Inline styles are automatically removed when popup is removed
        cleanupPopupStyles(popupContainer);
        
        if (onClose && typeof onClose === 'function') {
            onClose();
        }
        popupContainer.remove();
    });

    // Add hover effect for close button
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#e81123';
    });
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });

    // Make popup movable if enabled
    if (movable && typeof makePopupMovable === 'function') {
        makePopupMovable(popupContainer);
    }

    return popupContainer;
}

/**
 * Creates a standardized scrollable content section
 * @param {string} content - HTML content to wrap
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.padding='0 2px 20px 20px'] - Padding for scroll section
 * @param {string} [options.maxHeight='calc(90vh - 235px)'] - Max height for scroll section
 * @returns {string} HTML string with scroll section wrapper
 */
function createScrollSection(content, options = {}) {
    const {
        padding = '0 2px 20px 20px',
        maxHeight = 'calc(90vh - 235px)'
    } = options;

    return `
        <div class="scroll-section" style="padding: ${padding}; overflow-y: auto; max-height: ${maxHeight};">
            ${content}
        </div>
    `;
}

/**
 * Creates a standardized info header section
 * @param {Array<Object>} items - Array of header items
 * @param {string} items[].label - Label text (will be bolded)
 * @param {string} items[].value - Value text
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.gap='50px'] - Gap between items
 * @param {string} [options.fontSize='15px'] - Font size
 * @returns {string} HTML string for info header
 */
function createInfoHeader(items, options = {}) {
    const {
        gap = '50px',
        fontSize = '15px'
    } = options;

    const itemsHtml = items.map((item, index) => {
        const flexStyle = index === items.length - 1 ? 'flex: 1;' : '';
        return `<div style="white-space: nowrap; ${flexStyle}"><strong>${item.label}:</strong> ${item.value}</div>`;
    }).join('');

    return `
        <div style="background-color: #f9f9f9; padding: 15px 20px; border-radius: 5px; margin-bottom: 15px;">
            <div style="display: flex; gap: ${gap}; align-items: center; flex-wrap: wrap; font-size: ${fontSize};">
                ${itemsHtml}
            </div>
        </div>
    `;
}

/**
 * Creates a standardized note/info banner
 * @param {string} text - Note text
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.position='right'] - Position: 'left', 'right', 'center'
 * @param {string} [options.fontSize='13px'] - Font size
 * @returns {string} HTML string for note banner
 */
function createNoteBanner(text, options = {}) {
    const {
        position = 'right',
        fontSize = '13px'
    } = options;

    const justifyContent = position === 'left' ? 'flex-start' : position === 'center' ? 'center' : 'flex-end';

    return `
        <div style="display: flex; justify-content: ${justifyContent}; margin-bottom: 10px; padding-right: 20px;">
            <div style="font-size: ${fontSize}; color: #666; font-style: italic; background-color: #f9f9f9; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd;">
                <strong>Note:</strong> ${text}
            </div>
        </div>
    `;
}

/**
 * Removes all existing popups of a specific class and cleans up any external styles
 * Inline styles are automatically removed with the popup HTML
 * @param {string} [className='commonPopup'] - Class name of popups to remove
 */
function removeExistingPopups(className = 'commonPopup') {
    const existingPopups = document.querySelectorAll(`.${className}`);
    existingPopups.forEach(popup => {
        // Clean up any external style elements (legacy approach)
        cleanupPopupStyles(popup);
        // Popup removal automatically removes inline styles
        popup.remove();
    });
    
    // Clean up any orphaned external styles as a safety measure
    const orphanedExternalStyles = document.querySelectorAll('style[data-popup-style]');
    orphanedExternalStyles.forEach(style => style.remove());
}

/**
 * Generates inline tooltip CSS for embedding directly in popup HTML
 * This ensures styles are automatically removed when popup is removed
 * @param {string} popupId - Unique identifier for the popup (for scoping)
 * @param {Object} [options] - Tooltip styling options
 * @param {string} [options.width='500px'] - Tooltip width
 * @param {string} [options.backgroundColor='rgba(43, 43, 43, 0.95)'] - Background color
 * @param {string} [options.fontSize='12px'] - Font size
 * @returns {string} HTML string containing style tag
 */
function generateTooltipStyles(popupId, options = {}) {
    const {
        width = '500px',
        backgroundColor = 'rgba(43, 43, 43, 0.95)',
        fontSize = '12px'
    } = options;

    // Scope styles to ONLY this specific popup ID
    const scopeSelector = `.commonPopup[data-popup-id="${popupId}"]`;
    
    return `
        <style data-inline-popup-style="${popupId}">
            ${scopeSelector} .field-card[data-tooltip],
            ${scopeSelector} .tooltip-enabled[data-tooltip] {
                position: relative;
            }
            ${scopeSelector} .field-card[data-tooltip]:hover::before,
            ${scopeSelector} .tooltip-enabled[data-tooltip]:hover::before {
                content: attr(data-tooltip);
                position: absolute;
                left: 0;
                top: 100%;
                margin-top: 8px;
                padding: 10px 14px;
                background-color: ${backgroundColor};
                color: white;
                border-radius: 6px;
                font-size: ${fontSize};
                line-height: 1.5;
                white-space: pre-wrap;
                width: ${width};
                box-sizing: border-box;
                z-index: 100000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                pointer-events: none;
                word-wrap: break-word;
            }
        </style>
    `;
}

/**
 * @deprecated Use generateTooltipStyles() instead for automatic cleanup
 * Adds custom tooltip styling to the page (can be scoped to specific popup)
 */
function addTooltipStyles(options = {}) {
    console.warn('addTooltipStyles() is deprecated. Use generateTooltipStyles() for embedded styles instead.');
    const {
        popupContainer,
        width = '500px',
        backgroundColor = 'rgba(43, 43, 43, 0.95)',
        fontSize = '12px'
    } = options;

    const tooltipStyle = document.createElement('style');
    
    let scopeSelector = '';
    if (popupContainer) {
        const styleId = popupContainer.getAttribute('data-style-id');
        if (styleId) {
            tooltipStyle.setAttribute('data-popup-style', styleId);
            const popupId = popupContainer.getAttribute('data-popup-id');
            if (popupId) {
                scopeSelector = `.commonPopup[data-popup-id="${popupId}"] `;
            }
        }
    }
    
    tooltipStyle.innerHTML = `
        ${scopeSelector}.field-card[data-tooltip],
        ${scopeSelector}.tooltip-enabled[data-tooltip] {
            position: relative;
        }
        ${scopeSelector}.field-card[data-tooltip]:hover::before,
        ${scopeSelector}.tooltip-enabled[data-tooltip]:hover::before {
            content: attr(data-tooltip);
            position: absolute;
            left: 0;
            top: 100%;
            margin-top: 8px;
            padding: 10px 14px;
            background-color: ${backgroundColor};
            color: white;
            border-radius: 6px;
            font-size: ${fontSize};
            line-height: 1.5;
            white-space: pre-wrap;
            width: ${width};
            box-sizing: border-box;
            z-index: 100000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            pointer-events: none;
            word-wrap: break-word;
        }
    `;
    document.head.appendChild(tooltipStyle);
    return tooltipStyle;
}

