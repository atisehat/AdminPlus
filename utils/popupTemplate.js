/**
 * Popup Template Utility
 * Creates standardized popup windows with consistent styling and behavior
 */

/**
 * Creates a standardized popup window
 * @param {Object} config - Configuration object
 * @param {string} config.title - Title text for the header
 * @param {string} config.content - HTML content for the popup body
 * @param {string} [config.popupId] - Unique identifier for this popup type (e.g., 'entityInfo', 'dirtyFields')
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
        width = '75%',
        maxHeight = '90vh',
        movable = true,
        onClose,
        customStyles = {}
    } = config;

    // Remove existing popup of the SAME type only
    if (popupId) {
        const existingPopup = document.querySelector(`.commonPopup[data-popup-id="${popupId}"]`);
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Also clean up any leftover tooltip styles for this popup
        const existingTooltipStyle = document.querySelector(`style[data-tooltip-for="${popupId}"]`);
        if (existingTooltipStyle) {
            existingTooltipStyle.remove();
        }
    }

    // Create popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'commonPopup';
    
    // Add unique identifier if provided
    if (popupId) {
        popupContainer.setAttribute('data-popup-id', popupId);
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

    // Build popup HTML structure
    popupContainer.innerHTML = `
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
        // Clean up tooltip styles for this popup if they exist
        if (popupId) {
            const tooltipStyle = document.querySelector(`style[data-tooltip-for="${popupId}"]`);
            if (tooltipStyle) {
                tooltipStyle.remove();
            }
        }
        
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
 * Removes all existing popups of a specific class
 * @param {string} [className='commonPopup'] - Class name of popups to remove
 */
function removeExistingPopups(className = 'commonPopup') {
    const existingPopups = document.querySelectorAll(`.${className}`);
    existingPopups.forEach(popup => {
        // Clean up tooltip styles if popup has an ID
        const popupId = popup.getAttribute('data-popup-id');
        if (popupId) {
            const tooltipStyle = document.querySelector(`style[data-tooltip-for="${popupId}"]`);
            if (tooltipStyle) {
                tooltipStyle.remove();
            }
        }
        popup.remove();
    });
}

/**
 * Adds custom tooltip styling scoped to a specific popup
 * @param {string} popupId - Unique identifier for the popup
 * @param {Object} [options] - Tooltip styling options
 * @param {string} [options.width='500px'] - Tooltip width
 * @param {string} [options.backgroundColor='rgba(43, 43, 43, 0.95)'] - Background color
 * @param {string} [options.fontSize='12px'] - Font size
 * @returns {HTMLStyleElement} The created style element
 */
function addTooltipStyles(popupId, options = {}) {
    const {
        width = '500px',
        backgroundColor = 'rgba(43, 43, 43, 0.95)',
        fontSize = '12px'
    } = options;

    // Remove any existing tooltip styles for this popup
    const existingStyle = document.querySelector(`style[data-tooltip-for="${popupId}"]`);
    if (existingStyle) {
        existingStyle.remove();
    }

    const tooltipStyle = document.createElement('style');
    tooltipStyle.setAttribute('data-tooltip-for', popupId);
    tooltipStyle.innerHTML = `
        .commonPopup[data-popup-id="${popupId}"] .field-card[data-tooltip],
        .commonPopup[data-popup-id="${popupId}"] .tooltip-enabled[data-tooltip] {
            position: relative;
        }
        .commonPopup[data-popup-id="${popupId}"] .field-card[data-tooltip]:hover::before,
        .commonPopup[data-popup-id="${popupId}"] .tooltip-enabled[data-tooltip]:hover::before {
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

