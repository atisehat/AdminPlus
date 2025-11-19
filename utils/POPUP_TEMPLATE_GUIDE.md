# Popup Template Guide

This guide explains how to use the standardized popup template system for creating consistent UI components in AdminPlus.

## Overview

The `popupTemplate.js` utility provides reusable functions to create standardized popup windows with consistent styling, behavior, and user experience across all AdminPlus tools.

## Core Features

✅ **Consistent Design**: Dark header (#2b2b2b) with title and close button  
✅ **Browser-Style Close**: Red hover effect on "X" close button  
✅ **Draggable Windows**: Optional movable popups  
✅ **Responsive Layout**: Flexible width and height options  
✅ **Custom Tooltips**: Built-in tooltip styling system  
✅ **Helper Functions**: Pre-built components for common UI patterns  

---

## Basic Usage

### 1. Creating a Simple Popup

```javascript
// Create a basic popup
const popup = createStandardPopup({
    title: 'My Tool Name',
    content: '<p>Your HTML content here</p>',
    width: '75%',  // Optional, defaults to 75%
    movable: true  // Optional, defaults to true
});
```

### 2. Creating a Full-Featured Popup

```javascript
// Build your content using helper functions
const headerHtml = createInfoHeader([
    { label: 'Entity Name', value: 'account' },
    { label: 'Record ID', value: '12345-67890' }
]);

const noteHtml = createNoteBanner('Click on items to interact');

const contentHtml = '<div>Your main content</div>';

const scrollableContent = createScrollSection(headerHtml + noteHtml + contentHtml);

// Create the popup
const popup = createStandardPopup({
    title: 'Entity Information',
    content: scrollableContent,
    width: '80%',
    onClose: () => {
        console.log('Popup closed');
        // Perform cleanup if needed
    }
});
```

---

## API Reference

### `createStandardPopup(config)`

Creates a standardized popup window.

**Parameters:**
- `config.title` (string, required): Title text for the header
- `config.content` (string, required): HTML content for the popup body
- `config.width` (string, optional): Width of popup (default: '75%')
- `config.maxHeight` (string, optional): Max height (default: '90vh')
- `config.movable` (boolean, optional): Enable dragging (default: true)
- `config.onClose` (function, optional): Callback when closed
- `config.customStyles` (object, optional): Override default styles

**Returns:** HTMLElement - The popup container

**Example:**
```javascript
const popup = createStandardPopup({
    title: 'Advanced Settings',
    content: myContentHtml,
    width: '60%',
    movable: false,
    onClose: () => console.log('Settings closed'),
    customStyles: {
        border: '2px solid #333',
        additionalStyles: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }
    }
});
```

---

### `createInfoHeader(items, options)`

Creates a standardized information header with label-value pairs.

**Parameters:**
- `items` (array, required): Array of `{label, value}` objects
- `options.gap` (string, optional): Gap between items (default: '50px')
- `options.fontSize` (string, optional): Font size (default: '15px')

**Returns:** HTML string

**Example:**
```javascript
const header = createInfoHeader([
    { label: 'Entity Name', value: 'contact' },
    { label: 'Plural Name', value: 'contacts' },
    { label: 'Record ID', value: 'abc-123' }
], {
    gap: '40px',
    fontSize: '14px'
});
```

**Output:**
```
Entity Name: contact    Plural Name: contacts    Record ID: abc-123
```

---

### `createScrollSection(content, options)`

Wraps content in a scrollable section.

**Parameters:**
- `content` (string, required): HTML content to wrap
- `options.padding` (string, optional): Padding (default: '0 2px 20px 20px')
- `options.maxHeight` (string, optional): Max height (default: 'calc(90vh - 235px)')

**Returns:** HTML string

**Example:**
```javascript
const scrollable = createScrollSection(myContent, {
    padding: '20px',
    maxHeight: 'calc(80vh - 200px)'
});
```

---

### `createNoteBanner(text, options)`

Creates a styled note/information banner.

**Parameters:**
- `text` (string, required): Note text (don't include "Note:" prefix)
- `options.position` (string, optional): 'left', 'center', or 'right' (default: 'right')
- `options.fontSize` (string, optional): Font size (default: '13px')

**Returns:** HTML string

**Example:**
```javascript
const note = createNoteBanner('Click on any field to copy', {
    position: 'right',
    fontSize: '12px'
});
```

---

### `addTooltipStyles(options)`

Adds custom tooltip styling for elements with `data-tooltip` attribute.

**Parameters:**
- `options.width` (string, optional): Tooltip width (default: '500px')
- `options.backgroundColor` (string, optional): Background (default: 'rgba(43, 43, 43, 0.95)')
- `options.fontSize` (string, optional): Font size (default: '12px')

**Returns:** HTMLStyleElement

**Example:**
```javascript
// Add tooltip styles
addTooltipStyles({
    width: '400px',
    fontSize: '11px'
});

// Use on elements
<div class="field-card" data-tooltip="This is my tooltip text">
    Hover over me
</div>
```

---

### `removeExistingPopups(className)`

Removes all popups with a specific class name.

**Parameters:**
- `className` (string, optional): Class name to remove (default: 'commonPopup')

**Example:**
```javascript
// Remove all popups before creating a new one
removeExistingPopups('commonPopup');
```

---

## Complete Example

Here's a complete example showing how to create a feature-rich popup:

```javascript
async function showMyToolPopup() {
    // 1. Fetch your data
    const data = await fetchMyData();
    
    // 2. Build the header
    const header = createInfoHeader([
        { label: 'Tool Name', value: 'My Tool' },
        { label: 'Version', value: '1.0' }
    ]);
    
    // 3. Add a note
    const note = createNoteBanner('Click items to interact with them');
    
    // 4. Build your main content
    const mainContent = `
        <div style="padding: 20px;">
            <h3>My Content</h3>
            <p>${data.description}</p>
        </div>
    `;
    
    // 5. Make it scrollable
    const scrollableContent = createScrollSection(
        header + note + mainContent
    );
    
    // 6. Add tooltips if needed
    addTooltipStyles();
    
    // 7. Create the popup
    const popup = createStandardPopup({
        title: 'My Tool Window',
        content: scrollableContent,
        width: '70%',
        movable: true,
        onClose: () => {
            console.log('User closed my tool');
        }
    });
    
    // 8. Add custom interactions (optional)
    popup.querySelectorAll('.my-clickable-item').forEach(item => {
        item.addEventListener('click', () => {
            alert('Item clicked!');
        });
    });
}
```

---

## Design Specifications

### Colors
- **Header Background**: `#2b2b2b` (dark gray)
- **Border**: `#1a1a1a` (darker gray)
- **Close Hover**: `#e81123` (browser red)
- **Info Background**: `#f9f9f9` (light gray)

### Dimensions
- **Default Width**: 75% of viewport
- **Max Height**: 90vh
- **Header Height**: ~50px
- **Border**: 3px solid
- **Border Radius**: 12px (container), 9px (header)

### Typography
- **Title**: White, default size
- **Labels**: Bold
- **Values**: Regular weight
- **Notes**: Italic, 13px

---

## Migration Guide

### Before (Old Way)
```javascript
function appendPopupToBody(html) {
    const container = document.createElement('div');
    container.className = 'commonPopup';
    container.style.border = '3px solid #1a1a1a';
    container.style.borderRadius = '12px';
    // ... 50+ lines of code ...
    container.innerHTML = `
        <div class="commonPopup-header" style="...">
            <span>Title</span>
            <span class="close-button">×</span>
        </div>
        // ... more HTML ...
    `;
    // ... event listeners ...
}
```

### After (New Way)
```javascript
function appendPopupToBody(html) {
    const popup = createStandardPopup({
        title: 'My Title',
        content: html,
        width: '75%'
    });
    // Done! Just add your custom interactions if needed
}
```

---

## Best Practices

1. **Always use the template** for new tools to maintain consistency
2. **Use helper functions** (createInfoHeader, createNoteBanner, etc.) instead of writing HTML
3. **Keep width at 75%** unless there's a specific reason to change it
4. **Enable movable** for better UX (default is true)
5. **Add onClose callbacks** if you need cleanup logic
6. **Use addTooltipStyles()** once per page, not per popup
7. **Test close button** hover effect (should turn red)

---

## Troubleshooting

**Q: Close button not working?**  
A: Ensure `makePopupMovable()` function is available (from ui.js)

**Q: Popup not movable?**  
A: Check that `movable: true` is set and `makePopupMovable()` exists

**Q: Styles not applying?**  
A: Make sure CSS files are loaded before creating popups

**Q: Tooltips not showing?**  
A: Call `addTooltipStyles()` before creating your popup

---

## Future Enhancements

Planned features for the template system:
- [ ] Modal backdrop option
- [ ] Multiple size presets (small, medium, large)
- [ ] Animation effects
- [ ] Minimize/maximize buttons
- [ ] Multi-tab support within popups
- [ ] Dark mode toggle

---

## Contributing

When adding new features to the template:
1. Update this documentation
2. Test with at least 2 existing tools
3. Ensure backward compatibility
4. Update version comments in code

