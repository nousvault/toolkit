/**
 * Global Utility Functions for DevTool
 */

/**
 * Copies text to the system clipboard
 * @param {string} text - text to copy
 * @returns {Promise<boolean>} success status
 */
export async function copyToClipboard(text) {
    if (!text) return false;
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy to clipboard', 'error');
        return false;
    }
}

/**
 * Shows a toast message notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
export function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // Add icon based on type
    let icon = '';
    if (type === 'success') {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.15s forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

/**
 * Sets up a file upload drag & drop area natively
 * @param {HTMLElement} dropArea - Element to attach listeners to
 * @param {HTMLInputElement} fileInput - Hidden file input element
 * @param {Function} onFileRead - Callback `(content, file)` when read is successful
 */
export function setupFileUpload(dropArea, fileInput, onFileRead) {
    if (!dropArea || !fileInput) return;

    // Click to open file dialog
    dropArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    });

    dropArea.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        if (files.length) handleFile(files[0]);
    }, false);

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            onFileRead(e.target.result, file);
        };
        reader.onerror = () => {
            showToast('Error reading file', 'error');
        };
        reader.readAsText(file);
        // Reset file input so same file can be selected again
        fileInput.value = '';
    }
}

/**
 * Debounce utility
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Syntax highlighting for JSON strings
 * @param {string|object} json - JSON string or object to highlight
 * @returns {string} HTML string with spans for styling
 */
export function syntaxHighlight(json) {
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    }

    // Escape HTML special characters
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Regex for finding JSON parts
    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

    return json.replace(regex, function (match) {
        let cls = 'json-num';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-str';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-bool';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
    });
}

/**
 * Gets current cursor position in a contenteditable element
 */
export function getCursorPosition(parent) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(parent);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
}

/**
 * Sets cursor position in a contenteditable element
 */
export function setCursorPosition(parent, offset) {
    let currentOffset = 0;
    const range = document.createRange();
    const selection = window.getSelection();

    function traverse(node) {
        if (node.nodeType === 3) {
            const len = node.textContent.length;
            if (currentOffset + len >= offset) {
                range.setStart(node, offset - currentOffset);
                range.setEnd(node, offset - currentOffset);
                return true;
            }
            currentOffset += len;
        } else {
            for (let i = 0; i < node.childNodes.length; i++) {
                if (traverse(node.childNodes[i])) return true;
            }
        }
        return false;
    }

    traverse(parent);
    selection.removeAllRanges();
    selection.addRange(range);
}
