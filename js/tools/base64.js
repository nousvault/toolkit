import { copyToClipboard, showToast } from '../utils.js';

export function render() {
    return `
        <style>
            .base64-container {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-lg);
                height: 100%;
            }

            .base64-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-lg);
                flex: 1;
                min-height: 0;
            }

            .pane {
                display: flex;
                flex-direction: column;
                background: var(--bg-surface);
                border: 1px solid var(--border-strong);
                border-radius: var(--radius-md);
                overflow: hidden;
            }

            .pane-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-sm) var(--spacing-md);
                background: var(--bg-elevated);
                border-bottom: 1px solid var(--border-subtle);
            }

            .pane-header h3 {
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: var(--text-secondary);
                margin: 0;
            }

            .base64-textarea {
                flex: 1;
                border: none;
                background: transparent;
                padding: var(--spacing-md);
                color: var(--text-primary);
                font-family: var(--font-mono);
                font-size: 0.95rem;
                line-height: 1.5;
                resize: none;
                outline: none;
            }

            .codec-settings {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
                background: var(--bg-surface);
                padding: var(--spacing-md) var(--spacing-lg);
                border-radius: var(--radius-md);
                border: 1px solid var(--border-strong);
            }

            .toggle-group {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                user-select: none;
            }

            .toggle-switch {
                position: relative;
                width: 36px;
                height: 20px;
                background: var(--bg-elevated);
                border-radius: 20px;
                transition: background 0.2s;
            }

            .toggle-switch::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 16px;
                height: 16px;
                background: var(--text-secondary);
                border-radius: 50%;
                transition: all 0.2s;
            }

            .toggle-group.active .toggle-switch {
                background: var(--brand-primary);
            }

            .toggle-group.active .toggle-switch::after {
                left: 18px;
                background: white;
            }

            .toggle-label {
                font-size: 0.9rem;
                color: var(--text-primary);
            }

            @media (max-width: 900px) {
                .base64-grid {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr 1fr;
                }
            }
        </style>

        <div class="base64-container">
            <div class="codec-settings">
                <div id="toggleUrlSafe" class="toggle-group">
                    <div class="toggle-switch"></div>
                    <span class="toggle-label">URL-Safe Mode</span>
                </div>
            </div>

            <div class="base64-grid">
                <div class="pane">
                    <div class="pane-header">
                        <h3>Plain Text</h3>
                        <button class="btn btn-secondary btn-icon" id="btnCopyText" style="padding: 4px 8px; font-size: 0.75rem;">Copy</button>
                    </div>
                    <textarea id="textInput" class="base64-textarea" placeholder="Enter plain text here..."></textarea>
                </div>

                <div class="pane">
                    <div class="pane-header">
                        <h3>Base64</h3>
                        <button class="btn btn-secondary btn-icon" id="btnCopyBase64" style="padding: 4px 8px; font-size: 0.75rem;">Copy</button>
                    </div>
                    <textarea id="base64Input" class="base64-textarea" placeholder="Enter base64 here..."></textarea>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const textInput = workspace.querySelector('#textInput');
    const base64Input = workspace.querySelector('#base64Input');
    const toggleUrlSafe = workspace.querySelector('#toggleUrlSafe');

    let isUrlSafe = false;

    // UTF-8 Helpers
    const utf8Encode = (str) => new TextEncoder().encode(str);
    const utf8Decode = (bytes) => new TextDecoder().decode(bytes);

    const encode = (str) => {
        try {
            if (!str) return '';
            const bytes = utf8Encode(str);
            let binString = '';
            for (const byte of bytes) {
                binString += String.fromCharCode(byte);
            }
            let b64 = btoa(binString);
            if (isUrlSafe) {
                b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            }
            return b64;
        } catch (e) {
            console.error('Encode error:', e);
            return 'Error encoding text';
        }
    };

    const decode = (b64) => {
        try {
            if (!b64) return '';
            let str = b64;
            if (isUrlSafe) {
                str = str.replace(/-/g, '+').replace(/_/g, '/');
                while (str.length % 4) str += '=';
            }
            const binString = atob(str);
            const bytes = new Uint8Array(binString.length);
            for (let i = 0; i < binString.length; i++) {
                bytes[i] = binString.charCodeAt(i);
            }
            return utf8Decode(bytes);
        } catch (e) {
            return 'Invalid Base64 string';
        }
    };

    const handleTextChange = () => {
        const result = encode(textInput.value);
        if (result !== 'Error encoding text') {
            base64Input.value = result;
        }
    };

    const handleBase64Change = () => {
        const result = decode(base64Input.value);
        if (result !== 'Invalid Base64 string') {
            textInput.value = result;
        }
    };

    textInput.addEventListener('input', handleTextChange);
    base64Input.addEventListener('input', handleBase64Change);

    toggleUrlSafe.addEventListener('click', () => {
        isUrlSafe = !isUrlSafe;
        toggleUrlSafe.classList.toggle('active', isUrlSafe);
        // Recalculate based on current text
        handleTextChange();
    });

    // Action buttons
    actionsContainer.innerHTML = `
        <button class="btn btn-secondary" id="btnClearCodec" style="color: var(--status-error); border-color: var(--status-error); background: var(--bg-main);">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Clear
        </button>
    `;

    actionsContainer.querySelector('#btnClearCodec').onclick = () => {
        textInput.value = '';
        base64Input.value = '';
        showToast('Cleared input & output', 'info');
    };

    workspace.querySelector('#btnCopyText').onclick = () => {
        if (textInput.value) {
            copyToClipboard(textInput.value);
        }
    };

    workspace.querySelector('#btnCopyBase64').onclick = () => {
        if (base64Input.value) {
            copyToClipboard(base64Input.value);
        }
    };

    // Auto focus
    textInput.focus();
}
